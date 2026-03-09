"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, LogOut, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/contexts/SidebarContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  if (pageTitles[pathname]) return pageTitles[pathname];

  const brandMatch = pathname.match(/^\/dashboard\/([^/]+)$/);
  if (brandMatch) {
    const slug = brandMatch[1];
    const brandNames: Record<string, string> = {
      cetaphil: "Cetaphil",
      dermotivin: "Dermotivin",
      alastin: "Alastin Skincare",
    };
    return brandNames[slug] || slug;
  }

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
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden h-9 w-9"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} />
        </Button>
        <div className="min-w-0">
          <h1 className="text-heading-md text-lg truncate">{title}</h1>
          <p className="text-metric text-[10px] text-muted-foreground hidden sm:block">
            GALDERMA BRASIL
          </p>
        </div>
      </div>

      {/* Center: navegação em pills */}
      <nav
        className="hidden md:flex flex-1 justify-center"
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-button)] bg-muted border border-border">
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
                    ? "px-3 py-1.5 rounded-md text-sm font-medium bg-purple/20 text-purple-light border border-purple/30 transition-colors duration-[var(--transition-fast)]"
                    : "px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors duration-[var(--transition-fast)]"
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
        {/* <div className="hidden lg:block w-40 xl:w-52">
          <Input
            type="search"
            placeholder="Buscar..."
            className="h-9"
          />
        </div> */}
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex h-9 w-9"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </Button>
        <ThemeToggle />

        {/* User avatar + dropdown com logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0" aria-label="Abrir menu da conta">
              <Avatar className="h-8 w-8 border border-purple/30 bg-purple/20">
                <AvatarFallback className="text-metric text-[10px] font-semibold text-purple-light bg-transparent">
                  M
                </AvatarFallback>
              </Avatar>
            </Button>
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
