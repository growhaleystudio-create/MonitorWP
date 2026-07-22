import { useState, useEffect } from 'react';
import axios from 'axios';
import PetLoader from '../components/PetLoader';
import {
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'error' | 'security';
  siteName: string;
  siteId: number;
  logType: string;
  detail: string;
  message: string;
  ipAddress: string | null;
  createdAt: string;
}

function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/dashboard/logs?limit=150');
        setLogs(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to fetch system activity logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Analyzing log audit trail..." />
      </div>
    );
  }

  // Extract unique site names for filter
  const uniqueSites = Array.from(new Set(logs.map((l) => l.siteName))).sort();

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchTerm));

    const matchesSite = siteFilter === '' || log.siteName === siteFilter;

    let matchesType = true;
    if (typeFilter === 'error') matchesType = log.type === 'error';
    else if (typeFilter === 'security') matchesType = log.type === 'security';
    else if (typeFilter === 'injection') matchesType = log.logType.startsWith('injection_');
    else if (typeFilter === 'login') matchesType = log.logType.startsWith('login_');

    return matchesSearch && matchesSite && matchesType;
  });

  const getLogTypeBadge = (log: LogEntry) => {
    const isError = log.type === 'error';
    const isInjection = log.logType.startsWith('injection_');
    const isFail = log.logType === 'login_failed';

    if (isInjection) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200">
          <ShieldAlert className="h-3 w-3" />
          {log.logType.replace('injection_', '').toUpperCase()} ATTACK
        </span>
      );
    }

    if (isError) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200">
          {log.logType}
        </span>
      );
    }

    if (isFail) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-200">
          LOGIN FAILURE
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200">
        <CheckCircle className="h-3 w-3" />
        {log.logType.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Telemetry Streams</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Central Activity Logs</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold shadow-xs">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="clean-input w-full pl-9"
            placeholder="Search logs..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="h-4 w-4 text-primary-teal" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filter:</span>
          </div>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="clean-input w-full md:w-44"
          >
            <option value="">All Websites</option>
            {uniqueSites.map((siteName) => (
              <option key={siteName} value={siteName}>
                {siteName}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="clean-input w-full md:w-44"
          >
            <option value="">All Event Types</option>
            <option value="security">Security Events</option>
            <option value="error">PHP & System Errors</option>
            <option value="injection">Malware & Injection</option>
            <option value="login">Login Failures</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs font-medium">
            No activity logs match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Website</th>
                  <th className="py-3 px-5">Event Category</th>
                  <th className="py-3 px-5">Log Summary</th>
                  <th className="py-3 px-5 text-right">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-5 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900 dark:text-slate-100">
                      {log.siteName}
                    </td>
                    <td className="py-3 px-5">
                      {getLogTypeBadge(log)}
                    </td>
                    <td className="py-3 px-5 max-w-md">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{log.message}</p>
                      {log.detail && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-sm">{log.detail}</p>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-xs text-slate-500">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;
