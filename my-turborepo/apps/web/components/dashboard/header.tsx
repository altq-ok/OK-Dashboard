import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DashboardNavigationMenu } from '@/components/dashboard/navigation_menu';
import { ToggleThemeButton } from '@/components/dashboard/toggle-theme';

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur">
      {/* Left: sidebar toggle and some fancy stuff*/}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-medium">Dashboard</h1>
      </div>

      {/* Centre: navigation menu */}
      <div className="flex-1 flex justify-center">
        <DashboardNavigationMenu />
      </div>

      {/* Right: toggle theme and other settings */}
      <div className="flex items-center gap-4">
        <ToggleThemeButton />
      </div>
    </header>
  );
}
