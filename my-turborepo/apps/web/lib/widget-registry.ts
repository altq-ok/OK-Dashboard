import { ComponentType } from 'react';
import { Home, BarChart3, Calendar, ShieldCheck, Settings, LucideIcon } from 'lucide-react';
import { AnalyticsWidget } from '@/components/dashboard/widgets/analytics-widget';
import { HomeWidget } from '@/components/dashboard/widgets/home-widget';
import { CalendarWidget } from '@/components/dashboard/widgets/calendar-widget';
import { TBIWidget } from '@/components/dashboard/widgets/to-be-implemented-widget';
import { WidgetType } from '@/types/dashboard';

// Supported tasks by the dashboard
export const SUPPORTED_TASKS = [
  { id: 'pricing', label: 'Pricing', icon: BarChart3 },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'guideline', label: 'Guideline', icon: ShieldCheck },
] as const;

export type TaskType = (typeof SUPPORTED_TASKS)[number]['id'];

// Supported data types by the dashboard
export const SUPPORTED_DATA_TYPES = [
  { id: 'prices', label: 'Pricing Data', icon: BarChart3 },
  { id: 'calendar_events', label: 'Events', icon: Calendar },
  { id: 'guidelines', label: 'Compliance', icon: ShieldCheck },
] as const;

export type DataType = (typeof SUPPORTED_DATA_TYPES)[number]['id'];

// For each widget to dispaly "Updating..." when a task is running
export const WIDGET_PRIMARY_TASK: Record<WidgetType, TaskType | 'summary' | 'none'> = {
  home: 'summary',
  analytics: 'pricing',
  userList: 'event',
  logs: 'guideline',
  settings: 'none',
} as const;

export interface WidgetProps {
  targetId: string;
}

interface WidgetConfig {
  component: ComponentType<WidgetProps>;
  label: string;
  icon: LucideIcon;
  disableOpacityOnUpdate?: boolean;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  home: { component: HomeWidget, label: 'Home', icon: Home, disableOpacityOnUpdate: true },
  analytics: { component: AnalyticsWidget, label: 'Analytics', icon: BarChart3 },
  userList: { component: CalendarWidget, label: 'Calendar', icon: Calendar },
  logs: { component: TBIWidget, label: 'Validation', icon: ShieldCheck },
  settings: { component: TBIWidget, label: 'Settings', icon: Settings },
};
