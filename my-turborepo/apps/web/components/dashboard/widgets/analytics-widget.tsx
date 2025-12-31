'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllStatuses } from '@/hooks/use-all-statuses';
import { Globe, AlertTriangle, Calendar, Cpu, Activity } from 'lucide-react';

// World clocks
const LOCATIONS = [
  { city: 'Tokyo', zone: 'Asia/Tokyo', flag: '🇯🇵', market: 'TSE' },
  { city: 'London', zone: 'Europe/London', flag: '🇬🇧', market: 'LSE' },
  { city: 'New York', zone: 'America/New_York', flag: '🇺🇸', market: 'NYSE' },
];

export function AnalyticsWidget() {
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

  // Summary (should count from Parquet but guess from status for now)
  const alertCount = allStatuses?.filter((s) => s.status === 'failed').length || 0;
  const runningCount = allStatuses?.filter((s) => s.status === 'running').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 animate-in fade-in duration-700">
      {/* --- Section 1: World Clocks --- */}
      <Card className="md:col-span-2 shadow-md border-muted-foreground/10 bg-linear-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" /> World Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {LOCATIONS.map((loc) => (
            <div key={loc.city} className="flex flex-col items-center p-3 rounded-xl bg-background/50 border shadow-sm">
              <span className="text-2xl mb-1">{loc.flag}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">{loc.city}</span>
              <span className="text-xl font-mono font-bold tracking-tighter">{times[loc.city] || '--:--:--'}</span>
              <Badge variant="outline" className="mt-2 text-[9px] h-4">
                {loc.market} • <span className="text-green-500 ml-1">OPEN</span>
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- Section 2: Quick Metrics --- */}
      <div className="space-y-6">
        {/* Alerts */}
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Guideline Alerts</p>
              <h3 className="text-2xl font-bold text-red-600">{alertCount}</h3>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="text-red-600 h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Today&apos;s Events</p>
              <h3 className="text-2xl font-bold text-blue-600">12</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="text-blue-600 h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Section 3: System Status (Fancy Monitor) --- */}
      <Card className="md:col-span-3 bg-slate-950 text-slate-50 overflow-hidden relative border-none">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="h-24 w-24" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Activity className="h-4 w-4 animate-pulse" />
            <h4 className="text-xs font-bold tracking-widest uppercase">Local Node System Monitor</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 uppercase">Worker Engine</p>
              <p className="text-sm font-mono text-emerald-400">● ONLINE</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 uppercase">Active Tasks</p>
              <p className="text-sm font-mono">{runningCount} Running</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 uppercase">Last Sync</p>
              <p className="text-sm font-mono">Just Now</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 uppercase">Shared Drive</p>
              <p className="text-sm font-mono text-blue-400">Y:/ Connected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
