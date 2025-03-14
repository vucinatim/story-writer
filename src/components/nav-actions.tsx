"use client";

import * as React from "react";
import { Download, MoreHorizontal, Settings, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useParams, useRouter } from "next/navigation";
import { useNovel, useNovelStore } from "@/lib/stores/novels-store";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { cn } from "@/lib/utils";
import { exportAsPDF } from "@/app/actions/export-as-pdf";

export function NavActions() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { "novel-id": novelId } = useParams();
  const novel = useNovel(novelId);

  const deleteNovel = useNovelStore((state) => state.deleteNovel);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleSettings = useEditorStore((state) => state.toggleSettings);
  const isSettingsOpen = useEditorStore((state) => state.showSettings);

  const data = [
    [
      {
        label: "Delete Novel",
        icon: Trash2,
        onClick: () => setShowDeleteDialog(true),
      },
      {
        label: "Export as PDF",
        icon: Download,
        onClick: () => {
          if (novel) {
            exportAsPDF(novel);
          }
        },
      },
    ],
  ];

  return (
    <>
      {novel && (
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            className={cn(isSettingsOpen && "bg-accent")}
            onClick={toggleSettings}
          >
            <Settings />
            Novel Config
          </Button>

          <div className="hidden font-medium text-muted-foreground md:inline-block">
            Edited{" "}
            {new Date(novel.editedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>

          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Star />
          </Button>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 data-[state=open]:bg-accent"
              >
                <MoreHorizontal />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 overflow-hidden rounded-lg p-0"
              align="end"
            >
              <Sidebar collapsible="none" className="bg-transparent">
                <SidebarContent>
                  {data.map((group, index) => (
                    <SidebarGroup
                      key={index}
                      className="border-b last:border-none"
                    >
                      <SidebarGroupContent className="gap-0">
                        <SidebarMenu>
                          {group.map((item, index) => (
                            <SidebarMenuItem key={index}>
                              <SidebarMenuButton onClick={item.onClick}>
                                <item.icon /> <span>{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ))}
                </SidebarContent>
              </Sidebar>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this novel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              novel and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (novel) {
                    deleteNovel(novel.id);
                  }
                  setShowDeleteDialog(false);
                  router.replace("/");
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
