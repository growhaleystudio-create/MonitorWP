import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MapPin,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Globe
} from 'lucide-react';
import PetLoader from '../components/PetLoader';
import type { Site } from '../types/dashboard';

interface SitemapUrlItem {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  status: 'ok' | 'redirect' | 'broken' | 'error';
  isNoindex: boolean;
  canonicalUrl: string | null;
}

interface SitemapAuditData {
  sitemapUrl: string;
  totalUrls: number;
  okCount: number;
  redirectCount: number;
  brokenCount: number;
  avgResponseTimeMs: number;
  urls: SitemapUrlItem[];
  auditedAt: string;
}

export default function SitemapAudit() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [auditData, setAuditData] = useState<SitemapAuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'redirect' | 'broken'>('all');

  const fetchSites = async () => {
    try {
      const res = await axios.get('/api/dashboard/sites');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSites(res.data);
        setSelectedUrl(res.data[0].url);
      }
    } catch (e) {
      console.error('Failed to fetch sites:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleRunAudit = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/seo/sitemap-audit', { url: targetUrl });
      setAuditData(res.data);
    } catch (e) {
      console.error('Failed to run sitemap audit:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      handleRunAudit(selectedUrl);
    }
  }, [selectedUrl, handleRunAudit]);

  if (initialLoading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Initializing Sitemap Audit Engine..." />
      </div>
    );
  }

  const activeAuditUrl = customUrlInput || selectedUrl;

  const filteredUrls = (auditData?.urls || []).filter(item => {
    const matchesSearch = item.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter || (statusFilter === 'broken' && item.status === 'error');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 text-primary-dark animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-primary-teal/10 text-primary-teal border border-primary-teal/20">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Sitemap XML Auditor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Parse XML sitemaps, audit URL health, latency, canonical tags, and noindex directives.
            </p>
          </div>
        </div>

        {/* Site Selector & Audit Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedUrl}
            onChange={(e) => {
              setSelectedUrl(e.target.value);
              setCustomUrlInput('');
            }}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            {sites.map(s => (
              <option key={s.id} value={s.url}>{s.name} ({s.url})</option>
            ))}
          </select>

          <button
            onClick={() => handleRunAudit(activeAuditUrl)}
            disabled={loading || !activeAuditUrl}
            className="btn-teal text-xs flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Auditing Sitemap...' : 'Audit Sitemap'}</span>
          </button>
        </div>
      </div>

      {/* Quick Custom Input Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Globe className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Or enter custom sitemap URL (e.g. https://example.com/sitemap.xml)..."
          value={customUrlInput}
          onChange={(e) => setCustomUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customUrlInput) {
              handleRunAudit(customUrlInput);
            }
          }}
          className="w-full bg-transparent text-xs font-semibold focus:outline-hidden placeholder:text-slate-400"
        />
        {customUrlInput && (
          <button
            onClick={() => handleRunAudit(customUrlInput)}
            disabled={loading}
            className="px-3 py-1.5 bg-primary-teal text-white rounded text-xs font-bold shrink-0 cursor-pointer"
          >
            Test
          </button>
        )}
      </div>

      {auditData && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total URLs Audited</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{auditData.totalUrls}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Healthy (200 OK)</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{auditData.okCount}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Redirects (30x)</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{auditData.redirectCount}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-red-200 dark:border-red-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Broken / Errors</span>
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">{auditData.brokenCount}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Avg Latency</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{auditData.avgResponseTimeMs} ms</span>
            </div>
          </div>

          {/* Detailed URL Audit Table */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col gap-4 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Audited URLs Stream</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sitemap target: <code className="text-primary-teal font-mono">{auditData.sitemapUrl}</code></p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded gap-1 text-[11px] font-bold">
                  {(['all', 'ok', 'redirect', 'broken'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 rounded cursor-pointer capitalize ${statusFilter === f ? 'bg-primary-teal text-white' : 'text-slate-500'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800">
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4">Target URL</th>
                    <th className="py-3 px-4 text-center">Latency</th>
                    <th className="py-3 px-4 text-center">Noindex</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                  {filteredUrls.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black border ${
                          item.status === 'ok'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40'
                            : item.status === 'redirect'
                              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40'
                              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40'
                        }`}>
                          {item.status === 'ok' && <CheckCircle className="h-3 w-3 shrink-0" />}
                          {item.status === 'redirect' && <AlertTriangle className="h-3 w-3 shrink-0" />}
                          {(item.status === 'broken' || item.status === 'error') && <XCircle className="h-3 w-3 shrink-0" />}
                          {item.statusCode || 'ERR'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono select-all truncate max-w-[320px]" title={item.url}>
                        {item.url}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.responseTimeMs} ms
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.isNoindex ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/80 text-[10px] font-bold">
                            NOINDEX
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            INDEXABLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-teal hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
