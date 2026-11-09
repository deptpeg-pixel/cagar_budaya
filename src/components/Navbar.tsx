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
  LayoutGrid, 
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
    <header className="sticky top-0 z-40 w-full border-b border-[#2c2822] bg-[#11100e]/90 backdrop-blur-md px-4 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group cursor-pointer text-decoration-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#c8a24a]/15 border border-[#c8a24a]/40 flex items-center justify-center text-[#e6c875] group-hover:border-[#c8a24a] transition-all">
            <svg width="18" height="22" viewBox="0 0 17 22" fill="none">
              <path d="M1.5 21V10C1.5 4.5 5 1.5 8.5 1.5 12 1.5 15.5 4.5 15.5 10V21" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8.5 21v-6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div className="font-serif text-sm tracking-wider font-semibold text-[#f2eee6] group-hover:text-[#e6c875] transition-colors">
              CAGAR BUDAYA · GPIB
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#a89f91] -mt-0.5">
              Inventaris Bangunan Bersejarah
            </div>
          </div>
        </Link>

        {/* Navigation Quick Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-[#d1c7b7]">
          {onJumpToSlide && (
            <>
              <button
                onClick={() => onJumpToSlide("ledger")}
                className="px-2.5 py-1.5 rounded-md hover:bg-[#25221d] hover:text-[#e6c875] flex items-center gap-1.5 transition-colors"
                title="Buka Daftar Isi"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#c8a24a]" />
                <span>Daftar Isi</span>
              </button>
              <button
                onClick={() => onJumpToSlide("map")}
                className="px-2.5 py-1.5 rounded-md hover:bg-[#25221d] hover:text-[#e6c875] flex items-center gap-1.5 transition-colors"
                title="Buka Peta Sebaran"
              >
                <MapPin className="w-3.5 h-3.5 text-[#5a94d6]" />
                <span>Peta</span>
              </button>
              <button
                onClick={() => onJumpToSlide("stats")}
                className="px-2.5 py-1.5 rounded-md hover:bg-[#25221d] hover:text-[#e6c875] flex items-center gap-1.5 transition-colors"
                title="Buka Rekapitulasi"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Rekapitulasi</span>
              </button>
            </>
          )}

          {onOpenOverview && (
            <button
              onClick={onOpenOverview}
              className="px-2.5 py-1.5 rounded-md hover:bg-[#25221d] hover:text-[#e6c875] flex items-center gap-1.5 transition-colors"
              title="Ringkasan Seluruh Slide"
            >
              <Compass className="w-3.5 h-3.5 text-[#d97736]" />
              <span>Ringkasan</span>
            </button>
          )}
        </nav>

        {/* View Mode Switcher & Tools */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#1d1b17] border border-[#2c2822] rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("deck")}
              className={`px-2.5 py-1 text-xs rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "deck"
                  ? "bg-[#c8a24a] text-[#11100e] shadow-sm font-semibold"
                  : "text-[#a89f91] hover:text-[#f2eee6]"
              }`}
              title="Tampilan Slide Presentasi Klasik"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deck Slide</span>
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-2.5 py-1 text-xs rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-[#c8a24a] text-[#11100e] shadow-sm font-semibold"
                  : "text-[#a89f91] hover:text-[#f2eee6]"
              }`}
              title="Tampilan Kartu Katalog Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Katalog Grid</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[#2c2822] bg-[#1a1815] text-[#d1c7b7] hover:text-[#e6c875] hover:border-[#c8a24a]/50 transition-colors"
              title={isLight ? "Beralih ke Tema Gelap" : "Beralih ke Tema Terang"}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex p-1.5 rounded-md border border-[#2c2822] bg-[#1a1815] text-[#d1c7b7] hover:text-[#e6c875] hover:border-[#c8a24a]/50 transition-colors"
              title="Cetak Dokumen atau Simpan PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleFullscreen}
              className="hidden sm:flex p-1.5 rounded-md border border-[#2c2822] bg-[#1a1815] text-[#d1c7b7] hover:text-[#e6c875] hover:border-[#c8a24a]/50 transition-colors"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Admin Access Button */}
            <Link
              href="/admin"
              className="px-2.5 py-1.5 text-xs rounded-md border border-[#c8a24a]/60 bg-[#c8a24a]/10 hover:bg-[#c8a24a]/20 text-[#e6c875] flex items-center gap-1.5 font-medium transition-colors ml-1"
              title="Masuk ke Panel Kelola Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#c8a24a]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
