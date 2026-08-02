import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import PetLoader from '../components/PetLoader';
import type { Site } from '../types/dashboard';

interface HeaderItem {
  key: string;
  value: string | null;
  isPresent: boolean;
  status: 'good' | 'warning' | 'missing';
  recommendation: string;
}

interface SecurityHeadersResult {
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

export default function SecurityHeaders() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [result, setResult] = useState<SecurityHeadersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'nginx' | 'apache' | 'express'>('nginx');

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

  const handleAudit = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/security/headers-audit', { url: targetUrl });
      setResult(res.data);
    } catch (e) {
      console.error('Failed to audit security headers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      handleAudit(selectedUrl);
    }
  }, [selectedUrl, handleAudit]);

  const copySnippet = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Initializing Security Headers Engine..." />
      </div>
    );
  }

  const activeUrl = customUrlInput || selectedUrl;

  return (
    <div className="flex flex-col gap-6 text-primary-dark animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-primary-teal/10 text-primary-teal border border-primary-teal/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">OWASP Security Headers Inspector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit HTTP response headers, evaluate letter grade rating, and generate Nginx/Apache fix snippets.
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
            onClick={() => handleAudit(activeUrl)}
            disabled={loading || !activeUrl}
            className="btn-teal text-xs flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Auditing Headers...' : 'Audit Headers'}</span>
          </button>
        </div>
      </div>

      {/* Quick Custom Input Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Globe className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Or enter target URL to test headers (e.g. https://example.com)..."
          value={customUrlInput}
          onChange={(e) => setCustomUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customUrlInput) {
              handleAudit(customUrlInput);
            }
          }}
          className="w-full bg-transparent text-xs font-semibold focus:outline-hidden placeholder:text-slate-400"
        />
        {customUrlInput && (
          <button
            onClick={() => handleAudit(customUrlInput)}
            disabled={loading}
            className="px-3 py-1.5 bg-primary-teal text-white rounded text-xs font-bold shrink-0 cursor-pointer"
          >
            Test
          </button>
        )}
      </div>

      {result && (
        <div className="flex flex-col gap-6">
          {/* Rating Grade Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between shadow-sm md:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Header Grade</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={`text-5xl font-black ${
                    result.grade.startsWith('A') ? 'text-emerald-500' : result.grade === 'B' ? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {result.grade}
                  </span>
                  <span className="text-sm font-bold text-slate-500">Score: {result.score} / 100</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-center gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Headers</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {result.headers.filter(h => h.isPresent).length} / {result.headers.length}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-center gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missing Security Headers</span>
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                {result.headers.filter(h => !h.isPresent).length}
              </span>
            </div>
          </div>

          {/* OWASP Security Headers Checklist */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              OWASP Security Headers Audit Details
            </h3>

            <div className="flex flex-col gap-3">
              {result.headers.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/40">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.key}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        item.isPresent ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {item.isPresent ? 'PASSED' : 'MISSING'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.recommendation}</p>
                    {item.value && (
                      <code className="text-[10px] font-mono bg-slate-200 dark:bg-slate-900 px-2 py-1 rounded text-primary-teal truncate max-w-[400px] mt-1 select-all">
                        {item.value}
                      </code>
                    )}
                  </div>

                  <span className="shrink-0">
                    {item.isPresent ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Fix Snippets */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">1-Click Fix Server Configurations</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Copy and paste these missing header rules into your web server config.</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded gap-1 text-xs font-bold">
                {(['nginx', 'apache', 'express'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSnippetTab(tab)}
                    className={`px-3 py-1 rounded cursor-pointer uppercase ${activeSnippetTab === tab ? 'bg-primary-teal text-white' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto select-all leading-relaxed">
                {result.remediationSnippets[activeSnippetTab]}
              </pre>
              <button
                onClick={() => copySnippet(result.remediationSnippets[activeSnippetTab], activeSnippetTab)}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                {copiedSnippet === activeSnippetTab ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
