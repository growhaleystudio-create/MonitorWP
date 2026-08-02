import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Code2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Share2,
  FileCode2,
  Globe
} from 'lucide-react';
import PetLoader from '../components/PetLoader';
import type { Site } from '../types/dashboard';

interface SchemaObject {
  type: string;
  rawJson: any;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface SchemaValidationResult {
  targetUrl: string;
  schemasFoundCount: number;
  validSchemasCount: number;
  schemas: SchemaObject[];
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
    siteName?: string;
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  auditedAt: string;
}

export default function SchemaValidator() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [result, setResult] = useState<SchemaValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  const handleValidate = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/seo/schema-validator', { url: targetUrl });
      setResult(res.data);
    } catch (e) {
      console.error('Failed to validate schema:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      handleValidate(selectedUrl);
    }
  }, [selectedUrl, handleValidate]);

  if (initialLoading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Initializing Schema Engine..." />
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
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Schema & Structured Data Inspector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Validate JSON-LD structured schemas, OpenGraph meta tags, and Twitter Cards.
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
            onClick={() => handleValidate(activeUrl)}
            disabled={loading || !activeUrl}
            className="btn-teal text-xs flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Inspecting Schema...' : 'Validate Schema'}</span>
          </button>
        </div>
      </div>

      {/* Quick Custom Input Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Globe className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Or enter URL to inspect (e.g. https://example.com/article)..."
          value={customUrlInput}
          onChange={(e) => setCustomUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customUrlInput) {
              handleValidate(customUrlInput);
            }
          }}
          className="w-full bg-transparent text-xs font-semibold focus:outline-hidden placeholder:text-slate-400"
        />
        {customUrlInput && (
          <button
            onClick={() => handleValidate(customUrlInput)}
            disabled={loading}
            className="px-3 py-1.5 bg-primary-teal text-white rounded text-xs font-bold shrink-0 cursor-pointer"
          >
            Inspect
          </button>
        )}
      </div>

      {result && (
        <div className="flex flex-col gap-6">
          {/* Summary Metric Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schemas Detected</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{result.schemasFoundCount}</span>
              </div>
              <FileCode2 className="h-8 w-8 text-primary-teal/80" />
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-950/60 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Valid JSON-LD Schemas</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{result.validSchemasCount}</span>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/80" />
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-950/60 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Social Graph Tags</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {result.openGraph.title ? 'OG Active' : 'No OG Tags'}
                </span>
              </div>
              <Share2 className="h-8 w-8 text-blue-500/80" />
            </div>
          </div>

          {/* JSON-LD Schemas Inspection Cards */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col gap-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Detected JSON-LD Microdata Structures
            </h3>

            {result.schemas.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                No JSON-LD structured schemas detected on this webpage.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {result.schemas.map((schema, idx) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-primary-teal">{schema.type}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          schema.isValid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {schema.isValid ? 'VALID SCHEMA' : 'ISSUES DETECTED'}
                        </span>
                      </div>
                    </div>

                    {schema.errors.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-3 rounded border border-red-200">
                        {schema.errors.map((err, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-1.5 font-semibold">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {schema.warnings.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 rounded border border-amber-200">
                        {schema.warnings.map((warn, wIdx) => (
                          <div key={wIdx} className="flex items-center gap-1.5 font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <pre className="p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto max-h-48 select-all">
                      {JSON.stringify(schema.rawJson, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OpenGraph & Social Media Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                OpenGraph Meta Audit
              </h4>
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">og:title</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px]">{result.openGraph.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">og:type</span>
                  <span className="text-primary-teal font-bold">{result.openGraph.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">og:site_name</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{result.openGraph.siteName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Twitter Card Meta Audit
              </h4>
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">twitter:card</span>
                  <span className="text-primary-teal font-bold">{result.twitterCard.card || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">twitter:title</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px]">{result.twitterCard.title || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
