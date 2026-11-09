"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { FotoBangunan } from "@/lib/types";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotos: FotoBangunan[];
  initialIndex?: number;
  buildingTitle?: string;
}

export default function LightboxModal({
  isOpen,
  onClose,
  fotos,
  initialIndex = 0,
  buildingTitle = "",
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isContain, setIsContain] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, fotos]);

  if (!isOpen || !fotos || fotos.length === 0) return null;

  const currentFoto = fotos[currentIndex] || fotos[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : fotos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < fotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Top Bar */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between text-[#f2eee6] z-10">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#c8a24a]">
            {buildingTitle}
          </div>
          <div className="text-sm font-medium text-[#d1c7b7]">
            Foto {currentIndex + 1} dari {fotos.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsContain(!isContain)}
            className="p-2 rounded-lg bg-[#25221d]/80 hover:bg-[#353028] text-[#e6c875] border border-[#3c362d] transition-colors"
            title={isContain ? "Tampilan Penuh (Cover)" : "Tampilan Pas (Contain)"}
          >
            {isContain ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#25221d]/80 hover:bg-[#353028] text-white border border-[#3c362d] transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative w-full h-[75vh] max-w-6xl mx-auto flex items-center justify-center px-12">
        <img
          src={currentFoto.src}
          alt={currentFoto.cap || buildingTitle}
          className={`max-h-full max-w-full rounded-lg shadow-2xl transition-all duration-300 ${
            isContain ? "object-contain" : "object-cover h-full w-full"
          }`}
        />

        {/* Prev / Next buttons */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 p-3 rounded-full bg-[#181714]/80 hover:bg-[#c8a24a] hover:text-[#11100e] text-[#f2eee6] border border-[#2c2822] transition-colors"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 p-3 rounded-full bg-[#181714]/80 hover:bg-[#c8a24a] hover:text-[#11100e] text-[#f2eee6] border border-[#2c2822] transition-colors"
              title="Foto Berikutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Caption */}
      <div className="absolute bottom-6 inset-x-8 text-center max-w-3xl mx-auto">
        {currentFoto.cap && (
          <p className="text-sm font-serif italic text-[#e6c875] bg-[#1a1814]/80 border border-[#2c2822] py-2 px-5 rounded-full inline-block backdrop-blur-sm shadow-lg">
            “{currentFoto.cap}”
          </p>
        )}
      </div>
    </div>
  );
}
