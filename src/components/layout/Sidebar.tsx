"use client";

import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-full w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarNav />
    </aside>
  );
}
