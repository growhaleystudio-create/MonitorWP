export interface Site {
  id: number;
  name: string;
  url: string;
  apiKey: string;
  isActive: boolean;
  status: string;
  lastSeenAt: string | null;
  wpMemoryUsage: number | null;
  diskTotal: number | null;
  diskFree: number | null;
  cpuLoad: number | null;
  createdAt: string;
  seoPlugin: string | null;
  seoTotalPosts: number | null;
  seoRecentPosts: string | null;
  scaResults: string | null;
  scaScore: number | null;
  plugins?: Plugin[];
}

export interface TrafficChartItem {
  date: string;
  pageviews: number;
  visitors: number;
}

export interface TopPageItem {
  url: string;
  views: number;
}

export interface TopReferrerItem {
  referer: string;
  views: number;
}

export interface TrafficStats {
  chartData: TrafficChartItem[];
  topPages: TopPageItem[];
  topReferrers: TopReferrerItem[];
  totalPageviews30d: number;
  totalUniqueVisitors30d: number;
}

export interface Plugin {
  id: number;
  name: string;
  slug: string;
  version: string;
  latestVersion: string | null;
  isActive: boolean;
  isExpired: boolean;
  expiredAt: string | null;
  requiresUpdate: boolean;
  updatedAt: string;
}

export interface UptimeLog {
  id: number;
  statusCode: number;
  responseTimeMs: number;
  isUp: boolean;
  checkedAt: string;
}

export interface ErrorLog {
  id: number;
  errorCode: number;
  url: string;
  message: string | null;
  count: number;
  lastSeen: string;
}

export interface SecurityEvent {
  id: number;
  eventType: string;
  detail: string;
  ipAddress: string | null;
  username: string | null;
  createdAt: string;
}

export interface OverviewStats {
  totalSites: number;
  onlineSites: number;
  offlineSites: number;
  pluginsNeedingUpdate: number;
  pluginsExpired: number;
  recentErrors: number;
}

export interface TimelineEvent {
  id: string;
  type: 'alert' | 'security' | string;
  siteName: string;
  eventType: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | string;
  createdAt: string;
}

export interface QuickSite extends Site {
  _count?: {
    plugins: number;
  };
}

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
}

export interface PageSpeedStatus {
  rateLimited: boolean;
  rateLimitedAt: string | null;
  hasApiKey: boolean;
}

export interface SecurityStats {
  bannedIpsCount?: number;
  failedLogins24h?: number;
  malwareStatus?: string;
  sslStatus?: string;
  sslValidUntil?: string;
  [key: string]: any;
}

export interface SeoData {
  pagespeedStatus?: PageSpeedStatus;
  performanceScore?: number;
  accessibilityScore?: number;
  bestPracticesScore?: number;
  seoScore?: number;
  pageSpeedScore?: number;
  mobileScore?: number;
  desktopScore?: number;
  lastChecked?: string;
  [key: string]: any;
}
