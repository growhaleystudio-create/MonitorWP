import { Request, Response } from 'express';
import { prisma } from '../db';
import { triggerAlert } from '../services/alerts';

/**
 * Handles payload POSTed by the WordPress Agent plugin.
 */
export async function handleAgentPush(req: Request, res: Response) {
  const site = req.site; // Populated by validateAgentKey middleware
  const { plugins, error_logs, security_events, system_stats, traffic_logs, seo_stats, sca_results } = req.body;

  try {
    const now = new Date();

    // 1. Update site status, lastSeenAt and resource stats
    const updateData: any = {
      lastSeenAt: now,
      status: 'online',
    };

    if (system_stats) {
      if (typeof system_stats.wp_peak_ram_mb === 'number') {
        updateData.wpMemoryUsage = system_stats.wp_peak_ram_mb;
      }
      if (typeof system_stats.disk_total_gb === 'number') {
        updateData.diskTotal = system_stats.disk_total_gb;
      }
      if (typeof system_stats.disk_free_gb === 'number') {
        updateData.diskFree = system_stats.disk_free_gb;
      }
      if (typeof system_stats.cpu_load_1m === 'number') {
        updateData.cpuLoad = system_stats.cpu_load_1m;
      }
    }

    await prisma.site.update({
      where: { id: site.id },
      data: updateData,
    });

    // 2. Process Plugins
    if (Array.isArray(plugins)) {
      const activeSlugs = plugins.map((p: any) => p.slug).filter(Boolean);

      // Remove plugins that are no longer installed on the site
      await prisma.plugin.deleteMany({
        where: {
          siteId: site.id,
          slug: { notIn: activeSlugs },
        },
      });

      for (const p of plugins) {
        if (!p.slug || !p.name) continue;

        // Check if plugin existed before to detect status changes
        const existingPlugin = await prisma.plugin.findUnique({
          where: {
            siteId_slug: {
              siteId: site.id,
              slug: p.slug,
            },
          },
        });

        // Upsert plugin
        const updatedPlugin = await prisma.plugin.upsert({
          where: {
            siteId_slug: {
              siteId: site.id,
              slug: p.slug,
            },
          },
          update: {
            name: p.name,
            version: p.version || '',
            latestVersion: p.latest_version || null,
            isActive: !!p.is_active,
            isExpired: !!p.is_expired,
            expiredAt: p.expired_at ? new Date(p.expired_at) : null,
            requiresUpdate: !!p.requires_update,
            updatedAt: now,
          },
          create: {
            siteId: site.id,
            name: p.name,
            slug: p.slug,
            version: p.version || '',
            latestVersion: p.latest_version || null,
            isActive: !!p.is_active,
            isExpired: !!p.is_expired,
            expiredAt: p.expired_at ? new Date(p.expired_at) : null,
            requiresUpdate: !!p.requires_update,
          },
        });

        // Check for alerts
        // Alert on newly expired plugin
        if (updatedPlugin.isExpired && (!existingPlugin || !existingPlugin.isExpired)) {
          await triggerAlert({
            siteId: site.id,
            alertType: 'plugin_expired',
            message: `Plugin "${updatedPlugin.name}" has expired (License expired: ${updatedPlugin.expiredAt?.toLocaleDateString() || 'N/A'})`,
            severity: 'warning',
          });
        }

        // Alert on new update available
        if (updatedPlugin.requiresUpdate && (!existingPlugin || !existingPlugin.requiresUpdate)) {
          await triggerAlert({
            siteId: site.id,
            alertType: 'plugin_update',
            message: `Plugin "${updatedPlugin.name}" has an update available. Installed: v${updatedPlugin.version}, Latest: v${updatedPlugin.latestVersion}`,
            severity: 'info',
          });
        }
      }
    }

    // 3. Process Error Logs (aggregated)
    if (Array.isArray(error_logs)) {
      for (const log of error_logs) {
        if (!log.error_code || !log.url) continue;

        // Try to aggregate error logs with same code and url in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existingLog = await prisma.errorLog.findFirst({
          where: {
            siteId: site.id,
            errorCode: parseInt(log.error_code, 10),
            url: log.url,
            lastSeen: { gte: oneHourAgo },
          },
        });

        if (existingLog) {
          await prisma.errorLog.update({
            where: { id: existingLog.id },
            data: {
              count: existingLog.count + 1,
              lastSeen: now,
              message: log.message || existingLog.message,
            },
          });
        } else {
          await prisma.errorLog.create({
            data: {
              siteId: site.id,
              errorCode: parseInt(log.error_code, 10),
              url: log.url,
              message: log.message || '',
              userAgent: log.user_agent || null,
              ipAddress: log.ip_address || null,
              referer: log.referer || null,
              firstSeen: now,
              lastSeen: now,
            },
          });
        }
      }

      // Check for error spike threshold
      const errorThresholdSetting = await prisma.setting.findUnique({
        where: { key: 'alert_on_error_spike_threshold' },
      });
      const threshold = parseInt(errorThresholdSetting?.value || '10', 10);

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const errorsInLastHour = await prisma.errorLog.aggregate({
        where: {
          siteId: site.id,
          lastSeen: { gte: oneHourAgo },
        },
        _sum: {
          count: true,
        },
      });

      const totalErrors = errorsInLastHour._sum.count || 0;
      if (totalErrors > threshold) {
        // Find if we already triggered an error spike alert in the last hour
        const lastSpikeAlert = await prisma.alert.findFirst({
          where: {
            siteId: site.id,
            alertType: 'error_spike',
            createdAt: { gte: oneHourAgo },
          },
        });

        if (!lastSpikeAlert) {
          await triggerAlert({
            siteId: site.id,
            alertType: 'error_spike',
            message: `High error rate detected: ${totalErrors} errors in the last hour (threshold is ${threshold}).`,
            severity: 'warning',
          });
        }
      }
    }

    // 4. Process Security Events
    if (Array.isArray(security_events)) {
      for (const ev of security_events) {
        if (!ev.event_type) continue;

        // Save security event
        await prisma.securityEvent.create({
          data: {
            siteId: site.id,
            eventType: ev.event_type,
            detail: typeof ev.detail === 'object' ? JSON.stringify(ev.detail) : String(ev.detail || ''),
            ipAddress: ev.ip_address || null,
            username: ev.username || null,
            createdAt: now,
          },
        });

        // Instant alerts for injections or file integrity events
        if (ev.event_type.startsWith('injection_')) {
          await triggerAlert({
            siteId: site.id,
            alertType: 'injection_detected',
            message: `Suspicious activity detected: <b>${ev.event_type.replace('injection_', '').toUpperCase()} attempt</b> from IP ${ev.ip_address || 'unknown'}.\nPayload preview: ${ev.detail ? (typeof ev.detail === 'object' ? JSON.stringify(ev.detail) : ev.detail).substring(0, 100) : 'none'}`,
            severity: 'critical',
          });
        } else if (ev.event_type === 'file_change') {
          await triggerAlert({
            siteId: site.id,
            alertType: 'security_event',
            message: `File Integrity Violation: ${ev.message}`,
            severity: 'critical',
          });
        }

        // Login failed spike check
        if (ev.event_type === 'login_failed') {
          const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
          const loginFailures = await prisma.securityEvent.count({
            where: {
              siteId: site.id,
              eventType: 'login_failed',
              createdAt: { gte: fifteenMinsAgo },
            },
          });

          if (loginFailures >= 5) {
            // Check if alert sent in last 15 minutes
            const recentAlert = await prisma.alert.findFirst({
              where: {
                siteId: site.id,
                alertType: 'security_event',
                message: { contains: 'login failures' },
                createdAt: { gte: fifteenMinsAgo },
              },
            });

            if (!recentAlert) {
              await triggerAlert({
                siteId: site.id,
                alertType: 'security_event',
                message: `Brute force warning: ${loginFailures} failed login attempts in the last 15 minutes.`,
                severity: 'warning',
              });
            }
          }
        }
      }
    }

    // 5. Process Traffic Logs
    if (Array.isArray(traffic_logs) && traffic_logs.length > 0) {
      const trafficData = traffic_logs.map((log: any) => ({
        siteId: site.id,
        url: log.url || '/',
        ipAddress: log.ip_address || null,
        userAgent: log.user_agent || null,
        referer: log.referer || null,
        visitedAt: log.timestamp ? new Date(log.timestamp) : now,
      }));

      await prisma.trafficLog.createMany({
        data: trafficData,
      });
    }

    // 6. Process SEO Stats
    if (seo_stats) {
      await prisma.site.update({
        where: { id: site.id },
        data: {
          seoPlugin: seo_stats.seo_plugin || 'none',
          seoTotalPosts: seo_stats.total_published_posts || 0,
          seoRecentPosts: seo_stats.recent_articles ? JSON.stringify(seo_stats.recent_articles) : null,
        },
      });
    }

    // 7. Process SCA Results
    if (Array.isArray(sca_results) && sca_results.length > 0) {
      const passedCount = sca_results.filter((r: any) => r.status === 'passed').length;
      const totalCount = sca_results.length;
      const scaScore = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

      await prisma.site.update({
        where: { id: site.id },
        data: {
          scaResults: JSON.stringify(sca_results),
          scaScore: scaScore,
        },
      });
    }

    res.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error(`Error processing agent push for site ${site.name}:`, error);
    res.status(500).json({ error: 'Failed to process sync payload' });
  }
}
