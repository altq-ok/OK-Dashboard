'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Activity, AlertCircle, Cpu, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WidgetProps } from '@/lib/widget-registry';

// 設定: 表示する都市とマーケット情報
const MARKETS = [
  { city: 'Tokyo', zone: 'Asia/Tokyo', code: 'TSE', color: 'from-red-500/20' },
  { city: 'London', zone: 'Europe/London', code: 'LSE', color: 'from-blue-500/20' },
  { city: 'New York', zone: 'America/New_York', code: 'NYSE', color: 'from-emerald-500/20' },
];

export function HomeWidget({ data, status, targetId }: WidgetProps) {
  const [now, setNow] = useState(new Date());

  // 1秒ごとに時刻を更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 計算中のタスク数などを取得（statusがALL/summaryを想定）
  // もし status が単一のオブジェクトなら、その中の progress 等を表示
  const runningTasksCount = status?.status === 'running' ? 1 : 0;

  return (
    <div className="p-1 space-y-6 animate-in fade-in duration-700">
      {/* --- Section 1: World Clocks --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MARKETS.map((m) => {
          const timeStr = now.toLocaleTimeString('en-US', {
            timeZone: m.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });

          return (
            <Card
              key={m.city}
              className={cn('border-none bg-gradient-to-br to-background shadow-sm overflow-hidden', m.color)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                    {m.city} / {m.code}
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold tracking-tighter">{timeStr}</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">MARKET OPEN</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* --- Section 2: Executive Summary Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerts Card */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Active Alerts</p>
              <h3 className="text-3xl font-bold tracking-tighter text-red-500">
                {/* 実際のアラート件数をバインド可能 */}
                {data?.alertsCount || 0}
              </h3>
            </div>
            <div className="rounded-full bg-red-500/10 p-3 text-red-500 transition-transform group-hover:scale-110">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-red-500/5 text-[10px] border-red-500/20 text-red-600">
              Requires Attention
            </Badge>
          </div>
        </div>

        {/* System Activity Card */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Running Tasks</p>
              <h3 className="text-3xl font-bold tracking-tighter text-blue-500">{runningTasksCount}</h3>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3 text-blue-500 transition-transform group-hover:scale-110">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
              Node Processing Active
            </p>
          </div>
        </div>
      </div>

      {/* --- Section 3: Node Health Status --- */}
      <div className="rounded-xl border bg-slate-950 p-4 text-slate-400 shadow-inner overflow-hidden relative group">
        {/* 背景の装飾用アイコン */}
        <Globe className="absolute -right-4 -top-4 h-24 w-24 opacity-5 transition-transform group-hover:rotate-12 duration-1000" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <Cpu className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">Local Engine Status</p>
              <p className="text-[11px] font-mono opacity-60">System Version: v1.0.4-stable</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-tighter opacity-50">Node Health</p>
              <p className="text-xs font-bold text-emerald-400 font-mono">EXCELLENT</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-tighter opacity-50">Latency</p>
              <p className="text-xs font-bold font-mono text-white">4ms</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase tracking-tighter opacity-50">Sync</p>
              <p className="text-xs font-bold font-mono text-white">REAL-TIME</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
