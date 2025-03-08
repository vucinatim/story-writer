"use client";

import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "./app-sidebar";
import { NavActions } from "./nav-actions";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { useParams } from "next/navigation";
import { useNovel } from "@/lib/stores/novels-store";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { "novel-id": novelId } = useParams();
  const novel = useNovel(novelId);

  // is body scrolled to top
  const [isScrolledToTop, setIsScrolledToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolledToTop(true);
      } else {
        setIsScrolledToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className={cn(
            "flex sticky top-0 bg-background z-20 border-b border-transparent h-14 transition-colors shrink-0 items-center gap-2",
            isScrolledToTop && "border-border"
          )}
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {novel?.config.title ?? "Your Novels"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div
          id="content"
          className="relative flex flex-1 flex-col items-center gap-4 sm:px-4 px-2"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
