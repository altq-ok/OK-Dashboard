'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewMonthGrid,
  createViewDay,
  createViewWeek,
  createViewList,
  viewMonthGrid,
} from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { WidgetProps } from '@/lib/widget-registry';
import { useTheme } from 'next-themes';
import { useCalendarLogic } from '@/hooks/use-calendar-logic';
import { CATEGORIES } from './calendar-constants';
import { EventDetailDialog } from './event-detail-dialog';
import { EventFormDialog } from './event-form-dialog';
import { LoadingWidget } from './loading-widget';

import '@schedule-x/theme-shadcn/dist/index.css';

export function CalendarWidget({ targetId }: WidgetProps) {
  const { resolvedTheme } = useTheme();
  const { combinedEvents, selectedDayEvents, isLoading, ui, form, deleteEvent, isSaving } = useCalendarLogic();
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const [eventsService] = useState(() => createEventsServicePlugin());

  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay(), createViewList()],
    events: combinedEvents,
    plugins: [eventsService, createEventModalPlugin()],
    isDark: resolvedTheme === 'dark',
    locale: 'en-UK', // 'ja-JP'
    timezone: userTimezone as any, // 'Asia/Tokyo'
    defaultView: viewMonthGrid.name,
    theme: 'shadcn',
    calendars: CATEGORIES.reduce(
      (acc, cat) => ({
        ...acc,
        [cat.id]: { colorName: cat.id, lightColors: cat.lightColors, darkColors: cat.darkColors },
      }),
      {},
    ),
    callbacks: {
      onClickDate(date) {
        ui.setSelectedDate(String(date).substring(0, 10));
        ui.setIsDetailOpen(true);
      },
    },
    // view options
    weekOptions: {
      // nDays: 5, - uncomment if you want to show Mon-Fri only
    },
    isResponsive: false, // true will dynamically switch view with window size
  });

  // Data sync
  useEffect(() => {
    if (calendar && eventsService) {
      eventsService.set(combinedEvents);
    }
  }, [combinedEvents, calendar, eventsService]);

  // Toggle theme
  useEffect(() => {
    if (calendar && calendar.setTheme) {
      calendar.setTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
    }
  }, [resolvedTheme, calendar]);

  if (isLoading) {
    return <LoadingWidget message="LOADING..." />;
  }
  return (
    <div className="h-full w-full p-1 relative flex flex-col overflow-hidden bg-transparent">
      <style jsx global>
        {`
          .sx-react-calendar-wrapper,
          .sx__calendar {
            height: 100% !important;
            border: none !important;
          }
          .dark .sx-react-calendar-wrapper,
          .dark .sx__calendar {
            background: transparent !important;
          }
        `}
      </style>
      <div
        key={resolvedTheme}
        className="flex-1 rounded-xl border overflow-hidden relative shadow-inner sx-react-calendar-wrapper"
      >
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      <EventDetailDialog
        isOpen={ui.isDetailOpen}
        onOpenChange={ui.setIsDetailOpen}
        selectedDate={ui.selectedDate}
        events={selectedDayEvents}
        onEdit={form.handleEditInit}
        onDelete={deleteEvent}
        onAdd={form.handleAddNewInit}
      />

      <EventFormDialog
        isOpen={ui.isAddOpen}
        onOpenChange={ui.setIsAddOpen}
        editingId={ui.editingId}
        selectedDate={ui.selectedDate}
        values={form.values}
        onChange={(field, val) => {
          if (field === 'title') form.setters.setNewTitle(val);
          if (field === 'start') form.setters.setStart(val);
          if (field === 'end') form.setters.setEnd(val);
          if (field === 'startTime') form.setters.setStartTime(val);
          if (field === 'endTime') form.setters.setEndTime(val);
          if (field === 'timezone') form.setters.setTimezone(val);
          if (field === 'description') form.setters.setDescription(val);
          if (field === 'category') form.setters.setCategory(val);
        }}
        onSave={form.handleSave}
        isPending={isSaving}
      />
    </div>
  );
}
