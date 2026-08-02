import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Site,
  Plugin,
  UptimeLog,
  ErrorLog,
  SecurityEvent,
  TrafficStats,
  PageSpeedStatus,
  SecurityStats,
  SeoData
} from '../types/dashboard';

export function useSiteDetail(id: string | undefined) {
  const [site, setSite] = useState<Site | null>(null);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [uptimeLogs, setUptimeLogs] = useState<UptimeLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingPageSpeed, setTestingPageSpeed] = useState(false);
  const [pagespeedStatus, setPagespeedStatus] = useState<PageSpeedStatus | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [cleaningDb, setCleaningDb] = useState(false);
  const [cleanDbResult, setCleanDbResult] = useState<string | null>(null);

  const fetchSeoData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/dashboard/sites/${id}/seo`);
      setSeoData(res.data);
      if (res.data?.pagespeedStatus) {
        setPagespeedStatus(res.data.pagespeedStatus);
      }
    } catch (err) {
      console.error('Failed to fetch SEO details:', err);
    }
  }, [id]);

  const fetchSiteDetail = useCallback(async () => {
    if (!id) return;
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
    } catch (err) {
      console.error('Error fetching site details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSiteDetail();
    fetchSeoData();
    const interval = setInterval(() => {
      fetchSiteDetail();
      fetchSeoData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSiteDetail, fetchSeoData]);

  const copyApiKey = () => {
    if (!site) return;
    navigator.clipboard.writeText(site.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCleanDb = async () => {
    if (!id) return;
    try {
      setCleaningDb(true);
      const res = await axios.post(`/api/dashboard/sites/${id}/clean-db`);
      setCleanDbResult(`✅ Cleaned ${res.data.stats.revisionsDeleted} revisions, ${res.data.stats.expiredTransientsDeleted} transients (${res.data.stats.reclaimedSpaceMb} MB reclaimed)`);
    } catch (e) {
      setCleanDbResult('Failed to clean database.');
    } finally {
      setCleaningDb(false);
    }
  };

  const handleExportPdf = async () => {
    if (!id) return;
    try {
      setDownloadingPdf(true);
      const res = await axios.get(`/api/dashboard/sites/${id}/export-pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Growhaley-Monitor-Report-${site?.name || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Failed to download PDF report:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleRunPageSpeed = async () => {
    if (!id) return;
    setTestingPageSpeed(true);
    try {
      const res = await axios.post(`/api/dashboard/sites/${id}/pagespeed`);
      if (res.data?.pagespeedStatus) {
        setPagespeedStatus(res.data.pagespeedStatus);
      }
      await fetchSeoData();
    } catch (err) {
      console.error('Failed to run PageSpeed test:', err);
    } finally {
      setTestingPageSpeed(false);
    }
  };

  const activeSite: Site = site || {
    id: parseInt(id || '6', 10),
    name: (id === '6' || !id) ? 'blower' : `Web Node ${id}`,
    url: (id === '6' || !id) ? 'https://blog.blowercentrifugal.com/' : `https://node${id}.example.com`,
    apiKey: `demo-key-${id}`,
    isActive: true,
    status: 'online',
    seoPlugin: 'yoast',
    seoTotalPosts: 3,
    seoRecentPosts: null,
    scaResults: null,
    scaScore: 85,
    plugins: [],
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    wpMemoryUsage: 42.5,
    diskTotal: 50,
    diskFree: 32,
    cpuLoad: 0.15,
  };

  const averageResponseTime = uptimeLogs.length > 0
    ? Math.round(uptimeLogs.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / uptimeLogs.length)
    : 0;

  const uptimePercentage = uptimeLogs.length > 0
    ? Math.round((uptimeLogs.filter((log) => log.isUp).length / uptimeLogs.length) * 100)
    : 100;

  const chartData = uptimeLogs.map((log) => ({
    time: new Date(log.checkedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    ms: log.responseTimeMs,
    status: log.isUp ? 'UP' : 'DOWN',
  }));

  return {
    id,
    site: activeSite,
    plugins,
    uptimeLogs,
    errorLogs,
    securityEvents,
    trafficStats,
    securityStats,
    seoData,
    loading,
    copiedKey,
    testingPageSpeed,
    pagespeedStatus,
    downloadingPdf,
    cleaningDb,
    cleanDbResult,
    averageResponseTime,
    uptimePercentage,
    chartData,
    copyApiKey,
    handleCleanDb,
    handleExportPdf,
    handleRunPageSpeed,
    refetch: fetchSiteDetail,
  };
}
