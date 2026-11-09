-- ====================================================================
-- SKEMA DATABASE SUPABASE: CAGAR BUDAYA GPIB
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.bangunan_cagar_budaya (
  id TEXT PRIMARY KEY,
  no INTEGER NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  didirikan TEXT,
  tahun_didirikan INTEGER,
  status TEXT NOT NULL CHECK (status IN ('Nasional', 'Provinsi', 'Kota', 'Kabupaten')),
  sk TEXT,
  tgl_sk TEXT,
  ket TEXT,
  alamat TEXT,
  narasi TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  fit TEXT DEFAULT 'contain',
  main_idx INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bangunan_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bangunan_id TEXT REFERENCES public.bangunan_cagar_budaya(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  cap TEXT DEFAULT '',
  is_main BOOLEAN DEFAULT false,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bangunan_no ON public.bangunan_cagar_budaya(no);
CREATE INDEX IF NOT EXISTS idx_bangunan_status ON public.bangunan_cagar_budaya(status);
CREATE INDEX IF NOT EXISTS idx_bangunan_fotos_b_id ON public.bangunan_fotos(bangunan_id);

-- Row Level Security (RLS)
ALTER TABLE public.bangunan_cagar_budaya ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bangunan_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik can view cagar budaya"
  ON public.bangunan_cagar_budaya FOR SELECT
  USING (true);

CREATE POLICY "Publik can view fotos"
  ON public.bangunan_fotos FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert cagar budaya"
  ON public.bangunan_cagar_budaya FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update cagar budaya"
  ON public.bangunan_cagar_budaya FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete cagar budaya"
  ON public.bangunan_cagar_budaya FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage fotos"
  ON public.bangunan_fotos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
