import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PetLoader from '../components/PetLoader';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Zap,
  Gauge,
  TrendingUp
} from 'lucide-react';

interface Site {
  id: number;
  name: string;
  url: string;
  apiKey: string;
  isActive: boolean;
  status: string;
  lastSeenAt: string | null;
  wpMemoryUsage: number | null;
  diskTotal: number | null;
  diskFree: number | null;
  cpuLoad: number | null;
  createdAt: string;
  seoPlugin: string | null;
  seoTotalPosts: number | null;
  seoRecentPosts: string | null;
  scaResults: string | null;
  scaScore: number | null;
}

interface TrafficChartItem {
  date: string;
  pageviews: number;
  visitors: number;
}

interface TopPageItem {
  url: string;
  views: number;
}

interface TopReferrerItem {
  referer: string;
  views: number;
}

interface TrafficStats {
  chartData: TrafficChartItem[];
  topPages: TopPageItem[];
  topReferrers: TopReferrerItem[];
  totalPageviews30d: number;
  totalUniqueVisitors30d: number;
}

interface Plugin {
  id: number;
  name: string;
  slug: string;
  version: string;
  latestVersion: string | null;
  isActive: boolean;
  isExpired: boolean;
  expiredAt: string | null;
  requiresUpdate: boolean;
  updatedAt: string;
}

interface UptimeLog {
  id: number;
  statusCode: number;
  responseTimeMs: number;
  isUp: boolean;
  checkedAt: string;
}

interface ErrorLog {
  id: number;
  errorCode: number;
  url: string;
  message: string | null;
  count: number;
  lastSeen: string;
}

interface SecurityEvent {
  id: number;
  eventType: string;
  detail: string;
  ipAddress: string | null;
  username: string | null;
  createdAt: string;
}

function SiteDetail() {
  const { id } = useParams();
  const [site, setSite] = useState<Site | null>(null);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [uptimeLogs, setUptimeLogs] = useState<UptimeLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'plugins' | 'errors' | 'security' | 'seo' | 'traffic'>('plugins');
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [testingPageSpeed, setTestingPageSpeed] = useState(false);

  const fetchSeoData = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/dashboard/sites/${id}/seo`);
      setSeoData(res.data);
    } catch (err) {
      console.error('Failed to fetch SEO details:', err);
    }
  };

  const handleRunPageSpeed = async () => {
    if (!id) return;
    setTestingPageSpeed(true);
    try {
      await axios.post(`/api/dashboard/sites/${id}/pagespeed`);
      await fetchSeoData();
    } catch (err) {
      console.error('Failed to run PageSpeed test:', err);
    } finally {
      setTestingPageSpeed(false);
    }
  };

  const fetchSiteDetail = async () => {
    try {
      const response = await axios.get(`/api/dashboard/sites/${id}`);
      setSite(response.data.site);
      setPlugins(response.data.site.plugins || []);
      setUptimeLogs(response.data.uptimeLogs || []);
      setErrorLogs(response.data.errorLogs || []);
      setSecurityEvents(response.data.securityEvents || []);
      setTrafficStats(response.data.trafficStats || null);
      setSecurityStats(response.data.securityStats || null);
      if (response.data.seoData) {
        setSeoData(response.data.seoData);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching site details:', err);
      setError('Failed to load website monitoring details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteDetail();
    fetchSeoData();
    const interval = setInterval(() => {
      fetchSiteDetail();
      fetchSeoData();
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const copyApiKey = () => {
    if (!site) return;
    navigator.clipboard.writeText(site.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getAverageResponseTime = () => {
    if (uptimeLogs.length === 0) return 0;
    const sum = uptimeLogs.reduce((acc, curr) => acc + curr.responseTimeMs, 0);
    return Math.round(sum / uptimeLogs.length);
  };

  const getUptimePercentage = () => {
    if (uptimeLogs.length === 0) return 100;
    const upCount = uptimeLogs.filter((log) => log.isUp).length;
    return Math.round((upCount / uptimeLogs.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Gathering site statistics..." />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center shadow-sm">
        <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">Site not found</p>
        <Link to="/sites" className="text-primary-teal hover:underline font-bold mt-2 inline-block">
          Back to Monitored Sites
        </Link>
      </div>
    );
  }

  const chartData = uptimeLogs.map((log) => ({
    time: new Date(log.checkedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    ms: log.responseTimeMs,
    status: log.isUp ? 'UP' : 'DOWN',
  }));

  return (
    <div className="flex flex-col gap-8 text-primary-dark">
      {/* Back button & Title */}
      <div className="flex flex-col gap-3">
        <Link to="/sites" className="flex items-center gap-1.5 text-xs font-bold text-primary-teal/80 hover:text-primary-teal transition">
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
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border ${
              site.status === 'online'
                ? 'bg-success/15 text-success border-success/30'
                : 'bg-coral/15 text-coral border-coral/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${site.status === 'online' ? 'bg-success' : 'bg-coral'}`} />
              {site.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-coral/10 border-2 border-coral text-coral-dark text-xs font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* Overview Cards & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick details */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col justify-between gap-6 border-l-4 border-l-primary-teal">
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Telemetry Status
            </h3>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Last Contact</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {site.lastSeenAt ? new Date(site.lastSeenAt).toLocaleString('id-ID') : 'Never'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Latency Ping</span>
                <span className="text-primary-teal font-bold">{getAverageResponseTime()} ms</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Uptime Score</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{getUptimePercentage()}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">WP Memory Peak</span>
                <span className="text-slate-900 dark:text-slate-100">{site.wpMemoryUsage ? `${site.wpMemoryUsage} MB` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Disk space</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {site.diskTotal ? `${Math.round(site.diskTotal - site.diskFree!)} / ${site.diskTotal} GB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">System CPU Load</span>
                <span className="text-slate-900 dark:text-slate-100">{site.cpuLoad !== null ? `${site.cpuLoad.toFixed(2)}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Secret API Key
            </span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 justify-between text-xs">
              <code className="text-rose-600 dark:text-rose-400 font-mono font-bold select-all truncate">{site.apiKey}</code>
              <button
                onClick={copyApiKey}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 transition"
                title="Copy API key"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Response Latency Stream (Last 50 Pings)
          </h3>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#187DB4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#187DB4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ms" name="Ping" stroke="#187DB4" strokeWidth={3} fillOpacity={1} fill="url(#colorMs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sleek Pill Tabs Menu */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-lg flex flex-wrap gap-1.5 max-w-fit border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          {(['plugins', 'errors', 'security', 'seo', 'traffic'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? 'bg-primary-teal text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab === 'plugins' && 'Plugins'}
              {tab === 'errors' && 'Errors'}
              {tab === 'security' && 'Security'}
              {tab === 'seo' && 'SEO & Vitals'}
              {tab === 'traffic' && 'Traffic Analytics'}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          {activeTab === 'plugins' && (
            <div>
              {plugins.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm font-medium">
                  No plugin sync data received yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-primary-bg/30 border-b border-primary-teal/15 text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-wider">
                        <th className="py-4 px-6">Plugin</th>
                        <th className="py-4 px-6">Slug</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Version</th>
                        <th className="py-4 px-6 text-center">Latest Version</th>
                        <th className="py-4 px-6 text-right">License</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-teal/10 text-sm font-medium">
                      {plugins.map((plugin) => (
                        <tr key={plugin.id} className="hover:bg-primary-bg/10 transition">
                          <td className="py-4 px-6">
                            <span className="font-extrabold text-primary-dark">{plugin.name}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-mono text-xs">{plugin.slug}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              plugin.isActive
                                ? 'bg-success/10 text-success'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {plugin.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-primary-dark">
                            v{plugin.version}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {plugin.requiresUpdate ? (
                              <span className="text-accent-dark font-extrabold flex items-center justify-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                v{plugin.latestVersion}
                              </span>
                            ) : (
                              <span className="text-slate-400">v{plugin.version}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {plugin.isExpired ? (
                              <span className="inline-flex px-2 py-0.5 rounded bg-coral/15 text-coral text-xs font-bold border border-coral/25">
                                Expired {plugin.expiredAt ? new Date(plugin.expiredAt).toLocaleDateString() : ''}
                              </span>
                            ) : (
                              <span className="text-success text-xs font-extrabold uppercase">Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div>
              {errorLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm font-medium">
                  No errors registered. Excellent!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-primary-bg/30 border-b border-primary-teal/15 text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-wider">
                        <th className="py-4 px-6">Code</th>
                        <th className="py-4 px-6">Requested Endpoint</th>
                        <th className="py-4 px-6">Details</th>
                        <th className="py-4 px-6 text-center">Hits</th>
                        <th className="py-4 px-6 text-right">Last Logged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-teal/10 text-sm font-medium">
                      {errorLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-primary-bg/10 transition">
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-black border ${
                              log.errorCode === 404
                                ? 'bg-accent-light/35 text-accent-dark border-accent-gold/30'
                                : 'bg-coral/10 text-coral border-coral/30'
                            }`}>
                              {log.errorCode}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-primary-dark font-mono text-xs select-all truncate max-w-[200px]" title={log.url}>
                            {log.url}
                          </td>
                          <td className="py-4 px-6 text-slate-500 italic max-w-[300px] truncate" title={log.message || 'N/A'}>
                            {log.message || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-center font-extrabold text-primary-dark">
                            {log.count}
                          </td>
                          <td className="py-4 px-6 text-right text-slate-400 text-xs font-bold">
                            {new Date(log.lastSeen).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (() => {
            let scaList: any[] = [];
            if (site.scaResults) {
              try {
                scaList = JSON.parse(site.scaResults);
              } catch (e) {
                console.error(e);
              }
            }

            const vuln = securityStats?.vulnerabilities || {
              critical: site.status === 'offline' ? 1 : 0,
              high: plugins.filter(p => p.isExpired).length,
              medium: plugins.filter(p => p.requiresUpdate && !p.isExpired).length,
              low: scaList.filter(s => s.status === 'failed').length
            };

            const secChart = securityStats?.securityEventsChart || [];

            return (
              <div className="p-6 flex flex-col gap-6 animate-fadeIn">
                {/* 1. Vulnerability Severity Cards Grid (Wazuh Style) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Critical */}
                  <div className="bg-white dark:bg-slate-900/90 border border-red-200 dark:border-red-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                    <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider pl-1.5">Critical</span>
                    <div className="flex items-baseline justify-between mt-1 pl-1.5">
                      <span className="text-3xl font-extrabold text-red-600 dark:text-red-400 leading-none">{vuln.critical}</span>
                      <span className="text-[9px] font-bold text-red-400">Risk Severity</span>
                    </div>
                  </div>

                  {/* High */}
                  <div className="bg-white dark:bg-slate-900/90 border border-orange-200 dark:border-orange-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider pl-1.5">High</span>
                    <div className="flex items-baseline justify-between mt-1 pl-1.5">
                      <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 leading-none">{vuln.high}</span>
                      <span className="text-[9px] font-bold text-orange-400">Risk Severity</span>
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="bg-white dark:bg-slate-900/90 border border-yellow-200 dark:border-amber-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-amber-400 uppercase tracking-wider pl-1.5">Medium</span>
                    <div className="flex items-baseline justify-between mt-1 pl-1.5">
                      <span className="text-3xl font-extrabold text-yellow-600 dark:text-amber-400 leading-none">{vuln.medium}</span>
                      <span className="text-[9px] font-bold text-yellow-500">Risk Severity</span>
                    </div>
                  </div>

                  {/* Low */}
                  <div className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider pl-1.5">Low</span>
                    <div className="flex items-baseline justify-between mt-1 pl-1.5">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">{vuln.low}</span>
                      <span className="text-[9px] font-bold text-blue-400">Risk Severity</span>
                    </div>
                  </div>
                </div>

                {/* 2. SCA Audit Results & FIM / Event Trend Evolution */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: SCA Hardening Audit Checklist (3 columns) */}
                  <div className="lg:col-span-3 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Security Configuration Assessment (SCA)</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated server hardening audit check</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${site.scaScore ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50">
                          {site.scaScore ?? 0}% SCA
                        </span>
                      </div>
                    </div>

                    {scaList.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs italic">
                        No SCA scan data received yet. Run agent sync.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
                        {scaList.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-3 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.policy}</span>
                              <span className="text-[10px] text-slate-400 font-normal leading-relaxed">{item.description}</span>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              item.status === 'passed'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/50'
                                : 'bg-red-50 text-red-600 dark:bg-red-950/40 border border-red-200/50 animate-pulse'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Security Events Count Evolution & Core File Modification List (2 columns) */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Security events count line chart */}
                    <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Security Events Evolution</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Incidents and warnings count last 30 days</p>
                      </div>
                      <div className="h-40 w-full mt-1">
                        {secChart.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">No charts timeline data</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={secChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#EF6C4A" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#EF6C4A" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                                formatter={(value) => [value, 'Incidents']}
                              />
                              <Area type="monotone" dataKey="count" stroke="#EF6C4A" strokeWidth={2} fillOpacity={1} fill="url(#colorSecurity)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* FIM (File Integrity Monitoring) Modified list */}
                    <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">File Integrity Monitoring (FIM)</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recent modifications of critical WordPress files</p>
                      </div>

                      <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {securityEvents.filter(e => e.eventType === 'file_change').length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs italic">
                            No file modifications detected. Core is clean.
                          </div>
                        ) : (
                          securityEvents
                            .filter(e => e.eventType === 'file_change')
                            .slice(0, 5)
                            .map((event) => (
                              <div key={event.id} className="flex items-start justify-between p-2 rounded bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                                    <AlertOctagon className="h-3 w-3 shrink-0" />
                                    Modifikasi Terdeteksi
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{event.detail}</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                                  {new Date(event.createdAt).toLocaleTimeString('id-ID')}
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Security Event Log Table */}
                <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Full Security Event Alerts</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Detailed raw security alerts logged by the WordPress agent</p>
                  </div>

                  {securityEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic">
                      No security alerts logged.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {securityEvents.map((event) => {
                        const isInjection = event.eventType.startsWith('injection_');
                        const isFailure = event.eventType === 'login_failed';
                        const isFim = event.eventType === 'file_change';

                        return (
                          <div
                            key={event.id}
                            className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded border transition ${
                              isInjection || isFim
                                ? 'bg-red-50/40 border-red-100 hover:bg-red-50/70'
                                : isFailure
                                  ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70'
                                  : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="p-1.5 rounded bg-white border border-slate-200/50 shrink-0 mt-0.5">
                                {isInjection || isFim ? (
                                  <ShieldAlert className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Shield className="h-4 w-4 text-amber-500" />
                                )}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                                    isInjection || isFim ? 'text-red-600' : 'text-amber-700'
                                  }`}>
                                    {event.eventType.replace('_', ' ')}
                                  </span>
                                  {event.ipAddress && (
                                    <span className="text-[9px] text-slate-400 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                                      IP: {event.ipAddress}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-slate-800 mt-1 select-all">
                                  {event.username ? `Username: "${event.username}" | ` : ''}{event.detail}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-extrabold mt-2 md:mt-0 whitespace-nowrap self-end md:self-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              {new Date(event.createdAt).toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'seo' && (
            <div className="p-6 flex flex-col gap-6">
              {/* Top Bar / Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary-teal/10 text-primary-teal border border-primary-teal/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">SEO Engine & Core Web Vitals</h3>
                    <p className="text-[11px] text-slate-500">Automated On-Page Audit, PageSpeed Insights, and Smart Opportunities</p>
                  </div>
                </div>
                <button
                  onClick={handleRunPageSpeed}
                  disabled={testingPageSpeed}
                  className="btn-teal text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${testingPageSpeed ? 'animate-spin' : ''}`} />
                  <span>{testingPageSpeed ? 'Testing PageSpeed...' : 'Run PageSpeed Test'}</span>
                </button>
              </div>

              {/* Metric Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* On-Page Audit Score */}
                <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">On-Page Health Score</span>
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {seoData?.audit?.score !== undefined ? `${seoData.audit.score}%` : '--'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Health Audit</span>
                  </div>
                </div>

                {/* Mobile Performance */}
                <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-sky-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Mobile Performance</span>
                    <Zap className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold ${(seoData?.vitals?.mobile?.perfScore ?? 0) >= 80 ? 'text-emerald-600' : (seoData?.vitals?.mobile?.perfScore ?? 0) >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                      {seoData?.vitals?.mobile?.perfScore !== undefined ? `${seoData.vitals.mobile.perfScore}/100` : '--'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Lighthouse Mobile</span>
                  </div>
                </div>

                {/* Desktop Performance */}
                <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Desktop Performance</span>
                    <Gauge className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {seoData?.vitals?.desktop?.perfScore !== undefined ? `${seoData.vitals.desktop.perfScore}/100` : '--'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Lighthouse Desktop</span>
                  </div>
                </div>

                {/* Active SEO Plugin */}
                <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Plugin SEO Active</span>
                    <Globe className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {site.seoPlugin === 'yoast' ? 'Yoast SEO' : site.seoPlugin === 'rankmath' ? 'RankMath' : 'None'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{site.seoTotalPosts ?? 0} Posts</span>
                  </div>
                </div>
              </div>

              {/* Core Web Vitals breakdown */}
              <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Core Web Vitals Metrics</h4>
                    <p className="text-[11px] text-slate-500">Google User Experience performance thresholds</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 border border-emerald-200/50">
                    Google Standard
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">LCP (Largest Contentful)</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {seoData?.vitals?.mobile?.lcp ? `${seoData.vitals.mobile.lcp}s` : '--'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Good (&le; 2.5s)</span>
                  </div>

                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CLS (Layout Shift)</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {seoData?.vitals?.mobile?.cls !== undefined ? seoData.vitals.mobile.cls : '--'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Good (&le; 0.1)</span>
                  </div>

                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">INP (Next Paint)</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {seoData?.vitals?.mobile?.inp ? `${seoData.vitals.mobile.inp}ms` : '--'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Good (&le; 200ms)</span>
                  </div>

                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TTFB (Server Response)</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {seoData?.vitals?.mobile?.ttfb ? `${seoData.vitals.mobile.ttfb}s` : '--'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Fast (&le; 0.8s)</span>
                  </div>
                </div>
              </div>

              {/* Smart SEO Opportunities Section */}
              <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-teal" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Smart SEO Opportunities</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-teal/10 text-primary-teal border border-primary-teal/20">
                    {seoData?.opportunities?.length || 0} Action Items
                  </span>
                </div>

                {(!seoData?.opportunities || seoData.opportunities.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Belum ada peluang SEO terdeteksi. Sistem akan memantau artikel secara berkala.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seoData.opportunities.map((opp: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-2.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">{opp.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              opp.severity === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 border border-red-200/60' :
                              opp.severity === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-200/60' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 border border-slate-200'
                            }`}>
                              {opp.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{opp.detail}</p>
                        </div>

                        {opp.potential && (
                          <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-[10px] font-semibold text-primary-teal">
                            <span>Estimasi Dampak:</span>
                            <span className="bg-primary-teal/10 px-2 py-0.5 rounded border border-primary-teal/20">{opp.potential}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* On-Page Audit Findings Breakdown */}
              <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">On-Page SEO Audit Findings</h4>
                  <span className="text-[10px] text-slate-400">Scanned via WordPress Agent</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Missing H1</span>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {seoData?.audit?.missingH1Count ?? 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Missing Meta Desc</span>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {seoData?.audit?.missingMetaDescCount ?? 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Missing Alt Tags</span>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {seoData?.audit?.missingAltCount ?? 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Noindex Tags</span>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {seoData?.audit?.noindexCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Audit Issues List */}
                {seoData?.audit?.issues && seoData.audit.issues.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Detailed Findings List</span>
                    {seoData.audit.issues.map((issue: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{issue.title}</span>
                          <span className="text-slate-500 text-[11px]">{issue.detail}</span>
                        </div>
                        {issue.url && (
                          <a href={issue.url} target="_blank" rel="noreferrer" className="text-primary-teal hover:underline text-[11px] font-semibold shrink-0 flex items-center gap-1">
                            Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Published Articles List */}
              <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
                  Latest Published Articles
                </h4>
                {(() => {
                  let recentArticles = [];
                  try {
                    if (site.seoRecentPosts) {
                      recentArticles = JSON.parse(site.seoRecentPosts);
                    }
                  } catch (e) {
                    console.error("Failed to parse recent posts JSON", e);
                  }

                  if (recentArticles.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500 text-sm font-medium">
                        No articles sync data received yet. Add posts or activate Yoast/RankMath in WordPress.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Title</th>
                            <th className="py-2.5 px-3">Publish Date</th>
                            <th className="py-2.5 px-3">Focus Keyword</th>
                            <th className="py-2.5 px-3 text-center font-bold">SEO Score</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                          {recentArticles.map((art: any, index: number) => {
                            const score = art.seo_score;
                            let scoreBadge = "bg-slate-100 text-slate-500";
                            let scoreLabel = "No Data";

                            if (score > 0) {
                              scoreLabel = score.toString();
                              if (score >= 81) {
                                scoreBadge = "bg-emerald-50 text-emerald-600 border border-emerald-200";
                              } else if (score >= 51) {
                                scoreBadge = "bg-amber-50 text-amber-600 border border-amber-200";
                              } else {
                                scoreBadge = "bg-red-50 text-red-600 border border-red-200";
                              }
                            }

                            return (
                              <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 max-w-[280px] truncate" title={art.title}>
                                  {art.title}
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 text-xs font-medium">
                                  {new Date(art.publish_date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-3">
                                  {art.focus_keyword ? (
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                      {art.focus_keyword}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">None</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center justify-center h-6 w-10 rounded text-xs font-bold ${scoreBadge}`}>
                                    {scoreLabel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <a
                                    href={art.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-teal hover:underline inline-flex items-center gap-1 text-xs font-semibold"
                                  >
                                    Open
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="p-6 flex flex-col gap-6">
              {!trafficStats ? (
                <div className="py-8 text-center text-slate-500 text-sm font-medium">
                  No traffic log data received yet. Visit the website frontend to generate log events!
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Traffic cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-sky-500 shadow-sm">
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Pageviews (30 Days)</p>
                      <h4 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                        {trafficStats.totalPageviews30d.toLocaleString('id-ID')}
                      </h4>
                    </div>

                    <div className="p-5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-sm">
                      <p className="text-xs text-slate-500 uppercase font-bold">Unique Visitors (30 Days)</p>
                      <h4 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                        {trafficStats.totalUniqueVisitors30d.toLocaleString('id-ID')}
                      </h4>
                    </div>
                  </div>

                  {/* Traffic Chart */}
                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
                      Daily Traffic Trend (Last 30 Days)
                    </h4>
                    <div className="h-56 w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficStats.chartData}>
                          <defs>
                            <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#187DB4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#187DB4" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#187DB4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPageviews)" />
                          <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Pages and Top Referrers grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Pages */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
                        Top Visited Pages (Last 30 Days)
                      </h4>
                      {trafficStats.topPages.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">No pageview data.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-bold text-slate-500 uppercase">
                                <th className="py-2 px-3">Page Path</th>
                                <th className="py-2 px-3 text-right">Pageviews</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                              {trafficStats.topPages.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200 truncate font-mono select-all max-w-[200px]" title={item.url}>
                                    {item.url}
                                  </td>
                                  <td className="py-2 px-3 text-right font-bold text-primary-teal">
                                    {item.views}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
                        Top Traffic Sources (Referrers)
                      </h4>
                      {trafficStats.topReferrers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">No referrer data.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-bold text-slate-500 uppercase">
                                <th className="py-2 px-3">Referrer URL</th>
                                <th className="py-2 px-3 text-right">Hits</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                              {trafficStats.topReferrers.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={item.referer}>
                                    {item.referer}
                                  </td>
                                  <td className="py-2 px-3 text-right font-bold text-primary-teal">
                                    {item.views}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SiteDetail;
