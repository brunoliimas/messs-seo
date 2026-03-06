"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, LogOut, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/contexts/SidebarContext";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navPills = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/compare", label: "Comparativo" },
  { href: "/dashboard/glossary", label: "Glossário" },
  { href: "/dashboard/reports", label: "Relatórios" },
];

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
  const router = useRouter();
  const { setOpen: setSidebarOpen } = useSidebar();
  const title = getPageTitle(pathname);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6">
      {/* Left: menu (mobile) + título */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple/40 transition-colors cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-heading-md text-lg truncate">{title}</h1>
          <p className="text-metric text-[10px] text-[var(--text-muted)] hidden sm:block">
            GALDERMA BRASIL
          </p>
        </div>
      </div>

      {/* Center: navegação em pills (estilo referência) */}
      <nav
        className="hidden md:flex flex-1 justify-center"
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-button)] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]">
          {navPills.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "px-3 py-1.5 rounded-[var(--radius-badge)] text-sm font-medium bg-purple/20 text-purple-light border border-purple/30 transition-colors duration-[var(--transition-fast)]"
                    : "px-3 py-1.5 rounded-[var(--radius-badge)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors duration-[var(--transition-fast)]"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: search + notificações + theme + avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        <div className="hidden lg:block w-40 xl:w-52">
          <Input
            type="search"
            placeholder="Buscar..."
            className="h-9 bg-[var(--bg-surface-alt)] border-[var(--border-subtle)]"
          />
        </div>
        <button
          type="button"
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-purple/40 transition-colors cursor-pointer"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </button>
        <ThemeToggle />

        {/* User avatar + dropdown com logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-purple-light hover:bg-purple/30 hover:border-purple/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir menu da conta"
            >
              <span className="text-metric text-[10px] font-semibold">M</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
