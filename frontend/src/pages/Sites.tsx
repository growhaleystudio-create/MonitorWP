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
    <div className="flex flex-col gap-8 text-primary-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">Websites Network</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Monitored Websites</h2>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={handleDownloadAgent}
            className="btn-teal px-4 py-3 flex items-center gap-2 text-xs font-extrabold"
            title="Download WordPress Agent Plugin ZIP"
          >
            <Download className="h-4.5 w-4.5" />
            Download WP Agent ZIP
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold px-6 py-3 flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Website
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-coral/10 border-2 border-coral text-coral-dark text-xs font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* Grid of sites */}
      {sites.length === 0 ? (
        <div className="bg-white border-2 border-primary-teal/15 rounded p-16 text-center text-slate-500 shadow-card">
          <Globe className="h-12 w-12 text-primary-teal mx-auto mb-4" />
          <p className="font-extrabold text-primary-dark text-lg">No Websites Registered</p>
          <p className="text-xs mt-1 mb-6 font-medium">Add your first website or WordPress node to start tracking.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-teal px-6 py-3 mx-auto"
          >
            Add New Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => {
            const isOffline = site.status === 'offline';
            const cardClass = isOffline ? 'flip7-card-boom' : 'flip7-card';
            const isNonWp = site.siteType === 'non-wp';

            return (
              <div
                key={site.id}
                className={`${cardClass} flex flex-col justify-between hover:-translate-y-1 duration-200`}
              >
                <div className="flex flex-col gap-4">
                  {/* Site Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border ${
                          isNonWp
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-teal-100 text-teal-800 border-teal-200'
                        }`}>
                          {isNonWp ? 'Non-WP / App' : 'WordPress'}
                        </span>
                        {site.sslDaysRemaining !== undefined && site.sslDaysRemaining !== null && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                            site.sslDaysRemaining <= 7
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            🔒 SSL {site.sslDaysRemaining}d
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-primary-dark text-base leading-tight hover:text-primary-teal transition">
                        <Link to={`/sites/${site.id}`}>{site.name}</Link>
                      </h3>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-teal/80 hover:text-primary-teal hover:underline flex items-center gap-1 mt-1 truncate max-w-[190px]"
                      >
                        {site.url}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase border ${
                      site.status === 'online'
                        ? 'bg-success/15 text-success border-success/30'
                        : isOffline
                          ? 'bg-coral/15 text-coral border-coral/30'
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {site.status}
                    </span>
                  </div>

                  {/* KPI stats */}
                  <div className="grid grid-cols-3 border-y-2 border-dashed border-primary-teal/15 py-4 my-1 text-center text-xs font-bold">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Uptime</p>
                      <p className={`text-base font-black mt-1 ${
                        site.uptime7d >= 99
                          ? 'text-success'
                          : site.uptime7d >= 95
                            ? 'text-accent-dark'
                            : 'text-coral'
                      }`}>
                        {site.uptime7d}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">{isNonWp ? 'Type' : 'Plugins'}</p>
                      <p className={`text-base font-black mt-1 ${
                        !isNonWp && site.issuesCount.expired > 0
                          ? 'text-coral'
                          : !isNonWp && site.issuesCount.updates > 0
                            ? 'text-accent-dark'
                            : 'text-primary-teal'
                      }`}>
                        {isNonWp ? 'HTTP' : (site.issuesCount.expired + site.issuesCount.updates)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Enabled</p>
                      <p className={`text-base font-black mt-1 ${site.isActive ? 'text-primary-teal' : 'text-slate-400'}`}>
                        {site.isActive ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Resource Stats */}
                  <div className="grid grid-cols-3 bg-slate-50 rounded py-3 px-2 text-center text-[11px] font-medium text-slate-500 mt-1 gap-1.5 border border-slate-100">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">CPU Load</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {site.cpuLoad !== null ? `${site.cpuLoad.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">WP RAM</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {site.wpMemoryUsage ? `${site.wpMemoryUsage} MB` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Disk</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {site.diskTotal ? `${Math.round(site.diskTotal - site.diskFree!)}/${site.diskTotal}G` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warnings and Actions */}
                <div className="flex flex-col gap-4 mt-2">
                  <div className="text-[11px] font-bold flex flex-col gap-1">
                    {isOffline && (
                      <span className="text-coral flex items-center gap-1.5 bg-coral/5 px-2 py-1 rounded border border-coral/10">
                        <AlertOctagon className="h-4 w-4" />
                        Website is offline (Timeout)
                      </span>
                    )}
                    {!isNonWp && site.issuesCount.expired > 0 && (
                      <span className="text-coral pl-1">
                        ⚠️ {site.issuesCount.expired} plugin licenses expired
                      </span>
                    )}
                    {!isNonWp && site.issuesCount.updates > 0 && (
                      <span className="text-accent-dark pl-1">
                        ⚡ {site.issuesCount.updates} updates pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-primary-teal/15 pt-4">
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="p-2 text-slate-400 hover:text-coral hover:bg-coral/10 rounded-md transition border border-transparent hover:border-coral/20"
                      title="Delete site"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <Link
                      to={`/sites/${site.id}`}
                      className="px-4 py-2 bg-primary-bg hover:bg-primary-teal hover:text-white text-primary-dark rounded-full border-2 border-primary-dark font-extrabold text-[11px] tracking-wide uppercase flex items-center gap-1 transition ml-auto shadow-sm active:scale-95"
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
        <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-white border-3 border-primary-dark rounded p-6 md:p-8 flex flex-col gap-6 relative"
            style={{ boxShadow: '8px 8px 0px #1E8C86' }}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-primary-dark rounded-md hover:bg-slate-100"
            >
              <X className="h-6 w-6" />
            </button>

            {!createdSite ? (
              <>
                <div className="border-b-2 border-dashed border-primary-teal/20 pb-2">
                  <h3 className="text-xl font-black text-primary-dark">Add New Website</h3>
                  <p className="text-xs text-primary-teal/70 font-semibold uppercase tracking-wider mt-1">
                    Register a site for Uptime, SSL & Security Monitoring
                  </p>
                </div>

                <form onSubmit={handleAddSite} className="flex flex-col gap-4">
                  {/* Site Type Toggle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                      Website Platform / Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewSiteType('wordpress')}
                        className={`p-3 rounded border-2 text-left transition font-bold text-xs ${
                          newSiteType === 'wordpress'
                            ? 'border-primary-teal bg-primary-teal/10 text-primary-teal'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-sm">🌐 WordPress</span>
                        <span className="text-[10px] font-normal text-slate-400">Includes Plugin & Security Agent</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSiteType('non-wp')}
                        className={`p-3 rounded border-2 text-left transition font-bold text-xs ${
                          newSiteType === 'non-wp'
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-sm">⚡ Non-WP / App</span>
                        <span className="text-[10px] font-normal text-slate-400">HTTP, SSL & Keyword Health Check</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                      Site Label Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      className="w-full cream-input"
                      placeholder="e.g. Landing Page / Main App"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      required
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      className="w-full cream-input"
                      placeholder="e.g. https://mywebsite.com"
                    />
                  </div>

                  {newSiteType === 'non-wp' && (
                    <div className="flex flex-col gap-1.5 bg-purple-50/60 p-3 rounded border border-purple-200">
                      <label className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                        Keyword Check (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCheckKeyword}
                        onChange={(e) => setNewCheckKeyword(e.target.value)}
                        className="w-full cream-input"
                        placeholder="e.g. Welcome to Our Site"
                      />
                      <span className="text-[10px] text-purple-700 font-medium">
                        Alert if this text is missing from HTML body (useful for defacement detection).
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full mt-2"
                  >
                    {submitting ? 'Registering...' : 'Register Site'}
                  </button>
                </form>
              </>
) : (
              // Success Screen
              <div className="flex flex-col gap-5 text-center">
                <div className="p-3 bg-success/10 text-success border-2 border-success rounded w-14 h-14 flex items-center justify-center mx-auto shadow-sm">
                  <Shield className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary-dark">Node Registered Successfully!</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
                    Unduh plugin agent di bawah ini dan konfigurasikan <b>wp-config.php</b>.
                  </p>
                </div>

                {/* Download Plugin Step Card */}
                <div className="bg-primary-teal/10 border-2 border-primary-teal/30 rounded p-4 text-left flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-primary-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                      ⚡ Langkah 1: Plugin WordPress Agent
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Unduh file <b>wp-monitor-agent.zip</b> lalu upload melalui WordPress Admin (<b>Plugins &gt; Add New &gt; Upload Plugin</b>).
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadAgent}
                    className="btn-teal py-2.5 px-4 text-xs font-black flex items-center justify-center gap-2 mt-1 shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download Plugin Agent (ZIP)
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-left bg-cream border-2 border-primary-teal/20 rounded p-4 text-xs font-medium">
                  <div className="flex items-center justify-between border-b border-primary-teal/15 pb-2 mb-1">
                    <span className="font-extrabold text-primary-dark text-xs uppercase tracking-wider">
                      🔑 Langkah 2: Kunci Konfigurasi
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-primary-teal/80 font-bold uppercase tracking-wider text-[10px]">
                      API KEY (X-API-KEY)
                    </span>
                    <div className="flex items-center gap-2 bg-white border border-primary-teal/25 rounded-md py-2 px-3 justify-between">
                      <code className="text-coral font-mono font-bold select-all truncate">{createdSite.apiKey}</code>
                      <button
                        onClick={() => copyToClipboard(createdSite.apiKey)}
                        className="text-slate-400 hover:text-primary-dark p-1 transition"
                        title="Copy key"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-primary-teal/80 font-bold uppercase tracking-wider text-[10px]">
                      SERVER URL
                    </span>
                    <div className="flex items-center gap-2 bg-white border border-primary-teal/25 rounded-md py-2 px-3 justify-between">
                      <code className="text-primary-dark font-mono font-bold select-all truncate">
                        {window.location.origin}
                      </code>
                      <button
                        onClick={() => copyToClipboard(window.location.origin)}
                        className="text-slate-400 hover:text-primary-dark p-1 transition"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-bg/50 border-2 border-primary-teal/10 p-4 rounded text-left text-xs text-primary-dark/80 leading-relaxed mt-1">
                  <b>wp-config.php Parameters:</b><br />
                  Add these parameters to your WordPress configuration:
                  <pre className="bg-white p-2.5 rounded border border-primary-teal/20 font-mono text-[9px] text-coral font-bold mt-2 overflow-x-auto select-all">
{`define('WP_MONITOR_API_KEY', '${createdSite.apiKey}');
define('WP_MONITOR_SERVER_URL', '${window.location.origin}');`}
                  </pre>
                </div>

                <button
                  onClick={closeCreatedModal}
                  className="btn-teal w-full mt-2"
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
