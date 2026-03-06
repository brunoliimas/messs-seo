"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/compare": "Comparativo",
  "/dashboard/glossary": "Glossário",
  "/dashboard/reports": "Relatórios",
  "/settings": "Configurações",
};

function getPageTitle(pathname: string): string {
  // Checa match direto
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Checa se é uma brand page
  const brandMatch = pathname.match(/^\/dashboard\/([^/]+)$/);
  if (brandMatch) {
    const slug = brandMatch[1];
    const brandNames: Record<string, string> = {
      cetaphil: "Cetaphil",
      dermotivin: "Dermotivin",
      alastin: "ALASTIN Skincare",
    };
    return brandNames[slug] || slug;
  }

  // Checa se é history
  if (pathname.endsWith("/history")) return "Evolução Temporal";

  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="lg:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div>
          <h1 className="text-heading-md text-lg">{title}</h1>
          <p className="text-metric text-[10px] text-[var(--text-muted)] hidden sm:block">
            GALDERMA BRASIL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* User avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center">
          <span className="text-metric text-[10px] text-purple-light">M</span>
        </div>
      </div>
    </header>
  );
}
