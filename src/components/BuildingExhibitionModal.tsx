"use client";

import { useEffect, useState } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Sparkles, 
  BookOpen,
  Compass,
  Award
} from "lucide-react";
import { CagarBudayaItem } from "@/lib/types";
import { getStatusBadgeClass, getStatusColor, padNumber } from "@/lib/utils";

interface BuildingExhibitionModalProps {
  building: CagarBudayaItem | null;
  allBuildings: CagarBudayaItem[];
  onClose: () => void;
  onSelectBuilding: (building: CagarBudayaItem) => void;
  onFocusOnMap?: (buildingId: string) => void;
}

export default function BuildingExhibitionModal({
  building,
  allBuildings,
  onClose,
  onSelectBuilding,
  onFocusOnMap,
}: BuildingExhibitionModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setActivePhotoIdx(0);
    setImgError(false);
  }, [building]);

  useEffect(() => {
    if (!building) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNextBuilding();
      if (e.key === "ArrowLeft") handlePrevBuilding();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [building, allBuildings]);

  if (!building) return null;

  const currentIdx = allBuildings.findIndex((b) => b.id === building.id);
  const prevBuilding =
    currentIdx > 0 ? allBuildings[currentIdx - 1] : allBuildings[allBuildings.length - 1];
  const nextBuilding =
    currentIdx < allBuildings.length - 1 ? allBuildings[currentIdx + 1] : allBuildings[0];

  const handlePrevBuilding = () => {
    if (prevBuilding) onSelectBuilding(prevBuilding);
  };

  const handleNextBuilding = () => {
    if (nextBuilding) onSelectBuilding(nextBuilding);
  };

  const fotos = building.fotos || [];
  const currentPhoto = fotos[activePhotoIdx] || fotos[0];
  const statusColor = getStatusColor(building.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Ambient Background Glow */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[160px] opacity-20"
        style={{ backgroundColor: statusColor }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#11100d] border border-[#322c23] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#25211a] bg-[#15130f]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-mono font-bold text-[#f3e5ab]">
              MONUMEN #{padNumber(building.no)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono border font-semibold ${getStatusBadgeClass(
                building.status
              )}`}
            >
              ✦ Status {building.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#221f1a] hover:bg-[#d4af37] text-[#d1c7b7] hover:text-[#0b0a08] border border-[#332e25] transition-all cursor-pointer"
            title="Tutup Eksibisi (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Exhibition Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Monumental Arch Frame */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative w-full aspect-[4/5] arch-frame gold-glow-animated overflow-hidden group">
              {currentPhoto && !imgError ? (
                <img
                  src={currentPhoto.src}
                  alt={building.nama}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1a1712] to-[#0e0d0a]">
                  <svg
                    className="w-24 h-24 text-[#d4af37] opacity-50 mb-3"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M20 100V58c0-22 17-38 40-38s40 16 40 38v42" />
                    <path d="M42 100V72c0-11 8-19 18-19s18 8 18 19v28" />
                    <path d="M60 20V8M52 14h16" />
                    <path d="M10 100h100" />
                  </svg>
                  <span className="text-xs font-mono text-[#d4af37] uppercase tracking-widest">
                    {building.nama}
                  </span>
                </div>
              )}

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090806] via-transparent to-black/30" />

              {/* Bottom Caption inside Arch */}
              <div className="absolute bottom-4 inset-x-4 p-3 rounded-xl bg-[#0e0d0a]/85 backdrop-blur-md border border-[#302b22] text-center">
                <p className="text-xs font-serif italic text-[#f3e5ab]">
                  “{currentPhoto?.cap || `Arsitektur bersejarah ${building.nama}`}”
                </p>
              </div>
            </div>

            {/* Thumbnail Selector if Multiple Photos */}
            {fotos.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {fotos.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setImgError(false);
                    }}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activePhotoIdx
                        ? "border-[#d4af37] scale-105 shadow-md"
                        : "border-[#2a251d] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={f.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Editorial Story & Legal Metadata */}
          <div className="lg:col-span-7 space-y-6 relative">
            {/* Giant Ghost Watermark */}
            <div className="pointer-events-none select-none absolute -top-6 right-0 font-serif text-8xl font-bold text-[#d4af37]/5 leading-none">
              {padNumber(building.no)}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ARSIP WARISAN ARSITEKTUR GPIB</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f2eb] leading-tight">
                {building.nama}
              </h2>
            </div>

            {/* Narrative with Luxury Dropcap */}
            <div className="p-6 rounded-2xl border border-[#2c271f] bg-[#161410]/90 shadow-inner space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sejarah & Karakteristik Bangunan</span>
              </div>
              <p className="text-sm sm:text-base text-[#dfd7c8] leading-relaxed font-light editorial-dropcap">
                {building.narasi ||
                  `${building.nama} merupakan salah satu bangunan cagar budaya bersejarah di lingkungan Gereja Protestan di Indonesia bagian Barat (GPIB) yang memiliki nilai penting bagi sejarah perkembangan gereja, arsitektur kolonial, dan warisan budaya nasional.`}
              </p>
            </div>

            {/* Key Historical Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl border border-[#28241d] bg-[#14130f] flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273]">
                    Tahun / Masa Didirikan
                  </div>
                  <div className="text-base font-serif font-bold text-[#f5f2eb] mt-0.5">
                    {building.didirikan || "Era Kolonial"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#28241d] bg-[#14130f] flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#5a94d6]/15 text-[#5a94d6]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273]">
                    Tanggal Penetapan SK
                  </div>
                  <div className="text-base font-serif font-bold text-[#f5f2eb] mt-0.5">
                    {building.tglSK || "Terdaftar Resmi"}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl border border-[#28241d] bg-[#14130f] flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#52b788]/15 text-[#52b788]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273]">
                    Surat Keputusan (SK) Cagar Budaya
                  </div>
                  <div className="text-sm font-semibold text-[#f5f2eb] mt-0.5 break-words">
                    {building.sk || "Dokumen SK Inventaris Cagar Budaya"}
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Interactive Map Links */}
            <div className="p-5 rounded-2xl border border-[#2e2920] bg-gradient-to-r from-[#161410] to-[#12100d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lokasi & Koordinat Geografis</span>
                </span>
                {building.lat && building.lng && (
                  <span className="text-[11px] font-mono text-[#52b788] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
                    {building.lat.toFixed(4)}, {building.lng.toFixed(4)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#e0d8c8]">
                {building.alamat || "Alamat lengkap terdaftar dalam inventaris GPIB"}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {building.lat && building.lng && onFocusOnMap && (
                  <button
                    onClick={() => {
                      onFocusOnMap(building.id);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#0b0a08] font-semibold text-xs hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#d4af37]/20"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Sorot di Peta Nusantara</span>
                  </button>
                )}

                {building.lat && building.lng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${building.lat},${building.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl border border-[#332e25] bg-[#1b1914] hover:border-[#d4af37] text-[#d1c7b7] hover:text-[#f3e5ab] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Navigation between Monuments */}
        <div className="px-6 py-4 border-t border-[#25211a] bg-[#14120e] flex items-center justify-between gap-4">
          <button
            onClick={handlePrevBuilding}
            className="px-4 py-2 rounded-xl border border-[#2e2920] bg-[#1a1813] hover:border-[#d4af37] text-xs text-[#d1c7b7] hover:text-[#f3e5ab] flex items-center gap-2 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#d4af37]" />
            <div className="text-left">
              <div className="text-[9px] font-mono text-[#786f61] uppercase">Sebelumnya</div>
              <div className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                #{padNumber(prevBuilding.no)} {prevBuilding.nama}
              </div>
            </div>
          </button>

          <div className="hidden sm:block text-[11px] font-mono text-[#8c8273]">
            Gunakan tombol panah <kbd className="px-1.5 py-0.5 rounded bg-[#221f19] text-[#d4af37]">←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-[#221f19] text-[#d4af37]">→</kbd> untuk berpindah monumen
          </div>

          <button
            onClick={handleNextBuilding}
            className="px-4 py-2 rounded-xl border border-[#2e2920] bg-[#1a1813] hover:border-[#d4af37] text-xs text-[#d1c7b7] hover:text-[#f3e5ab] flex items-center gap-2 transition-all cursor-pointer"
          >
            <div className="text-right">
              <div className="text-[9px] font-mono text-[#786f61] uppercase">Berikutnya</div>
              <div className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                #{padNumber(nextBuilding.no)} {nextBuilding.nama}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#d4af37]" />
          </button>
        </div>
      </div>
    </div>
  );
}
