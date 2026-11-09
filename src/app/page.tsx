"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import DeckView from "@/components/DeckView";
import CatalogView from "@/components/CatalogView";
import OverviewModal from "@/components/OverviewModal";
import { CagarBudayaItem } from "@/lib/types";
import { fetchAllBangunan } from "@/lib/supabase/service";
import { INITIAL_CAGAR_BUDAYA } from "@/data/initialData";

export default function HomePage() {
  const [items, setItems] = useState<CagarBudayaItem[]>(INITIAL_CAGAR_BUDAYA);
  // Default to the Luxury Exhibition / Catalog Experience ("grid") for maximum "Stop Scrolling" impact
  const [viewMode, setViewMode] = useState<"deck" | "grid">("grid");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // Load latest data from Supabase or local storage
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAllBangunan();
        if (data && data.length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.error("Error loading cagar budaya data:", err);
      }
    }
    loadData();
  }, []);

  // Jump to specific slide kind
  const handleJumpToSlide = (
    kind: "cover" | "ledger" | "map" | "stats" | number
  ) => {
    setViewMode("deck");
    if (kind === "cover") setCurrentSlideIndex(0);
    else if (kind === "ledger") setCurrentSlideIndex(1);
    else if (kind === "map") setCurrentSlideIndex(2);
    else if (kind === "stats") setCurrentSlideIndex(3 + items.length);
    else if (typeof kind === "number") setCurrentSlideIndex(kind);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Jump to specific building slide
  const handleOpenBuildingInDeck = (buildingNo: number) => {
    const idx = items.findIndex((b) => b.no === buildingNo);
    if (idx >= 0) {
      setViewMode("deck");
      setCurrentSlideIndex(3 + idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Jump to Map slide focusing on building
  const handleOpenMapAt = () => {
    setViewMode("deck");
    setCurrentSlideIndex(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080706] text-[#f5f2eb] grain-overlay">
      {/* Navigation Bar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onJumpToSlide={handleJumpToSlide}
        onOpenOverview={() => setOverviewOpen(true)}
      />

      {/* Main View Mode Content */}
      <div className="flex-1">
        {viewMode === "grid" ? (
          <CatalogView
            items={items}
            onOpenDeckAt={handleOpenBuildingInDeck}
            onOpenMapAt={handleOpenMapAt}
          />
        ) : (
          <DeckView
            items={items}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            onOpenOverview={() => setOverviewOpen(true)}
          />
        )}
      </div>

      {/* Quick Overview Modal */}
      <OverviewModal
        isOpen={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        items={items}
        onSelectBuilding={(buildingNo) => {
          handleOpenBuildingInDeck(buildingNo);
        }}
        onSelectSection={(sec) => {
          handleJumpToSlide(sec);
        }}
      />
    </div>
  );
}
