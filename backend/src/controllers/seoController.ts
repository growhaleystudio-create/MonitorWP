import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db';
import { runPageSpeedCheck } from '../services/pagespeedService';
import { generateSeoOpportunities } from '../services/seoOpportunitiesService';

/**
 * Perform a real server-side HTML scraping audit for a website.
 */
async function runServerSideOnPageAudit(siteId: number, url: string) {
  let targetUrl = (url || '').trim();
  if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  let missingH1Count = 0;
  let missingMetaDescCount = 0;
  let missingAltCount = 0;
  let noindexCount = 0;
  let sitemapStatus = 'missing';
  let robotsStatus = 'missing';
  const issues: any[] = [];

  try {
    const res = await axios.get(targetUrl, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Compatible; GrowhaleyMonitor/1.0)' },
      validateStatus: () => true,
    });

    const html = typeof res.data === 'string' ? res.data : '';

    // 1. H1 Check
    if (!/<h1[^>]*>/i.test(html)) {
      missingH1Count = 1;
      issues.push({
        type: 'missing_h1',
        title: 'Missing H1 Heading Tag',
        url: targetUrl,
        detail: 'The homepage HTML does not contain a primary <h1> heading tag.',
      });
    }

    // 2. Meta Description Check
    if (!/<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html) &&
        !/<meta[^>]*property=["']og:description["'][^>]*content=["'][^"']+["']/i.test(html)) {
      missingMetaDescCount = 1;
      issues.push({
        type: 'missing_meta_desc',
        title: 'Missing Meta Description',
        url: targetUrl,
        detail: 'No meta description or OpenGraph description tag found in <head>.',
      });
    }

    // 3. Image Alt Tag Check
    const imgMatches = html.match(/<img[^>]+>/gi) || [];
    let missingAltInImgs = 0;
    for (const img of imgMatches) {
      if (!/alt=["'][^"']+["']/i.test(img)) {
        missingAltInImgs++;
      }
    }
    missingAltCount = missingAltInImgs;
    if (missingAltInImgs > 0) {
      issues.push({
        type: 'missing_alt',
        title: 'Images Missing Alt Attributes',
        url: targetUrl,
        detail: `${missingAltInImgs} <img> tag(s) on the homepage lack descriptive alt text.`,
      });
    }

    // 4. Noindex Check
    if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(html)) {
      noindexCount = 1;
      issues.push({
        type: 'noindex_detected',
        title: 'Accidental Noindex Meta Tag Detected',
        url: targetUrl,
        detail: 'The site contains a <meta name="robots" content="noindex"> blocking search engines.',
      });
    }

    // 5. Robots.txt Check
    try {
      const baseUrl = new URL(targetUrl).origin;
      const robotsRes = await axios.get(`${baseUrl}/robots.txt`, { timeout: 4000, validateStatus: () => true });
      if (robotsRes.status === 200) {
        robotsStatus = 'ok';
      }
    } catch (e) {
      robotsStatus = 'missing';
    }

    // 6. Sitemap Check
    try {
      const baseUrl = new URL(targetUrl).origin;
      const sitemapRes = await axios.get(`${baseUrl}/sitemap.xml`, { timeout: 4000, validateStatus: () => true });
      if (sitemapRes.status === 200) {
        sitemapStatus = 'ok';
      }
    } catch (e) {
      sitemapStatus = 'missing';
    }
  } catch (err) {
    // Basic fallback if site scraping failed
    missingH1Count = 1;
    missingMetaDescCount = 1;
  }

  const penalty = (missingH1Count * 15) + (missingMetaDescCount * 10) + (missingAltCount * 2) + (noindexCount * 25);
  const score = Math.max(10, 100 - penalty);

  const auditRecord = await prisma.seoAuditResult.create({
    data: {
      siteId,
      score,
      missingH1Count,
      missingMetaDescCount,
      missingAltCount,
      noindexCount,
      sitemapStatus,
      robotsStatus,
      issuesJson: JSON.stringify(issues),
    },
  });

  return auditRecord;
}

/**
 * GET /api/sites/:id/seo
 * Get comprehensive SEO audit, Core Web Vitals, and Smart SEO Opportunities.
 */
export async function getSiteSeoDetails(req: Request, res: Response) {
  try {
    const siteId = parseInt(req.params.id, 10);
    if (isNaN(siteId)) {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pageSpeedMetrics: {
          orderBy: { checkedAt: 'desc' },
          take: 4,
        },
        seoAuditResults: {
          orderBy: { auditedAt: 'desc' },
          take: 1,
        },
        seoOpportunities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Run real On-Page audit if no audit results exist
    let latestAudit = site.seoAuditResults[0] || null;
    if (!latestAudit && site.url) {
      latestAudit = await runServerSideOnPageAudit(siteId, site.url);
    }

    // Run PageSpeed check if no metrics exist
    let pageSpeedMetrics = site.pageSpeedMetrics;
    if (pageSpeedMetrics.length === 0 && site.url) {
      await runPageSpeedCheck(siteId, site.url, 'MOBILE');
      await runPageSpeedCheck(siteId, site.url, 'DESKTOP');
      pageSpeedMetrics = await prisma.pageSpeedMetric.findMany({
        where: { siteId },
        orderBy: { checkedAt: 'desc' },
        take: 4,
      });
    }

    // Generate opportunities if none exist
    let opportunities = site.seoOpportunities;
    if (opportunities.length === 0) {
      await generateSeoOpportunities(siteId);
      opportunities = await prisma.seoOpportunity.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
      });
    }

    const mobileVitals = pageSpeedMetrics.find((m) => m.strategy === 'MOBILE') || null;
    const desktopVitals = pageSpeedMetrics.find((m) => m.strategy === 'DESKTOP') || null;

    res.json({
      siteId,
      siteName: site.name,
      seoPlugin: site.seoPlugin,
      seoTotalPosts: site.seoTotalPosts,
      audit: latestAudit
        ? {
            score: latestAudit.score,
            missingH1Count: latestAudit.missingH1Count,
            missingMetaDescCount: latestAudit.missingMetaDescCount,
            missingAltCount: latestAudit.missingAltCount,
            noindexCount: latestAudit.noindexCount,
            sitemapStatus: latestAudit.sitemapStatus,
            robotsStatus: latestAudit.robotsStatus,
            issues: latestAudit.issuesJson ? JSON.parse(latestAudit.issuesJson) : [],
            auditedAt: latestAudit.auditedAt,
          }
        : null,
      vitals: {
        mobile: mobileVitals,
        desktop: desktopVitals,
      },
      opportunities,
    });
  } catch (error: any) {
    console.error('Error fetching SEO details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * POST /api/sites/:id/pagespeed
 * Run an on-demand PageSpeed Insights check.
 */
export async function runPageSpeedTest(req: Request, res: Response) {
  try {
    const siteId = parseInt(req.params.id, 10);
    if (isNaN(siteId)) {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Also run fresh server-side on-page audit
    await runServerSideOnPageAudit(siteId, site.url);

    const mobile = await runPageSpeedCheck(siteId, site.url, 'MOBILE');
    const desktop = await runPageSpeedCheck(siteId, site.url, 'DESKTOP');

    res.json({
      success: true,
      message: 'PageSpeed test completed',
      vitals: { mobile, desktop },
    });
  } catch (error: any) {
    console.error('Error running PageSpeed test:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
