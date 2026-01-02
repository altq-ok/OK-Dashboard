'use client';

import { useEffect, useState } from 'react';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid, createViewDay, createViewWeek, createViewList } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { WidgetProps } from '@/lib/widget-registry';
import { useTheme } from 'next-themes';
import { useCalendarLogic } from '@/hooks/use-calendar-logic';
import { CATEGORIES } from './calendar-constants';
import { EventDetailDialog } from './event-detail-dialog';
import { EventFormDialog } from './event-form-dialog';

import '@schedule-x/theme-shadcn/dist/index.css';

export function CalendarWidget({ targetId }: WidgetProps) {
  const { resolvedTheme } = useTheme();
  const { combinedEvents, selectedDayEvents, isLoading, ui, form, deleteEvent, isSaving } = useCalendarLogic();

  const [eventsService] = useState(() => createEventsServicePlugin());

  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay(), createViewList()],
    events: combinedEvents,
    plugins: [eventsService, createEventModalPlugin()],
    isDark: resolvedTheme === 'dark',
    locale: 'en-US',
    defaultView: 'month-grid',
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
    return <div className="h-full w-full flex items-center justify-center animate-pulse text-xs">Loading...</div>;
  }
  return (
    <div className="h-full w-full p-1 bg-background relative flex flex-col overflow-hidden">
      <style jsx global>
        {`
          .sx-react-calendar-wrapper,
          .sx__calendar {
            height: 100%;
            width: 100%;
            border: none;
            background-color: transparent !important;
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
          if (field === 'startTime') form.setters.setStartTime(val);
          if (field === 'endTime') form.setters.setEndTime(val);
          if (field === 'description') form.setters.setDescription(val);
          if (field === 'category') form.setters.setCategory(val);
        }}
        onSave={form.handleSave}
        isPending={isSaving}
      />
    </div>
  );
}
