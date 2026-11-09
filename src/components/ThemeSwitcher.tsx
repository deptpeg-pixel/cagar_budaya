"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "cagar_budaya_theme_mode";

export function applyThemeToDOM(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  let resolved: "light" | "dark" = "dark";

  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    resolved = prefersDark ? "dark" : "light";
  } else {
    resolved = mode;
  }

  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-mode", mode);

  if (resolved === "light") {
    root.classList.add("light-theme");
    root.classList.remove("dark");
  } else {
    root.classList.remove("light-theme");
    root.classList.add("dark");
  }
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const initialMode: ThemeMode =
      saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setMode(initialMode);
    applyThemeToDOM(initialMode);

    // Listen to OS theme changes when in 'system' mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentSaved =
        (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) || "system";
      if (currentSaved === "system") {
        applyThemeToDOM("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleSelectMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyThemeToDOM(nextMode);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-24 rounded-xl border border-[#2c271f] bg-[#161410] animate-pulse" />
    );
  }

  return (
    <div
      className="theme-switcher inline-flex items-center rounded-xl p-0.5 border border-[var(--card-border)] bg-[var(--card-subtle)]"
      role="group"
      aria-label="Pilih Tema Tampilan"
    >
      <button
        type="button"
        onClick={() => handleSelectMode("light")}
        className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
          mode === "light"
            ? "bg-[#d4af37] text-[#0b0a08] font-bold shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
        }`}
        title="Tema Terang (Kertas Arsip Klasik)"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Terang</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectMode("dark")}
        className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
          mode === "dark"
            ? "bg-[#d4af37] text-[#0b0a08] font-bold shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
        }`}
        title="Tema Gelap (Obsidian & Emas)"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Gelap</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectMode("system")}
        className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
          mode === "system"
            ? "bg-[#d4af37] text-[#0b0a08] font-bold shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
        }`}
        title="Ikuti Pengaturan Tema Sistem Operasi"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Sistem</span>
      </button>
    </div>
  );
}

export default ThemeSwitcher;
