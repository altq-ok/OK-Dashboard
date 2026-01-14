'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export interface DataPoint {
  date: string;
  price1: number | null;
  price2?: number | null;
  volume: number | null;
}

// Explicit colors to ensure visibility in both Light/Dark themes
const chartConfig = {
  price1: { label: 'Price A', color: '#2563eb' }, // Vivid Blue
  price2: { label: 'Price B', color: '#db2777' }, // Vivid Pink
  volume: { label: 'Volume', color: '#71717a' }, // Zinc Gray
} satisfies ChartConfig;

export function MultiSeriesChart({ data }: { data: any[] }) {
  const [range, setRange] = useState([0, data.length - 1]);
  const [startMonth, setStartMonth] = useState<Date>(parseISO(data[range[0]].date));
  const [endMonth, setEndMonth] = useState<Date>(parseISO(data[range[1]].date));

  const filteredData = useMemo(() => {
    return data.slice(range[0], range[1] + 1);
  }, [range, data]);

  const handleDateChange = (dateRange: DateRange | undefined) => {
    if (dateRange?.from && dateRange?.to) {
      const startIdx = data.findIndex((d) => new Date(d.date) >= dateRange.from!);
      const endIdx = data.findIndex((d) => new Date(d.date) >= dateRange.to!);
      setRange([startIdx === -1 ? 0 : startIdx, endIdx === -1 ? data.length - 1 : endIdx]);
    }
  };

  // Helper to find the nearest index in the data array for a selected calendar date
  const findIndexByDate = (date: Date) => {
    const target = startOfDay(date);
    const idx = data.findIndex((d) => {
      const dDate = startOfDay(parseISO(d.date));
      return dDate.getTime() === target.getTime() || isAfter(dDate, target);
    });
    return idx === -1 ? data.length - 1 : idx;
  };

  const updateStart = (date: Date | undefined) => {
    if (!date) return;
    let newStart = findIndexByDate(date);
    if (newStart >= range[1]) newStart = Math.max(0, range[1] - 1);
    setRange([newStart, range[1]]);
    setStartMonth(date); // Sync the calendar view
  };

  const updateEnd = (date: Date | undefined) => {
    if (!date) return;
    let newEnd = findIndexByDate(date);
    if (newEnd <= range[0]) newEnd = Math.min(data.length - 1, range[0] + 1);
    setRange([range[0], newEnd]);
    setEndMonth(date); // Sync the calendar view
  };

  return (
    <Card className="w-full border-none shadow-md">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-0 pb-8">
        {/* Left side: Title & status */}
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">Market Analysis</CardTitle>
          <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
            Real-time Data Stream
          </div>
        </div>

        {/* Right side: Unified toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset date ranges */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border">
            {[
              { label: '1W', d: 7 },
              { label: '1M', d: 30 },
              { label: 'ALL', d: -1 },
            ].map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-[11px] font-semibold hover:bg-background hover:shadow-sm"
                onClick={() => {
                  if (p.d === -1) setRange([0, data.length - 1]);
                  else setRange([Math.max(0, data.length - p.d), data.length - 1]);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Start and end date buttons */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border">
            {/* Start date calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-[11px] font-semibold font-mono hover:bg-background hover:shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-3 w-3 opacity-70" />
                  {format(parseISO(data[range[0]].date), 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  // Source of truth from your slider state
                  selected={parseISO(data[range[0]].date)}
                  onSelect={updateStart}
                  // Ensures it opens to the correct month when the popover opens
                  defaultMonth={parseISO(data[range[0]].date)}
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground px-1 text-[10px]">
              <ArrowRight className="h-3 w-3 opacity-50" />
            </span>

            {/* End date calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-[11px] font-semibold font-mono hover:bg-background hover:shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-3 w-3 opacity-70" />
                  {format(parseISO(data[range[1]].date), 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={parseISO(data[range[1]].date)}
                  onSelect={updateEnd}
                  defaultMonth={parseISO(data[range[1]].date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <div className="flex flex-col h-full gap-2">
            {/* Price chart (top) */}
            <div className="flex-[3]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} syncId="marketSync">
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" hide />
                  <YAxis
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    opacity={0.5}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="price1"
                    stroke={chartConfig.price1.color}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    animationDuration={300}
                  />
                  <Line
                    dataKey="price2"
                    stroke={chartConfig.price2.color}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Volume chart (bottom) */}
            <div className="flex-[1] border-t pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} syncId="marketSync">
                  <XAxis dataKey="date" hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Area
                    type="step" // <--- This restores the "square" volume look
                    dataKey="volume"
                    fill={chartConfig.volume.color}
                    fillOpacity={0.2}
                    stroke={chartConfig.volume.color}
                    strokeWidth={1}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Date range slider */}
            <div className="pt-6 pb-2 px-2">
              <Slider min={0} max={data.length - 1} step={1} value={range} onValueChange={setRange} className="my-4" />
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>START: {data[range[0]]?.date}</span>
                <span className="hidden sm:inline">DRAG TO ZOOM</span>
                <span>END: {data[range[1]]?.date}</span>
              </div>
            </div>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
