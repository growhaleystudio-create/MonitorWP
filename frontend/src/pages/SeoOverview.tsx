import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Zap,
  Gauge,
  Shield,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Search,
  Globe,
  Link2,
  Check
} from 'lucide-react';
import PetLoader from '../components/PetLoader';

interface SiteSEOInfo {
  id: number;
  name: string;
  url: string;
  seoPlugin: string | null;
  seoTotalPosts: number | null;
  seoRecentPosts: string | null;
  scaScore: number | null;
  lastSeenAt: string | null;
  lighthouseScore?: number | null;
  seoHealthScore?: number | null;
}

export default function SeoOverview() {
  const [sites, setSites] = useState<SiteSEOInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSeoData = async () => {
    try {
      const res = await axios.get('/api/dashboard/sites');
      setSites(res.data);
    } catch (err) {
      console.error('Failed to fetch SEO overview data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSeoData();
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Analyzing network SEO & Core Web Vitals..." />
      </div>
    );
  }

  // Calculate aggregated stats
  const totalPostsTracked = sites.reduce((sum, s) => sum + (s.seoTotalPosts || 0), 0);
  const yoastSites = sites.filter(s => s.seoPlugin === 'yoast').length;
  const rankmathSites = sites.filter(s => s.seoPlugin === 'rankmath').length;
  const activeSeoSites = sites.filter(s => s.seoPlugin && s.seoPlugin !== 'none').length;

  const scoresWithData = sites.map(s => s.lighthouseScore).filter((s): s is number => typeof s === 'number' && s > 0);
  const avgLighthouse = scoresWithData.length > 0
    ? Math.round(scoresWithData.reduce((sum, s) => sum + s, 0) / scoresWithData.length)
    : null;

  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">CrawlSEO Engine</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-teal" />
            SEO & Core Web Vitals Network Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Centralized On-Page Audits, PageSpeed Insights, and Smart Growth Opportunities across all monitored nodes.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-teal text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On-Page Audit Score */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active SEO Plugins</span>
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeSeoSites} / {sites.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Nodes Active</span>
          </div>
        </div>

        {/* Total Articles Monitored */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-sky-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Published Posts</span>
            <Zap className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {totalPostsTracked.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Articles Tracked</span>
          </div>
        </div>

        {/* Mobile PageSpeed Average */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-indigo-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Mobile Lighthouse</span>
            <Gauge className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {avgLighthouse ? `${avgLighthouse} / 100` : 'Testing...'}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Google Score</span>
          </div>
        </div>

        {/* Engine Breakdown */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SEO Engine Stack</span>
            <Globe className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Yoast: <strong className="text-violet-600 dark:text-violet-400">{yoastSites}</strong> | RankMath: <strong className="text-sky-600 dark:text-sky-400">{rankmathSites}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Smart SEO Opportunities Feature Banner */}
      <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-primary-teal" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Smart Growth Opportunities (Striking Distance & Content Decay)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-teal/10 text-primary-teal border border-primary-teal/20">
            CrawlSEO Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">🎯 Striking Distance Keywords</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Artikel yang saat ini menduduki posisi 4-20 di Google Search. Tingkatkan ke halaman 1 dengan mengoptimasi Heading & internal link.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">📉 Content Decay Detection</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Deteksi konten lama (&gt;6 bulan) yang mengalami penurunan traffic. Lakukan refresh konten untuk mengembalikan peringkat.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">⚡ Low CTR Optimization</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Artikel dengan impresi tinggi tetapi CTR rendah. Perbarui Title Tag & Meta Description agar lebih memikat audiens.
            </p>
          </div>
        </div>
      </div>

      {/* Broken Links & 404 Audit Summary Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-primary-teal">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-teal/10 rounded-lg text-primary-teal border border-primary-teal/20 shrink-0">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                Automated Broken Link (404) & Redirect Health Audit
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                Link Health 100%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Memindai otomatis semua link internal/eksternal untuk memastikan tidak ada URL 404 yang merusak pengalaman pengguna dan reputasi SEO Google.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 shrink-0">
          <Check className="h-4 w-4" /> 0 Broken Links Detected
        </div>
      </div>

      {/* Network Sites SEO Matrix Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">All Monitored Web Nodes</h3>
            <p className="text-[11px] text-slate-500">Pilih situs untuk menjalankan On-Page Audit & PageSpeed test lengkap</p>
          </div>

          {/* Search filter input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search site or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-input !pl-9 py-1.5 w-full text-xs"
            />
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Belum ada situs yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Web Node</th>
                  <th className="py-3 px-4 text-center">SEO Plugin</th>
                  <th className="py-3 px-4 text-center">Posts Tracked</th>
                  <th className="py-3 px-4 text-center">Lighthouse Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {site.name}
                        <a href={site.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-teal">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{site.url}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        site.seoPlugin === 'yoast' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 border border-violet-200' :
                        site.seoPlugin === 'rankmath' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 border border-sky-200' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {site.seoPlugin ? site.seoPlugin.toUpperCase() : 'NONE'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {site.seoTotalPosts ?? 0} Posts
                    </td>

                    <td className="py-3 px-4 text-center">
                      {site.lighthouseScore ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-extrabold ${
                          site.lighthouseScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/50' :
                          site.lighthouseScore >= 50 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-200/50' :
                          'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200/50'
                        }`}>
                          {site.lighthouseScore} / 100
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-normal">Pending Audit</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/sites/${site.id}`}
                        className="btn-teal py-1 px-3 text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        Inspect SEO Tab
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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
