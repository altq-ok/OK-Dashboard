'use client';

import { Loader2, Activity } from 'lucide-react';

interface LoadingWidgetProps {
  message?: string;
  variant?: 'default' | 'mini' | 'terminal';
}

export function LoadingWidget({ message = 'Loading...', variant = 'default' }: LoadingWidgetProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Circle with animate-ping */}
        <div className="absolute h-12 w-12 rounded-full bg-primary/10 animate-ping" />
        {/* Rotating main icon */}
        <div className="relative bg-background p-3 rounded-xl border shadow-sm">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>

      {/* Text section */}
      <div className="text-center space-y-1.5">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">{message}</p>
        {/* Sub-text to make it look nicer */}
        <div className="flex items-center justify-center gap-2">
          <Activity className="h-3 w-3 text-emerald-500 opacity-50" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase italic">
            Connecting to Shared Node Alpha...
          </span>
        </div>
      </div>

      {/* Progress bar style animation - just to make it look fancy */}
      <div className="w-24 h-0.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/40 w-1/2 animate-[loading_1.5s_infinite_ease-in-out]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
