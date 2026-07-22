import { prisma } from '../db';

export interface OpportunityItem {
  type: 'striking_distance' | 'low_ctr' | 'content_decay' | 'cannibalization';
  title: string;
  detail: string;
  query?: string;
  url?: string;
  severity: 'high' | 'medium' | 'low';
  potential?: string;
}

/**
 * Generate Smart SEO Opportunities for a WordPress site based on article metadata & audit results.
 */
export async function generateSeoOpportunities(siteId: number): Promise<OpportunityItem[]> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { seoAuditResults: { orderBy: { auditedAt: 'desc' }, take: 1 } }
  });

  if (!site) return [];

  const opportunities: OpportunityItem[] = [];
  const recentArticles = site.seoRecentPosts ? JSON.parse(site.seoRecentPosts) : [];

  // 1. Striking Distance Opportunities (Keywords / Articles with SEO Score 50-80 that can reach Top 3)
  for (const article of recentArticles) {
    if (article.seo_score >= 50 && article.seo_score <= 80 && article.focus_keyword) {
      opportunities.push({
        type: 'striking_distance',
        title: `Striking Distance: "${article.focus_keyword}"`,
        detail: `Artikel "${article.title}" memiliki skor SEO ${article.seo_score}/100. Tambahkan 2-3 internal link & perbarui H2/H3 untuk mendorong posisi ke Top 3 Google.`,
        query: article.focus_keyword,
        url: article.url,
        severity: 'high',
        potential: '+35% Clicks Estimation',
      });
    }
  }

  // 2. Low CTR Opportunities (Articles missing meta description or attractive titles)
  const latestAudit = site.seoAuditResults[0];
  if (latestAudit && latestAudit.missingMetaDescCount > 0) {
    opportunities.push({
      type: 'low_ctr',
      title: 'Peluang Low CTR: Meta Description Kosong',
      detail: `Terdapat ${latestAudit.missingMetaDescCount} artikel tanpa meta description. Menambahkan meta description yang persuasif dapat meningkatkan Click-Through Rate hingga 2.5x.`,
      severity: 'high',
      potential: 'Fix CTR Gap',
    });
  }

  // 3. Keyword Cannibalization (Multiple articles sharing the same focus keyword)
  const keywordMap = new Map<string, string[]>();
  for (const article of recentArticles) {
    if (article.focus_keyword) {
      const kw = article.focus_keyword.toLowerCase().trim();
      const list = keywordMap.get(kw) || [];
      list.push(article.title);
      keywordMap.set(kw, list);
    }
  }

  for (const [kw, titles] of keywordMap.entries()) {
    if (titles.length > 1) {
      opportunities.push({
        type: 'cannibalization',
        title: `Keyword Cannibalization: "${kw}"`,
        detail: `${titles.length} artikel bersaing untuk kata kunci "${kw}" (${titles.join(', ')}). Gabungkan artikel atau konsolidasikan tag canonical.`,
        query: kw,
        severity: 'medium',
        potential: 'Prevent Rank Splitting',
      });
    }
  }

  // 4. Content Decay (Articles older than 6 months needing updates)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (const article of recentArticles) {
    if (article.publish_date && new Date(article.publish_date) < sixMonthsAgo) {
      opportunities.push({
        type: 'content_decay',
        title: `Content Decay: "${article.title}"`,
        detail: `Artikel dipublikasikan pada ${new Date(article.publish_date).toLocaleDateString('id-ID')}. Perbarui fakta, tanggal, dan tambahkan poin baru agar tidak kehilangan posisi pencarian.`,
        url: article.url,
        severity: 'low',
        potential: 'Recover Lost Traffic',
      });
    }
  }

  // Sync to database
  await prisma.seoOpportunity.deleteMany({ where: { siteId } });
  for (const opp of opportunities) {
    await prisma.seoOpportunity.create({
      data: {
        siteId,
        type: opp.type,
        title: opp.title,
        detail: opp.detail,
        query: opp.query,
        url: opp.url,
        severity: opp.severity,
        potential: opp.potential,
      },
    });
  }

  return opportunities;
}
