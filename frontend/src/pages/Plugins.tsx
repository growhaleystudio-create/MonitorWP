import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PetLoader from '../components/PetLoader';
import {
  Plug,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  Download
} from 'lucide-react';

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
  site: {
    name: string;
    url: string;
    isActive: boolean;
  };
  siteId: number;
}

function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await axios.get('/api/dashboard/plugins');
        setPlugins(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching plugins:', err);
        setError('Failed to fetch aggregated plugin lists.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlugins();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Scanning global plugins..." />
      </div>
    );
  }

  // Get unique sites for filter dropdown
  const uniqueSites = Array.from(new Set(plugins.map((p) => p.site.name))).sort();

  // Filter plugins
  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSite = siteFilter === '' || plugin.site.name === siteFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = plugin.isActive;
    else if (statusFilter === 'inactive') matchesStatus = !plugin.isActive;
    else if (statusFilter === 'expired') matchesStatus = plugin.isExpired;
    else if (statusFilter === 'update') matchesStatus = plugin.requiresUpdate;

    return matchesSearch && matchesSite && matchesStatus;
  });

  const handleDownloadAgent = async () => {
    try {
      const response = await axios.get('/api/dashboard/download-plugin', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'wp-monitor-agent.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download plugin zip:', err);
      alert('Gagal mengunduh file plugin ZIP.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Global Scoreboard</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Aggregated Plugins</h2>
        </div>
        <button
          onClick={handleDownloadAgent}
          className="btn-teal px-3.5 py-2 flex items-center gap-2 text-xs font-semibold self-start md:self-auto"
          title="Download WordPress Agent Plugin ZIP"
        >
          <Download className="h-4 w-4" />
          Download WP Agent ZIP
        </button>
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
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-primary-teal outline-none rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 shadow-2xs"
            placeholder="Search plugins..."
          />
        </div>

        {/* Filters Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="h-4 w-4 text-primary-teal" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filter:</span>
          </div>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-primary-teal text-xs font-medium text-slate-900 dark:text-slate-100 rounded-lg w-full md:w-44 shadow-2xs"
          >
            <option value="">All Websites</option>
            {uniqueSites.map((siteName) => (
              <option key={siteName} value={siteName}>
                {siteName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-primary-teal text-xs font-medium text-slate-900 dark:text-slate-100 rounded-lg w-full md:w-44 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
            <option value="expired">Expired licenses</option>
            <option value="update">Update available</option>
          </select>
        </div>
      </div>

      {/* Plugins Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {filteredPlugins.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3 font-medium text-xs">
            <Plug className="h-10 w-10 text-primary-teal" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No plugins match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Plugin Name</th>
                  <th className="py-3 px-5">Website</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-center">Version</th>
                  <th className="py-3 px-5 text-center">Latest Version</th>
                  <th className="py-3 px-5 text-right">License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                {filteredPlugins.map((plugin) => (
                  <tr key={plugin.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-5 flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{plugin.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{plugin.slug}</span>
                    </td>
                    <td className="py-3 px-5">
                      <Link
                        to={`/sites/${plugin.siteId}`}
                        className="font-semibold text-primary-teal hover:underline flex items-center gap-1"
                      >
                        {plugin.site.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        plugin.isActive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 border border-slate-200'
                      }`}>
                        {plugin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center font-medium text-slate-700 dark:text-slate-300">
                      v{plugin.version}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {plugin.requiresUpdate ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          v{plugin.latestVersion}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">v{plugin.version}</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      {plugin.isExpired ? (
                        <span className="inline-flex px-2 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-950/40 text-xs font-semibold border border-red-200">
                          Expired {plugin.expiredAt ? new Date(plugin.expiredAt).toLocaleDateString() : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">Valid</span>
                      )}
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

export default Plugins;
