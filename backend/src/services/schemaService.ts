import axios from 'axios';

export interface SchemaObject {
  type: string;
  rawJson: any;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
  siteName?: string;
}

export interface SchemaValidationResult {
  targetUrl: string;
  schemasFoundCount: number;
  validSchemasCount: number;
  schemas: SchemaObject[];
  openGraph: OpenGraphData;
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  auditedAt: string;
}

/**
 * Validate standard Schema.org JSON-LD object requirements
 */
function validateSchemaObject(json: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!json['@context']) {
    errors.push('Missing "@context" declaration (expected "https://schema.org")');
  }

  const type = json['@type'];
  if (!type) {
    errors.push('Missing "@type" property in JSON-LD structure');
    return { isValid: false, errors, warnings };
  }

  // Type-specific field validations
  if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    if (!json.headline) errors.push('Missing required property "headline" in Article schema');
    if (!json.author) warnings.push('Recommended property "author" is missing');
    if (!json.publisher) warnings.push('Recommended property "publisher" is missing');
    if (!json.image) warnings.push('Recommended property "image" is missing');
  } else if (type === 'Organization' || type === 'Corporation') {
    if (!json.name) errors.push('Missing required property "name" in Organization schema');
    if (!json.url) warnings.push('Recommended property "url" is missing');
  } else if (type === 'Product') {
    if (!json.name) errors.push('Missing required property "name" in Product schema');
    if (!json.offers) warnings.push('Recommended property "offers" (price/currency) is missing');
  } else if (type === 'BreadcrumbList') {
    if (!json.itemListElement || !Array.isArray(json.itemListElement)) {
      errors.push('Missing or invalid "itemListElement" array in BreadcrumbList schema');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and inspect structured data (JSON-LD, OpenGraph) for a webpage
 */
export async function validatePageSchemas(url: string): Promise<SchemaValidationResult> {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const response = await axios.get(targetUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'WhalePod-SchemaValidator/1.0' },
  });

  const html = typeof response.data === 'string' ? response.data : '';

  // Extract JSON-LD script blocks
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const schemas: SchemaObject[] = [];

  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const rawText = match[1].trim();
      const parsed = JSON.parse(rawText);

      // Handle both single object and @graph arrays
      const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);

      items.forEach((item: any) => {
        const type = item['@type'] || 'Unknown';
        const validation = validateSchemaObject(item);
        schemas.push({
          type,
          rawJson: item,
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      });
    } catch (e: any) {
      schemas.push({
        type: 'Invalid JSON',
        rawJson: match[1],
        isValid: false,
        errors: [`JSON Syntax Error: ${e.message}`],
        warnings: [],
      });
    }
  }

  // Extract OpenGraph meta tags
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogType = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1];

  // Extract Twitter Card meta tags
  const twCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const twTitle = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const twDesc = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const twImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1];

  const validCount = schemas.filter(s => s.isValid).length;

  return {
    targetUrl,
    schemasFoundCount: schemas.length,
    validSchemasCount: validCount,
    schemas,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      image: ogImage,
      type: ogType,
      url: targetUrl,
      siteName: ogSiteName,
    },
    twitterCard: {
      card: twCard,
      title: twTitle,
      description: twDesc,
      image: twImage,
    },
    auditedAt: new Date().toISOString(),
  };
}
