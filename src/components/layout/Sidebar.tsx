"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  GitCompareArrows,
  BookOpen,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/compare", label: "Comparativo", icon: GitCompareArrows },
  { href: "/dashboard/glossary", label: "Glossário", icon: BookOpen },
  { href: "/dashboard/reports", label: "Relatórios", icon: FileText },
];

const bottomItems = [
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* Logo MESSS */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {/* SSS Symbol */}
          <span className="text-heading-lg text-2xl text-purple">
            MESSS
          </span>
          <span className="text-metric text-[10px] text-[var(--text-muted)]">
            DASHBOARD
          </span>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] 
                text-sm font-medium transition-colors duration-[var(--transition-fast)]
                ${
                  isActive
                    ? "bg-purple/10 text-purple-light border border-purple/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}

        {/* Separador — Brand links */}
        <div className="pt-4 pb-2 px-3">
          <p className="text-metric text-[10px] text-[var(--text-muted)]">
            MARCAS
          </p>
        </div>

        {/* Brand nav items — estes serão dinâmicos quando conectar ao DB */}
        {[
          { slug: "cetaphil", name: "Cetaphil", color: "#8021de" },
          { slug: "dermotivin", name: "Dermotivin", color: "#be12b3" },
          { slug: "alastin", name: "ALASTIN", color: "#4124b2" },
        ].map((brand) => {
          const href = `/dashboard/${brand.slug}`;
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={brand.slug}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)]
                text-sm font-medium transition-colors duration-[var(--transition-fast)]
                ${
                  isActive
                    ? "bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                }
              `}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: brand.color }}
              />
              {brand.name}
              {isActive && (
                <BarChart3 size={14} className="ml-auto text-[var(--text-muted)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-[var(--border-subtle)]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              <Icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
