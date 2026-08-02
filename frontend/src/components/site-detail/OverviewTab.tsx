import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, ShieldCheck, Database, Check, Copy } from 'lucide-react';
import type { Site } from '../../types/dashboard';

interface OverviewTabProps {
  site: Site;
  averageResponseTime: number;
  uptimePercentage: number;
  chartData: Array<{ time: string; ms: number; status: string }>;
  cleaningDb: boolean;
  cleanDbResult: string | null;
  copiedKey: boolean;
  onCleanDb: () => void;
  onCopyApiKey: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  site,
  averageResponseTime,
  uptimePercentage,
  chartData,
  cleaningDb,
  cleanDbResult,
  copiedKey,
  onCleanDb,
  onCopyApiKey,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick details */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col justify-between gap-6 border-l-4 border-l-primary-teal">
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Telemetry Status
          </h3>
          <div className="flex flex-col gap-3 text-xs font-semibold">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Last Contact</span>
              <span className="text-slate-900 dark:text-slate-100">
                {site.lastSeenAt ? new Date(site.lastSeenAt).toLocaleString('id-ID') : 'Never'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Latency Ping</span>
              <span className="text-primary-teal font-bold">{averageResponseTime} ms</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Uptime Score</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{uptimePercentage}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">WP Memory Peak</span>
              <span className="text-slate-900 dark:text-slate-100">
                {site.wpMemoryUsage ? `${site.wpMemoryUsage} MB` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Disk space</span>
              <span className="text-slate-900 dark:text-slate-100">
                {site.diskTotal ? `${Math.round(site.diskTotal - (site.diskFree || 0))} / ${site.diskTotal} GB` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400 uppercase text-[10px] font-bold flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-500" /> SSL Sentinel
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Valid (Sisa 68 Hari)
              </span>
            </div>
          </div>
        </div>

        {/* Database Cleaner Action Box */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <button
            onClick={onCleanDb}
            disabled={cleaningDb}
            className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <Database className="h-4 w-4 text-primary-teal" />
            {cleaningDb ? 'Cleaning Database Junk...' : '1-Click Database Junk Cleaner'}
          </button>
          {cleanDbResult && (
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 text-center animate-fade-in">
              {cleanDbResult}
            </p>
          )}
        </div>
        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <span className="text-slate-400 uppercase text-[10px] font-bold">System CPU Load</span>
          <span className="text-slate-900 dark:text-slate-100">
            {site.cpuLoad !== null && site.cpuLoad !== undefined ? `${site.cpuLoad.toFixed(2)}` : 'N/A'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Secret API Key
          </span>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 justify-between text-xs">
            <code className="text-rose-600 dark:text-rose-400 font-mono font-bold select-all truncate">{site.apiKey}</code>
            <button
              onClick={onCopyApiKey}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 transition cursor-pointer"
              title="Copy API key"
            >
              {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Latency Chart */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-sm p-6 lg:col-span-2 flex flex-col gap-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
          Response Latency Stream (Last 50 Pings)
        </h3>
        <div className="h-48 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#187DB4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#187DB4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="ms" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="ms" name="Ping" stroke="#187DB4" strokeWidth={3} fillOpacity={1} fill="url(#colorMs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
