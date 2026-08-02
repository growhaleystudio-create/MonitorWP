import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, ShieldAlert, AlertOctagon } from 'lucide-react';
import type { Site, Plugin, SecurityEvent, SecurityStats } from '../../types/dashboard';

interface SecurityTabProps {
  site: Site;
  plugins: Plugin[];
  securityEvents: SecurityEvent[];
  securityStats: SecurityStats | null;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  site,
  plugins,
  securityEvents,
  securityStats,
}) => {
  let scaList: any[] = [];
  if (site.scaResults) {
    try {
      scaList = JSON.parse(site.scaResults);
    } catch (e) {
      console.error(e);
    }
  }

  const vuln = securityStats?.vulnerabilities || {
    critical: site.status === 'offline' ? 1 : 0,
    high: plugins.filter((p) => p.isExpired).length,
    medium: plugins.filter((p) => p.requiresUpdate && !p.isExpired).length,
    low: scaList.filter((s) => s.status === 'failed').length,
  };

  const secChart = securityStats?.securityEventsChart || [];

  return (
    <div className="p-6 flex flex-col gap-6 animate-fadeIn">
      {/* 1. Vulnerability Severity Cards Grid (SIEM Risk Matrix) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical */}
        <div className="bg-white dark:bg-slate-900/90 border border-red-200 dark:border-red-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
          <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider pl-1.5">Critical</span>
          <div className="flex items-baseline justify-between mt-1 pl-1.5">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400 leading-none">{vuln.critical}</span>
            <span className="text-[9px] font-bold text-red-400">Risk Severity</span>
          </div>
        </div>

        {/* High */}
        <div className="bg-white dark:bg-slate-900/90 border border-orange-200 dark:border-orange-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
          <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider pl-1.5">High</span>
          <div className="flex items-baseline justify-between mt-1 pl-1.5">
            <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 leading-none">{vuln.high}</span>
            <span className="text-[9px] font-bold text-orange-400">Risk Severity</span>
          </div>
        </div>

        {/* Medium */}
        <div className="bg-white dark:bg-slate-900/90 border border-yellow-200 dark:border-amber-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>
          <span className="text-[10px] font-bold text-yellow-600 dark:text-amber-400 uppercase tracking-wider pl-1.5">Medium</span>
          <div className="flex items-baseline justify-between mt-1 pl-1.5">
            <span className="text-3xl font-extrabold text-yellow-600 dark:text-amber-400 leading-none">{vuln.medium}</span>
            <span className="text-[9px] font-bold text-yellow-500">Risk Severity</span>
          </div>
        </div>

        {/* Low */}
        <div className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-950/60 rounded-lg p-4 flex flex-col gap-1 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider pl-1.5">Low</span>
          <div className="flex items-baseline justify-between mt-1 pl-1.5">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">{vuln.low}</span>
            <span className="text-[9px] font-bold text-blue-400">Risk Severity</span>
          </div>
        </div>
      </div>

      {/* 2. SCA Audit Results & FIM / Event Trend Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: SCA Hardening Audit Checklist (3 columns) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Security Configuration Assessment (SCA)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated server hardening audit check</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${site.scaScore ?? 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50">
                {site.scaScore ?? 0}% SCA
              </span>
            </div>
          </div>

          {scaList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No SCA scan data received yet. Run agent sync.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {scaList.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-3 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.policy}</span>
                    <span className="text-[10px] text-slate-400 font-normal leading-relaxed">{item.description}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    item.status === 'passed'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200/50'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/40 border border-red-200/50 animate-pulse'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Security Events Count Evolution & Core File Modification List (2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Security events count line chart */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Security Events Evolution</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Incidents and warnings count last 30 days</p>
            </div>
            <div className="h-40 w-full mt-1">
              {secChart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">No charts timeline data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={secChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF6C4A" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#EF6C4A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value) => [value, 'Incidents']}
                    />
                    <Area type="monotone" dataKey="count" stroke="#EF6C4A" strokeWidth={2} fillOpacity={1} fill="url(#colorSecurity)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* FIM (File Integrity Monitoring) Modified list */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">File Integrity Monitoring (FIM)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Recent modifications of critical WordPress files</p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {securityEvents.filter((e) => e.eventType === 'file_change').length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic">
                  No file modifications detected. Core is clean.
                </div>
              ) : (
                securityEvents
                  .filter((e) => e.eventType === 'file_change')
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-2 rounded bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                          <AlertOctagon className="h-3 w-3 shrink-0" />
                          Modifikasi Terdeteksi
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{event.detail}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                        {new Date(event.createdAt).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Security Event Log Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Full Security Event Alerts</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Detailed raw security alerts logged by the WordPress agent</p>
        </div>

        {securityEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            No security alerts logged.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {securityEvents.map((event) => {
              const isInjection = event.eventType.startsWith('injection_');
              const isFailure = event.eventType === 'login_failed';
              const isFim = event.eventType === 'file_change';

              return (
                <div
                  key={event.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded border transition ${
                    isInjection || isFim
                      ? 'bg-red-50/40 border-red-100 hover:bg-red-50/70'
                      : isFailure
                        ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70'
                        : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-1.5 rounded bg-white border border-slate-200/50 shrink-0 mt-0.5">
                      {isInjection || isFim ? (
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-amber-500" />
                      )}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isInjection || isFim ? 'text-red-600' : 'text-amber-700'
                        }`}>
                          {event.eventType.replace('_', ' ')}
                        </span>
                        {event.ipAddress && (
                          <span className="text-[9px] text-slate-400 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                            IP: {event.ipAddress}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1 select-all">
                        {event.username ? `Username: "${event.username}" | ` : ''}{event.detail}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold mt-2 md:mt-0 whitespace-nowrap self-end md:self-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {new Date(event.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
