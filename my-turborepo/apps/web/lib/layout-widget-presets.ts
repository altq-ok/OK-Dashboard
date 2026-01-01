import { WidgetType } from '@/types/dashboard';

export type DashboardPreset = {
  id: string;
  title: string;
  description: string;
  layoutId: string;
  widgets: (WidgetType | null)[];
  targetId: string;
};

export const DASHBOARD_PRESETS: DashboardPreset[] = [
  {
    id: 'home',
    title: 'Home',
    description: 'Overview of global markets, system health, and team activity.',
    layoutId: 'single',
    widgets: ['home'],
    targetId: 'ALL',
  },
  {
    id: 'risk-monitor',
    title: 'Risk & Analytics',
    description: 'Deep dive into fund pricing and risk factors side-by-side.',
    layoutId: 'split-v',
    widgets: ['analytics', 'logs'],
    targetId: 'AAPL',
  },
  {
    id: 'month-view',
    title: 'Event Calendar',
    description: 'Month view of events using Schedule-X.',
    layoutId: 'single',
    widgets: ['calendar'],
    targetId: 'ALL',
  },
  {
    id: 'compliance',
    title: 'Compliance Dashboard',
    description: 'Monitor guideline violations and upcoming corporate events.',
    layoutId: 'split-h',
    widgets: ['logs', 'calendar'],
    targetId: 'ALL',
  },
];
