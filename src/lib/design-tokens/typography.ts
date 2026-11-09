/**
 * ====================================================================
 * DESIGN TOKENS — TIPOGRAFI MODULAR CAGAR BUDAYA GPIB
 * ====================================================================
 * Sistem tipografi terstruktur yang memadukan keanggunan klasik
 * (Fraunces Serif) dengan kemudahan baca modern (Plus Jakarta Sans)
 * dan ketepatan data historis (IBM Plex Mono).
 */

export const typography = {
  // 1. Font Family Definitive Mapping
  fonts: {
    serif: "var(--font-fraunces), Georgia, Cambria, 'Times New Roman', serif",
    sans: "var(--font-sans), 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    mono: "var(--font-mono), 'IBM Plex Mono', 'Courier New', monospace",
  },

  // 2. Preset Gaya Teks Modular (Composable Styles)
  styles: {
    // Judul Utama / Sampul / Teater Layar Lebar
    heroTitle: "font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f5f2eb] leading-tight",
    
    // Judul Bagian / Header Slide
    sectionTitle: "font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f2eb]",
    
    // Judul Kartu / Modal
    cardTitle: "font-serif text-base sm:text-lg font-bold text-[#f5f2eb] group-hover:text-[#f3e5ab] transition-colors",
    
    // Label Subtitle / Eyebrow (Khas Arsip / Editorial)
    eyebrow: "font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#d4af37] font-semibold",
    
    // Narasi Sejarah (Format Editorial Klasik yang nyaman dibaca)
    narrative: "font-sans text-xs sm:text-sm text-[#d4cbbe] leading-relaxed font-light",
    
    // Label Meta Data (Misal: "DIBANGUN / DIDIRIKAN", "SK NOMOR")
    metaLabel: "font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8a7f70] font-medium",
    
    // Nilai Meta Data (Misal: "Tahun 1839")
    metaValue: "font-sans text-xs sm:text-sm font-semibold text-[#f5f2eb]",
    
    // Plaque & Badge Token
    plaqueText: "font-mono text-[10px] uppercase tracking-widest font-bold",
    
    // Angka Metrik Raksasa (War Room KPI)
    metricCounter: "font-serif text-4xl sm:text-6xl font-bold text-[#f3e5ab] tracking-tight",
  },

  // 3. Tipografi Skala Responsif
  scale: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
  },
} as const;

export type TypographyPresetKey = keyof typeof typography.styles;
