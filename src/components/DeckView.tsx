"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Image as ImageIcon,
  ArrowUpDown,
  BookOpen,
  BarChart2,
  Calendar,
  FileText,
  ExternalLink,
  Info
} from "lucide-react";
import { CagarBudayaItem, CagarBudayaStatus, FotoBangunan } from "@/lib/types";
import { getStatusBadgeClass, getStatusColor, padNumber } from "@/lib/utils";
import MapInteractive from "./MapInteractive";
import LightboxModal from "./LightboxModal";
import ArchImage from "./ArchImage";

interface DeckViewProps {
  items: CagarBudayaItem[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onOpenOverview: () => void;
}

const STATUS_LIST: CagarBudayaStatus[] = ["Nasional", "Provinsi", "Kota", "Kabupaten"];

export default function DeckView({
  items,
  currentSlideIndex,
  onSlideChange,
  onOpenOverview,
}: DeckViewProps) {
  // Sort state for Ledger table
  const [sortKey, setSortKey] = useState<keyof CagarBudayaItem>("no");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  // Filter state for Stats slide
  const [statFilter, setStatFilter] = useState<CagarBudayaStatus | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxFotos, setLightboxFotos] = useState<FotoBangunan[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");

  // Map focus state
  const [focusedBuildingId, setFocusedBuildingId] = useState<string | null>(null);

  // Total slides: Cover (0), Ledger (1), Map (2), Buildings (3 ... 3 + 35 - 1 = 37), Stats (38), Penutup (39)
  const totalSlides = 3 + items.length + 2;

  // Keyboard navigation
  const handleNext = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, totalSlides, onSlideChange]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, onSlideChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        onSlideChange(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onSlideChange(totalSlides - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onSlideChange, totalSlides]);

  // Jump to specific building slide
  const jumpToBuilding = (no: number) => {
    const index = items.findIndex((b) => b.no === no);
    if (index >= 0) {
      onSlideChange(3 + index);
    }
  };

  // Sorted items for ledger table
  const sortedItems = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * sortDir;
      }
      return String(va || "").localeCompare(String(vb || ""), "id") * sortDir;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const handleSort = (key: keyof CagarBudayaItem) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  // Open Lightbox for current building
  const openBuildingLightbox = (item: CagarBudayaItem, idx: number = 0) => {
    if (item.fotos && item.fotos.length > 0) {
      setLightboxFotos(item.fotos);
      setLightboxIdx(idx);
      setLightboxTitle(item.nama);
      setLightboxOpen(true);
    }
  };

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round(((currentSlideIndex + 1) / totalSlides) * 100)
  );

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between overflow-hidden">
      {/* Top Slide Progress Line */}
      <div className="w-full h-1 bg-[#1a1814] fixed top-[56px] left-0 z-30">
        <div
          className="h-full bg-gradient-to-r from-[#c8a24a] via-[#e6c875] to-[#c8a24a] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Slide Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        {/* ==================== SLIDE 0: COVER ==================== */}
        {currentSlideIndex === 0 && (
          <div className="w-full py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c8a24a]/40 bg-[#c8a24a]/10 text-[#e6c875] text-xs font-mono uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#c8a24a] animate-ping" />
                Daftar Status Bangunan Cagar Budaya
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#f2eee6] tracking-tight leading-none">
                Cagar Budaya <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8a24a] via-[#e6c875] to-[#f4d58d] italic">
                  GPIB
                </span>
              </h1>

              <div className="w-16 h-0.5 bg-[#c8a24a]" />

              <p className="text-sm sm:text-base text-[#b8ad9e] leading-relaxed max-w-xl font-light">
                Gereja Protestan di Indonesia bagian Barat — inventarisasi resmi{" "}
                <strong className="text-[#f2eee6] font-semibold">
                  {items.length} bangunan cagar budaya
                </strong>{" "}
                bersejarah beserta status penetapan, surat keputusan, narasi sejarah,
                galeri foto arsitektur, dan peta sebarannya di seluruh nusantara.
              </p>

              {/* Meta Stats Badges */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-3 py-1.5 rounded-lg border border-[#2c2822] bg-[#181714] text-[#e6c875]">
                  ✦ {padNumber(items.length)} BANGUNAN TERDATA
                </span>
                <span className="px-3 py-1.5 rounded-lg border border-[#2c2822] bg-[#181714] text-[#a89f91]">
                  NASIONAL · PROVINSI · KOTA · KABUPATEN
                </span>
                <span className="px-3 py-1.5 rounded-lg border border-[#2c2822] bg-[#181714] text-[#5a94d6]">
                  ● {items.filter((b) => b.lat && b.lng).length} TITIK PETA
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onSlideChange(1)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a24a] to-[#d4af37] text-[#11100e] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#c8a24a]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mulai Jelajah Slide ➔</span>
                </button>
                <button
                  onClick={() => onSlideChange(2)}
                  className="px-5 py-2.5 rounded-xl border border-[#2c2822] bg-[#181714] hover:border-[#c8a24a] text-[#f2eee6] text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#5a94d6]" />
                  <span>Buka Peta Sebaran</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#786f61] pt-2">
                PETUNJUK: TEKAN TOMBOL PANAH [←] [→] ATAU SPASI PADA PAPAN KETIK UNTUK NAVIGASI
              </div>
            </div>

            {/* Right Architectural Graphic */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-64 h-80 sm:w-80 sm:h-96 arch-frame p-6 flex flex-col items-center justify-center text-center">
                <svg className="w-full h-full text-[#c8a24a] opacity-80" viewBox="0 0 400 520" fill="none">
                  <path d="M60 500V240C60 120 140 40 200 40s140 80 140 200v260" stroke="currentColor" strokeWidth="2" />
                  <path d="M100 500V250c0-100 55-166 100-166s100 66 100 166v250" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                  <path d="M150 500V320c0-60 22-96 50-96s50 36 50 96v180" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  <circle cx="200" cy="150" r="22" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                  <path d="M200 8v30M186 21h28M20 500h360" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div className="absolute bottom-4 text-[10px] font-mono text-[#c8a24a] uppercase tracking-widest">
                  DEO GLORIA · GPIB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 1: DAFTAR ISI / LEDGER ==================== */}
        {currentSlideIndex === 1 && (
          <div className="w-full py-4 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#2c2822] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#c8a24a]">
                  Daftar Isi Lengkap
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f2eee6]">
                  Daftar Status Bangunan Cagar Budaya
                </h2>
              </div>
              <div className="text-xs text-[#a89f91] font-mono">
                {items.length} Bangunan Terdata · Klik baris untuk membuka slide
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto border border-[#2c2822] rounded-xl bg-[#141311] shadow-xl max-h-[60vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1c1a16] text-[#e6c875] sticky top-0 z-10 border-b border-[#2c2822] font-mono text-[11px]">
                  <tr>
                    <th 
                      onClick={() => handleSort("no")}
                      className="py-3 px-3 cursor-pointer hover:bg-[#25221d] w-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>No</span>
                        <ArrowUpDown className="w-3 h-3 text-[#786f61]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("nama")}
                      className="py-3 px-3 cursor-pointer hover:bg-[#25221d]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Jemaat</span>
                        <ArrowUpDown className="w-3 h-3 text-[#786f61]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("didirikan")}
                      className="py-3 px-3 cursor-pointer hover:bg-[#25221d]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Dibangun</span>
                        <ArrowUpDown className="w-3 h-3 text-[#786f61]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("status")}
                      className="py-3 px-3 cursor-pointer hover:bg-[#25221d]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3 text-[#786f61]" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Surat Keputusan (SK)</th>
                    <th 
                      onClick={() => handleSort("tglSK")}
                      className="py-3 px-3 cursor-pointer hover:bg-[#25221d]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Tanggal SK</span>
                        <ArrowUpDown className="w-3 h-3 text-[#786f61]" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Alamat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24211a]">
                  {sortedItems.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => jumpToBuilding(b.no)}
                      className="hover:bg-[#201d17] cursor-pointer transition-colors group text-[#d1c7b7]"
                    >
                      <td className="py-2.5 px-3 font-mono text-center text-[#c8a24a] group-hover:font-bold">
                        {padNumber(b.no)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#f2eee6] group-hover:text-[#e6c875]">
                        {b.nama}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#a89f91]">
                        {b.didirikan || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadgeClass(
                            b.status
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#a89f91] max-w-xs truncate">
                        {b.sk || "—"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#a89f91]">
                        {b.tglSK || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#a89f91] max-w-xs truncate">
                        {b.alamat || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 2: PETA SEBARAN ==================== */}
        {currentSlideIndex === 2 && (
          <div className="w-full py-4 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#2c2822] pb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5a94d6]">
                  Peta Interaktif
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f2eee6]">
                  Peta Sebaran Cagar Budaya GPIB
                </h2>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                {STATUS_LIST.map((st) => (
                  <span
                    key={st}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181714] border border-[#2c2822]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(st) }}
                    />
                    <span className="text-[#d1c7b7]">{st.toUpperCase()}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <MapInteractive
              items={items}
              focusedBuildingId={focusedBuildingId}
              onSelectBuilding={(id) => {
                const b = items.find((x) => x.id === id);
                if (b) jumpToBuilding(b.no);
              }}
              height="500px"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8273]">
              <span>SUMBER PETA: OPENSTREETMAP · KLIK MARKER UNTUK MELIHAT RINGKASAN & FOTO</span>
              <span>TOTAL TITIK TERPETAKAN: {items.filter((b) => b.lat && b.lng).length} DARI {items.length}</span>
            </div>
          </div>
        )}

        {/* ==================== SLIDES 3..N: BUILDING DETAIL ==================== */}
        {currentSlideIndex >= 3 && currentSlideIndex < 3 + items.length && (() => {
          const bIndex = currentSlideIndex - 3;
          const b = items[bIndex];
          if (!b) return null;

          const hasPhotos = b.fotos && b.fotos.length > 0;
          const currentPhoto = hasPhotos ? b.fotos[b.mainIdx || 0] || b.fotos[0] : null;

          return (
            <div className="w-full py-4 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Architectural Arch Photo Frame */}
                <div className="lg:col-span-5 space-y-3">
                  <div
                    onClick={() => hasPhotos && openBuildingLightbox(b, b.mainIdx || 0)}
                    className={`relative w-full aspect-[4/4.6] arch-frame gold-glow-animated group ${
                      hasPhotos ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Image / Placeholder */}
                    <div className="absolute inset-0 z-0">
                      <ArchImage
                        src={currentPhoto?.src}
                        title={b.nama}
                        no={b.no}
                        status={b.status}
                        didirikan={b.didirikan}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>

                    {/* Classic Bottom-Centered Plaque Badge (Never clipped by arch!) */}
                    <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-4 py-1 rounded-full bg-[#d4af37] text-[#0b0a08] text-[10px] font-mono tracking-widest font-bold uppercase shadow-lg">
                      NO. {padNumber(b.no)} · {b.status}
                    </div>
                  </div>

                  {/* Caption Outside Arch Frame (Never covers photo or gets clipped!) */}
                  {currentPhoto?.cap && (
                    <div className="bg-[#141310] border border-[#2c2822] rounded-xl p-3 text-center text-xs font-serif italic text-[#f3e5ab]">
                      “{currentPhoto.cap}”
                    </div>
                  )}

                  {/* Filmstrip thumbnails if multiple photos */}
                  {b.fotos && b.fotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {b.fotos.map((foto, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => openBuildingLightbox(b, fIdx)}
                          className="w-14 h-14 rounded-lg border border-[#2c2822] hover:border-[#c8a24a] overflow-hidden flex-shrink-0 cursor-pointer"
                        >
                          <img
                            src={foto.src}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Historical Narrative & Data Grid */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[#c8a24a] uppercase tracking-wider">
                        Inventaris Cagar Budaya #{padNumber(b.no)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#f2eee6] tracking-tight">
                      {b.nama}
                    </h2>
                  </div>

                  {/* Historical Narrative */}
                  <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311] space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#c8a24a] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Narasi Sejarah & Arsitektur</span>
                    </div>
                    {b.narasi ? (
                      <p className="text-sm text-[#d1c7b7] leading-relaxed font-light">
                        {b.narasi}
                      </p>
                    ) : (
                      <p className="text-xs italic text-[#786f61]">
                        Narasi sejarah belum ditambahkan. Admin dapat melengkapinya melalui panel admin.
                      </p>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-[#24211a] bg-[#161512]">
                      <div className="text-[10px] font-mono text-[#8c8273] uppercase mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#c8a24a]" />
                        <span>Dibangun / Didirikan</span>
                      </div>
                      <div className="font-semibold text-[#f2eee6]">
                        {b.didirikan || "—"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[#24211a] bg-[#161512]">
                      <div className="text-[10px] font-mono text-[#8c8273] uppercase mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#5a94d6]" />
                        <span>Tanggal Penetapan SK</span>
                      </div>
                      <div className="font-semibold text-[#f2eee6]">
                        {b.tglSK || "—"}
                      </div>
                    </div>

                    <div className="col-span-2 p-3 rounded-xl border border-[#24211a] bg-[#161512]">
                      <div className="text-[10px] font-mono text-[#8c8273] uppercase mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#52b788]" />
                        <span>Surat Keputusan (SK)</span>
                      </div>
                      <div className="font-semibold text-[#f2eee6] text-xs">
                        {b.sk || "—"}
                      </div>
                    </div>

                    {b.ket && (
                      <div className="col-span-2 p-3 rounded-xl border border-[#24211a] bg-[#161512]">
                        <div className="text-[10px] font-mono text-[#8c8273] uppercase mb-1 flex items-center gap-1">
                          <Info className="w-3 h-3 text-[#d97736]" />
                          <span>Keterangan Tambahan</span>
                        </div>
                        <div className="text-[#d1c7b7] text-xs">
                          {b.ket}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address & Coordinates */}
                  <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#a89f91] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5a94d6]" />
                        <span>Lokasi & Koordinat</span>
                      </div>
                      {b.lat && b.lng && (
                        <span className="text-[10px] font-mono text-[#52b788]">
                          ● Titik Terdaftar
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#f2eee6]">
                      {b.alamat || "Alamat belum tercatat lengkap"}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#22201c]">
                      <div className="font-mono text-[11px] text-[#786f61]">
                        {b.lat && b.lng ? `${b.lat}, ${b.lng}` : "Koordinat belum disetel"}
                      </div>
                      {b.lat && b.lng && (
                        <button
                          onClick={() => {
                            setFocusedBuildingId(b.id);
                            onSlideChange(2); // Jump to map slide
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#5a94d6]/15 hover:bg-[#5a94d6]/25 text-[#8eb8eb] border border-[#5a94d6]/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Lihat di Peta Sebaran</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ==================== SLIDE: REKAPITULASI STATS ==================== */}
        {currentSlideIndex === 3 + items.length && (() => {
          const counts: Record<string, number> = {
            Nasional: 0,
            Provinsi: 0,
            Kota: 0,
            Kabupaten: 0,
          };
          items.forEach((b) => {
            if (counts[b.status] !== undefined) counts[b.status]++;
          });
          const total = items.length || 1;

          const filteredList = statFilter
            ? items.filter((b) => b.status === statFilter)
            : items;

          return (
            <div className="w-full py-4 space-y-6 animate-fade-in">
              <div className="border-b border-[#2c2822] pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#52b788]">
                  Rekapitulasi Data
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f2eee6]">
                  Status Penetapan Cagar Budaya
                </h2>
                <p className="text-xs text-[#a89f91] mt-1">
                  Klik pada bar status untuk memfilter daftar bangunan di bawahnya.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Status Bar Chart */}
                <div className="md:col-span-7 space-y-3">
                  {STATUS_LIST.map((st) => {
                    const count = counts[st] || 0;
                    const percent = Math.round((count / total) * 100);
                    const isSelected = statFilter === st;

                    return (
                      <div
                        key={st}
                        onClick={() =>
                          setStatFilter((prev) => (prev === st ? null : st))
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#201d17] border-[#c8a24a]"
                            : "bg-[#141311] border-[#2c2822] hover:border-[#3d372c]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="text-[#f2eee6] font-semibold flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getStatusColor(st) }}
                            />
                            {st}
                          </span>
                          <span className="text-[#c8a24a]">
                            {count} Bangunan ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#201d18] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: getStatusColor(st),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Counter Box */}
                <div className="md:col-span-5 flex flex-col justify-between p-6 rounded-2xl border border-[#c8a24a]/30 bg-gradient-to-br from-[#181714] to-[#12110e]">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#c8a24a]">
                      Total Inventarisasi
                    </span>
                    <div className="text-5xl sm:text-6xl font-serif font-bold text-[#e6c875] my-2">
                      {padNumber(items.length)}
                    </div>
                    <div className="text-xs text-[#a89f91] leading-relaxed">
                      Gedung & situs bersejarah GPIB yang terdaftar dan terdokumentasi
                      sebagai cagar budaya oleh instansi berwenang.
                    </div>
                  </div>

                  {statFilter && (
                    <button
                      onClick={() => setStatFilter(null)}
                      className="mt-4 px-3 py-1.5 rounded-lg border border-[#3c362d] bg-[#201d17] text-xs text-[#e6c875] hover:bg-[#2c271f] transition-colors"
                    >
                      ✕ Reset Filter: Tampilkan Semua ({items.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered Building Mini List */}
              <div className="p-4 rounded-xl border border-[#2c2822] bg-[#141311]">
                <div className="text-xs font-mono text-[#a89f91] mb-3 flex items-center justify-between">
                  <span>
                    Daftar {statFilter ? `Status ${statFilter}` : "Seluruh Bangunan"} ({filteredList.length})
                  </span>
                  <span className="text-[10px]">Klik untuk membuka slide bangunan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {filteredList.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => jumpToBuilding(b.no)}
                      className="p-2 rounded-lg bg-[#181714] border border-[#24211a] hover:border-[#c8a24a] cursor-pointer text-xs flex items-center justify-between gap-2 group transition-colors"
                    >
                      <span className="truncate text-[#d1c7b7] group-hover:text-[#e6c875]">
                        <strong className="text-[#c8a24a] font-mono mr-1">
                          #{padNumber(b.no)}
                        </strong>
                        {b.nama}
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#6e6556] group-hover:text-[#c8a24a] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ==================== SLIDE: PENUTUP ==================== */}
        {currentSlideIndex === totalSlides - 1 && (
          <div className="w-full py-12 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c8a24a]/15 border border-[#c8a24a]/40 flex items-center justify-center text-[#e6c875]">
              <svg width="32" height="40" viewBox="0 0 17 22" fill="none">
                <path d="M1.5 21V10C1.5 4.5 5 1.5 8.5 1.5 12 1.5 15.5 4.5 15.5 10V21" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8.5 21v-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#c8a24a]">
                Dokumentasi & Preservasi
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f2eee6]">
                Melestarikan Warisan Sejarah GPIB
              </h2>
            </div>

            <p className="text-sm text-[#b8ad9e] leading-relaxed">
              Setiap gedung gereja cagar budaya adalah saksi perjalanan iman, sejarah
              arsitektur, dan kontribusi nyata Gereja Protestan di Indonesia bagian
              Barat bagi bangsa dan masyarakat Indonesia.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onSlideChange(0)}
                className="px-5 py-2.5 rounded-xl bg-[#c8a24a] text-[#11100e] font-semibold text-sm hover:brightness-110 shadow-lg cursor-pointer transition-all"
              >
                ↺ Kembali ke Awal
              </button>
              <button
                onClick={() => onSlideChange(1)}
                className="px-5 py-2.5 rounded-xl border border-[#2c2822] bg-[#181714] hover:border-[#c8a24a] text-[#f2eee6] text-sm cursor-pointer transition-all"
              >
                Daftar Isi Lengkap
              </button>
            </div>

            <div className="text-[11px] font-mono text-[#6e6556] pt-8 border-t border-[#22201c]">
              CAGAR BUDAYA GPIB · DEPARTEMEN DOKUMENTASI & INVENTARISASI
            </div>
          </div>
        )}
      </main>

      {/* Slide Navigation Dock */}
      <footer className="w-full border-t border-[#2c2822] bg-[#11100e]/95 backdrop-blur-md px-4 py-3 sticky bottom-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="px-3.5 py-1.5 rounded-lg border border-[#2c2822] bg-[#181714] text-[#d1c7b7] hover:border-[#c8a24a] hover:text-[#e6c875] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-mono transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Slide Indicator & Overview Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenOverview}
              className="text-xs font-mono text-[#e6c875] bg-[#221f19] border border-[#3c362c] px-3 py-1 rounded-md hover:bg-[#2e2a22] transition-colors"
              title="Klik untuk membuka ringkasan seluruh slide"
            >
              Slide {padNumber(currentSlideIndex + 1)} / {padNumber(totalSlides)}
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="px-3.5 py-1.5 rounded-lg border border-[#2c2822] bg-[#181714] text-[#d1c7b7] hover:border-[#c8a24a] hover:text-[#e6c875] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-mono transition-colors"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        fotos={lightboxFotos}
        initialIndex={lightboxIdx}
        buildingTitle={lightboxTitle}
      />
    </div>
  );
}

