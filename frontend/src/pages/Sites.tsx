import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PetLoader from '../components/PetLoader';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Shield,
  Copy,
  Check,
  AlertOctagon,
  X,
  Download
} from 'lucide-react';

interface Site {
  id: number;
  name: string;
  url: string;
  apiKey: string;
  isActive: boolean;
  status: string;
  siteType?: string;
  sslValid?: boolean | null;
  sslDaysRemaining?: number | null;
  checkKeyword?: string | null;
  uptime7d: number;
  issuesCount: {
    updates: number;
    expired: number;
  };
  lastSeenAt: string | null;
  wpMemoryUsage: number | null;
  diskTotal: number | null;
  diskFree: number | null;
  cpuLoad: number | null;
}

function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteType, setNewSiteType] = useState<'wordpress' | 'non-wp'>('wordpress');
  const [newCheckKeyword, setNewCheckKeyword] = useState('');
  const [createdSite, setCreatedSite] = useState<Site | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSites = async () => {
    try {
      const response = await axios.get('/api/dashboard/sites');
      setSites(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError('Failed to fetch monitored websites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let formattedUrl = newSiteUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    try {
      const response = await axios.post('/api/dashboard/sites', {
        name: newSiteName,
        url: formattedUrl,
        siteType: newSiteType,
        checkKeyword: newCheckKeyword.trim() || undefined,
      });
      setCreatedSite(response.data);
      setNewSiteName('');
      setNewSiteUrl('');
      setNewCheckKeyword('');
      setNewSiteType('wordpress');
      fetchSites();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register new site');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSite = async (id: number) => {
    if (!confirm('Are you sure you want to delete this site and all its monitoring logs?')) {
      return;
    }
    try {
      await axios.delete(`/api/dashboard/sites/${id}`);
      fetchSites();
    } catch (err) {
      console.error('Error deleting site:', err);
      alert('Failed to delete site.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const closeCreatedModal = () => {
    setCreatedSite(null);
    setIsAddModalOpen(false);
  };

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PetLoader size={64} state="running" text="Retrieving monitored sites..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Websites Network</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Monitored Websites</h2>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={handleDownloadAgent}
            className="btn-teal px-3.5 py-2 flex items-center gap-2 text-xs font-semibold"
            title="Download WordPress Agent Plugin ZIP"
          >
            <Download className="h-4 w-4" />
            Download WP Agent ZIP
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold px-4 py-2 flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Website
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold shadow-xs">
          {error}
        </div>
      )}

      {/* Grid of sites */}
      {sites.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-16 text-center text-slate-400 shadow-xs">
          <Globe className="h-12 w-12 text-primary-teal mx-auto mb-4" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Websites Registered</p>
          <p className="text-xs mt-1 mb-6 font-medium">Add your first website or WordPress node to start tracking.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-teal px-5 py-2.5 mx-auto"
          >
            Add New Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map((site) => {
            const isOffline = site.status === 'offline';
            const cardClass = isOffline ? 'saas-card-coral' : 'saas-card';
            const isNonWp = site.siteType === 'non-wp';

            return (
              <div
                key={site.id}
                className={`${cardClass} flex flex-col justify-between hover:-translate-y-0.5 duration-200`}
              >
                <div className="flex flex-col gap-4">
                  {/* Site Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                          isNonWp
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200'
                        }`}>
                          {isNonWp ? 'Non-WP / App' : 'WordPress'}
                        </span>
                        {site.sslDaysRemaining !== undefined && site.sslDaysRemaining !== null && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            site.sslDaysRemaining <= 7
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200'
                          }`}>
                            🔒 SSL {site.sslDaysRemaining}d
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight hover:text-primary-teal transition">
                        <Link to={`/sites/${site.id}`}>{site.name}</Link>
                      </h3>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-teal hover:underline flex items-center gap-1 mt-1 truncate max-w-[200px]"
                      >
                        {site.url}
                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                      </a>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                      site.status === 'online'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border-emerald-200'
                        : isOffline
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border-rose-200'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200'
                    }`}>
                      {site.status}
                    </span>
                  </div>

                  {/* KPI stats */}
                  <div className="grid grid-cols-3 border-y border-slate-100 dark:border-slate-800 py-3 my-1 text-center text-xs font-semibold">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase">Uptime</p>
                      <p className={`text-base font-extrabold mt-0.5 ${
                        site.uptime7d >= 99
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : site.uptime7d >= 95
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {site.uptime7d}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase">{isNonWp ? 'Type' : 'Plugins'}</p>
                      <p className={`text-base font-extrabold mt-0.5 ${
                        !isNonWp && site.issuesCount.expired > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : !isNonWp && site.issuesCount.updates > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-primary-teal'
                      }`}>
                        {isNonWp ? 'HTTP' : (site.issuesCount.expired + site.issuesCount.updates)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase">Enabled</p>
                      <p className={`text-base font-extrabold mt-0.5 ${site.isActive ? 'text-primary-teal' : 'text-slate-400'}`}>
                        {site.isActive ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Resource Stats */}
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg py-2.5 px-2 text-center text-[11px] font-medium text-slate-500 gap-1 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">CPU Load</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                        {site.cpuLoad !== null ? `${site.cpuLoad.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">WP RAM</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                        {site.wpMemoryUsage ? `${site.wpMemoryUsage} MB` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Disk</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                        {site.diskTotal ? `${Math.round(site.diskTotal - site.diskFree!)}/${site.diskTotal}G` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warnings and Actions */}
                <div className="flex flex-col gap-3 mt-3">
                  <div className="text-[11px] font-semibold flex flex-col gap-1">
                    {isOffline && (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded border border-rose-200">
                        <AlertOctagon className="h-4 w-4 shrink-0" />
                        Website is offline (Timeout)
                      </span>
                    )}
                    {!isNonWp && site.issuesCount.expired > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 pl-1">
                        ⚠️ {site.issuesCount.expired} plugin licenses expired
                      </span>
                    )}
                    {!isNonWp && site.issuesCount.updates > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 pl-1">
                        ⚡ {site.issuesCount.updates} updates pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition border border-transparent"
                      title="Delete site"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/sites/${site.id}`}
                      className="btn-outline px-3.5 py-1.5 text-xs font-semibold ml-auto"
                    >
                      Inspect
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Site Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col gap-5 relative shadow-xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!createdSite ? (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Website</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Register a site for Uptime, SSL & Security Monitoring
                  </p>
                </div>

                <form onSubmit={handleAddSite} className="flex flex-col gap-4">
                  {/* Site Type Toggle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Website Platform / Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewSiteType('wordpress')}
                        className={`p-3 rounded-lg border text-left transition font-semibold text-xs ${
                          newSiteType === 'wordpress'
                            ? 'border-primary-teal bg-primary-teal/10 text-primary-teal'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="block font-bold">🌐 WordPress</span>
                        <span className="text-[10px] text-slate-400 font-normal">Includes Plugin & Security Agent</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSiteType('non-wp')}
                        className={`p-3 rounded-lg border text-left transition font-semibold text-xs ${
                          newSiteType === 'non-wp'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="block font-bold">⚡ Non-WP / App</span>
                        <span className="text-[10px] text-slate-400 font-normal">HTTP, SSL & Keyword Health Check</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Site Label Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      className="clean-input"
                      placeholder="e.g. Landing Page / Main App"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Website URL
                    </label>
                    <input
                      type="text"
                      required
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      className="clean-input"
                      placeholder="e.g. https://mywebsite.com"
                    />
                  </div>

                  {newSiteType === 'non-wp' && (
                    <div className="flex flex-col gap-1.5 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                      <label className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                        Keyword Check (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCheckKeyword}
                        onChange={(e) => setNewCheckKeyword(e.target.value)}
                        className="clean-input"
                        placeholder="e.g. Welcome to My Site"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="btn-outline text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-teal text-xs"
                    >
                      {submitting ? 'Registering...' : 'Register Website'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success Screen */
              <div className="flex flex-col gap-5 text-center">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 rounded-xl w-12 h-12 flex items-center justify-center mx-auto shadow-xs">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Node Registered Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Unduh plugin agent di bawah ini dan konfigurasikan <b>wp-config.php</b>.
                  </p>
                </div>

                {/* Download Plugin Step Card */}
                <div className="bg-primary-teal/10 border border-primary-teal/30 rounded-xl p-4 text-left flex flex-col gap-2.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Langkah 1: Plugin WordPress Agent
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Unduh file <b>wp-monitor-agent.zip</b> lalu upload melalui WordPress Admin (<b>Plugins &gt; Add New &gt; Upload Plugin</b>).
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadAgent}
                    className="btn-teal py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 mt-1"
                  >
                    <Download className="h-4 w-4" />
                    Download Plugin Agent (ZIP)
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-medium">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                      🔑 Langkah 2: Kunci Konfigurasi
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-primary-teal font-bold uppercase tracking-wider text-[10px]">
                      API KEY (X-API-KEY)
                    </span>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 justify-between">
                      <code className="text-rose-600 dark:text-rose-400 font-mono font-bold select-all truncate">{createdSite.apiKey}</code>
                      <button
                        onClick={() => copyToClipboard(createdSite.apiKey)}
                        className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 transition"
                        title="Copy key"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCreatedModal}
                  className="btn-teal w-full py-2.5 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sites;
