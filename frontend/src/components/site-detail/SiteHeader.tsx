import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, FileText } from 'lucide-react';
import type { Site } from '../../types/dashboard';

interface SiteHeaderProps {
  site: Site;
  downloadingPdf: boolean;
  onExportPdf: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  site,
  downloadingPdf,
  onExportPdf,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/sites"
        className="flex items-center gap-1.5 text-xs font-bold text-primary-teal/80 hover:text-primary-teal transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Web List
      </Link>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 text-primary-teal" />
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{site.name}</h2>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary-teal/80 hover:underline flex items-center gap-1 mt-1 font-semibold"
            >
              {site.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportPdf}
            disabled={downloadingPdf}
            className="px-3.5 py-1.5 rounded-lg bg-primary-teal text-white hover:bg-primary-teal/90 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Download Client Performance & Security Audit PDF Report"
          >
            <FileText className="h-4 w-4" />
            {downloadingPdf ? 'Generating PDF...' : 'Export Client PDF Report'}
          </button>
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border ${
              site.status === 'online'
                ? 'bg-success/15 text-success border-success/30'
                : 'bg-coral/15 text-coral border-coral/30'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                site.status === 'online' ? 'bg-success' : 'bg-coral'
              }`}
            />
            {site.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
