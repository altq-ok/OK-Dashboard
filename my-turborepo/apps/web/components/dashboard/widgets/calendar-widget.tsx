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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Plus, Info, Trash2, Edit2, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserEvent } from '@/types/task';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import '@schedule-x/theme-shadcn/dist/index.css';

// Set colors for different catgegories
const CATEGORIES = [
  {
    id: 'earnings',
    label: 'Earnings',
    lightColors: { main: '#3b82f6', container: '#dbeafe', onContainer: '#1e40af' },
    darkColors: { main: '#60a5fa', container: '#1e3a8a', onContainer: '#dbeafe' },
  },
  {
    id: 'macro',
    label: 'Macro',
    lightColors: { main: '#f59e0b', container: '#fef3c7', onContainer: '#92400e' },
    darkColors: { main: '#fbbf24', container: '#78350f', onContainer: '#fef3c7' },
  },
  {
    id: 'meeting',
    label: 'Meeting',
    lightColors: { main: '#a855f7', container: '#f3e8ff', onContainer: '#6b21a8' },
    darkColors: { main: '#c084fc', container: '#4c1d95', onContainer: '#f3e8ff' },
  },
  {
    id: 'holiday',
    label: 'Holiday',
    lightColors: { main: '#10b981', container: '#dcfce7', onContainer: '#166534' },
    darkColors: { main: '#34d399', container: '#064e3b', onContainer: '#dcfce7' },
  },
  {
    id: 'error',
    label: 'Data Error',
    lightColors: { main: '#ef4444', container: '#fee2e2', onContainer: '#991b1b' },
    darkColors: { main: '#f87171', container: '#7f1d1d', onContainer: '#fee2e2' },
  },
  {
    id: 'other',
    label: 'Other',
    lightColors: { main: '#64748b', container: '#f1f5f9', onContainer: '#334155' },
    darkColors: { main: '#94a3b8', container: '#1e293b', onContainer: '#f1f5f9' },
  },
] as const;

function parseToTemporalWithValidation(dateStr: string | undefined | null, timeStr?: string | null) {
  const today = new Date().toISOString().split('T')[0];
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const d = (dateStr || '').substring(0, 10);
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(d);
  try {
    if (!isValidDate) throw new Error('Invalid Date');
    // Normalize time - allow HH:mm only
    let t = timeStr?.trim() || '';
    const hasTime = /^([01]\d|2[0-3]):[0-5]\d/.test(t);
    if (hasTime) {
      const cleanTime = t.substring(0, 5); // "HH:mm"
      return { value: Temporal.ZonedDateTime.from(`${d}T${cleanTime}:00[${tz}]`), isError: false };
    } else {
      return { value: Temporal.PlainDate.from(d), isError: false };
    }
  } catch (e) {
    // On exception, returns today with an error flag
    return { value: Temporal.PlainDate.from(today), isError: true };
  }
}

export function CalendarWidget({ targetId }: WidgetProps) {
  const queryClient = useQueryClient();
  const { versions } = useDashboardParams();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { resolvedTheme } = useTheme();

  // UI states
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');

  // Initialize event service to set events to calendar
  const [eventsService] = useState(() => createEventsServicePlugin());

  // Fetch data
  const { result: rawSystemEvents } = useSnapshot('ALL', 'calendar_events', versions.calendar_events);
  const { data: rawUserEvents = [] } = useQuery<UserEvent[]>({
    queryKey: ['user-events'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/data/user-events');
      return res.ok ? res.json() : [];
    },
  });

  // Process data and combine system and user events
  const combinedEvents = useMemo(() => {
    const mapEvent = (e: any, isSystem: boolean, index: number) => {
      const startRes = parseToTemporalWithValidation(e.start, e.start_time);
      // fallback to start when end is missing
      const endRes = parseToTemporalWithValidation(e.end || e.start, e.end_time || e.start_time);
      const isError = startRes.isError || endRes.isError;
      const catId = isError ? 'error' : e.category || (isSystem ? 'earnings' : 'other');
      return {
        ...e, // description, category etc.
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
  }, [rawSystemEvents, rawUserEvents, today]);

  // Initialize calendar app
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid()],
    events: combinedEvents,
    plugins: [eventsService, createEventModalPlugin()],
    isDark: resolvedTheme === 'dark',
    locale: 'en-US',
    defaultView: 'month-grid',
    theme: 'shadcn',
    // Set color for each category
    calendars: CATEGORIES.reduce(
      (acc, cat) => ({
        ...acc,
        [cat.id]: {
          colorName: cat.id,
          lightColors: cat.lightColors,
          darkColors: cat.darkColors,
        },
      }),
      {},
    ),
    callbacks: {
      onClickDate(date) {
        setSelectedDate(String(date).substring(0, 10));
        setIsDetailOpen(true);
      },
    },
  });

  // Sync asynchronous data and display events
  useEffect(() => {
    if (calendar && eventsService) {
      eventsService.set(combinedEvents);
    }
  }, [combinedEvents, calendar, eventsService]);

  // Mutation logics
  // Save
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

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`http://localhost:8000/data/user-events/${eventId}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
      setIsDetailOpen(false);
      toast.success('Event deleted');
    },
  });

  const handleEditInit = (e: any) => {
    setEditingId(e.event_id);
    setNewTitle(e.title);
    setStartTime(e.start_time || '09:00');
    setEndTime(e.end_time || '10:00');
    setDescription(e.description || '');
    setCategory(e.category || 'other');
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  const handleAddNewInit = () => {
    setEditingId(null);
    setNewTitle('');
    setDescription('');
    setCategory('other');
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  // Get event list for selected date
  const selectedDayEvents = useMemo(() => {
    return combinedEvents.filter((e) => {
      // Convert Temporal object to string before comparison
      return e.start.toString().startsWith(selectedDate);
    });
  }, [combinedEvents, selectedDate]);

  return (
    <div className="h-full w-full p-1 bg-background relative flex flex-col overflow-hidden">
      <div
        key={resolvedTheme}
        className="flex-1 rounded-xl border overflow-hidden relative shadow-inner sx-react-calendar-wrapper"
      >
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      {/* --- Detail View --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[450px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 bg-secondary text-secondary-foreground relative flex justify-between items-center">
            <div className="flex items-center gap-2 font-mono">
              <CalendarIcon className="h-5 w-5 opacity-80" />
              <DialogTitle className="text-xl font-bold tracking-tight">{selectedDate}</DialogTitle>
            </div>
            <div className="flex items-center gap-4 mr-8">
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold">
                {selectedDayEvents.length} Events
              </Badge>
            </div>
          </div>

          <ScrollArea className="max-h-[50vh] p-6 bg-card">
            <div className="space-y-3 pr-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((e) => {
                  const displayTime = e.start.toString().includes('T')
                    ? e.start.toString().split('T')[1].substring(0, 5)
                    : 'All Day';
                  const catColor = CATEGORIES.find((c) => c.id === e.calendarId)?.lightColors.main;

                  return (
                    <div
                      key={e.id}
                      className={cn(
                        'p-4 rounded-xl border flex flex-col gap-2 transition-all hover:shadow-md',
                        e._isError ? 'bg-red-500/5 border-red-500/30' : 'bg-muted/30 border-muted',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn('h-2.5 w-2.5 rounded-full', e._isError && 'bg-red-500 animate-pulse')}
                            style={!e._isError ? { backgroundColor: catColor } : {}}
                          />
                          <span
                            className={cn(
                              'text-sm font-bThis is test descriptionold leading-tight',
                              e._isError && 'text-red-600',
                            )}
                          >
                            {e.title}
                          </span>
                        </div>
                        {!e._isSystem && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditInit(e)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500"
                              onClick={() => deleteMutation.mutate(e.event_id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        <Badge variant="secondary" className="text-[9px] uppercase font-black tabular-nums">
                          {displayTime}
                        </Badge>
                      </div>
                      {e.description && (
                        <p className="text-xs text-muted-foreground pl-4.5 border-l-2 ml-1 leading-relaxed">
                          {e.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1 pl-1">
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                          <User className="h-3 w-3" /> {e._isSystem ? 'Market System' : e.user}
                        </div>
                        {e._isError && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-2 opacity-20 text-muted-foreground">
                  <Info className="h-10 w-10" />
                  <p className="text-sm italic font-medium">No events for this date.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button
              size="sm"
              className="gap-2 rounded-full px-6 shadow-lg shadow-blue-500/20"
              onClick={handleAddNewInit}
            >
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Add/Edit Dialog --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold opacity-60">Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold opacity-60">End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black opacity-60">Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black opacity-60">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs uppercase font-bold">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black opacity-60">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-20 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 px-8 font-bold"
              onClick={() =>
                saveMutation.mutate({
                  event_id: editingId || crypto.randomUUID(),
                  title: newTitle,
                  start: selectedDate,
                  start_time: startTime,
                  end: selectedDate,
                  end_time: endTime,
                  category,
                  description,
                  user: 'UserA',
                })
              }
              disabled={!newTitle.trim() || saveMutation.isPending}
            >
              Save
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
          background: transparent !important;
        }
        /* ★ theme-shadcn が自動で変数を扱うため、最小限の調整のみ */
        .dark .sx__calendar {
          --sx-color-background: transparent;
        }
      `}</style>
    </div>
  );
}
