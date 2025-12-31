import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DashboardNavigationMenu } from '@/components/dashboard/navigation-menu';
import { ToggleThemeButton } from '@/components/dashboard/toggle-theme';
import { LayoutResetButton, LayoutPicker } from '@/components/dashboard/layout-picker';
import { DataControlCenter } from '@/components/dashboard/data-control-center';
import { GlobalTaskMonitor } from '@/components/dashboard/global-task-monitor';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Left: sidebar toggle and Dashboard title */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-bold tracking-tight">OK-Dashboard</h1>
      </div>

      {/* Centre: navigation menu */}
      <div className="flex-1 flex justify-center">
        <DashboardNavigationMenu />
      </div>

      {/* Right: Controls, Tasks, and Settings */}
      <div className="flex items-center gap-3">
        {/* Run task and select snapshots */}
        <DataControlCenter />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Team task monitoring */}
        <GlobalTaskMonitor />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-3">
          <LayoutResetButton />
          <LayoutPicker />
          <ToggleThemeButton />
        </div>
      </div>
    </header>
  );
}
