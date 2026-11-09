"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  Layers,
  ArrowUpDown,
  Sparkles,
  Compass,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
  Eye
} from "lucide-react";
import { CagarBudayaItem, CagarBudayaStatus } from "@/lib/types";
import { getStatusBadgeClass, getStatusColor, padNumber } from "@/lib/utils";
import MapInteractive from "./MapInteractive";
import BuildingExhibitionModal from "./BuildingExhibitionModal";

interface CatalogViewProps {
  items: CagarBudayaItem[];
  onOpenDeckAt: (buildingNo: number) => void;
  onOpenMapAt: (buildingId: string) => void;
}

const STATUS_FILTERS: (CagarBudayaStatus | "Semua")[] = [
  "Semua",
  "Nasional",
  "Provinsi",
  "Kota",
  "Kabupaten",
];

const ERA_TABS = [
  {
    id: "all",
    label: "Seluruh Abad (1695–1950)",
    sub: "35 Monumen Bersejarah",
    desc: "Lintasan lengkap lebih dari tiga abad warisan arsitektur gereja di Indonesia.",
  },
  {
    id: "17",
    label: "Abad XVII (< 1700)",
    sub: "Era Barok & Portugis",
    desc: "Periode paling awal kekristenan di Nusantara dengan konstruksi batu bata tebal dan mimbar ukir Barok.",
  },
  {
    id: "18",
    label: "Abad XVIII (1700–1799)",
    sub: "Era Kubah Oktagonal",
    desc: "Ditandai dengan lahirnya mahakarya kubah tembaga Gereja Blenduk Semarang dan Gereja Tugu.",
  },
  {
    id: "19",
    label: "Abad XIX (1800–1899)",
    sub: "Era Klasikisme & Neo-Gotik",
    desc: "Zaman keemasan arsitektur rotunda Dorika (Willemskerk Jakarta) hingga gereja besi (Gereja Merah Probolinggo).",
  },
  {
    id: "20",
    label: "Abad XX (1900+)",
    sub: "Era Art Deco & Tropis",
    desc: "Perpaduan langgam Eropa modern dan adaptasi iklim tropis Nusantara karya arsitek ternama.",
  },
];

export default function CatalogView({
  items,
  onOpenDeckAt,
}: CatalogViewProps) {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<CagarBudayaStatus | "Semua">("Semua");
  const [activeEra, setActiveEra] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"no" | "nama" | "tahun">("no");

  // Spotlight hero carousel index
  const [heroIdx, setHeroIdx] = useState(0);

  // Selected building for Museum Exhibition Modal
  const [exhibitionBuilding, setExhibitionBuilding] = useState<CagarBudayaItem | null>(null);

  // Map focused building
  const [focusedMapId, setFocusedMapId] = useState<string | null>(null);

  // Featured iconic monuments for the Hero Spotlight
  const heroSpotlights = useMemo(() => {
    const featuredIds = ["b1", "b2", "b4", "b3", "b6", "b5"];
    const found = featuredIds
      .map((id) => items.find((b) => b.id === id))
      .filter(Boolean) as CagarBudayaItem[];
    return found.length > 0 ? found : items.slice(0, 5);
  }, [items]);

  // Auto-advance hero spotlight every 6 seconds
  useEffect(() => {
    if (heroSpotlights.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroSpotlights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSpotlights.length]);

  const currentHeroItem = heroSpotlights[heroIdx] || items[0];

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: items.length };
    items.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const result = items.filter((b) => {
      const matchStatus = activeStatus === "Semua" || b.status === activeStatus;

      let matchEra = true;
      if (activeEra !== "all") {
        const y = b.tahunDidirikan;
        if (!y) matchEra = false;
        else if (activeEra === "17") matchEra = y < 1700;
        else if (activeEra === "18") matchEra = y >= 1700 && y < 1800;
        else if (activeEra === "19") matchEra = y >= 1800 && y < 1900;
        else if (activeEra === "20") matchEra = y >= 1900;
      }

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.nama.toLowerCase().includes(q) ||
        b.alamat.toLowerCase().includes(q) ||
        b.sk.toLowerCase().includes(q) ||
        b.didirikan.toLowerCase().includes(q) ||
        b.narasi.toLowerCase().includes(q) ||
        String(b.no).includes(q);

      return matchStatus && matchEra && matchSearch;
    });

    result.sort((a, b) => {
      if (sortBy === "no") return a.no - b.no;
      if (sortBy === "nama") return a.nama.localeCompare(b.nama, "id");
      if (sortBy === "tahun") {
        return (a.tahunDidirikan || 9999) - (b.tahunDidirikan || 9999);
      }
      return 0;
    });

    return result;
  }, [items, activeStatus, activeEra, search, sortBy]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen exhibition-bg text-[#f5f2eb] relative overflow-hidden">
      {/* ==================== 1. MONUMENTAL HERO SECTION ==================== */}
      <section className="relative pt-8 pb-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Cathedral Light Beam Effect */}
        <div className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#d4af37]/15 via-[#d4af37]/5 to-transparent blur-3xl cathedral-beam" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#f3e5ab] font-semibold">
                Eksibisi Digital Warisan Nusantara · Sejak 1695
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-serif font-bold tracking-tight leading-[1.06] text-[#f5f2eb]">
              Menjelajahi Jejak Abadi{" "}
              <span className="shimmer-gold italic font-normal block sm:inline">
                Arsitektur & Iman
              </span>{" "}
              di Nusantara
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#c2b8a8] leading-relaxed font-light max-w-2xl">
              Dokumentasi kuratorial{" "}
              <strong className="text-[#f3e5ab] font-medium">
                {items.length} Bangunan Cagar Budaya GPIB
              </strong>{" "}
              yang membentang lebih dari tiga abad sejarah Indonesia — dari gereja Barok
              abad ke-17, rotunda Klasikisme Eropa, hingga langgam Art Deco tropis.
            </p>

            {/* Primary Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => scrollToSection("katalog-kurasi")}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e8c86b] to-[#c59b27] text-[#0b0a08] font-bold text-xs sm:text-sm shadow-xl shadow-[#d4af37]/25 hover:brightness-110 hover:scale-[1.02] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Jelajahi 35 Monumen Bersejarah</span>
              </button>

              <button
                onClick={() => onOpenDeckAt(1)}
                className="px-5 py-3.5 rounded-2xl border border-[#3a3327] bg-[#161410]/85 hover:border-[#d4af37] text-[#f5f2eb] hover:text-[#f3e5ab] text-xs sm:text-sm font-medium flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#d4af37]" />
                <span>Buka Mode Presentasi Slide</span>
              </button>

              <button
                onClick={() => scrollToSection("peta-nusantara")}
                className="px-4 py-3.5 rounded-2xl border border-[#2b261e] bg-[#12110e]/80 hover:border-[#5a94d6] text-[#c2b8a8] hover:text-white text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#5a94d6]" />
                <span>Peta Sebaran</span>
              </button>
            </div>

            {/* 4 Luxury Glass KPI Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#2c271e] bg-[#13110e]/80 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f3e5ab]">
                  1695
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] mt-0.5">
                  Situs Tertua (Sion)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#2c271e] bg-[#13110e]/80 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#d4af37]">
                  {padNumber(items.length)}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] mt-0.5">
                  Monumen Terdata
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#2c271e] bg-[#13110e]/80 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5a94d6]">
                  {items.filter((b) => b.lat && b.lng).length}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] mt-0.5">
                  Titik Koordinat GPS
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#2c271e] bg-[#13110e]/80 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#52b788]">
                  04
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] mt-0.5">
                  Tingkat Status SK
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive 3D Arch Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {currentHeroItem && (
              <div className="relative w-full max-w-md">
                {/* Floating Year Badge */}
                <div className="absolute -top-4 -right-2 z-20 px-4 py-1.5 rounded-full bg-[#14120e] border border-[#d4af37] shadow-xl flex items-center gap-2 animate-float">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-xs font-mono font-bold text-[#f3e5ab]">
                    {currentHeroItem.didirikan || "Abad Bersejarah"}
                  </span>
                </div>

                {/* Arch Frame Spotlight */}
                <div
                  onClick={() => setExhibitionBuilding(currentHeroItem)}
                  className="w-full aspect-[4/5] arch-frame gold-glow-animated cursor-pointer group overflow-hidden"
                >
                  {currentHeroItem.fotos?.[0]?.src && (
                    <img
                      src={currentHeroItem.fotos[0].src}
                      alt={currentHeroItem.nama}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/30 to-transparent" />

                  {/* Top Plaque inside Arch */}
                  <div className="absolute top-6 inset-x-0 flex justify-center">
                    <span className="px-3.5 py-1 rounded-full bg-[#090806]/80 backdrop-blur-md border border-[#d4af37]/50 text-[10px] font-mono uppercase tracking-widest text-[#f3e5ab] font-bold">
                      SOROTAN UTAMA · #{padNumber(currentHeroItem.no)}
                    </span>
                  </div>

                  {/* Bottom Details inside Arch */}
                  <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${getStatusBadgeClass(
                          currentHeroItem.status
                        )}`}
                      >
                        Status {currentHeroItem.status}
                      </span>
                      <span className="text-[11px] font-mono text-[#d4af37]">
                        {currentHeroItem.sk}
                      </span>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-white group-hover:text-[#f3e5ab] transition-colors">
                      {currentHeroItem.nama}
                    </h2>

                    <p className="text-xs text-[#d1c7b7] line-clamp-2 font-light">
                      {currentHeroItem.narasi}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#f3e5ab]">
                      <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Klik untuk Membuka Eksibisi</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                    </div>
                  </div>
                </div>

                {/* Carousel Selector Dots */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {heroSpotlights.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setHeroIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === heroIdx
                          ? "w-8 bg-[#d4af37]"
                          : "w-2 bg-[#332d22] hover:bg-[#6e624c]"
                      }`}
                      title={item.nama}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 2. INFINITE HISTORICAL TICKER RIBBON ==================== */}
      <div className="w-full border-y border-[#26221b] bg-[#100e0b]/95 py-3 overflow-hidden">
        <div className="animate-marquee flex items-center gap-8 text-xs font-mono text-[#a89f91]">
          {[...items.slice(0, 12), ...items.slice(0, 12)].map((b, i) => (
            <button
              key={`${b.id}-${i}`}
              onClick={() => setExhibitionBuilding(b)}
              className="flex items-center gap-2.5 hover:text-[#f3e5ab] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="text-[#d4af37]">✦</span>
              <span className="font-bold text-[#f5f2eb]">#{padNumber(b.no)}</span>
              <span>{b.nama.toUpperCase()}</span>
              <span className="px-2 py-0.5 rounded bg-[#1d1a14] border border-[#2e2920] text-[10px] text-[#d4af37]">
                {b.didirikan || b.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 3. LORONG WAKTU LINTAS ABAD (ERA EXPLORER) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Kronologi Sejarah Arsitektur</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#f5f2eb]">
              Perjalanan Lintas Empat Abad
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a89f91] max-w-md font-light">
            Pilih periode abad di bawah ini untuk menyaring bangunan berdasarkan masa
            berdirinya dan mengamati evolusi gaya arsitektur gereja di Indonesia.
          </p>
        </div>

        {/* Interactive Century Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ERA_TABS.map((era) => {
            const isSelected = activeEra === era.id;
            return (
              <div
                key={era.id}
                onClick={() => {
                  setActiveEra(era.id);
                  scrollToSection("katalog-kurasi");
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-[#241f15] to-[#16130d] border-[#d4af37] shadow-lg shadow-[#d4af37]/15 -translate-y-0.5"
                    : "bg-[#12110e] border-[#26221b] hover:border-[#453d30]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#d4af37] mb-1">
                    <span>{era.sub}</span>
                    {isSelected && <span>● Aktif</span>}
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#f5f2eb] mb-1.5">
                    {era.label}
                  </h3>
                  <p className="text-[11px] text-[#9c9283] leading-relaxed line-clamp-3">
                    {era.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#242019] flex items-center justify-between text-[11px] font-mono text-[#f3e5ab]">
                  <span>Filter Periode</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 4. CURATED ARCH GALLERY (35 MONUMENTS) ==================== */}
      <section
        id="katalog-kurasi"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
      >
        {/* Sticky Floating Glass Filter Dock */}
        <div className="sticky top-[62px] z-30 p-3 sm:p-4 rounded-2xl border border-[#302b22] bg-[#12110e]/90 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            {STATUS_FILTERS.map((st) => {
              const isAct = activeStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setActiveStatus(st)}
                  className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAct
                      ? "bg-[#d4af37] border-[#d4af37] text-[#0b0a08] font-bold shadow-md shadow-[#d4af37]/20"
                      : "bg-[#181612] border-[#28241d] text-[#d1c7b7] hover:border-[#453e31]"
                  }`}
                >
                  {st !== "Semua" && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isAct ? "#0b0a08" : getStatusColor(st),
                      }}
                    />
                  )}
                  <span>{st}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isAct ? "bg-black/20 text-[#0b0a08]" : "bg-[#221f19] text-[#a89f91]"
                    }`}
                  >
                    {statusCounts[st] || 0}
                  </span>
                </button>
              );
            })}

            {activeEra !== "all" && (
              <button
                onClick={() => setActiveEra("all")}
                className="px-3 py-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37] text-[#f3e5ab] text-xs font-mono whitespace-nowrap cursor-pointer"
              >
                Abad ke-{activeEra} ✕
              </button>
            )}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8273]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari gereja, kota, tahun, SK..."
                className="w-full bg-[#181612] border border-[#2c271f] rounded-xl pl-10 pr-8 py-2 text-xs text-[#f5f2eb] placeholder-[#706759] focus:outline-none focus:border-[#d4af37]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a89f91] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-[#181612] border border-[#2c271f] rounded-xl px-3 py-2 text-xs text-[#d1c7b7]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#d4af37]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "no" | "nama" | "tahun")}
                className="bg-transparent text-[#f5f2eb] focus:outline-none cursor-pointer font-medium"
              >
                <option value="no" className="bg-[#181714]">Urutan Inventaris</option>
                <option value="tahun" className="bg-[#181714]">Tahun Tertua</option>
                <option value="nama" className="bg-[#181714]">Abjad Nama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center border border-[#2c2822] rounded-3xl bg-[#12110e] space-y-4">
            <p className="text-lg font-serif text-[#d1c7b7]">
              Tidak ditemukan bangunan cagar budaya yang sesuai dengan filter Anda.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveStatus("Semua");
                setActiveEra("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#0b0a08] text-xs font-bold cursor-pointer"
            >
              Tampilkan Kembali Seluruh 35 Monumen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredItems.map((b) => {
              const photoSrc = b.fotos && b.fotos.length > 0 ? b.fotos[0].src : null;

              return (
                <div
                  key={b.id}
                  onClick={() => setExhibitionBuilding(b)}
                  className="group relative bg-[#12110e] border border-[#28241d] hover:border-[#d4af37]/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.12)] cursor-pointer"
                >
                  <div>
                    {/* Cathedral Arch Image Header */}
                    <div className="p-3 pb-0">
                      <div className="relative w-full aspect-[16/11] arch-card-top bg-[#0b0a08] border border-[#2e2920] group-hover:border-[#d4af37]/50 overflow-hidden">
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={b.nama}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs font-mono text-[#6e6556]">
                              Arsip Visual GPIB
                            </span>
                          </div>
                        )}

                        {/* Gradient Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12110e] via-transparent to-black/40" />

                        {/* Top Floating Badges */}
                        <div className="absolute top-3 inset-x-4 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-[#0b0a08]/85 backdrop-blur-md border border-[#d4af37]/50 text-[10px] font-mono text-[#f3e5ab] font-bold">
                            #{padNumber(b.no)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur-md font-semibold ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
                        </div>

                        {/* Year Pill at bottom-left of photo */}
                        <div className="absolute bottom-2.5 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0b0a08]/80 backdrop-blur-md border border-[#2e2920] text-[10px] font-mono text-[#d4af37]">
                          <Calendar className="w-3 h-3" />
                          <span>{b.didirikan || "Bersejarah"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 pt-4 space-y-3 relative">
                      {/* Subtle Ghost Number */}
                      <div className="pointer-events-none select-none absolute right-4 top-1 font-serif text-5xl font-bold text-[#d4af37]/5">
                        {padNumber(b.no)}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#f5f2eb] group-hover:text-[#f3e5ab] transition-colors line-clamp-1">
                        {b.nama}
                      </h3>

                      <p className="text-xs text-[#b0a695] line-clamp-2 leading-relaxed font-light">
                        {b.narasi ||
                          `Bangunan cagar budaya berstatus ${b.status} yang berlokasi di ${b.alamat}.`}
                      </p>

                      <div className="pt-2 space-y-1.5 text-[11px] text-[#8c8273] border-t border-[#1e1b16]">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-[#52b788] flex-shrink-0" />
                          <span className="truncate">{b.sk || "SK Terdaftar"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#5a94d6] flex-shrink-0" />
                          <span className="truncate">{b.alamat || "Indonesia"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2 border-t border-[#1c1914]">
                    <span className="text-xs font-mono text-[#d4af37] group-hover:text-[#f3e5ab] flex items-center gap-1.5 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Buka Eksibisi Detail</span>
                    </span>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onOpenDeckAt(b.no)}
                        className="px-2.5 py-1 rounded-lg bg-[#1d1a14] hover:bg-[#d4af37] text-[#d1c7b7] hover:text-[#0b0a08] border border-[#2e2920] text-[10px] font-mono transition-colors cursor-pointer"
                        title="Tampilkan dalam Mode Slide Presentasi"
                      >
                        Slide
                      </button>
                      {b.lat && b.lng && (
                        <button
                          onClick={() => {
                            setFocusedMapId(b.id);
                            scrollToSection("peta-nusantara");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1d1a14] hover:bg-[#5a94d6] text-[#d1c7b7] hover:text-[#0b0a08] border border-[#2e2920] text-[10px] font-mono transition-colors cursor-pointer"
                          title="Sorot Titik di Peta Nusantara"
                        >
                          Peta
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================== 5. INTERACTIVE NUSANTARA MAP SECTION ==================== */}
      <section
        id="peta-nusantara"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6"
      >
        <div className="p-6 sm:p-8 rounded-3xl border border-[#2e2920] bg-[#12110e]/90 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#242019] pb-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5a94d6] flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Kartografi Interaktif Nusantara</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#f5f2eb]">
                Peta Sebaran 35 Bangunan Cagar Budaya
              </h2>
            </div>

            {/* Status Legend Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              {(["Nasional", "Provinsi", "Kota", "Kabupaten"] as CagarBudayaStatus[]).map(
                (st) => (
                  <span
                    key={st}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181612] border border-[#2c271f]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(st) }}
                    />
                    <span className="text-[#d1c7b7]">{st}</span>
                  </span>
                )
              )}
            </div>
          </div>

          <MapInteractive
            items={items}
            focusedBuildingId={focusedMapId}
            height="540px"
            onSelectBuilding={(id) => {
              const found = items.find((b) => b.id === id);
              if (found) setExhibitionBuilding(found);
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#8c8273]">
            <span>
              ✦ KLIK PIN PADA PETA UNTUK MEMBUKA FOTO & EKSIBISI LENGKAP BANGUNAN
            </span>
            <span>
              TERPETAKAN: {items.filter((b) => b.lat && b.lng).length} DARI {items.length} MONUMEN
            </span>
          </div>
        </div>
      </section>

      {/* ==================== 6. LUXURY EDITORIAL FOOTER ==================== */}
      <footer className="border-t border-[#242019] bg-[#0a0907] py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3e5ab]">
                <Award className="w-4 h-4 text-[#d4af37]" />
              </div>
              <span className="font-serif font-bold text-base tracking-wider text-[#f5f2eb]">
                CAGAR BUDAYA · GPIB
              </span>
            </div>
            <p className="text-xs text-[#8c8273] max-w-md">
              Pelestarian dan inventarisasi resmi gedung gereja bersejarah Gereja
              Protestan di Indonesia bagian Barat sebagai warisan budaya bangsa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#a89f91]">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-[#f3e5ab] cursor-pointer"
            >
              ↑ Kembali ke Atas
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenDeckAt(1)}
              className="hover:text-[#f3e5ab] cursor-pointer"
            >
              Mode Slide Deck
            </button>
          </div>
        </div>
      </footer>

      {/* ==================== MUSEUM EXHIBITION MODAL ==================== */}
      <BuildingExhibitionModal
        building={exhibitionBuilding}
        allBuildings={items}
        onClose={() => setExhibitionBuilding(null)}
        onSelectBuilding={(b) => setExhibitionBuilding(b)}
        onFocusOnMap={(id) => {
          setFocusedMapId(id);
          scrollToSection("peta-nusantara");
        }}
      />
    </div>
  );
}
