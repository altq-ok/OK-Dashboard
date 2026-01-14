'use client';

import { Calendar, Home, Inbox, Search, Settings, LayoutGrid } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { WIDGET_REGISTRY } from '@/lib/widget-registry';
import { WidgetType } from '@/types/dashboard';

// 既存のメニュー
const navItems = [
  { title: 'Home', url: '#', icon: Home },
  { title: 'Inbox', url: '#', icon: Inbox },
  { title: 'Calendar', url: '#', icon: Calendar },
];

export function AppSidebar() {
  return (
    <Sidebar>
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
