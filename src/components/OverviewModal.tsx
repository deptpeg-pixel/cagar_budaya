"use client";

import { useEffect } from "react";
import { X, Search } from "lucide-react";
import { CagarBudayaItem } from "@/lib/types";
import { getStatusBadgeClass, padNumber } from "@/lib/utils";
import { useState } from "react";

interface OverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CagarBudayaItem[];
  onSelectBuilding: (no: number) => void;
  onSelectSection: (section: "cover" | "ledger" | "map" | "stats") => void;
}

export default function OverviewModal({
  isOpen,
  onClose,
  items,
  onSelectBuilding,
  onSelectSection,
}: OverviewModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = items.filter(
    (b) =>
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.alamat.toLowerCase().includes(search.toLowerCase()) ||
      b.status.toLowerCase().includes(search.toLowerCase()) ||
      String(b.no).includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#141311] border border-[#2c2822] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#2c2822] flex items-center justify-between gap-4 bg-[#181714]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c8a24a]">
              Navigasi Cepat
            </span>
            <h2 className="text-xl font-serif font-bold text-[#f2eee6]">
              Ringkasan Slide & Bangunan
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a89f91]" />
              <input
                type="text"
                placeholder="Cari gereja / kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#100f0d] border border-[#2c2822] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f2eee6] placeholder-[#7d7568] focus:outline-none focus:border-[#c8a24a]"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#25221d] hover:bg-[#353028] text-[#d1c7b7] border border-[#3c362d] transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Quick Jump Pills */}
        <div className="px-5 py-3 border-b border-[#22201c] bg-[#12110f] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#8c8273] font-mono text-[11px]">Bagian:</span>
          <button
            onClick={() => {
              onSelectSection("cover");
              onClose();
            }}
            className="px-3 py-1 rounded bg-[#201d18] hover:bg-[#c8a24a] hover:text-[#11100e] text-[#d1c7b7] border border-[#2e2a22] transition-colors"
          >
            01. Sampul
          </button>
          <button
            onClick={() => {
              onSelectSection("ledger");
              onClose();
            }}
            className="px-3 py-1 rounded bg-[#201d18] hover:bg-[#c8a24a] hover:text-[#11100e] text-[#d1c7b7] border border-[#2e2a22] transition-colors"
          >
            02. Daftar Isi
          </button>
          <button
            onClick={() => {
              onSelectSection("map");
              onClose();
            }}
            className="px-3 py-1 rounded bg-[#201d18] hover:bg-[#c8a24a] hover:text-[#11100e] text-[#d1c7b7] border border-[#2e2a22] transition-colors"
          >
            03. Peta Sebaran
          </button>
          <button
            onClick={() => {
              onSelectSection("stats");
              onClose();
            }}
            className="px-3 py-1 rounded bg-[#201d18] hover:bg-[#c8a24a] hover:text-[#11100e] text-[#d1c7b7] border border-[#2e2a22] transition-colors"
          >
            Rekapitulasi
          </button>
        </div>

        {/* Buildings Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((b) => {
            const hasPhoto = b.fotos && b.fotos.length > 0;
            const photoSrc = hasPhoto ? b.fotos[0].src : null;
            return (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBuilding(b.no);
                  onClose();
                }}
                className="group relative bg-[#181714] border border-[#2c2822] hover:border-[#c8a24a] rounded-xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-[#c8a24a] font-bold">
                      #{padNumber(b.no)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[9px] ${getStatusBadgeClass(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-full h-20 rounded-lg bg-[#0e0d0c] border border-[#24211a] overflow-hidden mb-2 relative flex items-center justify-center">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={b.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-[10px] text-[#6d6455] text-center px-1">
                        Belum ada foto
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-semibold text-[#f2eee6] group-hover:text-[#e6c875] line-clamp-2 leading-tight">
                    {b.nama}
                  </h3>
                </div>

                <div className="text-[10px] text-[#8c8273] mt-2 truncate">
                  {b.didirikan || "Tahun —"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

