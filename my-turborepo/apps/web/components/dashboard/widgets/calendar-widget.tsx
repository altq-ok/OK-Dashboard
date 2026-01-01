'use client';

import { useMemo, useEffect } from 'react';
import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { WidgetProps } from '@/lib/widget-registry';
import '@schedule-x/theme-default/dist/index.css';

export function CalendarWidget({ targetId }: WidgetProps) {
  const { versions } = useDashboardParams();

  // 1. システムイベントの取得 (DataType = 'calendar_events')
  // カレンダーは全体俯瞰のため targetId は 'ALL' を優先的に使う設計にします
  const { data: rawEvents, isLoading } = useSnapshot('ALL', 'calendar_events', versions.calendar_events);

  // 2. Parquetのデータを Schedule-X の型に変換
  const events = useMemo(() => {
    if (!rawEvents) return [];

    return rawEvents.map((e: any, index: number) => ({
      id: e.id || `sys-${index}`,
      title: e.title || 'Untitled Event',
      start: e.start_date, // 'YYYY-MM-DD' 形式を期待
      end: e.end_date || e.start_date,
      description: e.description || '',
      // 金融イベントっぽく色を分けるためのカスタム属性
      _category: e.category,
    }));
  }, [rawEvents]);

  // 3. カレンダーインスタンスの作成
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid()],
    events: events,
    plugins: [createEventModalPlugin()],
    config: {
      theme: 'light', // 後でダークモード対応します
      locale: 'en-US',
      defaultView: 'month-grid',
    },
  });

  // イベントが更新されたらカレンダーに反映させる
  useEffect(() => {
    if (events.length > 0) {
      calendar.events.set(events);
    }
  }, [events, calendar]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground animate-pulse text-xs font-bold tracking-widest">
        FETCHING GLOBAL EVENTS...
      </div>
    );
  }

  return (
    <div className="h-full w-full p-1 flex flex-col bg-background">
      <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-inner relative">
        <ScheduleXCalendar calendarApp={calendar} />

        {/* ダークモード用のスタイル調整（後で詳細を詰めますが一旦これだけで綺麗になります） */}
        <style jsx global>{`
          .sx__calendar {
            border: none !important;
            height: 100% !important;
          }
          .dark .sx__calendar {
            --sx-color-background: transparent;
            --sx-color-on-background: #e2e8f0;
            --sx-color-surface: #0f172a;
            --sx-color-on-surface: #f1f5f9;
            --sx-color-primary: #3b82f6;
            --sx-color-border: #1e293b;
          }
        `}</style>
      </div>
    </div>
  );
}
