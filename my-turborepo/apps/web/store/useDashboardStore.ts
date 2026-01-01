import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LayoutNode, WidgetType } from '@/types/dashboard';
import { DASHBOARD_TEMPLATES } from '@/lib/layout-templates';

interface DashboardState {
  layouts: Record<string, LayoutNode>;
  lastLayoutId: string | null;
  activeWidgets: (WidgetType | null)[];
  updateLayoutSize: (templateId: string, groupId: string, sizes: Record<string, number>) => void;
  resetLayout: (templateId: string) => void;
  setWidget: (index: number, type: WidgetType | null) => void;
  syncWidgetsCount: (count: number) => void;
  setLastLayoutId: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: {},
      activeWidgets: [],
      lastLayoutId: null,

      updateLayoutSize: (templateId, groupId, sizes) =>
        set((state) => {
          // Get current layout tree (or from template if missing)
          const currentRoot = state.layouts[templateId] || DASHBOARD_TEMPLATES[templateId];

          if (!currentRoot) return state;

          // Search tree recursively and update size with matched groupId
          const updateRecursive = (node: LayoutNode): LayoutNode => {
            if (node.id === groupId && node.widgets) {
              return {
                ...node,
                widgets: node.widgets.map((w) => ({
                  ...w,
                  defaultSize: sizes[w.id] ?? w.defaultSize,
                })),
              };
            }
            if (node.widgets) {
              return { ...node, widgets: node.widgets.map(updateRecursive) };
            }
            return node;
          };

          const newRoot = updateRecursive(currentRoot);

          return {
            layouts: { ...state.layouts, [templateId]: newRoot },
          };
        }),

      resetLayout: (id) =>
        set((state) => {
          const newLayouts = { ...state.layouts };
          delete newLayouts[id];
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
          if (current.length >= count) return state;
          const synced = current.slice(0, count);
          while (synced.length < count) synced.push(null);
          return { activeWidgets: synced };
        }),

      setLastLayoutId: (id) => set({ lastLayoutId: id }),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
