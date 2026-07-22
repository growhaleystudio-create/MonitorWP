import axios from 'axios';
import tls from 'tls';
import { URL } from 'url';
import { prisma } from '../db';
import { triggerAlert } from './alerts';

let isChecking = false;

export async function checkSslCertificate(siteUrl: string): Promise<{
  sslValid: boolean;
  sslExpiresAt: Date | null;
  sslDaysRemaining: number | null;
  sslIssuer: string | null;
}> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'https:') {
        return resolve({ sslValid: false, sslExpiresAt: null, sslDaysRemaining: null, sslIssuer: null });
      }

      const port = parsed.port ? parseInt(parsed.port, 10) : 443;
      const socket = tls.connect(
        {
          host: parsed.hostname,
          port: port,
          servername: parsed.hostname,
          rejectUnauthorized: false,
          timeout: 5000,
        },
        () => {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            socket.destroy();
            return resolve({ sslValid: false, sslExpiresAt: null, sslDaysRemaining: null, sslIssuer: null });
          }

          const expiresAt = new Date(cert.valid_to);
          const daysRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const isValid = socket.authorized && daysRemaining > 0;
          const issuer = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Unknown Issuer') : null;

          socket.destroy();
          resolve({
            sslValid: isValid,
            sslExpiresAt: expiresAt,
            sslDaysRemaining: daysRemaining,
            sslIssuer: typeof issuer === 'string' ? issuer : null,
          });
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve({ sslValid: false, sslExpiresAt: null, sslDaysRemaining: null, sslIssuer: null });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ sslValid: false, sslExpiresAt: null, sslDaysRemaining: null, sslIssuer: null });
      });
    } catch {
      resolve({ sslValid: false, sslExpiresAt: null, sslDaysRemaining: null, sslIssuer: null });
    }
  });
}

/**
 * Performs an uptime HTTP GET check on a single site.
 */
export async function checkSiteUptime(siteId: number) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || !site.isActive) return;

  const startTime = Date.now();
  let isUp = false;
  let statusCode = 0;
  let responseTimeMs = 0;
  let keywordMatched = true;

  try {
    // Request with 10s timeout to prevent hanging requests
    const response = await axios.get(site.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Growhaley-Monitor/1.0',
      },
      validateStatus: () => true, // resolve promise for any status code
    });

    statusCode = response.status;
    responseTimeMs = Date.now() - startTime;
    isUp = statusCode >= 200 && statusCode < 400;

    // Optional Keyword check
    if (isUp && site.checkKeyword && typeof response.data === 'string') {
      keywordMatched = response.data.includes(site.checkKeyword);
      if (!keywordMatched) {
        isUp = false;
      }
    }
  } catch (error: any) {
    statusCode = error.response?.status || 0;
    responseTimeMs = Date.now() - startTime;
    isUp = false;
  }

  // Perform SSL Check for HTTPS sites
  const sslInfo = await checkSslCertificate(site.url);

  try {
    // Save to UptimeLog
    await prisma.uptimeLog.create({
      data: {
        siteId: site.id,
        statusCode,
        responseTimeMs,
        isUp,
      },
    });

    // Check status changes to trigger alert
    const prevStatus = site.status;
    const nextStatus = isUp ? 'online' : 'offline';

    await prisma.site.update({
      where: { id: site.id },
      data: {
        status: nextStatus,
        lastSeenAt: isUp ? new Date() : site.lastSeenAt,
        sslValid: sslInfo.sslValid,
        sslExpiresAt: sslInfo.sslExpiresAt,
        sslDaysRemaining: sslInfo.sslDaysRemaining,
        sslIssuer: sslInfo.sslIssuer,
      },
    });

    // SSL Expiring Warning Alert (if <= 7 days)
    if (sslInfo.sslDaysRemaining !== null && sslInfo.sslDaysRemaining <= 7 && sslInfo.sslDaysRemaining > 0) {
      await triggerAlert({
        siteId: site.id,
        alertType: 'ssl_expiring_soon',
        message: `SSL Certificate for ${site.name} expires in ${sslInfo.sslDaysRemaining} days!`,
        severity: 'warning',
      });
    }

    if (prevStatus !== nextStatus && prevStatus !== 'unknown') {
      if (nextStatus === 'offline') {
        const msg = !keywordMatched
          ? `Site offline: Keyword "${site.checkKeyword}" not found on page.`
          : `Site down with status code ${statusCode} (Response time: ${responseTimeMs}ms)`;

        await triggerAlert({
          siteId: site.id,
          alertType: 'site_down',
          message: msg,
          severity: 'critical',
        });
      } else if (nextStatus === 'online') {
        await triggerAlert({
          siteId: site.id,
          alertType: 'site_up',
          message: `Site is back online. Response time: ${responseTimeMs}ms`,
          severity: 'info',
        });
      }
    }
  } catch (dbError) {
    console.error(`Database error writing uptime log for site ${site.name}:`, dbError);
  }
}

/**
 * Main loop checking all active sites that are due.
 */
export async function runUptimeCheckCycle() {
  if (isChecking) return;
  isChecking = true;

  try {
    // Get uptime interval setting
    const intervalSetting = await prisma.setting.findUnique({
      where: { key: 'uptime_interval_minutes' },
    });
    const intervalMinutes = parseInt(intervalSetting?.value || '5', 10);
    const intervalMs = intervalMinutes * 60 * 1000;

    const sites = await prisma.site.findMany({
      where: { isActive: true },
    });

    const now = Date.now();

    for (const site of sites) {
      // Find the last uptime log for this site
      const lastLog = await prisma.uptimeLog.findFirst({
        where: { siteId: site.id },
        orderBy: { checkedAt: 'desc' },
      });

      const shouldCheck = !lastLog || (now - new Date(lastLog.checkedAt).getTime()) >= intervalMs;

      if (shouldCheck) {
        // Run check asynchronously so one site doesn't block the loop
        checkSiteUptime(site.id).catch((err) =>
          console.error(`Error checking uptime for site ${site.name}:`, err)
        );
      }
    }
  } catch (error) {
    console.error('Error in uptime check cycle:', error);
  } finally {
    isChecking = false;
  }
}

/**
 * Starts the background uptime scheduler.
 * Ticks every 30 seconds to evaluate what needs checking.
 */
export function startUptimeScheduler() {
  console.log('Uptime checker scheduler started.');
  // Initial check
  runUptimeCycleImmediate();
  // Tick every 30 seconds
  setInterval(runUptimeCheckCycle, 30000);
}

/**
 * Runs a check on all active sites immediately.
 */
export async function runUptimeCycleImmediate() {
  try {
    const sites = await prisma.site.findMany({ where: { isActive: true } });
    for (const site of sites) {
      checkSiteUptime(site.id).catch(err => 
        console.error(`Error checking site ${site.name} uptime:`, err)
      );
    }
  } catch (error) {
    console.error('Error in immediate uptime check:', error);
  }
}

/**
 * Runs a check on all active sites immediately and awaits all pings (for Serverless/Vercel Cron).
 */
export async function runUptimeCycleImmediateAwaited() {
  try {
    const sites = await prisma.site.findMany({ where: { isActive: true } });
    const promises = sites.map(async (site) => {
      try {
        await checkSiteUptime(site.id);
      } catch (err) {
        console.error(`Error checking site ${site.name} uptime:`, err);
      }
    });
    await Promise.all(promises);
    console.log('All uptime checks completed.');
  } catch (error) {
    console.error('Error in awaited uptime check:', error);
  }
}
