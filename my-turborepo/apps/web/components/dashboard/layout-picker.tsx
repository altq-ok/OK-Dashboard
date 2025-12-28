'use client';

import { useQueryState } from 'nuqs';
import {
  Layout,
  Columns2,
  Rows2,
  PanelTop,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Grid2x2,
  Check,
  Settings2,
  RotateCcw,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useDashboardStore } from '@/store/useDashboardStore';

// Label and icons for 8 patterns
const LAYOUT_OPTIONS = [
  { id: 'single', label: 'Single', icon: Layout },
  { id: 'split-h', label: '2 Columns (H)', icon: Columns2 },
  { id: 'split-v', label: '2 Rows (V)', icon: Rows2 },
  { id: 't-shape', label: 'Top Focus (3)', icon: PanelTop },
  { id: 'inv-t-shape', label: 'Bottom Focus (3)', icon: PanelBottom },
  { id: 'left-split', label: 'Left Focus (3)', icon: PanelLeft },
  { id: 'right-split', label: 'Right Focus (3)', icon: PanelRight },
  { id: 'grid-4', label: '4 Grid', icon: Grid2x2 },
];

export function LayoutResetButton() {
  const [layoutId] = useQueryState('layout', { defaultValue: 'single' });
  const resetLayout = useDashboardStore((state) => state.resetLayout);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => {
        if (confirm('Do you reset the current layout to default?')) {
          resetLayout(layoutId);
        }
      }}
      title="Reset Layout"
    >
      <RotateCcw className="h-4 w-4" />
      <span className="sr-only">Reset</span>
    </Button>
  );
}

export function LayoutPicker() {
  // Update ?layout=... in URL with nuqs; default is single
  const [layout, setLayout] = useQueryState('layout', {
    defaultValue: 'single',
    shallow: false, // Let server know about layout
  });

  // Get icon for the currently selected layout
  const ActiveIcon = LAYOUT_OPTIONS.find((opt) => opt.id === layout)?.icon || Layout;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-none hover:bg-accent focus-visible:ring-0"
          title="Change Layout"
        >
          <ActiveIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Change Layout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Dashboard Layout</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="grid grid-cols-1 gap-1">
          {LAYOUT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => setLayout(opt.id)}
              className={cn(
                'flex items-center gap-3 cursor-pointer py-2',
                layout === opt.id && 'bg-accent text-accent-foreground font-medium',
              )}
            >
              <opt.icon className={cn('h-4 w-4', layout === opt.id ? 'text-primary' : 'text-muted-foreground')} />
              <span className="flex-1">{opt.label}</span>
              {layout === opt.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
