"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  ExternalLink, 
  SlidersHorizontal,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { CagarBudayaItem, CagarBudayaStatus } from "@/lib/types";
import { getStatusBadgeClass, padNumber } from "@/lib/utils";

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

export default function CatalogView({
  items,
  onOpenDeckAt,
  onOpenMapAt,
}: CatalogViewProps) {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<CagarBudayaStatus | "Semua">("Semua");
  const [sortBy, setSortBy] = useState<"no" | "nama" | "tahun">("no");
  const [selectedBuilding, setSelectedBuilding] = useState<CagarBudayaItem | null>(null);

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
    let result = items.filter((b) => {
      const matchStatus = activeStatus === "Semua" || b.status === activeStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.nama.toLowerCase().includes(q) ||
        b.alamat.toLowerCase().includes(q) ||
        b.sk.toLowerCase().includes(q) ||
        b.didirikan.toLowerCase().includes(q) ||
        String(b.no).includes(q);

      return matchStatus && matchSearch;
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
  }, [items, activeStatus, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header & Search Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2c2822] pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#c8a24a] mb-1">
              Katalog Lengkap · GPIB Heritage
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f2eee6]">
              Inventaris Bangunan Cagar Budaya
            </h1>
            <p className="text-sm text-[#a89f91] mt-1 max-w-2xl font-light">
              Jelajahi dokumentasi 35 gedung gereja bersejarah GPIB yang telah
              ditetapkan sebagai Cagar Budaya Nasional, Provinsi, Kota, dan Kabupaten.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#e6c875] bg-[#1d1b17] border border-[#2c2822] px-3 py-1.5 rounded-lg">
              {filteredItems.length} dari {items.length} Bangunan
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                  activeStatus === st
                    ? "bg-[#c8a24a] border-[#c8a24a] text-[#11100e] font-semibold shadow-sm"
                    : "bg-[#181714] border-[#2c2822] text-[#d1c7b7] hover:border-[#3d372c]"
                }`}
              >
                {st} ({statusCounts[st] || 0})
              </button>
            ))}
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d7568]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama gereja, kota, SK..."
                className="w-full bg-[#161512] border border-[#2c2822] rounded-xl pl-9 pr-4 py-2 text-xs text-[#f2eee6] placeholder-[#6d6455] focus:outline-none focus:border-[#c8a24a]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c8273] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-[#161512] border border-[#2c2822] rounded-xl px-2.5 py-1.5 text-xs text-[#d1c7b7]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#c8a24a]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#f2eee6] focus:outline-none cursor-pointer"
              >
                <option value="no" className="bg-[#181714]">No. Inventaris</option>
                <option value="nama" className="bg-[#181714]">Nama Gereja</option>
                <option value="tahun" className="bg-[#181714]">Tahun Didirikan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border border-[#2c2822] rounded-2xl bg-[#141311] space-y-3">
          <p className="text-base text-[#a89f91]">
            Tidak ada bangunan cagar budaya yang cocok dengan pencarian & filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveStatus("Semua");
            }}
            className="px-4 py-2 rounded-xl bg-[#c8a24a] text-[#11100e] text-xs font-semibold cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((b) => {
            const hasPhotos = b.fotos && b.fotos.length > 0;
            const photoSrc = hasPhotos ? b.fotos[0].src : null;

            return (
              <div
                key={b.id}
                className="group bg-[#141311] border border-[#2c2822] hover:border-[#c8a24a] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c8a24a]/5"
              >
                <div>
                  {/* Photo Header with Arch effect */}
                  <div className="relative w-full aspect-[16/10] bg-[#0e0d0b] border-b border-[#24211a] overflow-hidden flex items-center justify-center">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={b.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg
                          className="w-12 h-12 mx-auto text-[#c8a24a] opacity-30 mb-1"
                          viewBox="0 0 120 120"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        >
                          <path d="M20 100V58c0-22 17-38 40-38s40 16 40 38v42" />
                          <path d="M42 100V72c0-11 8-19 18-19s18 8 18 19v28" />
                          <path d="M60 20V8M52 14h16" />
                          <path d="M10 100h100" />
                        </svg>
                        <span className="text-[10px] font-mono text-[#6e6556]">
                          Foto belum tersedia
                        </span>
                      </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-[#11100e]/85 backdrop-blur-sm border border-[#c8a24a]/50 text-[10px] font-mono text-[#e6c875] font-bold">
                        #{padNumber(b.no)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-sm ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#f2eee6] group-hover:text-[#e6c875] transition-colors line-clamp-1">
                      {b.nama}
                    </h3>

                    {/* Metadata chips */}
                    <div className="space-y-1.5 text-xs text-[#a89f91]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#c8a24a] flex-shrink-0" />
                        <span>Didirikan: <strong className="text-[#d1c7b7]">{b.didirikan || "—"}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#52b788] flex-shrink-0" />
                        <span className="truncate">SK: {b.sk || "—"}</span>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#5a94d6] flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[#7d7568] line-clamp-2">
                          {b.alamat || "Alamat belum tercatat"}
                        </span>
                      </div>
                    </div>

                    {/* Narrative snippet */}
                    {b.narasi && (
                      <p className="text-xs text-[#8c8273] line-clamp-2 italic pt-1 border-t border-[#201d18]">
                        “{b.narasi}”
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-0 border-t border-[#1c1a16] grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => onOpenDeckAt(b.no)}
                    className="w-full py-2 px-3 rounded-xl bg-[#c8a24a]/10 hover:bg-[#c8a24a] text-[#e6c875] hover:text-[#11100e] border border-[#c8a24a]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mode Slide</span>
                  </button>

                  <button
                    onClick={() => onOpenMapAt(b.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#181714] hover:bg-[#25221d] text-[#d1c7b7] border border-[#2c2822] hover:border-[#5a94d6] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#5a94d6]" />
                    <span>Lihat Peta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

