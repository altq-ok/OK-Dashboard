'use client';

import 'temporal-polyfill/global';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserEvent } from '@/types/task';
import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { CATEGORIES } from '@/components/dashboard/widgets/calendar-constants';

function parseToTemporalWithValidation(
  dateStr: string | undefined | null,
  timeStr?: string | null,
  timezone?: string | null,
) {
  const today = new Date().toISOString().split('T')[0];
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const d = (dateStr || '').substring(0, 10);
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(d);
  try {
    if (!isValidDate) throw new Error('Invalid Date');
    const t = timeStr?.trim() || '';
    const hasTime = /^([01]\d|2[0-3]):[0-5]\d/.test(t);
    if (hasTime) {
      const cleanTime = t.substring(0, 5);
      const dateTimeString = `${d}T${cleanTime}:00[${tz}]`;
      return { value: Temporal.ZonedDateTime.from(dateTimeString), isError: false };
    } else {
      return { value: Temporal.PlainDate.from(d), isError: false };
    }
  } catch (e) {
    return { value: Temporal.PlainDate.from(today), isError: true };
  }
}

export function useCalendarLogic() {
  const queryClient = useQueryClient();
  const { versions } = useDashboardParams();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // UI States
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [start, setStart] = useState(selectedDate);
  const [end, setEnd] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timezone, setTimezone] = useState(userTimezone);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');

  // Fetch data
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

  // Combine system and user events
  const combinedEvents = useMemo(() => {
    const mapEvent = (e: any, isSystem: boolean, index: number) => {
      const startRes = parseToTemporalWithValidation(e.start, e.start_time, e.timezone);
      const endRes = parseToTemporalWithValidation(e.end || e.start, e.end_time || e.start_time, e.timezone);
      const isError = startRes.isError || endRes.isError;
      const isValidCategory = CATEGORIES.some((c) => c.id === e.category);
      const catId = isError ? 'error' : isValidCategory ? e.category : 'other';
      return {
        ...e,
        id: isSystem ? `sys-${e.event_id || index}` : String(e.event_id),
        title: isError ? `[!] ERROR: ${e.title}` : e.title,
        start: startRes.value,
        end: isError ? startRes.value : endRes.value,
        calendarId: catId,
        _isSystem: isSystem,
        _isError: isError,
      };
    };
    return [
      ...(rawSystemEvents || []).map((e: any, i: number) => mapEvent(e, true, i)),
      ...(rawUserEvents || []).map((e: any, i: number) => mapEvent(e, false, i)),
    ];
  }, [rawSystemEvents, rawUserEvents]);

  // Mutation functions
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
      toast.success('Event saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`http://localhost:8000/data/user-events/${eventId}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
      toast.success('Event deleted');
    },
  });

  // Handlers on click
  const handleEditInit = (e: any) => {
    setEditingId(e.event_id);
    setNewTitle(e.title);
    setStart(e.start.toPlainDate().toString() || '');
    setEnd(e.end.toPlainDate().toString() || '');
    setStartTime(e.start_time || '09:00');
    setEndTime(e.end_time || '10:00');
    setTimezone(e.timezone || userTimezone);
    setDescription(e.description || '');
    setCategory(e.category || 'other');
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  const handleAddNewInit = () => {
    setEditingId(null);
    setNewTitle('');
    setStart(selectedDate);
    setEnd(selectedDate);
    setStartTime('09:00');
    setEndTime('10:00');
    setTimezone(userTimezone);
    setDescription('');
    setCategory('other');
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      event_id: editingId || crypto.randomUUID(),
      title: newTitle,
      start: start,
      start_time: startTime,
      end: end,
      end_time: endTime,
      timezone: timezone,
      category,
      description,
      user: 'UserA', // TODO
    });
  };

  // Check if selected date is within the event date range (start <= date <= end)
  const selectedDayEvents = useMemo(() => {
    return combinedEvents.filter((e) => {
      const selectedDay = selectedDate.split('T')[0];
      const eventStartDay = String(e.start).split('T')[0];
      const eventEndDay = String(e.end).split('T')[0];
      return selectedDay >= eventStartDay && selectedDay <= eventEndDay;
    });
  }, [combinedEvents, selectedDate]);

  return {
    // Data
    combinedEvents,
    selectedDayEvents,
    isLoading: isSysLoading || isUserLoading,
    // UI State
    ui: {
      selectedDate,
      setSelectedDate,
      isDetailOpen,
      setIsDetailOpen,
      isAddOpen,
      setIsAddOpen,
      editingId,
    },
    // Form State & Actions
    form: {
      values: { title: newTitle, start, end, startTime, endTime, timezone, description, category },
      setters: { setNewTitle, setStart, setEnd, setStartTime, setEndTime, setTimezone, setDescription, setCategory },
      handleEditInit,
      handleAddNewInit,
      handleSave,
    },
    // CRUD
    deleteEvent: (id: string) => deleteMutation.mutate(id),
    isSaving: saveMutation.isPending,
  };
}
