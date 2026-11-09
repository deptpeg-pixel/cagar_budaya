import { supabase, isSupabaseConfigured } from "./client";
import { CagarBudayaItem, FotoBangunan } from "@/lib/types";
import { INITIAL_CAGAR_BUDAYA } from "@/data/initialData";

const STORAGE_KEY = "cagar_budaya_gpib_data_v1";

export async function fetchAllBangunan(): Promise<CagarBudayaItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: bData, error: bError } = await supabase
        .from("bangunan_cagar_budaya")
        .select("*")
        .order("no", { ascending: true });

      if (bError) throw bError;

      if (bData && bData.length > 0) {
        // Fetch fotos
        const { data: fData } = await supabase
          .from("bangunan_fotos")
          .select("*")
          .order("urutan", { ascending: true });

        const fotosMap: Record<string, FotoBangunan[]> = {};
        (fData || []).forEach((f) => {
          if (!fotosMap[f.bangunan_id]) fotosMap[f.bangunan_id] = [];
          fotosMap[f.bangunan_id].push({
            id: f.id,
            src: f.src,
            cap: f.cap || "",
            isMain: f.is_main || false,
          });
        });

        return bData.map((b) => ({
          id: b.id,
          no: b.no,
          nama: b.nama,
          didirikan: b.didirikan || "",
          tahunDidirikan: b.tahun_didirikan,
          status: b.status,
          sk: b.sk || "",
          tglSK: b.tgl_sk || "",
          ket: b.ket || "",
          alamat: b.alamat || "",
          narasi: b.narasi || "",
          lat: b.lat,
          lng: b.lng,
          fotos: fotosMap[b.id] || [],
          mainIdx: b.main_idx || 0,
          fit: (b.fit as "contain" | "cover") || "contain",
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local data:", err);
    }
  }

  // Client-side fallback to localStorage or INITIAL_CAGAR_BUDAYA
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  return INITIAL_CAGAR_BUDAYA;
}

export async function saveBangunanItem(item: CagarBudayaItem): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("bangunan_cagar_budaya")
        .upsert({
          id: item.id,
          no: item.no,
          nama: item.nama,
          didirikan: item.didirikan,
          tahun_didirikan: item.tahunDidirikan,
          status: item.status,
          sk: item.sk,
          tgl_sk: item.tglSK,
          ket: item.ket,
          alamat: item.alamat,
          narasi: item.narasi,
          lat: item.lat,
          lng: item.lng,
          fit: item.fit || "contain",
          main_idx: item.mainIdx || 0,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan ke Supabase";
      return { success: false, error: msg };
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const current = await fetchAllBangunan();
      const existingIdx = current.findIndex((b) => b.id === item.id);
      let updated: CagarBudayaItem[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = item;
      } else {
        updated = [...current, item];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan ke localStorage";
      return { success: false, error: msg };
    }
  }

  return { success: false, error: "Lingkungan tidak mendukung penyimpanan" };
}

export async function deleteBangunanItem(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("bangunan_cagar_budaya")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus dari Supabase";
      return { success: false, error: msg };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const current = await fetchAllBangunan();
      const updated = current.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus dari localStorage";
      return { success: false, error: msg };
    }
  }

  return { success: false, error: "Gagal menghapus" };
}

export async function uploadBangunanFoto(
  bangunanId: string,
  file: File,
  caption: string = ""
): Promise<{ success: boolean; foto?: FotoBangunan; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${bangunanId}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cagar-budaya-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("cagar-budaya-photos")
        .getPublicUrl(uploadData.path);

      // Insert into bangunan_fotos
      const { data: insertData, error: insertError } = await supabase
        .from("bangunan_fotos")
        .insert({
          bangunan_id: bangunanId,
          src: publicUrl,
          cap: caption,
          is_main: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        success: true,
        foto: {
          id: insertData.id,
          src: insertData.src,
          cap: insertData.cap,
          isMain: insertData.is_main,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto ke Supabase Storage";
      return { success: false, error: msg };
    }
  }

  // Fallback: Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        success: true,
        foto: {
          id: "foto_" + Date.now(),
          src: reader.result as string,
          cap: caption,
          isMain: false,
        },
      });
    };
    reader.onerror = () => resolve({ success: false, error: "Gagal membaca file" });
    reader.readAsDataURL(file);
  });
}
