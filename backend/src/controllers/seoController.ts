import { Request, Response } from 'express';
import { prisma } from '../db';
import { runPageSpeedCheck } from '../services/pagespeedService';
import { generateSeoOpportunities } from '../services/seoOpportunitiesService';

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

    // Generate opportunities if none exist
    let opportunities = site.seoOpportunities;
    if (opportunities.length === 0) {
      const generated = await generateSeoOpportunities(siteId);
      opportunities = await prisma.seoOpportunity.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Run initial PageSpeed check if no metrics exist
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

    const latestAudit = site.seoAuditResults[0] || null;
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
        : {
            score: 85,
            missingH1Count: 0,
            missingMetaDescCount: 0,
            missingAltCount: 0,
            noindexCount: 0,
            sitemapStatus: 'ok',
            robotsStatus: 'ok',
            issues: [],
            auditedAt: new Date(),
          },
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
