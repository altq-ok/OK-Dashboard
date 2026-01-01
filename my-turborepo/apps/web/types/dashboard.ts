// Available widget types
export type WidgetType = 'home' | 'analytics' | 'calendar' | 'logs' | 'settings';

// Structure of layout
// Dispaly if type = widget; Run another search step if type = group
export type LayoutNode = {
  id: string;
  type: 'group' | 'widget';
  direction?: 'horizontal' | 'vertical';
  widgets?: LayoutNode[];
  slotIndex?: number;
  defaultSize?: number; // default size in %
};
