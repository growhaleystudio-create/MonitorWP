import axios from 'axios';

export interface SitemapUrlResult {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  status: 'ok' | 'redirect' | 'broken' | 'error';
  isNoindex: boolean;
  canonicalUrl: string | null;
  lastmod?: string;
}

export interface SitemapAuditSummary {
  sitemapUrl: string;
  totalUrls: number;
  okCount: number;
  redirectCount: number;
  brokenCount: number;
  avgResponseTimeMs: number;
  urls: SitemapUrlResult[];
  auditedAt: string;
}

/**
 * Extract URLs from raw sitemap XML content
 */
function extractUrlsFromXml(xml: string): { url: string; lastmod?: string }[] {
  const urls: { url: string; lastmod?: string }[] = [];
  const locRegex = /<loc>(.*?)<\/loc>/gi;
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/gi;
  
  let locMatch;
  while ((locMatch = locRegex.exec(xml)) !== null) {
    const rawUrl = locMatch[1].trim();
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      urls.push({ url: rawUrl });
    }
  }

  // Deduplicate URLs
  const uniqueMap = new Map<string, string | undefined>();
  urls.forEach(u => uniqueMap.set(u.url, u.lastmod));

  return Array.from(uniqueMap.entries()).map(([url, lastmod]) => ({ url, lastmod }));
}

/**
 * Audit a single URL for HTTP status, latency, and meta tags
 */
async function auditSingleUrl(targetUrl: string): Promise<SitemapUrlResult> {
  const startTime = Date.now();
  try {
    const response = await axios.get(targetUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'WhalePod-SitemapAuditor/1.0',
      },
      maxRedirects: 3,
      validateStatus: () => true, // Don't throw on status codes
    });

    const responseTimeMs = Date.now() - startTime;
    const statusCode = response.status;
    const html = typeof response.data === 'string' ? response.data : '';

    const isNoindex = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(html) ||
                      (response.headers['x-robots-tag']?.toString().includes('noindex') ?? false);

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

    let status: 'ok' | 'redirect' | 'broken' | 'error' = 'ok';
    if (statusCode >= 200 && statusCode < 300) status = 'ok';
    else if (statusCode >= 300 && statusCode < 400) status = 'redirect';
    else if (statusCode >= 400) status = 'broken';

    return {
      url: targetUrl,
      statusCode,
      responseTimeMs,
      status,
      isNoindex,
      canonicalUrl,
    };
  } catch (err: any) {
    return {
      url: targetUrl,
      statusCode: err.response?.status || 0,
      responseTimeMs: Date.now() - startTime,
      status: 'error',
      isNoindex: false,
      canonicalUrl: null,
    };
  }
}

/**
 * Audit full XML sitemap by URL
 */
export async function auditSitemap(sitemapUrl: string): Promise<SitemapAuditSummary> {
  // Normalize URL
  let targetSitemapUrl = sitemapUrl.trim();
  if (!targetSitemapUrl.startsWith('http://') && !targetSitemapUrl.startsWith('https://')) {
    targetSitemapUrl = `https://${targetSitemapUrl}`;
  }
  if (!targetSitemapUrl.endsWith('.xml') && !targetSitemapUrl.includes('sitemap')) {
    targetSitemapUrl = `${targetSitemapUrl.replace(/\/$/, '')}/sitemap.xml`;
  }

  const response = await axios.get(targetSitemapUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'WhalePod-SitemapAuditor/1.0' },
  });

  const xmlContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  const parsedUrls = extractUrlsFromXml(xmlContent);

  // Limit audit to first 25 URLs for fast responsiveness
  const urlsToAudit = parsedUrls.slice(0, 25);

  const auditedResults = await Promise.all(
    urlsToAudit.map(item => auditSingleUrl(item.url))
  );

  const okCount = auditedResults.filter(r => r.status === 'ok').length;
  const redirectCount = auditedResults.filter(r => r.status === 'redirect').length;
  const brokenCount = auditedResults.filter(r => r.status === 'broken' || r.status === 'error').length;
  
  const totalMs = auditedResults.reduce((acc, curr) => acc + curr.responseTimeMs, 0);
  const avgResponseTimeMs = auditedResults.length > 0 ? Math.round(totalMs / auditedResults.length) : 0;

  return {
    sitemapUrl: targetSitemapUrl,
    totalUrls: auditedResults.length,
    okCount,
    redirectCount,
    brokenCount,
    avgResponseTimeMs,
    urls: auditedResults,
    auditedAt: new Date().toISOString(),
  };
}
