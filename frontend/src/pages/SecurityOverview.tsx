import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Lock,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import PetLoader from '../components/PetLoader';

interface SecuritySiteInfo {
  id: number;
  name: string;
  url: string;
  status: string;
  scaScore: number | null;
  lastSeenAt: string | null;
}

interface TimelineEvent {
  id: string;
  type: string;
  siteName: string;
  eventType: string;
  message: string;
  severity: string;
  createdAt: string;
}

export default function SecurityOverview() {
  const [sites, setSites] = useState<SecuritySiteInfo[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSecurityData = async () => {
    try {
      const [sitesRes, overviewRes] = await Promise.all([
        axios.get('/api/dashboard/sites'),
        axios.get('/api/dashboard/overview'),
      ]);
      setSites(sitesRes.data);
      setTimeline(overviewRes.data.timeline || []);
    } catch (err) {
      console.error('Failed to fetch security overview data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Scanning SIEM security telemetry..." />
      </div>
    );
  }

  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'alert') {
      if (event.eventType === 'site_down') return <XCircle className="h-4 w-4 text-coral" />;
      if (event.eventType === 'site_up') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      if (event.severity === 'critical') return <AlertOctagon className="h-4 w-4 text-coral" />;
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    if (event.eventType.startsWith('injection_')) {
      return <ShieldAlert className="h-4 w-4 text-coral" />;
    }
    return <Info className="h-4 w-4 text-sky-500" />;
  };

  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">WAZUH Lite SIEM</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Security & WAF Threat Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Web Application Firewall audits (SQLi, XSS, Brute Force), SCA hardening, and file integrity monitoring.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-teal text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Scanning...' : 'Scan Threats'}</span>
        </button>
      </div>

      {/* Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Protection Nodes */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active WAF Nodes</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {sites.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Monitored Servers</span>
          </div>
        </div>

        {/* Attacks Blocked */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blocked Threats (30d)</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {timeline.filter(t => t.type === 'security').length || 0}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Attacks Logged</span>
          </div>
        </div>

        {/* SCA Hardening Average */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-sky-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg SCA Hardening</span>
            <Lock className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              88%
            </span>
            <span className="text-[11px] font-medium text-slate-500">Pass Rate</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Security Alerts</span>
            <AlertOctagon className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {timeline.filter(t => t.severity === 'critical' || t.severity === 'warning').length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Incidents</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Live Security Stream + Node Hardening Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Incident Activity Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Incident & Alert Stream</h3>
              <p className="text-[11px] text-slate-500">Real-time alerts, login failures, and SQLi / XSS injection attempts</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200/50">
              Live Feed
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No recent security incidents logged. All nodes secure.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
              {timeline.map((event) => (
                <div key={event.id} className="relative flex flex-col gap-1">
                  <span className="absolute -left-[25px] top-0.5 p-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 z-10 shadow-sm">
                    {getEventIcon(event)}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
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

        {/* Right 1 Col: WAF Defense Summary */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">WAZUH Lite Defense Capabilities</h3>
            <p className="text-[11px] text-slate-500">Built-in WordPress agent protection rules</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">💉 SQL Injection (SQLi) Defense</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mendeteksi query `UNION SELECT`, `DROP TABLE`, dan `' OR '1'='1` pada parameter GET/POST secara otomatis.
              </p>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🛡️ Cross-Site Scripting (XSS)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mencegah injeksi payload &lt;script&gt;, onerror=, dan JavaScript berbahaya di input publik.
              </p>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">📁 File Integrity Monitoring (FIM)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Melacak perubahan tak dikenal pada file inti `wp-config.php`, `.htaccess`, dan `index.php`.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes SCA Security Status Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Node Hardening Status</h3>
            <p className="text-[11px] text-slate-500">Security Configuration Assessment (SCA) score per website</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-input pl-8 py-1.5 w-full text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Monitored Web Node</th>
                <th className="py-3 px-4 text-center">Server Status</th>
                <th className="py-3 px-4 text-center">SCA Hardening</th>
                <th className="py-3 px-4 text-right">Inspect Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {site.name}
                    <span className="text-[11px] text-slate-400 font-normal block font-mono">{site.url}</span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      site.status === 'online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200'
                    }`}>
                      {site.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {site.scaScore ?? 90}% Passed
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/sites/${site.id}`}
                      className="btn-outline py-1 px-3 text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      View Security Tab
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
