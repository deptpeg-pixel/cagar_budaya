/**
 * ====================================================================
 * DESIGN TOKENS — PALET WARNA & STATUS CAGAR BUDAYA GPIB
 * ====================================================================
 * Token warna modular yang dipakai di seluruh komponen, peta, dan badge.
 */

export const colors = {
  // Brand Gold Palette (Warna Utama & Aksen GPIB)
  gold: {
    primary: "#d4af37",
    light: "#f3e5ab",
    dark: "#8a6e1d",
    surface: "rgba(212, 175, 55, 0.12)",
    border: "rgba(212, 175, 55, 0.35)",
    glow: "rgba(212, 175, 55, 0.3)",
  },

  // Semantic Status Penetapan Cagar Budaya
  status: {
    Nasional: {
      key: "Nasional",
      label: "Cagar Budaya Nasional",
      color: "#d4af37", // Gold
      badgeClass: "border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f3e5ab]",
      glowColor: "rgba(212, 175, 55, 0.4)",
    },
    Provinsi: {
      key: "Provinsi",
      label: "Cagar Budaya Provinsi",
      color: "#5a94d6", // Classical Blue
      badgeClass: "border-[#5a94d6]/50 bg-[#5a94d6]/15 text-[#8eb8eb]",
      glowColor: "rgba(90, 148, 214, 0.4)",
    },
    Kota: {
      key: "Kota",
      label: "Cagar Budaya Kota",
      color: "#52b788", // Heritage Green
      badgeClass: "border-[#52b788]/50 bg-[#52b788]/15 text-[#82e0aa]",
      glowColor: "rgba(82, 183, 136, 0.4)",
    },
    Kabupaten: {
      key: "Kabupaten",
      label: "Cagar Budaya Kabupaten",
      color: "#d97736", // Warm Terracotta / Amber
      badgeClass: "border-[#d97736]/50 bg-[#d97736]/15 text-[#f4a261]",
      glowColor: "rgba(217, 119, 54, 0.4)",
    },
  },

  // Dark & Light Surface Tokens
  surface: {
    dark: {
      background: "#0b0a08",
      card: "#141310",
      cardSubtle: "#181713",
      cardHover: "#201d17",
      border: "#28241e",
      borderHighlight: "#3d372c",
      textPrimary: "#f5f2eb",
      textSecondary: "#a89f91",
      textMuted: "#786f61",
    },
    light: {
      background: "#fbf9f4",
      card: "#ffffff",
      cardSubtle: "#f4f0e8",
      cardHover: "#eae4d8",
      border: "#e6ded3",
      borderHighlight: "#d5cabb",
      textPrimary: "#1c1916",
      textSecondary: "#5c5549",
      textMuted: "#8a8172",
    },
  },
} as const;

export type ColorStatusKey = keyof typeof colors.status;

export function getStatusToken(status: string) {
  if (status in colors.status) {
    return colors.status[status as ColorStatusKey];
  }
  return colors.status.Nasional;
}
