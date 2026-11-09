"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit3, 
  BarChart3, 
  Layers, 
  Compass,
  Sparkles,
  Clock,
  ShieldCheck,
  Building2,
  Info
} from "lucide-react";
import { CagarBudayaItem, CagarBudayaStatus } from "@/lib/types";
import { getStatusBadgeClass, getStatusColor, padNumber } from "@/lib/utils";
import MapInteractive from "@/components/MapInteractive";
import ArchImage from "@/components/ArchImage";

interface BigScreenPresentationProps {
  items: CagarBudayaItem[];
  onClose: () => void;
  onEditItem: (item: CagarBudayaItem) => void;
}

type BigScreenTab = "spotlight" | "warroom" | "map";

export default function BigScreenPresentation({
  items,
  onClose,
  onEditItem,
}: BigScreenPresentationProps) {
  const [activeTab, setActiveTab] = useState<BigScreenTab>("spotlight");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  // Digital clock for live big screen
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Current building
  const currentBuilding = items[currentIndex] || items[0];

  // Auto-play presentation tour
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      setPhotoIndex(0);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPlaying, items.length]);

  // Keyboard navigation
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    setPhotoIndex(0);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    setPhotoIndex(0);
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "p" || e.key === "P") {
        setIsPlaying((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Status analytics
  const analytics = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Nasional: 0,
      Provinsi: 0,
      Kota: 0,
      Kabupaten: 0,
    };
    let withPhoto = 0;
    let withCoords = 0;

    const centuries: Record<string, number> = {
      "Abad 17 (< 1700)": 0,
      "Abad 18 (1700-1799)": 0,
      "Abad 19 (1800-1899)": 0,
      "Abad 20 (1900+)": 0,
    };

    items.forEach((b) => {
      if (statusCounts[b.status] !== undefined) statusCounts[b.status]++;
      if (b.fotos && b.fotos.length > 0) withPhoto++;
      if (b.lat && b.lng) withCoords++;

      const year = b.tahunDidirikan;
      if (year) {
        if (year < 1700) centuries["Abad 17 (< 1700)"]++;
        else if (year < 1800) centuries["Abad 18 (1700-1799)"]++;
        else if (year < 1900) centuries["Abad 19 (1800-1899)"]++;
        else centuries["Abad 20 (1900+)"]++;
      }
    });

    return {
      statusCounts,
      withPhoto,
      withCoords,
      centuries,
    };
  }, [items]);

  const hasPhotos = currentBuilding.fotos && currentBuilding.fotos.length > 0;
  const currentPhoto = hasPhotos ? currentBuilding.fotos[photoIndex] || currentBuilding.fotos[0] : null;

  return (
    <div className="fixed inset-0 z-50 warroom-bg text-[#f5f2eb] flex flex-col overflow-hidden select-none animate-fade-in font-sans">
      {/* ================= TOP EXECUTIVE BAR ================= */}
      <header className="h-16 px-6 border-b border-[#302a22] bg-[#11100d]/90 backdrop-blur-xl flex items-center justify-between gap-4 z-20 flex-shrink-0">
        {/* Left Crest & Live Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-[#8a6e1d]/20 border border-[#d4af37]/60 flex items-center justify-center text-[#f3e5ab] shadow-lg shadow-[#d4af37]/20">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-wide text-[#f5f2eb] shimmer-gold">
                CAGAR BUDAYA GPIB
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 text-[9px] font-mono tracking-widest font-bold">
                BIG SCREEN SUITE
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#a89f91] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] animate-pulse" />
              <span>PRESIDIUM & DEWAN KURATOR ARSIP</span>
              <span>•</span>
              <span className="text-[#f3e5ab] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#d4af37]" />
                {currentTime}
              </span>
            </div>
          </div>
        </div>

        {/* Center Presentation Mode Switcher */}
        <div className="flex items-center bg-[#191713] border border-[#302a22] rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setActiveTab("spotlight")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "spotlight"
                ? "bg-gradient-to-r from-[#d4af37] to-[#b38f26] text-[#0f0e0c] shadow-md shadow-[#d4af37]/30 font-bold"
                : "text-[#a89f91] hover:text-[#f5f2eb]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teater Spotlight</span>
          </button>
          <button
            onClick={() => setActiveTab("warroom")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "warroom"
                ? "bg-gradient-to-r from-[#d4af37] to-[#b38f26] text-[#0f0e0c] shadow-md shadow-[#d4af37]/30 font-bold"
                : "text-[#a89f91] hover:text-[#f5f2eb]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>War Room Analitik</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "map"
                ? "bg-gradient-to-r from-[#d4af37] to-[#b38f26] text-[#0f0e0c] shadow-md shadow-[#d4af37]/30 font-bold"
                : "text-[#a89f91] hover:text-[#f5f2eb]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Radar Sebaran GPS</span>
          </button>
        </div>

        {/* Right Tools & Controls */}
        <div className="flex items-center gap-2">
          {activeTab === "spotlight" && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying
                  ? "bg-[#52b788]/20 border-[#52b788]/60 text-[#82e0aa]"
                  : "bg-[#1f1c17] border-[#302a22] text-[#d1c7b7] hover:border-[#d4af37]"
              }`}
              title="Auto-play tur presentasi setiap 8 detik (P)"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#52b788]" /> : <Play className="w-3.5 h-3.5 text-[#d4af37]" />}
              <span>{isPlaying ? "Tur Berjalan" : "Auto-Tur"}</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#1f1c17] hover:bg-[#2c2820] text-[#d1c7b7] hover:text-[#f3e5ab] border border-[#302a22] transition-colors cursor-pointer"
            title="Layar Penuh (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#241717] hover:bg-[#381c1c] text-red-300 border border-red-900/40 transition-colors cursor-pointer"
            title="Tutup Mode Layar Lebar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= MAIN PRESENTATION CANVAS ================= */}
      <main className="flex-1 overflow-hidden relative p-6 sm:p-8 flex flex-col justify-between">
        {/* VIEW 1: SPOTLIGHT TEATER (BIG WOW CINEMATIC ARCH) */}
        {activeTab === "spotlight" && (
          <div className="h-full flex flex-col justify-between max-w-7xl mx-auto w-full gap-6 animate-fade-in">
            {/* Top Spotlight Theater Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-0">
              {/* Left Column: Monumental Arch Visual */}
              <div className="lg:col-span-5 h-full flex flex-col items-center justify-center relative space-y-3">
                <div className="relative w-full max-w-md h-[400px] arch-frame gold-glow-animated group transition-all duration-700">
                  {/* Main Image View */}
                  <div className="absolute inset-0 z-0">
                    <ArchImage
                      src={currentPhoto?.src}
                      title={currentBuilding.nama}
                      no={currentBuilding.no}
                      status={currentBuilding.status}
                      didirikan={currentBuilding.didirikan}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  </div>

                  {/* Classic Bottom-Centered Plaque (Never clipped by arch!) */}
                  <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-4 py-1 rounded-full bg-[#d4af37] text-[#0b0a08] text-xs font-mono tracking-widest font-bold uppercase shadow-lg">
                    NO. {padNumber(currentBuilding.no)} · {currentBuilding.status}
                  </div>
                </div>

                {/* Caption & Navigation Outside Arch Frame */}
                <div className="w-full max-w-md bg-[#141310] border border-[#302a22] rounded-xl p-3 text-center space-y-1.5 shadow-lg">
                  <p className="text-xs font-serif italic text-[#f3e5ab] line-clamp-2">
                    “{currentPhoto?.cap || currentBuilding.nama}”
                  </p>
                  {hasPhotos && currentBuilding.fotos.length > 1 && (
                    <div className="flex justify-center gap-1.5 pt-1">
                      {currentBuilding.fotos.map((_, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setPhotoIndex(pIdx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            pIdx === photoIndex ? "w-5 bg-[#d4af37]" : "bg-[#3d372c]"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: High-Impact Typography & Narrative */}
              <div className="lg:col-span-7 space-y-5 h-full flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-bold">
                      INVENTARIS RESMI #{padNumber(currentBuilding.no)}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-mono border font-semibold ${getStatusBadgeClass(
                        currentBuilding.status
                      )}`}
                    >
                      {currentBuilding.status}
                    </span>
                    {currentBuilding.tahunDidirikan && (
                      <span className="text-xs font-mono text-[#a89f91] bg-[#1a1814] px-2.5 py-0.5 rounded-md border border-[#2c2822]">
                        ✦ {currentBuilding.didirikan}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5f2eb] tracking-tight leading-tight">
                    {currentBuilding.nama}
                  </h1>
                </div>

                {/* Key Attributes Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[#2c2822] bg-[#151411]/80 backdrop-blur-sm">
                    <div className="text-[10px] font-mono text-[#8a7f70] uppercase flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-[#d4af37]" />
                      <span>Didirikan</span>
                    </div>
                    <div className="font-semibold text-[#f5f2eb] text-sm">
                      {currentBuilding.didirikan || "—"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#2c2822] bg-[#151411]/80 backdrop-blur-sm">
                    <div className="text-[10px] font-mono text-[#8a7f70] uppercase flex items-center gap-1 mb-1">
                      <FileText className="w-3 h-3 text-[#52b788]" />
                      <span>Surat Keputusan (SK)</span>
                    </div>
                    <div className="font-semibold text-[#f5f2eb] truncate text-xs">
                      {currentBuilding.sk || "—"}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3 rounded-xl border border-[#2c2822] bg-[#151411]/80 backdrop-blur-sm">
                    <div className="text-[10px] font-mono text-[#8a7f70] uppercase flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-[#5a94d6]" />
                      <span>Tanggal SK</span>
                    </div>
                    <div className="font-semibold text-[#f5f2eb] text-xs">
                      {currentBuilding.tglSK || "—"}
                    </div>
                  </div>
                </div>

                {/* Historical Narrative Box */}
                <div className="p-5 rounded-2xl border border-[#302a22] bg-[#141310]/90 backdrop-blur-md space-y-2 relative shadow-xl">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Narasi Sejarah & Arsitektur</span>
                    </span>
                    <button
                      onClick={() => onEditItem(currentBuilding)}
                      className="px-2.5 py-1 rounded bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#0b0a08] border border-[#d4af37]/50 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Langsung (Live)</span>
                    </button>
                  </div>
                  <p className="text-sm text-[#d4cbbe] leading-relaxed font-light max-h-36 overflow-y-auto">
                    {currentBuilding.narasi || "Narasi sejarah gedung belum dilengkapi. Klik tombol 'Edit Langsung' untuk menambahkan keterangan arsitektur dan sejarah berdirinya."}
                  </p>
                </div>

                {/* Address & GPS Pulse Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#2c2822] bg-[#12110e]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-[#52b788]" />
                      <span className="absolute w-3 h-3 rounded-full bg-[#52b788] radar-ping" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#f5f2eb]">
                        {currentBuilding.alamat || "Alamat belum tercatat lengkap"}
                      </div>
                      <div className="text-[10px] font-mono text-[#8a7f70]">
                        KOORDINAT: {currentBuilding.lat && currentBuilding.lng ? `${currentBuilding.lat}, ${currentBuilding.lng}` : "BELUM DISET"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono text-[#d4af37]">
                    GEDUNG {currentIndex + 1} / {items.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Rolling Ticker Carousel */}
            <div className="border-t border-[#2c2822] pt-4 flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl border border-[#302a22] bg-[#161512] hover:bg-[#d4af37] hover:text-[#0b0a08] text-[#f5f2eb] transition-all cursor-pointer flex-shrink-0"
                title="Bangunan Sebelumnya (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Ticker Cards */}
              <div className="flex-1 overflow-x-auto flex items-center gap-2.5 py-1 scrollbar-none">
                {items.map((b, idx) => {
                  const isCur = idx === currentIndex;
                  const thumb = b.fotos && b.fotos.length > 0 ? b.fotos[0].src : null;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setPhotoIndex(0);
                      }}
                      className={`flex-shrink-0 w-36 p-2 rounded-xl border cursor-pointer transition-all duration-300 ${
                        isCur
                          ? "bg-[#252119] border-[#d4af37] shadow-lg shadow-[#d4af37]/20 scale-105"
                          : "bg-[#141310] border-[#25221b] hover:border-[#3d372c] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="w-full h-12 rounded-lg bg-[#0b0a08] overflow-hidden mb-1 relative">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-[#5a5245]">
                            NO FOTO
                          </div>
                        )}
                        <span className="absolute top-1 left-1 px-1 rounded bg-black/70 text-[8px] font-mono text-[#d4af37] font-bold">
                          #{padNumber(b.no)}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-[#f5f2eb] truncate">
                        {b.nama}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                className="p-3 rounded-xl border border-[#302a22] bg-[#161512] hover:bg-[#d4af37] hover:text-[#0b0a08] text-[#f5f2eb] transition-all cursor-pointer flex-shrink-0"
                title="Bangunan Berikutnya (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: WAR ROOM EXECUTIVE ANALYTICS */}
        {activeTab === "warroom" && (
          <div className="h-full max-w-7xl mx-auto w-full flex flex-col justify-between gap-6 overflow-y-auto animate-fade-in">
            {/* 4 Big Impact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-br from-[#1c1913] to-[#12110e] shadow-xl relative overflow-hidden">
                <div className="text-xs font-mono uppercase tracking-widest text-[#d4af37]">
                  Total Bangunan Cagar Budaya
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-bold text-[#f3e5ab] my-2">
                  {padNumber(items.length)}
                </div>
                <p className="text-xs text-[#a89f91]">
                  100% Gedung GPIB terverifikasi dalam inventarisasi
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#c8a24a]/30 bg-[#141310] shadow-lg">
                <div className="text-xs font-mono uppercase tracking-widest text-[#d4af37]">
                  Peringkat Nasional
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-bold text-[#d4af37] my-2">
                  {analytics.statusCounts["Nasional"]}
                </div>
                <p className="text-xs text-[#a89f91]">
                  Ditetapkan langsung melalui Keputusan Menteri
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#5a94d6]/30 bg-[#141310] shadow-lg">
                <div className="text-xs font-mono uppercase tracking-widest text-[#5a94d6]">
                  Titik Peta GPS Terdaftar
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-bold text-[#8eb8eb] my-2">
                  {analytics.withCoords}
                </div>
                <p className="text-xs text-[#a89f91]">
                  Koordinat geografis akurat siap visualisasi
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#52b788]/30 bg-[#141310] shadow-lg">
                <div className="text-xs font-mono uppercase tracking-widest text-[#52b788]">
                  Berkas Foto Terdokumentasi
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-bold text-[#82e0aa] my-2">
                  {analytics.withPhoto}
                </div>
                <p className="text-xs text-[#a89f91]">
                  Tersimpan di Supabase Cloud Storage
                </p>
              </div>
            </div>

            {/* Century / Historical Era Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Breakdown Bar Gauges */}
              <div className="p-6 rounded-2xl border border-[#302a22] bg-[#141310]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#25221b] pb-3">
                  <span className="font-serif font-bold text-lg text-[#f5f2eb]">
                    Pembagian Kategori Penetapan
                  </span>
                  <span className="text-xs font-mono text-[#d4af37]">
                    REGULASI RESMI
                  </span>
                </div>

                <div className="space-y-3">
                  {(["Nasional", "Provinsi", "Kota", "Kabupaten"] as CagarBudayaStatus[]).map((st) => {
                    const count = analytics.statusCounts[st] || 0;
                    const pct = Math.round((count / (items.length || 1)) * 100);
                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[#f5f2eb] font-semibold">{st}</span>
                          <span className="text-[#d4af37]">{count} Bangunan ({pct}%)</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#1e1c17] overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: getStatusColor(st),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Century / Era Timeline */}
              <div className="p-6 rounded-2xl border border-[#302a22] bg-[#141310]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#25221b] pb-3">
                  <span className="font-serif font-bold text-lg text-[#f5f2eb]">
                    Rentang Era Berdirinya Bangunan
                  </span>
                  <span className="text-xs font-mono text-[#52b788]">
                    SEJARAH NUSANTARA
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(analytics.centuries).map(([era, count]) => {
                    const pct = Math.round((count / (items.length || 1)) * 100);
                    return (
                      <div key={era} className="p-2.5 rounded-xl border border-[#25221b] bg-[#171612] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#f5f2eb] font-medium">{era}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#a89f91]">{pct}%</span>
                          <span className="px-2.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f3e5ab] font-bold">
                            {count} Gedung
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Executive Action Banner */}
            <div className="p-5 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[#1c1912] via-[#241f14] to-[#1c1912] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#d4af37]/20 text-[#f3e5ab]">
                  <Building2 className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#f5f2eb]">
                    Kelola & Perbarui Data Secara Langsung di Panggung
                  </h4>
                  <p className="text-xs text-[#a89f91]">
                    Pilih gedung mana saja dari teater spotlight untuk mengubah narasi atau mengunggah foto resolusi tinggi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("spotlight")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f26] text-[#0b0a08] text-xs font-bold hover:brightness-110 shadow-lg shadow-[#d4af37]/20 cursor-pointer transition-all"
              >
                Buka Teater Spotlight ➔
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: RADAR SEBARAN GPS MAP */}
        {activeTab === "map" && (
          <div className="h-full max-w-7xl mx-auto w-full flex flex-col justify-between gap-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#2c2822] pb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5a94d6] font-bold">
                  PETA SEBARAN NASIONAL
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#f5f2eb]">
                  Pemetaan 35 Bangunan Cagar Budaya GPIB
                </h3>
              </div>
              <div className="text-xs font-mono text-[#a89f91]">
                Klik marker pada peta untuk melihat detail & foto gereja
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-[#302a22] overflow-hidden shadow-2xl">
              <MapInteractive
                items={items}
                height="100%"
                zoomLevel={5}
                onSelectBuilding={(id) => {
                  const idx = items.findIndex((b) => b.id === id);
                  if (idx >= 0) {
                    setCurrentIndex(idx);
                    setActiveTab("spotlight");
                  }
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

