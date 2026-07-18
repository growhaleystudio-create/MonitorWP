import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PetLoader from '../components/PetLoader';
import {
  Terminal,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
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
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
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
      log.logType.toLowerCase().includes(searchTerm.toLowerCase());

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-coral/15 text-coral border border-coral/30">
          <ShieldAlert className="h-3 w-3" />
          {log.logType.replace('injection_', '').toUpperCase()} ATTACK
        </span>
      );
    }

    if (isError) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-coral/10 text-coral border border-coral/15">
          {log.logType}
        </span>
      );
    }

    if (isFail) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-light/40 text-accent-dark border border-accent-gold/40">
          LOGIN FAILURE
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-success/15 text-success border border-success/30">
        <CheckCircle className="h-3 w-3" />
        {log.logType.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 text-primary-dark font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Telemetry Streams</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Central Activity Logs</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-coral/10 border-2 border-coral text-coral-dark text-xs font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border-2 border-primary-teal/15 rounded p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-card">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-teal/70">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-cream border-2 border-primary-teal/20 focus:border-primary-teal outline-none rounded-md text-xs font-bold text-primary-dark shadow-sm"
            placeholder="Search logs..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-primary-teal" />
            <span className="text-xs text-primary-dark/85 font-extrabold uppercase tracking-wider">Filter:</span>
          </div>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2.5 bg-cream border-2 border-primary-teal/25 focus:border-primary-teal text-xs font-bold text-primary-dark rounded-md w-full md:w-44 shadow-sm"
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
            className="px-3 py-2.5 bg-cream border-2 border-primary-teal/25 focus:border-primary-teal text-xs font-bold text-primary-dark rounded-md w-full md:w-44 shadow-sm"
          >
            <option value="">All Event Types</option>
            <option value="error">Errors only</option>
            <option value="security">Security events only</option>
            <option value="injection">Injections only</option>
            <option value="login">Logins only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-2 border-primary-teal/15 rounded shadow-card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3 font-medium">
            <Terminal className="h-10 w-10 text-primary-teal" />
            <p className="font-extrabold text-primary-dark">No logs found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-bg/30 border-b border-primary-teal/15 text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-wider">
                  <th className="py-4 px-6 w-12"></th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Website</th>
                  <th className="py-4 px-6">Event Type</th>
                  <th className="py-4 px-6">Endpoint / Detail</th>
                  <th className="py-4 px-6">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-teal/10 text-sm font-medium">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpandLog(log.id)}
                        className="hover:bg-primary-bg/15 transition cursor-pointer"
                      >
                        <td className="py-4 px-6 text-primary-teal">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-400 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            to={`/sites/${log.siteId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-extrabold text-primary-teal hover:text-primary-light flex items-center gap-1"
                          >
                            {log.siteName}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="py-4 px-6">{getLogTypeBadge(log)}</td>
                        <td className="py-4 px-6 text-primary-dark font-mono text-xs select-all truncate max-w-[280px]" title={log.detail}>
                          {log.detail}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-mono text-xs font-bold">
                          {log.ipAddress || 'N/A'}
                        </td>
                      </tr>
                      {/* Expanded View */}
                      {isExpanded && (
                        <tr className="bg-primary-bg/10 border-y border-primary-teal/10">
                          <td colSpan={6} className="py-4 px-12 text-primary-dark">
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-widest">
                                Raw Log Event Payload
                              </p>
                              <div className="bg-cream border-2 border-primary-teal/15 p-4 rounded-md font-mono text-xs leading-relaxed max-w-4xl overflow-x-auto text-coral font-bold select-all whitespace-pre-wrap">
                                {log.message || JSON.stringify(log, null, 2)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;
