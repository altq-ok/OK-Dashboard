import { ComponentType } from 'react';
import { Home, BarChart3, Calendar, ShieldCheck, Settings, LucideIcon } from 'lucide-react';
import { AnalyticsWidget } from '@/components/dashboard/widgets/analytics-widget';
import { HomeWidget } from '@/components/dashboard/widgets/home-widget';
import { CalendarWidget } from '@/components/dashboard/widgets/calendar-widget';
import { WidgetType } from '@/types/dashboard';

export const WIDGET_TASK_MAP = {
  home: 'summary',
  analytics: 'pricing',
  userList: 'event',
  logs: 'guideline',
} as const;

export interface WidgetProps {
  data: any;
  status: any;
  targetId: string;
}

interface WidgetConfig {
  component: ComponentType<WidgetProps>;
  label: string;
  icon: LucideIcon;
  disableOpacityOnUpdate?: boolean;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  home: {
    component: HomeWidget,
    label: 'Home',
    icon: Home,
    disableOpacityOnUpdate: true,
  },
  analytics: {
    component: AnalyticsWidget,
    label: 'Analytics',
    icon: BarChart3,
  },
  userList: {
    component: CalendarWidget,
    label: 'Calendar',
    icon: Calendar,
  },
  logs: {
    component: () => '<div className="p-4 text-muted-foreground">Validation Logs coming soon...</div>',
    label: 'Validation',
    icon: ShieldCheck,
  },
  settings: {
    component: () => '<div className="p-4 text-muted-foreground">Settings Panel coming soon...</div>',
    label: 'Settings',
    icon: Settings,
  },
};
