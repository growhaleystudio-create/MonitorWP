import axios from 'axios';
import { prisma } from '../db';
import { triggerAlert } from './alerts';

let isChecking = false;

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

  try {
    // Request with 10s timeout to prevent hanging requests
    const response = await axios.get(site.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'CMS-Dashboard-Monitor/1.0',
      },
      validateStatus: () => true, // resolve promise for any status code
    });

    statusCode = response.status;
    responseTimeMs = Date.now() - startTime;
    isUp = statusCode >= 200 && statusCode < 400;
  } catch (error: any) {
    statusCode = error.response?.status || 0;
    responseTimeMs = Date.now() - startTime;
    isUp = false;
  }

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
      },
    });

    if (prevStatus !== nextStatus && prevStatus !== 'unknown') {
      if (nextStatus === 'offline') {
        await triggerAlert({
          siteId: site.id,
          alertType: 'site_down',
          message: `Site down with status code ${statusCode} (Response time: ${responseTimeMs}ms)`,
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
