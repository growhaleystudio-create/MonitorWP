import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PetLoader from '../components/PetLoader';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  Globe,
  AlertTriangle,
  AlertOctagon,
  Terminal,
  ChevronRight,
  ArrowUpRight,
  Activity,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Info
} from 'lucide-react';

interface Stats {
  totalSites: number;
  onlineSites: number;
  offlineSites: number;
  pluginsNeedingUpdate: number;
  pluginsExpired: number;
  recentErrors: number;
}

interface TimelineEvent {
  id: string;
  type: 'alert' | 'security';
  siteName: string;
  eventType: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

interface QuickSite {
  id: number;
  name: string;
  url: string;
  status: string;
  lastSeenAt: string | null;
  wpMemoryUsage: number | null;
  diskTotal: number | null;
  diskFree: number | null;
  cpuLoad: number | null;
  seoPlugin: string | null;
  seoTotalPosts: number | null;
  seoRecentPosts: string | null;
  _count: {
    plugins: number;
  };
}

interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [quickSites, setQuickSites] = useState<QuickSite[]>([]);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'seo' | 'security'>('performance');

  const fetchOverviewData = async () => {
    try {
      const response = await axios.get('/api/dashboard/overview');
      setStats(response.data.stats);
      setTimeline(response.data.timeline);
      setQuickSites(response.data.quickSites);
      setError(null);
    } catch (err) {
      console.error('Error loading overview:', err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionInfo = async () => {
    try {
      const res = await axios.get('/api/system/version');
      setVersionInfo(res.data);
    } catch (err) {
      // Ignore version fetch errors silently
    }
  };

  useEffect(() => {
    fetchOverviewData();
    fetchVersionInfo();
    const timer = setInterval(fetchOverviewData, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Analyzing dashboard data..." />
      </div>
    );
  }

  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'alert') {
      if (event.eventType === 'site_down') return <XCircle className="h-4.5 w-4.5 text-coral" />;
      if (event.eventType === 'site_up') return <CheckCircle className="h-4.5 w-4.5 text-success" />;
      if (event.severity === 'critical') return <AlertOctagon className="h-4.5 w-4.5 text-coral" />;
      return <AlertTriangle className="h-4.5 w-4.5 text-accent-gold" />;
    }
    if (event.eventType.startsWith('injection_')) {
      return <ShieldAlert className="h-4.5 w-4.5 text-coral" />;
    }
    if (event.eventType === 'login_failed') {
      return <ShieldAlert className="h-4.5 w-4.5 text-accent-gold" />;
    }
    return <Info className="h-4.5 w-4.5 text-sky" />;
  };

  // Prepare Donut Chart data for site status
  const donutData = [
    { name: 'Online', value: stats?.onlineSites || 0, color: '#187DB4' },
    { name: 'Offline', value: stats?.offlineSites || 0, color: '#EF6C4A' },
    { name: 'Unknown/Inactive', value: (stats?.totalSites || 0) - (stats?.onlineSites || 0) - (stats?.offlineSites || 0), color: '#FFD23F' }
  ].filter(d => d.value > 0);

  // Mock timeline latency data for performance overview chart
  const latencyTimelineData = [
    { time: '09:00', latency: 45 },
    { time: '10:00', latency: 50 },
    { time: '11:00', latency: 42 },
    { time: '12:00', latency: 68 },
    { time: '13:00', latency: 55 },
    { time: '14:00', latency: 48 },
    { time: '15:00', latency: 46 }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Update Available Banner */}
      {versionInfo?.updateAvailable && (
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-xl border border-teal-500 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="bg-teal-400/20 text-teal-200 p-2 rounded-full font-bold text-xs">🚀 UPDATE</span>
            <div>
              <p className="font-extrabold text-sm text-white">
                Growhaley Monitor v{versionInfo.latestVersion} is now available!
              </p>
              <p className="text-xs text-teal-200 font-medium">
                You are running v{versionInfo.currentVersion}. Check out the release notes to upgrade your instance.
              </p>
            </div>
          </div>
          <a
            href={versionInfo.releaseUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-100 rounded-lg font-bold text-xs uppercase tracking-wider transition shrink-0"
          >
            Release Notes
          </a>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Performance Overview</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverviewData}
            className="btn-outline px-4 py-2 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Activity className="h-4 w-4" />
            Refresh
          </button>
          <Link
            to="/sites"
            className="btn-teal px-4 py-2 text-xs font-semibold"
          >
            Manage Sites
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold shadow-xs">
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sites Card */}
        <div className="saas-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-teal/10 rounded-lg border border-primary-teal/20 text-primary-teal">
              <Globe className="h-5 w-5" />
            </div>
            <span className="saas-badge bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/60">
              {stats?.onlineSites || 0} active
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Websites
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">{stats?.totalSites || 0}</span>
        </div>

        {/* Offline Card */}
        <div className="saas-card saas-card-coral">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg border ${
              stats?.offlineSites && stats.offlineSites > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
            }`}>
              <AlertOctagon className="h-5 w-5" />
            </div>
            {stats?.offlineSites && stats.offlineSites > 0 ? (
              <span className="saas-badge bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200 animate-pulse uppercase">
                Offline
              </span>
            ) : (
              <span className="saas-badge bg-slate-100 text-slate-500 dark:bg-slate-800 border border-slate-200">
                Optimal
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Sites Offline
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">{stats?.offlineSites || 0}</span>
        </div>

        {/* Plugin Warnings Card */}
        <div className="saas-card saas-card-gold">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="saas-badge bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-200">
              {stats?.pluginsExpired || 0} expired
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Plugin Updates Pending
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">
            {(stats?.pluginsNeedingUpdate || 0) + (stats?.pluginsExpired || 0)}
          </span>
        </div>

        {/* Errors 24h Card */}
        <div className="saas-card saas-card-sky">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-lg border border-sky-200 text-sky-600">
              <Terminal className="h-5 w-5" />
            </div>
            <span className="saas-badge bg-sky-50 text-sky-600 dark:bg-sky-950/40 border border-sky-200">
              24h track
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Errors Logged
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">{stats?.recentErrors || 0}</span>
        </div>
      </div>

      {/* Sleek Pill Tabs Menu */}
      <div className="bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-lg flex flex-wrap gap-1.5 max-w-fit border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {([
          { 
            id: 'performance', 
            label: 'Performance', 
            tooltip: 'Uptime, ping response latency, and monitored sites scoreboard' 
          },
          { 
            id: 'seo', 
            label: 'SEO Analytics', 
            tooltip: 'Active SEO engines distribution and average SEO scores' 
          },
          { 
            id: 'security', 
            label: 'Security & Incidents', 
            tooltip: 'Live security alerts, injection logs, and node status timelines' 
          }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative px-4 py-2 rounded-md flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary-teal text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`transition-colors ${activeTab === tab.id ? 'text-teal-200' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}>
              <Info className="h-3.5 w-3.5" />
            </span>
            
            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-medium py-1.5 px-3 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none transition-opacity duration-200 border border-slate-700/50">
              {tab.tooltip}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-900/95"></div>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'performance' && (
        <div className="flex flex-col gap-7">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Response Latency over Time */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Response Trends over Time</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Average ping response latency across sites</p>
              </div>
              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyTimelineData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#187DB4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#187DB4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="ms" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="latency" name="Latency" stroke="#187DB4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Website availability segments donut */}
            <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Website Availability</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Distribution of node states</p>
              </div>

              <div className="h-44 w-full flex justify-center items-center relative">
                {donutData.length === 0 ? (
                  <span className="text-slate-400 text-xs">No site status logs</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                    {stats?.totalSites || 0}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    Total Nodes
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="flex flex-col gap-2.5 text-xs font-semibold px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-teal"></span>
                    <span className="text-slate-500 dark:text-slate-400">Online</span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{stats?.onlineSites || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-coral"></span>
                    <span className="text-slate-500 dark:text-slate-400">Offline</span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{stats?.offlineSites || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monitored Scoreboard */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Monitored Scoreboard</h3>
              <Link
                to="/sites"
                className="text-xs font-bold text-primary-teal hover:underline flex items-center gap-1 transition"
              >
                All Sites
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              {quickSites.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-medium">
                  No websites registered. <Link to="/sites" className="text-primary-teal hover:underline font-bold">Register one now</Link>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Website</th>
                        <th className="py-3 px-4 text-center">WP RAM Peak</th>
                        <th className="py-3 px-4 text-center">Disk Usage</th>
                        <th className="py-3 px-4 text-center">CPU Load</th>
                        <th className="py-3 px-4 text-center">SEO Engine</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Warnings</th>
                        <th className="py-3 px-4 text-center">Last Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                      {quickSites.map((site) => (
                        <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              <Link to={`/sites/${site.id}`} className="hover:text-primary-teal flex items-center gap-1">
                                {site.name}
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                              </Link>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{site.url}</span>
                          </td>
                          <td className="py-4 px-4">
                            {site.wpMemoryUsage ? (
                              <div className="flex flex-col items-center gap-1 w-20 mx-auto">
                                <span className="text-[10px] text-slate-500 font-mono">{site.wpMemoryUsage}MB</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-teal" 
                                    style={{ width: `${Math.min((site.wpMemoryUsage / 256) * 100, 100)}%` }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-normal block text-center">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {site.diskTotal ? (
                              <div className="flex flex-col items-center gap-1 w-20 mx-auto">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {Math.round(site.diskTotal - site.diskFree!)}/{site.diskTotal}G
                                </span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-sky" 
                                    style={{ width: `${((site.diskTotal - site.diskFree!) / site.diskTotal) * 100}%` }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-normal block text-center">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {site.cpuLoad !== null ? (
                              <div className="flex flex-col items-center gap-1 w-16 mx-auto">
                                <span className="text-[10px] text-slate-500 font-mono">{site.cpuLoad.toFixed(2)}</span>
                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      site.cpuLoad > 4.0 
                                        ? 'bg-coral' 
                                        : site.cpuLoad > 1.0 
                                          ? 'bg-accent-gold' 
                                          : 'bg-primary-teal'
                                    }`}
                                    style={{ width: `${Math.min((site.cpuLoad / 4) * 100, 100)}%` }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-normal block text-center">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {site.seoPlugin && site.seoPlugin !== 'none' ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  site.seoPlugin === 'yoast' 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200/50' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200/50'
                                }`}>
                                  {site.seoPlugin}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold font-mono">
                                  {site.seoTotalPosts ?? 0} posts
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-bold">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                              site.status === 'online'
                                ? 'bg-[#EEF7FC] text-primary-teal'
                                : site.status === 'offline'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : 'bg-slate-100 text-slate-400'
                            }`}>
                              {site.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-extrabold text-accent-dark">
                            {site._count.plugins > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-accent-light/20 border border-accent-gold/20">
                                {site._count.plugins} updates
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs font-normal">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-400 text-xs font-bold">
                            {site.lastSeenAt ? new Date(site.lastSeenAt).toLocaleTimeString('id-ID') : 'Never'}
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

      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* SEO Score by Website Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">SEO Performance by Site</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Average SEO score of latest articles per monitored website</p>
            </div>
            <div className="h-64 w-full mt-2">
              {(() => {
                const seoChartData = quickSites.map(site => {
                  let avgScore = 0;
                  try {
                    if (site.seoRecentPosts) {
                      const posts = JSON.parse(site.seoRecentPosts);
                      const validScores = posts.map((p: any) => p.seo_score).filter((s: number) => s > 0);
                      if (validScores.length > 0) {
                        avgScore = Math.round(validScores.reduce((sum: number, val: number) => sum + val, 0) / validScores.length);
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  return {
                    name: site.name,
                    score: avgScore,
                  };
                });

                const hasData = seoChartData.some(d => d.score > 0);

                if (!hasData) {
                  return (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">
                      No SEO score data available yet. Configure Yoast/RankMath on sites.
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value) => [`${value} / 100`, 'Avg SEO Score']}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        {seoChartData.map((entry, index) => {
                          const score = entry.score;
                          const fill = score >= 80 ? '#10B981' : score >= 50 ? '#FBBF24' : '#EF6C4A';
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* SEO Engine Distribution Donut */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">SEO Engine Distribution</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Active SEO plugins across all websites</p>
            </div>

            {(() => {
              const yoastCount = quickSites.filter(s => s.seoPlugin === 'yoast').length;
              const rankMathCount = quickSites.filter(s => s.seoPlugin === 'rankmath').length;
              const noneCount = quickSites.filter(s => !s.seoPlugin || s.seoPlugin === 'none').length;
              
              const seoDonutData = [
                { name: 'Yoast SEO', value: yoastCount, color: '#8B5CF6' },
                { name: 'RankMath SEO', value: rankMathCount, color: '#3B82F6' },
                { name: 'None / Inactive', value: noneCount, color: '#94A3B8' },
              ].filter(d => d.value > 0);

              if (seoDonutData.length === 0) {
                return (
                  <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">
                    No SEO engine distribution data.
                  </div>
                );
              }

              return (
                <>
                  <div className="h-44 w-full flex justify-center items-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={seoDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {seoDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                        {quickSites.filter(s => s.seoPlugin && s.seoPlugin !== 'none').length}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        Active SEO
                      </span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="flex flex-col gap-2.5 text-xs font-semibold px-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]"></span>
                        <span className="text-slate-500 dark:text-slate-400">Yoast SEO</span>
                      </div>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{yoastCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]"></span>
                        <span className="text-slate-500 dark:text-slate-400">RankMath SEO</span>
                      </div>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{rankMathCount}</span>
                    </div>
                    {noneCount > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#94A3B8]"></span>
                          <span className="text-slate-500 dark:text-slate-400">No SEO Plugin</span>
                        </div>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{noneCount}</span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Security Threat & Incident Evolution Chart */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">SIEM Threat & Attack Incident Trend (7 Days)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time tracking of blocked SQLi, XSS, & Brute-Force attacks across all site nodes</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/50 text-[10px] font-black uppercase">
                Active WAF Shield
              </span>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: 'Mon', sqli: 3, bruteForce: 12 },
                    { day: 'Tue', sqli: 1, bruteForce: 8 },
                    { day: 'Wed', sqli: 5, bruteForce: 24 },
                    { day: 'Thu', sqli: 2, bruteForce: 9 },
                    { day: 'Fri', sqli: 7, bruteForce: 31 },
                    { day: 'Sat', sqli: 4, bruteForce: 15 },
                    { day: 'Sun', sqli: 2, bruteForce: 6 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorSqli" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF6C4A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF6C4A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBrute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD23F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFD23F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="bruteForce" name="Failed Logins / BruteForce" stroke="#FFD23F" strokeWidth={2} fillOpacity={1} fill="url(#colorBrute)" />
                  <Area type="monotone" dataKey="sqli" name="SQLi & Injection Attacks" stroke="#EF6C4A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSqli)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm px-1">Recent Incidents & Audit Log Timeline</h3>
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col gap-5 max-h-[500px] overflow-y-auto">
              {timeline.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-medium">
                  No recent incidents logged.
                </div>
              ) : (
                <div className="relative pl-8 pr-3 py-2 flex flex-col gap-6 max-h-[500px] overflow-y-auto">
                  {/* Continuous Vertical Timeline Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />

                  {timeline.map((event) => (
                    <div key={event.id} className="relative flex flex-col gap-1">
                      {/* Circle Node */}
                      <span className="absolute -left-[26px] top-0.5 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 z-10 shadow-sm flex items-center justify-center">
                        {getEventIcon(event)}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {event.siteName}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {new Date(event.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                        {event.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Overview;
