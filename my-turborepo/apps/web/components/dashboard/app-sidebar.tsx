'use client';

import { Calendar, Home, Inbox, Search, Settings, LayoutGrid, RotateCcw, Target } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { WIDGET_REGISTRY } from '@/lib/widget-registry';
import { WidgetType } from '@/types/dashboard';

// 既存のメニュー
const navItems = [
  { title: 'Home', url: '#', icon: Home },
  { title: 'Inbox', url: '#', icon: Inbox },
  { title: 'Calendar', url: '#', icon: Calendar },
];

let targetId = 'TEST';
const setTargetId = (newTargetId: string) => {
  targetId = newTargetId;
};

export function AppSidebar() {
  return (
    <Sidebar>
      <TooltipProvider delayDuration={400}>
        <SidebarHeader className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-xl border border-primary/10 shadow-sm transition-all hover:bg-primary/10 group/card">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                  <Target className="h-2 w-2" /> Context
                </span>
                <span className="text-sm font-bold truncate text-foreground decoration-primary/30 underline-offset-4 group-hover/card:underline">
                  {targetId === 'ALL' ? 'Market Overview' : targetId}
                </span>
              </div>
              {targetId !== 'ALL' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-background hover:shadow-sm transition-all active:scale-95 group/btn"
                      onClick={() => setTargetId('ALL')}
                    >
                      <RotateCcw className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary transition-transform group-hover/btn:-rotate-45" />
                      <span className="sr-only">Reset to Global</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-md">
                    <p className="text-xs font-medium">Reset context to ALL</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </SidebarHeader>
      </TooltipProvider>

      <SidebarContent>
        {/* 1. 通常のナビゲーション */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. ウィジェット・パレット (ドラッグ＆ドロップ用) */}
        <SidebarGroup>
          <SidebarGroupLabel>Widget Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(WIDGET_REGISTRY).map(([key, config]) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    draggable
                    className="cursor-grab active:cursor-grabbing select-none" // select-none が重要
                    onDragStart={(e) => {
                      e.dataTransfer.setData('widgetType', key);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    // 終わった後に変な残像が残らないようにするだけ
                    onDragEnd={() => {}}
                  >
                    <config.icon className="h-4 w-4" />
                    <span>{config.label}</span>
                    <LayoutGrid className="ml-auto h-3 w-3 opacity-50" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. フッター（ユーザー名など） */}
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
            JD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">John Doe</span>
            <span className="text-[10px] text-muted-foreground truncate">john.doe@example.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
