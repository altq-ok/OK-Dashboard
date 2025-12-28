import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LayoutNode, WidgetType } from '@/types/dashboard';

interface DashboardState {
  layouts: Record<string, LayoutNode>;
  activeWidgets: (WidgetType | null)[];
  saveLayout: (templateId: string, data: LayoutNode) => void;
  resetLayout: (templateId: string) => void;
  setWidget: (index: number, type: WidgetType | null) => void;
  syncWidgetsCount: (count: number) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: {},
      activeWidgets: [],

      saveLayout: (id, data) =>
        set((state) => ({
          layouts: { ...state.layouts, [id]: data },
        })),

      resetLayout: (id) =>
        set((state) => {
          const newLayouts = { ...state.layouts };
          delete newLayouts[id]; // Reset custom layout
          return { layouts: newLayouts };
        }),

      setWidget: (index, type) =>
        set((state) => {
          const newWidgets = [...state.activeWidgets];
          newWidgets[index] = type;
          return { activeWidgets: newWidgets };
        }),

      syncWidgetsCount: (count) =>
        set((state) => {
          const current = [...state.activeWidgets];
          const synced = current.slice(0, count);
          while (synced.length < count) synced.push(null);
          return { activeWidgets: synced };
        }),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
