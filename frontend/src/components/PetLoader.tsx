import { Activity, RefreshCw } from 'lucide-react';

interface PetLoaderProps {
  size?: number;
  state?: 'idle' | 'running' | 'jumping' | 'waiting' | 'failed';
  text?: string;
}

/**
 * Standard, professional dashboard loading spinner component.
 * Replaces old sprite animation with a clean modern loading ring & telemetry icon.
 */
export default function PetLoader({ size = 48, text }: PetLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none p-6 animate-fadeIn">
      {/* Outer Spinner Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div 
          className="rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-primary-teal border-r-primary-teal animate-spin"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
        {/* Inner Pulsing Ring */}
        <div 
          className="absolute rounded-full border border-sky-500/30 dark:border-sky-400/20 animate-ping"
          style={{ width: `${size * 0.75}px`, height: `${size * 0.75}px` }}
        />
        {/* Central Telemetry Icon */}
        <div className="absolute flex items-center justify-center text-primary-teal">
          <Activity style={{ width: `${size * 0.45}px`, height: `${size * 0.45}px` }} className="animate-pulse" />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin text-primary-teal" />
          {text}
        </span>
      )}
    </div>
  );
}
