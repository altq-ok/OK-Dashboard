'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllStatuses } from '@/hooks/use-all-statuses';
import { useSnapshot } from '@/hooks/use-snapshot';
import { useQuery } from '@tanstack/react-query';
import { Globe, AlertTriangle, Calendar, Cpu, TrendingUp, Zap } from 'lucide-react';
import { WidgetProps } from '@/lib/widget-registry';
import { cn, isSnapshotToday } from '@/lib/utils';

const LOCATIONS = [
  { city: 'Tokyo', zone: 'Asia/Tokyo', flag: '🇯🇵', market: 'TSE', open: 9, close: 15 },
  { city: 'London', zone: 'Europe/London', flag: '🇬🇧', market: 'LSE', open: 8, close: 16 },
  { city: 'New York', zone: 'America/New_York', flag: '🇺🇸', market: 'NYSE', open: 9, close: 16 },
];

export function HomeWidget({ targetId }: WidgetProps) {
  const { data: allStatuses } = useAllStatuses();

  // Fetch snapshots to check statuses
  const { snapshots: pricingSnaps } = useSnapshot('ALL', 'prices');
  const { snapshots: eventSnaps } = useSnapshot('ALL', 'calendar_events');
  const { snapshots: guideSnaps } = useSnapshot('ALL', 'guideline_results');

  // Fetch user events
  const { data: userEvents = [] } = useQuery({
    queryKey: ['user-events'],
    queryFn: async () => (await fetch('http://localhost:8000/data/user-events')).json(),
  });

  // Check status of each data type
  const stats = useMemo(() => {
    if (!allStatuses) return { running: 0, failed: 0, done: 0, total: 0 };
    return {
      running: allStatuses.filter((s) => s.status === 'running').length,
      failed: allStatuses.filter((s) => s.status === 'failed').length,
      done: allStatuses.filter((s) => s.status === 'done').length,
      total: allStatuses.length,
    };
  }, [allStatuses]);

  // Extract upcoming events from user events
  const upcomingEvents = useMemo(() => {
    return [...userEvents].sort((a, b) => a.start.localeCompare(b.start)).slice(0, 2);
  }, [userEvents]);

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-10">
      {/* Top Row: World Clocks & Market Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 shadow-sm border-muted-foreground/10 from-background to-muted/30 overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Globe className="h-3 w-3 text-blue-500" /> Global Exchange Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {LOCATIONS.map((loc) => (
              <WorldClockCard key={loc.city} location={loc} />
            ))}
          </CardContent>
        </Card>

        {/* Stability Chart - dummy data */}
        <Card className="flex flex-col justify-between p-6 bg-card border shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Load</p>
          </div>
          <div className="flex items-end gap-1 h-12 z-10">
            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 30].map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500/20 rounded-t-sm transition-all duration-1000"
                style={{ height: `${v}%` }}
              >
                <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: i === 8 ? '100%' : '30%' }} />
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-black tracking-tighter italic z-10">OPTIMAL</h3>
        </Card>
      </div>

      {/* Middle Row: Metrics & Data Freshness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alerts */}
        <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Guideline Alerts</p>
              <h3 className="text-4xl font-black text-red-600 tracking-tighter">{stats.failed}</h3>
              <Badge variant="destructive" className="text-[8px] h-4">
                CRITICAL
              </Badge>
            </div>
            <AlertTriangle className="text-red-600 h-8 w-8" />
          </CardContent>
        </Card>

        {/* Upcoming Events List */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Upcoming</p>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((e) => (
                  <div
                    key={e.event_id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="text-[10px] font-mono font-bold bg-blue-500 text-white px-1.5 rounded">
                      {e.start.substring(8, 10)}
                    </div>
                    <div className="text-[11px] font-bold truncate flex-1">{e.title}</div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] italic text-muted-foreground text-center py-2">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Freshness (The "Traffic Light" Grid) */}
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data Integrity</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Pricing', ok: isSnapshotToday(pricingSnaps?.[0]) },
                { label: 'Events', ok: isSnapshotToday(eventSnaps?.[0]) },
                { label: 'Compliance', ok: isSnapshotToday(guideSnaps?.[0]) },
                { label: 'Dummy', ok: true },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border">
                  <span className="text-[10px] font-medium">{d.label}</span>
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full shadow-[0_0_8px]',
                      d.ok ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50 animate-pulse',
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: System Status Console */}
      <Card className="bg-muted/40 backdrop-blur-sm text-foreground overflow-hidden relative border shadow-sm rounded-3xl transition-colors duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-10 rotate-12">
          <Cpu className="h-40 w-40" />
        </div>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border shadow-inner">
                <Zap className="h-6 w-6 text-emerald-500 fill-emerald-500/20" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-[0.3em] uppercase">Local Computing Node</h4>
                <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM STATUS: NOMINAL // VER: 0.1.0
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-muted-foreground uppercase">Current Target</span>
              <span className="text-xl font-black tracking-tighter text-blue-600">{targetId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-8">
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Worker Cluster</p>
              <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">● 01-ONLINE</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Active Processes</p>
              <p className="text-lg font-mono font-bold">{stats.running} ACTIVE</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Storage Link</p>
              <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">Y:/ MOUNTED</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Team Sync</p>
              <p className="text-sm font-mono font-bold text-muted-foreground uppercase italic">Real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Badge
          variant="secondary"
          className="px-4 py-1 rounded-full text-[10px] font-bold tracking-widest opacity-50 uppercase"
        >
          OK-Dashboard v0.1.0 • Secure Local Instance
        </Badge>
      </div>
    </div>
  );
}

function WorldClockCard({ location }: { location: (typeof LOCATIONS)[0] }) {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: location.zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [location.zone]);

  const hour = parseInt(time.split(':')[0]);
  const isOpen = hour >= location.open && hour < location.close;

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-background/40 border shadow-xs backdrop-blur-sm group hover:bg-background/60 transition-colors">
      <span className="text-3xl mb-1 transition-transform group-hover:scale-110 duration-500">{location.flag}</span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase">{location.city}</span>
      <span className="text-2xl font-mono font-bold tracking-tighter tabular-nums">{time}</span>
      <Badge
        variant="outline"
        className={cn(
          'mt-2 text-[9px] h-4 border-none font-bold',
          isOpen ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground',
        )}
      >
        {location.market} • {isOpen ? 'OPEN' : 'CLOSED'}
      </Badge>
    </div>
  );
}
