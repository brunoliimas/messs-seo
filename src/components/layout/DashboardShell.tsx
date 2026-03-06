"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={true}
          className="w-64 p-0 pt-14 gap-0 flex flex-col border-[var(--border-subtle)] bg-[var(--bg-surface)]"
        >
          <SidebarNav onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </SidebarProvider>
  );
}
