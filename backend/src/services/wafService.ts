import { prisma } from '../db';

export interface BannedIpItem {
  id: string;
  ipAddress: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
}

// In-memory cache of banned IP addresses for ultra-fast lookup
const bannedIpsCache = new Map<string, BannedIpItem>([
  ['185.220.101.4', { id: 'ban-1', ipAddress: '185.220.101.4', reason: 'Repeated SQL Injection Attack', bannedBy: 'System WAF', bannedAt: new Date(Date.now() - 3600000).toISOString() }],
  ['194.26.29.112', { id: 'ban-2', ipAddress: '194.26.29.112', reason: 'Brute Force Admin Login Spammer', bannedBy: 'System WAF', bannedAt: new Date(Date.now() - 7200000).toISOString() }],
]);

/**
 * Returns all currently blacklisted IP addresses.
 */
export async function getBannedIps(): Promise<BannedIpItem[]> {
  try {
    const dbSettings = await prisma.setting.findUnique({ where: { key: 'waf_banned_ips' } });
    if (dbSettings && dbSettings.value) {
      const parsed: BannedIpItem[] = JSON.parse(dbSettings.value);
      parsed.forEach((item) => bannedIpsCache.set(item.ipAddress, item));
      return Array.from(bannedIpsCache.values());
    }
  } catch (e) {
    // fallback to cache
  }

  return Array.from(bannedIpsCache.values());
}

/**
 * Adds an IP address to the central WAF blacklist.
 */
export async function banIpAddress(ipAddress: string, reason: string = 'Security Policy Violation', bannedBy: string = 'Admin'): Promise<BannedIpItem> {
  const cleanIp = (ipAddress || '').trim();
  const newItem: BannedIpItem = {
    id: `ban-${Date.now()}`,
    ipAddress: cleanIp,
    reason,
    bannedBy,
    bannedAt: new Date().toISOString(),
  };

  bannedIpsCache.set(cleanIp, newItem);
  const currentList = Array.from(bannedIpsCache.values());

  try {
    await prisma.setting.upsert({
      where: { key: 'waf_banned_ips' },
      update: { value: JSON.stringify(currentList) },
      create: { key: 'waf_banned_ips', value: JSON.stringify(currentList) },
    });
  } catch (e) {
    console.error('Error saving banned IPs to DB:', e);
  }

  return newItem;
}

/**
 * Removes an IP address from the blacklist.
 */
export async function unbanIpAddress(ipAddress: string): Promise<boolean> {
  const cleanIp = (ipAddress || '').trim();
  bannedIpsCache.delete(cleanIp);
  const currentList = Array.from(bannedIpsCache.values());

  try {
    await prisma.setting.upsert({
      where: { key: 'waf_banned_ips' },
      update: { value: JSON.stringify(currentList) },
      create: { key: 'waf_banned_ips', value: JSON.stringify(currentList) },
    });
    return true;
  } catch (e) {
    console.error('Error updating banned IPs in DB:', e);
    return false;
  }
}

/**
 * Synchronously checks if an IP is blacklisted.
 */
export function isIpBanned(ipAddress: string): boolean {
  return bannedIpsCache.has((ipAddress || '').trim());
}
