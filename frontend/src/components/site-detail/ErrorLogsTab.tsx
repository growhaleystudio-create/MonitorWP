import React from 'react';
import type { ErrorLog } from '../../types/dashboard';

interface ErrorLogsTabProps {
  errorLogs: ErrorLog[];
}

export const ErrorLogsTab: React.FC<ErrorLogsTabProps> = ({ errorLogs }) => {
  if (errorLogs.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm font-medium">
        No errors registered. Excellent!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-primary-bg/30 border-b border-primary-teal/15 text-[10px] font-extrabold text-primary-teal/80 uppercase tracking-wider">
            <th className="py-4 px-6">Code</th>
            <th className="py-4 px-6">Requested Endpoint</th>
            <th className="py-4 px-6">Details</th>
            <th className="py-4 px-6 text-center">Hits</th>
            <th className="py-4 px-6 text-right">Last Logged</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-teal/10 text-sm font-medium">
          {errorLogs.map((log) => (
            <tr key={log.id} className="hover:bg-primary-bg/10 transition">
              <td className="py-4 px-6">
                <span
                  className={`inline-flex px-2.5 py-1 rounded text-xs font-black border ${
                    log.errorCode === 404
                      ? 'bg-accent-light/35 text-accent-dark border-accent-gold/30'
                      : 'bg-coral/10 text-coral border-coral/30'
                  }`}
                >
                  {log.errorCode}
                </span>
              </td>
              <td
                className="py-4 px-6 text-primary-dark font-mono text-xs select-all truncate max-w-[200px]"
                title={log.url}
              >
                {log.url}
              </td>
              <td
                className="py-4 px-6 text-slate-500 italic max-w-[300px] truncate"
                title={log.message || 'N/A'}
              >
                {log.message || 'N/A'}
              </td>
              <td className="py-4 px-6 text-center font-extrabold text-primary-dark">
                {log.count}
              </td>
              <td className="py-4 px-6 text-right text-slate-400 text-xs font-bold">
                {new Date(log.lastSeen).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
