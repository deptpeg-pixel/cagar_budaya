import { CagarBudayaItem, FotoBangunan } from "@/lib/types";
import { INITIAL_CAGAR_BUDAYA } from "@/data/initialData";

const STORAGE_KEY = "cagar_budaya_gpib_data_v3";

function mergeWithFallbackPhotos(items: CagarBudayaItem[]): CagarBudayaItem[] {
  return items.map((item) => {
    const fallback = INITIAL_CAGAR_BUDAYA.find(
      (f) => f.id === item.id || f.no === item.no
    );
    const validFotos = (item.fotos || []).filter(
      (f) => f.src && !f.src.includes("upload.wikimedia.org")
    );
    return {
      ...fallback,
      ...item,
      fotos: validFotos.length > 0 ? validFotos : fallback?.fotos || [],
    };
  });
}

export async function fetchAllBangunan(): Promise<CagarBudayaItem[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/cagar-budaya", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const merged = mergeWithFallbackPhotos(data.items);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn("Cloud API fetch failed, using local fallback:", err);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithFallbackPhotos(parsed);
        }
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  return INITIAL_CAGAR_BUDAYA;
}

export async function saveBangunanItem(
  item: CagarBudayaItem
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/cagar-budaya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Gagal menyimpan ke Supabase Cloud",
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal terhubung ke server";
      return { success: false, error: msg };
    }
  }

  return { success: false, error: "Lingkungan tidak mendukung penyimpanan" };
}

export async function deleteBangunanItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(
        `/api/cagar-budaya?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Gagal menghapus dari Supabase Cloud",
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus dari server";
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
  if (typeof window !== "undefined") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bangunanId", bangunanId);
      formData.append("caption", caption);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.foto) {
        return {
          success: true,
          foto: data.foto,
        };
      }
      return {
        success: false,
        error: data.error || "Gagal mengunggah media ke Supabase Storage",
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengunggah media ke Supabase Storage";
      return { success: false, error: msg };
    }
  }

  return { success: false, error: "Gagal mengunggah media" };
}

export async function seedInitialDataToSupabase(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/cagar-budaya", { method: "PUT" });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(INITIAL_CAGAR_BUDAYA)
        );
        return { success: true, count: data.count };
      }
      return {
        success: false,
        error: data.error || "Gagal menyinkronkan data ke Supabase",
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyinkronkan data ke Supabase";
      return { success: false, error: msg };
    }
  }

  return { success: false, error: "Gagal menyinkronkan data" };
}
