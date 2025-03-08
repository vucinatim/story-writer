"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    onClick?: () => void;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            {item.url ? (
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            ) : (
              <div onClick={item.onClick} className="cursor-pointer">
                <item.icon />
                <span>{item.title}</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
