import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Construction,
  MapPin,
  Code2,
  ShieldCheck,
  ListChecks,
} from 'lucide-react';

const featureMap: Record<string, { title: string; description: string; icon: any; color: string }> = {
  '/seo/sitemap': {
    title: 'Sitemap Audit',
    description: 'Validate XML sitemaps, detect orphan pages, and monitor sitemap health across all your sites.',
    icon: MapPin,
    color: 'text-primary-teal',
  },
  '/seo/schema': {
    title: 'Schema Validator',
    description: 'Validate JSON-LD, Microdata & RDFa structured data against Google Rich Results guidelines.',
    icon: Code2,
    color: 'text-accent-gold',
  },
  '/security/headers': {
    title: 'Security Headers',
    description: 'Scan and grade HTTP security headers (CSP, HSTS, X-Frame-Options, and more) with remediation guidance.',
    icon: ShieldCheck,
    color: 'text-sky',
  },
  '/security/hardening': {
    title: 'WP Hardening',
    description: 'Automated WordPress security hardening checklist — file permissions, debug mode, xmlrpc, and more.',
    icon: ListChecks,
    color: 'text-coral',
  },
};

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();

  const feature = featureMap[location.pathname] || {
    title: 'Coming Soon',
    description: 'This feature is currently under development.',
    icon: Construction,
    color: 'text-primary-teal',
  };

  const FeatureIcon = feature.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Glowing icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary-teal/10 dark:bg-primary-teal/5 blur-2xl scale-150" />
        <div className="relative h-20 w-20 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-card flex items-center justify-center">
          <FeatureIcon className={`h-9 w-9 ${feature.color}`} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
        {feature.title}
      </h1>

      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/25 mb-4">
        <Construction className="h-3.5 w-3.5 text-accent-dark dark:text-accent-gold" />
        <span className="text-[11px] font-bold text-accent-dark dark:text-accent-gold uppercase tracking-wider">
          Coming Soon
        </span>
      </div>

      {/* Description */}
      <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-8">
        {feature.description}
      </p>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="btn-teal gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </button>
    </div>
  );
}
