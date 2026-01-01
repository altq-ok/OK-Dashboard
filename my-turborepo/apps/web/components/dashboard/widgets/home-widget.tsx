'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllStatuses } from '@/hooks/use-all-statuses';
import { Globe, AlertTriangle, Calendar, Cpu, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import { WidgetProps } from '@/lib/widget-registry';
import { cn } from '@/lib/utils';

// World clock settings
const LOCATIONS = [
  { city: 'Tokyo', zone: 'Asia/Tokyo', flag: '🇯🇵', market: 'TSE', open: 9, close: 15 },
  { city: 'London', zone: 'Europe/London', flag: '🇬🇧', market: 'LSE', open: 8, close: 16 },
  { city: 'New York', zone: 'America/New_York', flag: '🇺🇸', market: 'NYSE', open: 9, close: 16 },
];

export function HomeWidget({ targetId }: WidgetProps) {
  const { data: allStatuses } = useAllStatuses();
  const [times, setTimes] = useState<Record<string, string>>({});

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimes: Record<string, string> = {};
      LOCATIONS.forEach((loc) => {
        newTimes[loc.city] = new Intl.DateTimeFormat('en-US', {
          timeZone: loc.zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date());
      });
      setTimes(newTimes);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate summary from all statuses
  const stats = useMemo(() => {
    if (!allStatuses) return { running: 0, failed: 0, done: 0 };
    return {
      running: allStatuses.filter((s) => s.status === 'running').length,
      failed: allStatuses.filter((s) => s.status === 'failed').length,
      done: allStatuses.filter((s) => s.status === 'done').length,
    };
  }, [allStatuses]);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* --- Bento Grid Top Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* World Clocks (Spans 3 columns) */}
        <Card className="md:col-span-3 shadow-sm border-muted-foreground/10 bg-linear-to-br from-background to-muted/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Globe className="h-3 w-3" /> Global Market Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {LOCATIONS.map((loc) => {
              const timeStr = times[loc.city] || '00:00:00';
              const hour = parseInt(timeStr.split(':')[0]);
              const isOpen = hour >= loc.open && hour < loc.close;

              return (
                <div
                  key={loc.city}
                  className="flex flex-col items-center p-4 rounded-2xl bg-background/40 border shadow-sm backdrop-blur-sm"
                >
                  <span className="text-3xl mb-1 drop-shadow-sm">{loc.flag}</span>
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">
                    {loc.city}
                  </span>
                  <span className="text-2xl font-mono font-bold tracking-tighter tabular-nums text-foreground">
                    {timeStr}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'mt-2 text-[9px] h-4 font-bold border-none',
                      isOpen ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {loc.market} • {isOpen ? 'OPEN' : 'CLOSED'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Success Rate / Stability (Spans 1 column) */}
        <Card className="flex flex-col justify-between p-6 bg-card border shadow-sm">
          <div className="space-y-1">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stability</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold tracking-tighter italic">98.2%</h3>
            <p className="text-[9px] text-muted-foreground font-medium uppercase mt-1">Worker Success Rate</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full', i < 4 ? 'bg-emerald-500' : 'bg-muted')} />
            ))}
          </div>
        </Card>
      </div>

      {/* --- Bento Grid Middle Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerts Metrics */}
        <Card className="border-l-4 border-l-red-500 shadow-sm group hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Guideline Alerts</p>
              <h3 className="text-4xl font-bold text-red-600 tracking-tighter">{stats.failed}</h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">Active compliance violations</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-3xl transition-transform group-hover:scale-110">
              <AlertTriangle className="text-red-600 h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        {/* Events Metrics */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm group hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition-colors">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today&apos;s Events</p>
              <h3 className="text-4xl font-bold text-blue-600 tracking-tighter">12</h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">Earnings & Corporate Actions</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-3xl transition-transform group-hover:scale-110">
              <Calendar className="text-blue-600 h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Section 3: System Status --- */}
      <Card className="bg-muted/40 dark:bg-slate-950 text-foreground overflow-hidden relative border shadow-sm rounded-2xl transition-colors duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-10 rotate-12">
          <Cpu className="h-32 w-32" />
        </div>

        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border shadow-inner">
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-[0.2em] uppercase">Local Node System Monitor</h4>
              <p className="text-[10px] font-mono text-muted-foreground">Terminal ID: NODE-ALPHA-01</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-6">
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Worker Engine</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                  Ready
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Parallel Tasks</p>
              <p className="text-lg font-mono font-bold tracking-tighter">{stats.running}</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Link Status</p>
              <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                Y:/ Synchronized
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Version</p>
              <p className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-tighter">v1.2.0-STB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="flex justify-center items-center gap-6 py-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter bg-muted/50 px-3 py-1 rounded-full border">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Everything is updated
        </div>
      </div>
    </div>
  );
}
