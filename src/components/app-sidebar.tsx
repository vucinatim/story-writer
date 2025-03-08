"use client";

import * as React from "react";
import { FilePlus, Home } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavNovels } from "./nav-novels";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useNovelStore } from "@/lib/stores/novels-store";
import { useEditorStore } from "@/lib/stores/editor-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { "novel-id": novelId } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const setShowSettings = useEditorStore((state) => state.setShowSettings);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h2 className="font-bold p-2">Self Writing Novel</h2>
        <NavMain
          items={[
            {
              title: "Home",
              url: "/",
              icon: Home,
              isActive: pathname === "/" && !novelId,
            },
            {
              title: "Create Novel",
              onClick: () => {
                setShowSettings(true);
                const novelId = useNovelStore.getState().createNovel();
                router.push(`/${novelId}`);
              },
              icon: FilePlus,
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavNovels />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
