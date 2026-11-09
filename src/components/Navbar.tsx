"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Compass, 
  Printer, 
  Sun, 
  Moon, 
  Maximize2, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  MapPin,
  BarChart3,
  BookOpen
} from "lucide-react";

interface NavbarProps {
  viewMode: "deck" | "grid";
  onViewModeChange: (mode: "deck" | "grid") => void;
  onJumpToSlide?: (slideKind: "cover" | "ledger" | "map" | "stats" | number) => void;
  onOpenOverview?: () => void;
}

export function Navbar({
  viewMode,
  onViewModeChange,
  onJumpToSlide,
  onOpenOverview,
}: NavbarProps) {
  const [isLight, setIsLight] = useState(false);

  const toggleTheme = () => {
    const nextTheme = !isLight;
    setIsLight(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#28241d] bg-[#0c0b09]/85 backdrop-blur-xl px-4 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <Link 
          href="/" 
          onClick={() => onViewModeChange("grid")}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37]/25 to-[#8a6e1d]/10 border border-[#d4af37]/50 flex items-center justify-center text-[#f3e5ab] group-hover:border-[#d4af37] shadow-md shadow-[#d4af37]/10 transition-all">
            <svg width="18" height="22" viewBox="0 0 17 22" fill="none">
              <path d="M1.5 21V10C1.5 4.5 5 1.5 8.5 1.5 12 1.5 15.5 4.5 15.5 10V21" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8.5 21v-6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div className="font-serif text-sm sm:text-base tracking-wider font-bold text-[#f5f2eb] group-hover:text-[#f3e5ab] transition-colors">
              CAGAR BUDAYA · GPIB
            </div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#9c9283] -mt-0.5">
              Arsip & Eksibisi Warisan Sejarah
            </div>
          </div>
        </Link>

        {/* Navigation Quick Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-[#d1c7b7]">
          {onJumpToSlide && (
            <>
              <button
                onClick={() => onJumpToSlide("ledger")}
                className="px-3 py-1.5 rounded-lg hover:bg-[#221f19] hover:text-[#f3e5ab] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Tabel Daftar Isi"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Daftar Isi</span>
              </button>
              <button
                onClick={() => onJumpToSlide("map")}
                className="px-3 py-1.5 rounded-lg hover:bg-[#221f19] hover:text-[#f3e5ab] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Peta Sebaran"
              >
                <MapPin className="w-3.5 h-3.5 text-[#5a94d6]" />
                <span>Peta Nusantara</span>
              </button>
              <button
                onClick={() => onJumpToSlide("stats")}
                className="px-3 py-1.5 rounded-lg hover:bg-[#221f19] hover:text-[#f3e5ab] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Rekapitulasi Status"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Rekapitulasi</span>
              </button>
            </>
          )}

          {onOpenOverview && (
            <button
              onClick={onOpenOverview}
              className="px-3 py-1.5 rounded-lg hover:bg-[#221f19] hover:text-[#f3e5ab] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ringkasan Cepat 35 Monumen"
            >
              <Compass className="w-3.5 h-3.5 text-[#d97736]" />
              <span>Indeks Cepat</span>
            </button>
          )}
        </nav>

        {/* View Mode Switcher & Tools */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#181612] border border-[#2c271f] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-[#d4af37] to-[#b89225] text-[#0b0a08] shadow-sm font-bold"
                  : "text-[#a89f91] hover:text-[#f5f2eb]"
              }`}
              title="Tampilan Eksibisi Digital Interaktif"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eksibisi</span>
            </button>
            <button
              onClick={() => onViewModeChange("deck")}
              className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                viewMode === "deck"
                  ? "bg-gradient-to-r from-[#d4af37] to-[#b89225] text-[#0b0a08] shadow-sm font-bold"
                  : "text-[#a89f91] hover:text-[#f5f2eb]"
              }`}
              title="Tampilan Slide Presentasi Klasik"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide Deck</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[#2c271f] bg-[#161410] text-[#d1c7b7] hover:text-[#f3e5ab] hover:border-[#d4af37]/50 transition-colors cursor-pointer"
              title={isLight ? "Beralih ke Tema Gelap" : "Beralih ke Tema Terang"}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex p-2 rounded-lg border border-[#2c271f] bg-[#161410] text-[#d1c7b7] hover:text-[#f3e5ab] hover:border-[#d4af37]/50 transition-colors cursor-pointer"
              title="Cetak Dokumen atau Simpan PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleFullscreen}
              className="hidden sm:flex p-2 rounded-lg border border-[#2c271f] bg-[#161410] text-[#d1c7b7] hover:text-[#f3e5ab] hover:border-[#d4af37]/50 transition-colors cursor-pointer"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Admin Access Button */}
            <Link
              href="/admin"
              className="px-3 py-1.5 text-xs rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 text-[#f3e5ab] flex items-center gap-1.5 font-semibold transition-colors ml-1"
              title="Masuk ke Panel Kelola Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
