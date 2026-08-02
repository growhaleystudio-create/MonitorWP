import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PetLoader from '../components/PetLoader';
import { useSiteDetail } from '../hooks/useSiteDetail';
import { SiteHeader } from '../components/site-detail/SiteHeader';
import { OverviewTab } from '../components/site-detail/OverviewTab';
import { PluginsTab } from '../components/site-detail/PluginsTab';
import { ErrorLogsTab } from '../components/site-detail/ErrorLogsTab';
import { SecurityTab } from '../components/site-detail/SecurityTab';

export default function SiteDetail() {
  const { id } = useParams();
  const {
    site,
    plugins,
    errorLogs,
    securityEvents,
    securityStats,
    loading,
    copiedKey,
    downloadingPdf,
    cleaningDb,
    cleanDbResult,
    averageResponseTime,
    uptimePercentage,
    chartData,
    copyApiKey,
    handleCleanDb,
    handleExportPdf,
  } = useSiteDetail(id);

  const [activeTab, setActiveTab] = useState<'plugins' | 'errors' | 'security'>('plugins');

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Gathering site statistics..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-primary-dark">
      <SiteHeader
        site={site}
        downloadingPdf={downloadingPdf}
        onExportPdf={handleExportPdf}
      />

      <OverviewTab
        site={site}
        averageResponseTime={averageResponseTime}
        uptimePercentage={uptimePercentage}
        chartData={chartData}
        cleaningDb={cleaningDb}
        cleanDbResult={cleanDbResult}
        copiedKey={copiedKey}
        onCleanDb={handleCleanDb}
        onCopyApiKey={copyApiKey}
      />

      {/* Sleek Pill Tabs Menu */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-lg flex flex-wrap gap-1.5 max-w-fit border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          {(['plugins', 'errors', 'security'] as const).map((tab) => (
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
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          {activeTab === 'plugins' && <PluginsTab plugins={plugins} />}
          {activeTab === 'errors' && <ErrorLogsTab errorLogs={errorLogs} />}
          {activeTab === 'security' && (
            <SecurityTab
              site={site}
              plugins={plugins}
              securityEvents={securityEvents}
              securityStats={securityStats}
            />
          )}
        </div>
      </div>
    </div>
  );
}
