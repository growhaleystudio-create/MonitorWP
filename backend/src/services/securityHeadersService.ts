import axios from 'axios';

export interface HeaderItem {
  key: string;
  value: string | null;
  isPresent: boolean;
  status: 'good' | 'warning' | 'missing';
  recommendation: string;
}

export interface SecurityHeadersAuditResult {
  targetUrl: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  headers: HeaderItem[];
  remediationSnippets: {
    nginx: string;
    apache: string;
    express: string;
  };
  auditedAt: string;
}

export async function auditSecurityHeaders(url: string): Promise<SecurityHeadersAuditResult> {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const response = await axios.head(targetUrl, {
    timeout: 8000,
    headers: { 'User-Agent': 'WhalePod-SecurityHeaderAuditor/1.0' },
    validateStatus: () => true,
  });

  const resHeaders = response.headers;

  const headerRules = [
    {
      key: 'strict-transport-security',
      name: 'Strict-Transport-Security (HSTS)',
      weight: 25,
      recommendation: 'Enforces HTTPS connections and prevents SSL stripping attacks.',
      snippetNginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
      snippetApache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
    },
    {
      key: 'content-security-policy',
      name: 'Content-Security-Policy (CSP)',
      weight: 25,
      recommendation: 'Restricts loaded scripts and resources to mitigate XSS attacks.',
      snippetNginx: 'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\' \'unsafe-inline\';" always;',
      snippetApache: 'Header always set Content-Security-Policy "default-src \'self\';"',
    },
    {
      key: 'x-frame-options',
      name: 'X-Frame-Options',
      weight: 15,
      recommendation: 'Prevents clickjacking by controlling if site can be embedded in iframe.',
      snippetNginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
      snippetApache: 'Header always set X-Frame-Options "SAMEORIGIN"',
    },
    {
      key: 'x-content-type-options',
      name: 'X-Content-Type-Options',
      weight: 15,
      recommendation: 'Prevents MIME-sniffing vulnerabilities.',
      snippetNginx: 'add_header X-Content-Type-Options "nosniff" always;',
      snippetApache: 'Header always set X-Content-Type-Options "nosniff"',
    },
    {
      key: 'referrer-policy',
      name: 'Referrer-Policy',
      weight: 10,
      recommendation: 'Controls how much referrer information is sent with requests.',
      snippetNginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
      snippetApache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
    },
    {
      key: 'permissions-policy',
      name: 'Permissions-Policy',
      weight: 10,
      recommendation: 'Restricts access to browser features (camera, microphone, geolocation).',
      snippetNginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
      snippetApache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
    },
  ];

  let currentScore = 0;
  const headersResult: HeaderItem[] = [];
  const nginxLines: string[] = [];
  const apacheLines: string[] = [];

  headerRules.forEach(rule => {
    const rawVal = resHeaders[rule.key];
    const valString = Array.isArray(rawVal) ? rawVal.join(', ') : (rawVal || null);

    const isPresent = Boolean(valString);
    let status: 'good' | 'warning' | 'missing' = 'missing';

    if (isPresent) {
      status = 'good';
      currentScore += rule.weight;
    } else {
      status = 'missing';
      nginxLines.push(rule.snippetNginx);
      apacheLines.push(rule.snippetApache);
    }

    headersResult.push({
      key: rule.name,
      value: valString,
      isPresent,
      status,
      recommendation: rule.recommendation,
    });
  });

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (currentScore >= 95) grade = 'A+';
  else if (currentScore >= 80) grade = 'A';
  else if (currentScore >= 65) grade = 'B';
  else if (currentScore >= 50) grade = 'C';
  else if (currentScore >= 35) grade = 'D';

  return {
    targetUrl,
    grade,
    score: currentScore,
    headers: headersResult,
    remediationSnippets: {
      nginx: nginxLines.length > 0 ? nginxLines.join('\n') : '# All recommended security headers are present!',
      apache: apacheLines.length > 0 ? apacheLines.join('\n') : '# All recommended security headers are present!',
      express: `// Express.js Helmet integration\napp.use(helmet());`,
    },
    auditedAt: new Date().toISOString(),
  };
}
