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

const brandItems = [
  { slug: "cetaphil", name: "Cetaphil", color: "#8021de" },
  { slug: "dermotivin", name: "Dermotivin", color: "#be12b3" },
  { slug: "alastin", name: "Alastin", color: "#4124b2" },
];

interface SidebarNavProps {
  onLinkClick?: () => void;
}

export function SidebarNav({ onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();

  const linkProps = (href: string) => ({
    href,
    onClick: onLinkClick,
  });

  return (
    <>
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-heading-lg text-2xl text-purple">MESSS</span>
          <span className="text-metric text-[10px] text-[var(--text-muted)]">
            DASHBOARD
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              {...linkProps(item.href)}
              className={
                isActive
                  ? "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] text-sm font-medium bg-purple/15 text-purple-light border border-purple/30 transition-colors duration-[var(--transition-fast)]"
                  : "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors duration-[var(--transition-fast)]"
              }
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 pb-2 px-4">
          <p className="text-metric text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Marcas
          </p>
        </div>

        {brandItems.map((brand) => {
          const href = `/dashboard/${brand.slug}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={brand.slug}
              {...linkProps(href)}
              className={
                isActive
                  ? "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] text-sm font-medium bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors duration-[var(--transition-fast)]"
                  : "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors duration-[var(--transition-fast)]"
              }
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: brand.color }}
                aria-hidden
              />
              <span className="min-w-0 truncate">{brand.name}</span>
              {isActive && (
                <BarChart3 size={16} className="ml-auto shrink-0 text-[var(--text-muted)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-[var(--border-subtle)] space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              {...linkProps(item.href)}
              className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors duration-[var(--transition-fast)]"
            >
              <Icon size={20} strokeWidth={1.5} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
