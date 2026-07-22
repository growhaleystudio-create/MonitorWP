import { prisma } from '../db';
import { sendTelegramNotification } from './telegram';

type AlertType =
  | 'site_down'
  | 'site_up'
  | 'plugin_expired'
  | 'plugin_update'
  | 'error_spike'
  | 'security_event'
  | 'injection_detected'
  | 'ssl_expiring_soon';

interface AlertParams {
  siteId: number;
  alertType: AlertType;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Checks if a specific alert type is enabled in the settings.
 */
async function isAlertEnabled(type: AlertType): Promise<boolean> {
  let settingKey = '';
  switch (type) {
    case 'site_down':
    case 'site_up':
      settingKey = 'alert_on_site_down';
      break;
    case 'plugin_expired':
      settingKey = 'alert_on_plugin_expired';
      break;
    case 'plugin_update':
      settingKey = 'alert_on_plugin_update';
      break;
    case 'error_spike':
      settingKey = 'alert_on_error_spike_threshold';
      break;
    case 'injection_detected':
      settingKey = 'alert_on_injection';
      break;
    case 'security_event':
      settingKey = 'alert_on_login_failed';
      break;
    default:
      return true;
  }

  const setting = await prisma.setting.findUnique({
    where: { key: settingKey },
  });

  // Default to true if setting not explicitly set to 'false'
  return setting ? setting.value !== 'false' : true;
}

/**
 * Formats Telegram messages based on alert type and severity.
 */
function getTelegramEmoji(severity: string, type: AlertType): string {
  if (type === 'site_up') return '🟢';
  if (severity === 'critical') return '🔴';
  if (severity === 'warning') return '🟡';
  return 'ℹ️';
}

/**
 * Creates a database alert record and pushes it to Telegram if configured.
 */
export async function triggerAlert(params: AlertParams) {
  const { siteId, alertType, message, severity } = params;

  try {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) return;

    // Check if alert type is enabled
    const enabled = await isAlertEnabled(alertType);
    let telegramSent = false;

    if (enabled) {
      const emoji = getTelegramEmoji(severity, alertType);
      const formattedMessage = `${emoji} <b>[${severity.toUpperCase()}] ${alertType.replace('_', ' ').toUpperCase()}</b>\n<b>Site:</b> ${site.name} (${site.url})\n<b>Detail:</b> ${message}\n<b>Waktu:</b> ${new Date().toLocaleString('id-ID')}`;
      
      telegramSent = await sendTelegramNotification(formattedMessage);
    }

    // Save alert to database
    await prisma.alert.create({
      data: {
        siteId,
        alertType,
        message,
        severity,
        telegramSent,
      },
    });
  } catch (error) {
    console.error('Error triggering alert:', error);
  }
}
