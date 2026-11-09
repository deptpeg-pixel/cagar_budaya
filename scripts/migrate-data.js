const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../legacy/data/cagar_budaya_data.js'), 'utf8');
const fakeWindow = {};
const fn = new Function('window', code);
fn(fakeWindow);
const rawData = fakeWindow.CAGAR_BUDAYA_DATA || [];

const formattedData = rawData.map((item) => {
  const yearMatch = (item.didirikan || '').match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
  return {
    id: 'b' + item.no,
    no: item.no,
    nama: item.nama || '',
    didirikan: item.didirikan || '',
    tahunDidirikan: year,
    status: item.status || 'Nasional',
    sk: item.sk || '',
    tglSK: item.tglSK || '',
    ket: item.ket || '',
    alamat: item.alamat || '',
    narasi: item.narasi || '',
    lat: (typeof item.lat === 'number' && !isNaN(item.lat)) ? item.lat : null,
    lng: (typeof item.lng === 'number' && !isNaN(item.lng)) ? item.lng : null,
    fotos: item.fotos || [],
    mainIdx: item.mainIdx || 0,
    fit: item.fit || 'contain'
  };
});

// Ensure data dir
const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Write src/data/initialData.ts
const tsContent = `import { CagarBudayaItem } from "@/lib/types";

export const INITIAL_CAGAR_BUDAYA: CagarBudayaItem[] = ${JSON.stringify(formattedData, null, 2)};
`;

fs.writeFileSync(path.join(dataDir, 'initialData.ts'), tsContent, 'utf8');
console.log('✓ Generated src/data/initialData.ts with', formattedData.length, 'records');

// Ensure supabase dir
const supabaseDir = path.join(__dirname, '../supabase');
if (!fs.existsSync(supabaseDir)) fs.mkdirSync(supabaseDir, { recursive: true });

// Generate schema.sql
const schemaSql = `-- ====================================================================
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
`;

fs.writeFileSync(path.join(supabaseDir, 'schema.sql'), schemaSql, 'utf8');
console.log('✓ Generated supabase/schema.sql');

function sqlEsc(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let seedSql = `-- ====================================================================
-- SEED DATA 35 BANGUNAN CAGAR BUDAYA GPIB
-- ====================================================================

INSERT INTO public.bangunan_cagar_budaya (
  id, no, nama, didirikan, tahun_didirikan, status, sk, tgl_sk, ket, alamat, narasi, lat, lng, fit, main_idx
) VALUES
`;

const values = formattedData.map(b => {
  return `  (${sqlEsc(b.id)}, ${b.no}, ${sqlEsc(b.nama)}, ${sqlEsc(b.didirikan)}, ${b.tahunDidirikan ?? 'NULL'}, ${sqlEsc(b.status)}, ${sqlEsc(b.sk)}, ${sqlEsc(b.tglSK)}, ${sqlEsc(b.ket)}, ${sqlEsc(b.alamat)}, ${sqlEsc(b.narasi)}, ${b.lat ?? 'NULL'}, ${b.lng ?? 'NULL'}, ${sqlEsc(b.fit)}, ${b.mainIdx || 0})`;
});

seedSql += values.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  didirikan = EXCLUDED.didirikan,
  status = EXCLUDED.status,
  sk = EXCLUDED.sk,
  tgl_sk = EXCLUDED.tgl_sk,
  ket = EXCLUDED.ket,
  alamat = EXCLUDED.alamat,
  narasi = EXCLUDED.narasi,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;
`;

fs.writeFileSync(path.join(supabaseDir, 'seed.sql'), seedSql, 'utf8');
console.log('✓ Generated supabase/seed.sql');
