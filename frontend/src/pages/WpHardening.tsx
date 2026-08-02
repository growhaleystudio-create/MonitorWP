import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ListChecks,
  RefreshCw,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import PetLoader from '../components/PetLoader';
import type { Site } from '../types/dashboard';

interface HardeningItem {
  id: string;
  category: 'core' | 'file_access' | 'api' | 'database';
  title: string;
  description: string;
  passed: boolean;
  severity: 'high' | 'medium' | 'low';
  remediationCode: string;
}

interface HardeningResult {
  targetUrl: string;
  hardeningScore: number;
  totalChecks: number;
  passedChecks: number;
  items: HardeningItem[];
  auditedAt: string;
}

export default function WpHardening() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [result, setResult] = useState<HardeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      const res = await axios.post('/api/security/hardening-audit', { url: targetUrl });
      setResult(res.data);
    } catch (e) {
      console.error('Failed to audit WP hardening:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      handleAudit(selectedUrl);
    }
  }, [selectedUrl, handleAudit]);

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Initializing Hardening Auditor..." />
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
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">WP Server & Core Hardening Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit WordPress core generator disclosure, XML-RPC Status, user enumeration, and file editing flags.
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
            <span>{loading ? 'Auditing Hardening...' : 'Audit Hardening'}</span>
          </button>
        </div>
      </div>

      {/* Quick Custom Input Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Globe className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Or enter target WP URL to test hardening (e.g. https://example.com)..."
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
          {/* Progress Gauge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 flex flex-col gap-2 shadow-sm md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hardening Score</span>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-extrabold text-primary-teal">{result.hardeningScore}%</span>
                <span className="text-xs font-bold text-slate-500">
                  {result.passedChecks} of {result.totalChecks} Checks Passed
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mt-1">
                <div
                  className="bg-primary-teal h-full rounded-full transition-all duration-500"
                  style={{ width: `${result.hardeningScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-center gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Risk Vulnerabilities</span>
              <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                {result.items.filter(i => !i.passed && i.severity === 'high').length}
              </span>
            </div>
          </div>

          {/* Hardening Checklist & Remediation Snippets */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Server & WP Hardening Audit Checklist
            </h3>

            <div className="flex flex-col gap-4">
              {result.items.map((item) => (
                <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {item.passed ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            item.severity === 'high'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.severity} severity
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-black border shrink-0 ${
                      item.passed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {item.passed ? 'HARDENED' : 'UNSECURED'}
                    </span>
                  </div>

                  {!item.passed && (
                    <div className="relative mt-2">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono select-all overflow-x-auto">
                        {item.remediationCode}
                      </pre>
                      <button
                        onClick={() => copySnippet(item.remediationCode, item.id)}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
