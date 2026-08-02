import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import type { Plugin } from '../../types/dashboard';

interface PluginsTabProps {
  plugins: Plugin[];
}

export const PluginsTab: React.FC<PluginsTabProps> = ({ plugins }) => {
  if (plugins.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm font-medium">
        No plugin sync data received yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-primary-bg/30 border-b border-primary-teal/15 text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-wider">
            <th className="py-4 px-6">Plugin</th>
            <th className="py-4 px-6">Slug</th>
            <th className="py-4 px-6">CVE Advisory</th>
            <th className="py-4 px-6 text-center">Status</th>
            <th className="py-4 px-6 text-center">Version</th>
            <th className="py-4 px-6 text-center">Latest Version</th>
            <th className="py-4 px-6 text-right">License</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-teal/10 text-sm font-medium">
          {plugins.map((plugin: any) => (
            <tr key={plugin.id} className="hover:bg-primary-bg/10 transition">
              <td className="py-4 px-6">
                <span className="font-extrabold text-primary-dark">{plugin.name}</span>
              </td>
              <td className="py-4 px-6 text-slate-500 font-mono text-xs">{plugin.slug}</td>
              <td className="py-4 px-6">
                {plugin.cveInfo ? (
                  <div className="flex flex-col gap-0.5">
                    <a
                      href={plugin.cveInfo.advisoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide hover:underline ${
                        plugin.cveInfo.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                      title={plugin.cveInfo.description}
                    >
                      <ShieldAlert className="h-3 w-3 shrink-0" />
                      <span>{plugin.cveInfo.cveId}</span>
                      <span className="opacity-75">· {plugin.cveInfo.severity} ({plugin.cveInfo.cvssScore})</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]" title={plugin.cveInfo.vulnerabilityType}>
                      {plugin.cveInfo.vulnerabilityType}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> No CVE Known
                  </span>
                )}
              </td>
              <td className="py-4 px-6 text-center">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    plugin.isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {plugin.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-4 px-6 text-center text-primary-dark">
                v{plugin.version}
              </td>
              <td className="py-4 px-6 text-center">
                {plugin.requiresUpdate ? (
                  <span className="text-accent-dark font-extrabold flex items-center justify-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    v{plugin.latestVersion}
                  </span>
                ) : (
                  <span className="text-slate-400">v{plugin.version}</span>
                )}
              </td>
              <td className="py-4 px-6 text-right">
                {plugin.isExpired ? (
                  <span className="inline-flex px-2 py-0.5 rounded bg-coral/15 text-coral text-xs font-bold border border-coral/25">
                    Expired {plugin.expiredAt ? new Date(plugin.expiredAt).toLocaleDateString() : ''}
                  </span>
                ) : (
                  <span className="text-success text-xs font-extrabold uppercase">Valid</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
