"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "messs-dashboard-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "light" || current === "dark") setTheme(current);
    }
  }, [mounted]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple/40 transition-colors cursor-pointer"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
