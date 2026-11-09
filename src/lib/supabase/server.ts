import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pcwxtjfpbokwxhsyhyvi.supabase.co";

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const MEDIA_BUCKET = "cagar-budaya-photos";
export const CLOUD_DB_PATH = "database/cagar_budaya_v1.json";

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function ensureMediaBucket() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === MEDIA_BUCKET);
    if (!exists) {
      await supabase.storage.createBucket(MEDIA_BUCKET, {
        public: true,
        fileSizeLimit: 52428800, // 50 MB (menampung video & gambar)
      });
    } else {
      // Pastikan bucket update ke 50 MB
      await supabase.storage.updateBucket(MEDIA_BUCKET, {
        public: true,
        fileSizeLimit: 52428800,
      });
    }
  } catch (err) {
    console.warn("ensureMediaBucket warning:", err);
  }
  return supabase;
}

