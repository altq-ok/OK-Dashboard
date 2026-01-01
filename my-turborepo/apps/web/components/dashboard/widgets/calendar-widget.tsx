'use client';

import 'temporal-polyfill/global';
import { useMemo, useEffect, useState } from 'react';
import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { WidgetProps } from '@/lib/widget-registry';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { UserEvent } from '@/types/task';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// CSSの読み込み
import '@schedule-x/theme-default/dist/index.css';

/**
 * どんな文字列からでも安全に Temporal.PlainDate を作成する関数
 */
function toTemporalDate(dateStr: any) {
  const today = new Date().toISOString().split('T')[0];
  try {
    const clean = String(dateStr || today).substring(0, 10);
    return Temporal.PlainDate.from(clean);
  } catch (e) {
    return Temporal.PlainDate.from(today);
  }
}

export function CalendarWidget({ targetId }: WidgetProps) {
  const queryClient = useQueryClient();
  const { versions } = useDashboardParams();
  const { resolvedTheme } = useTheme();

  // マウント後の今日の日付（比較・表示用）
  const [todayStr] = useState(() => new Date().toISOString().split('T')[0]);

  // UI States
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 1. Plugins のインスタンスを固定 (useStateで一度だけ作成)
  const [eventsService] = useState(() => createEventsServicePlugin());
  const [eventModal] = useState(() => createEventModalPlugin());

  // 2. データの取得
  const { result: rawSystemEvents, isDataLoading: isSysLoading } = useSnapshot(
    'ALL',
    'calendar_events',
    versions.calendar_events,
  );

  const { data: rawUserEvents = [], isLoading: isUserLoading } = useQuery<UserEvent[]>({
    queryKey: ['user-events'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/data/user-events');
      return res.ok ? res.json() : [];
    },
  });

  // 3. イベントデータの整形 (Temporal オブジェクトへ変換)
  const combinedEvents = useMemo(() => {
    // システムイベント
    const sys = (rawSystemEvents || []).map((e: any, i: number) => ({
      id: String(e.event_id || `sys-${i}`),
      title: String(e.title || e.event_name || 'System Event'),
      start: toTemporalDate(e.start_date),
      end: toTemporalDate(e.end_date || e.start_date),
      _isSystem: true,
      backgroundColor: '#3b82f6',
    }));

    // ユーザーイベント (UserEvent 型)
    const user = (rawUserEvents || []).map((e: UserEvent) => ({
      id: String(e.event_id),
      title: String(e.title || 'User Event'),
      start: toTemporalDate(e.start_date),
      end: toTemporalDate(e.start_date),
      user: e.user,
      _isSystem: false,
      backgroundColor: '#a855f7',
    }));

    return [...sys, ...user];
  }, [rawSystemEvents, rawUserEvents]);

  // 4. カレンダーアプリの初期化
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid()],
    events: combinedEvents, // 初期ロード用
    plugins: [eventsService, eventModal],
    isDark: resolvedTheme === 'dark',
    locale: 'en-US',
    defaultView: 'month-grid',
    callbacks: {
      onClickDate(date) {
        setSelectedDate(String(date).substring(0, 10));
        setIsDetailOpen(true);
      },
    },
  });

  // 5. 非同期データの同期 (eventsService を使用)
  useEffect(() => {
    if (calendar && eventsService && combinedEvents.length >= 0) {
      eventsService.set(combinedEvents);
    }
  }, [combinedEvents, calendar, eventsService]);

  // 6. 保存ロジック (Mutation)
  const saveMutation = useMutation({
    mutationFn: async (newEvent: UserEvent) => {
      const res = await fetch('http://localhost:8000/data/user-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
      setIsAddOpen(false);
      setNewTitle('');
      toast.success('Event synced to team');
    },
  });

  const handleSave = () => {
    if (!newTitle.trim()) return;
    saveMutation.mutate({
      event_id: crypto.randomUUID(),
      title: newTitle.trim(),
      start_date: selectedDate,
      user: 'UserA', // ログインユーザー名
      description: '',
    });
  };

  // 選択日のイベントリスト
  const selectedDayEvents = useMemo(() => {
    return combinedEvents.filter((e) => {
      // Temporal オブジェクトを文字列に戻して比較
      return e.start.toString() === selectedDate;
    });
  }, [combinedEvents, selectedDate]);

  return (
    <div className="h-full w-full p-1 bg-background relative flex flex-col overflow-hidden">
      {/* 
        テーマ切替時に key を変えて再マウントさせることで、
        Schedule-X の内部 CSS 変数と isDark を確実に反映させます 
      */}
      <div
        key={`calendar-root-${resolvedTheme}-${combinedEvents.length}`}
        className="flex-1 rounded-xl border overflow-hidden relative shadow-inner sx-react-calendar-wrapper"
        style={{ height: '100%' }}
      >
        <ScheduleXCalendar calendarApp={calendar} />

        {(isSysLoading || isUserLoading) && (
          <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground animate-pulse uppercase">
              Syncing...
            </div>
          </div>
        )}
      </div>

      {/* --- Dialogs --- */}

      {/* 1. Zoom-in View (日次詳細) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-blue-600 text-white flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 opacity-80" />
              <DialogTitle className="text-xl font-bold tracking-tight">{selectedDate}</DialogTitle>
            </div>
            <Badge variant="outline" className="text-white border-white/30 bg-white/10 font-mono">
              {selectedDayEvents.length} Events
            </Badge>
          </DialogHeader>

          <div className="p-6 bg-card">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl border bg-muted/30 flex items-start gap-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        'mt-1.5 h-2.5 w-2.5 rounded-full shrink-0',
                        e._isSystem ? 'bg-blue-500' : 'bg-purple-500',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">
                        {e._isSystem ? 'Market System' : `Shared by: ${e.user || 'Unknown'}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 flex flex-col items-center gap-2">
                  <Info className="h-8 w-8 opacity-10" />
                  <p className="text-xs text-muted-foreground italic">No events scheduled for this day.</p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 pt-4 border-t flex justify-end">
              <Button
                size="sm"
                className="gap-2 rounded-full px-6"
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsAddOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Event
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. New Event Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>New Team Event</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Date</Label>
              <Input value={selectedDate} disabled className="bg-muted font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Title</Label>
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Ex: Team Lunch, Earnings Call..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={!newTitle.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .sx-react-calendar-wrapper,
        .sx-react-calendar-wrapper > div {
          height: 100% !important;
          width: 100% !important;
        }
        .sx__calendar {
          height: 100% !important;
          border: none !important;
          background-color: transparent !important;
        }
        /* ダークモード時のカレンダー境界線と文字色の微調整 */
        .dark .sx__calendar {
          --sx-color-background: transparent;
          --sx-color-on-background: #f8fafc;
          --sx-color-surface: #0f172a;
          --sx-color-on-surface: #f1f5f9;
          --sx-color-primary: #3b82f6;
          --sx-color-border: #1e293b;
          --sx-color-neutral-variant: #1e293b;
        }
        .sx__month-grid-day.sx__today {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        .sx__event {
          border-radius: 4px !important;
          font-size: 0.7rem !important;
          padding: 2px 4px !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
