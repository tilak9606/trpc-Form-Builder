"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFormEditorPage = /^\/dashboard\/forms\/[^/]+(\/.*)?$/.test(pathname);

  if (isFormEditorPage) {
    return (
      <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
