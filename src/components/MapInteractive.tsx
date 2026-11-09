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
  const markersRef = useRef<Record<string, any>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Avoid reinitializing if already exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered around Java / Indonesia
      const initialCenter: [number, number] = [-2.5489, 118.0149]; // Center of Indonesia
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoomLevel,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon generator
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
              transition: transform 0.2s ease;
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

      const validItems = items.filter(
        (b) => b.lat !== null && b.lng !== null && !isNaN(b.lat) && !isNaN(b.lng)
      );

      const markersMap: Record<string, any> = {};
      const latLngs: [number, number][] = [];

      validItems.forEach((b) => {
        const lat = b.lat as number;
        const lng = b.lng as number;
        latLngs.push([lat, lng]);

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(b.status, b.id === focusedBuildingId),
          title: b.nama,
        }).addTo(map);

        // Custom Popup Content
        const photoUrl = b.fotos && b.fotos[0]?.src ? b.fotos[0].src : null;
        const popupContent = document.createElement("div");
        popupContent.className = "text-[#11100e] p-1 font-sans";
        popupContent.style.minWidth = "220px";
        popupContent.innerHTML = `
          ${
            photoUrl
              ? `<img src="${photoUrl}" alt="${b.nama}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
              : ""
          }
          <div style="font-size:10px;text-transform:uppercase;font-weight:700;color:${getStatusColor(
            b.status
          )};letter-spacing:1px;margin-bottom:2px;">
            ${b.status} · NO. ${String(b.no).padStart(2, "0")}
          </div>
          <div style="font-weight:700;font-size:14px;color:#181714;line-height:1.2;margin-bottom:4px;">
            ${b.nama}
          </div>
          <div style="font-size:11px;color:#5c5549;margin-bottom:6px;">
            ${b.alamat || "Alamat belum tercatat"}
          </div>
          <button id="btn-popup-${b.id}" style="
            width: 100%;
            background: #c8a24a;
            color: #11100e;
            font-weight: 600;
            font-size: 11px;
            padding: 6px 10px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            margin-top: 4px;
          ">
            Buka Detail Gedung ➔
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-popup-${b.id}`);
          if (btn && onSelectBuilding) {
            btn.onclick = () => {
              onSelectBuilding(b.id);
            };
          }
        });

        markersMap[b.id] = marker;
      });

      markersRef.current = markersMap;

      // If there's a focused building, zoom into it
      if (focusedBuildingId && markersMap[focusedBuildingId]) {
        const focusedMarker = markersMap[focusedBuildingId];
        const latLng = focusedMarker.getLatLng();
        map.setView(latLng, 14, { animate: true });
        focusedMarker.openPopup();
      } else if (latLngs.length > 0) {
        map.fitBounds(latLngs, { padding: [40, 40] });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, items, focusedBuildingId, onSelectBuilding, zoomLevel]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-[#2c2822] bg-[#141311] ${className}`}>
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
