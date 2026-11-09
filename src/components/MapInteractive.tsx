"use client";

import { useEffect, useRef, useState } from "react";
import { CagarBudayaItem } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface MapInteractiveProps {
  items: CagarBudayaItem[];
  onSelectBuilding?: (id: string) => void;
  focusedBuildingId?: string | null;
  className?: string;
  zoomLevel?: number;
  height?: string;
}

export default function MapInteractive({
  items,
  onSelectBuilding,
  focusedBuildingId,
  className = "",
  zoomLevel = 5,
  height = "520px",
}: MapInteractiveProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const onSelectRef = useRef(onSelectBuilding);
  const [isClient, setIsClient] = useState(false);

  // Keep latest callback in ref so we never re-create the map when parent re-renders
  useEffect(() => {
    onSelectRef.current = onSelectBuilding;
  }, [onSelectBuilding]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 1. Initialize Leaflet Map ONLY ONCE on mount
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Guard if container already has a leaflet map attached
      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        return;
      }

      const initialCenter: [number, number] = [-2.5489, 118.0149];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoomLevel,
        zoomControl: true,
        scrollWheelZoom: true,
        zoomAnimation: false, // Prevents _leaflet_pos race condition on rapid state changes
        fadeAnimation: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;

      renderMarkers(L, map, layerGroup, items, focusedBuildingId);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors if DOM already detached
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        markersRef.current = {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // 2. Update markers only when `items` data changes
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      renderMarkers(
        L,
        mapInstanceRef.current,
        markersLayerRef.current,
        items,
        focusedBuildingId
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // 3. Pan/focus when `focusedBuildingId` changes WITHOUT destroying map
  useEffect(() => {
    if (!focusedBuildingId || !mapInstanceRef.current) return;
    const targetMarker = markersRef.current[focusedBuildingId];
    if (targetMarker) {
      try {
        const latLng = targetMarker.getLatLng();
        mapInstanceRef.current.setView(latLng, 14, { animate: false });
        targetMarker.openPopup();
      } catch {
        // Ignore if map not ready
      }
    }
  }, [focusedBuildingId]);

  function renderMarkers(
    L: any,
    map: any,
    layerGroup: any,
    dataItems: CagarBudayaItem[],
    focusId?: string | null
  ) {
    layerGroup.clearLayers();
    const markersMap: Record<string, any> = {};
    const latLngs: [number, number][] = [];

    const createCustomIcon = (status: string, isFocused: boolean = false) => {
      const color = getStatusColor(status);
      const size = isFocused ? 36 : 28;
      return L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });
    };

    const validItems = dataItems.filter(
      (b) => b.lat !== null && b.lng !== null && !isNaN(b.lat) && !isNaN(b.lng)
    );

    validItems.forEach((b) => {
      const lat = b.lat as number;
      const lng = b.lng as number;
      latLngs.push([lat, lng]);

      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(b.status, b.id === focusId),
        title: b.nama,
      }).addTo(layerGroup);

      const photoUrl = b.fotos && b.fotos[0]?.src ? b.fotos[0].src : null;
      const popupContent = document.createElement("div");
      popupContent.className = "p-1 font-sans";
      popupContent.style.minWidth = "220px";
      popupContent.innerHTML = `
        ${
          photoUrl
            ? `<img src="${photoUrl}" alt="" onerror="this.style.display='none'" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
            : ""
        }
        <div style="font-size:10px;text-transform:uppercase;font-weight:700;color:${getStatusColor(
          b.status
        )};letter-spacing:1px;margin-bottom:2px;">
          ${b.status} · NO. ${String(b.no).padStart(2, "0")}
        </div>
        <div style="font-weight:700;font-size:14px;color:var(--foreground);line-height:1.25;margin-bottom:4px;">
          ${b.nama}
        </div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">
          ${b.alamat || "Alamat belum tercatat"}
        </div>
        <button id="btn-popup-${b.id}" style="
          width: 100%;
          background: #d4af37;
          color: #0b0a08;
          font-weight: 700;
          font-size: 11px;
          padding: 7px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        ">
          Buka Detail Gedung ➔
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-popup-${b.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectRef.current) {
              onSelectRef.current(b.id);
            }
          };
        }
      });

      markersMap[b.id] = marker;
    });

    markersRef.current = markersMap;

    if (focusId && markersMap[focusId]) {
      const focusedMarker = markersMap[focusId];
      const latLng = focusedMarker.getLatLng();
      map.setView(latLng, 14, { animate: false });
      focusedMarker.openPopup();
    } else if (latLngs.length > 0) {
      map.fitBounds(latLngs, { padding: [40, 40], animate: false });
    }
  }

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#2c2822] bg-[#141311] ${className}`}
    >
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="z-10"
      />
      {!isClient && (
        <div
          style={{ height }}
          className="w-full flex items-center justify-center text-[#a89f91] text-xs font-mono"
        >
          Memuat Peta Sebaran Cagar Budaya...
        </div>
      )}
    </div>
  );
}
