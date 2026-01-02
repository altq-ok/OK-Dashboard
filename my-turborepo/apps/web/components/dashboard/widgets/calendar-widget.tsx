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
import { Calendar as CalendarIcon, Plus, Info, Clock, User, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserEvent } from '@/types/task';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import '@schedule-x/theme-default/dist/index.css';

// To set different colors for different categories
const CATEGORIES = [
  { id: 'earnings', label: 'Earnings', color: '#3b82f6' },
  { id: 'macro', label: 'Macro', color: '#f59e0b' },
  { id: 'meeting', label: 'Meeting', color: '#a855f7' },
  { id: 'holiday', label: 'Holiday', color: '#10b981' },
  { id: 'other', label: 'Other', color: '#64748b' },
  { id: 'error', label: 'Data Error', color: '#ef4444' },
];

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
  const { resolvedTheme } = useTheme();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // UI states
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Generated from states
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
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
      const finalStart = startRes.value;
      const finalEnd = isError ? startRes.value : endRes.value;
      return {
        ...e, // description, category etc.
        id: isSystem ? `sys-${e.event_id || index}` : String(e.event_id),
        title: isError ? `[!] ERROR: ${e.title}` : e.title,
        start: finalStart,
        end: finalEnd,
        _isSystem: isSystem,
        _isError: isError,
        backgroundColor: isError
          ? '#ef4444'
          : isSystem
            ? '#3b82f6'
            : CATEGORIES.find((c) => c.id === e.category)?.color || '#a855f7',
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

  // Mutation logic to save user events
  const saveMutation = useMutation({
    mutationFn: async (newEvent: any) => {
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
      setDescription('');
      toast.success('Event saved');
    },
  });

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
        key={`cal-${resolvedTheme}-${combinedEvents.length}`}
        className="flex-1 rounded-xl border overflow-hidden relative shadow-inner sx-react-calendar-wrapper"
        style={{ height: '100%' }}
      >
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
      {/* --- Detail View --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[450px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 bg-blue-600 text-white relative flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 opacity-80" />
              <DialogTitle className="text-xl font-bold tracking-tight">{selectedDate}</DialogTitle>
            </div>
            <div className="flex items-center gap-4 mr-4">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                {selectedDayEvents.length} Events
              </Badge>
            </div>
          </div>

          <ScrollArea className="max-h-[60vh] p-6 bg-card">
            <div className="space-y-4 pr-3 text-card-foreground">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((e) => {
                  const isoStr = e.start.toString(); // "2026-01-15" or "2026-01-15T09:00:00+09:00..."
                  const displayTime = isoStr.includes('T') ? isoStr.split('T')[1].substring(0, 5) : 'All Day';
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
                            className={cn('h-2.5 w-2.5 rounded-full', e._isError ? 'bg-red-500 animate-pulse' : '')}
                            style={!e._isError ? { backgroundColor: e.backgroundColor } : {}}
                          />
                          <span className={cn('text-sm font-bold leading-tight', e._isError && 'text-red-600')}>
                            {e.title}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase font-bold tracking-tighter tabular-nums"
                        >
                          {displayTime}
                        </Badge>
                      </div>
                      {e.description && (
                        <p className="text-xs text-muted-foreground pl-4.5 border-l-2 border-muted ml-1 leading-relaxed">
                          {e.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1 pl-1">
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                          <User className="h-3 w-3" /> {e._isSystem ? 'System' : e.user}
                        </div>
                        {e._isError && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-2 opacity-20">
                  <Info className="h-10 w-10" />
                  <p className="text-sm italic font-medium tracking-tight">No data for this date.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button
              size="sm"
              className="gap-2 rounded-full px-6 shadow-lg shadow-blue-500/20"
              onClick={() => {
                setIsDetailOpen(false);
                setIsAddOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Add Dialog --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black opacity-60">Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-40" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="font-mono h-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black opacity-60">End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-mono h-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60">Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's happening?" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-bold uppercase">{c.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-20 text-xs"
                placeholder="Optional notes..."
              />
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
                  event_id: crypto.randomUUID(),
                  title: newTitle,
                  start: selectedDate,
                  start_time: startTime,
                  end: selectedDate,
                  end_time: endTime,
                  category: category,
                  description: description,
                  user: 'UserA',
                })
              }
              disabled={!newTitle.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Syncing...' : 'Save Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .sx-react-calendar-wrapper,
        .sx__calendar {
          height: 100% !important;
          border: none !important;
          background: transparent !important;
        }
        .dark .sx__calendar {
          --sx-color-background: transparent;
          --sx-color-on-background: #f8fafc;
          --sx-color-surface: #0f172a;
          --sx-color-on-surface: #f1f5f9;
          --sx-color-primary: #3b82f6;
          --sx-color-border: #1e293b;
          --sx-color-neutral-variant: #1e293b;
        }
        .sx__event {
          border-radius: 4px !important;
          font-size: 0.7rem !important;
          font-weight: 800 !important;
        }
        .sx__event-modal {
          background-color: var(--sx-color-surface) !important;
          border-radius: 12px !important;
          border: 1px solid var(--sx-color-border) !important;
          color: var(--sx-color-on-surface) !important;
        }
      `}</style>
    </div>
  );
}
