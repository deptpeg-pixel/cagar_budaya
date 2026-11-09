import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  ensureMediaBucket,
  MEDIA_BUCKET,
  CLOUD_DB_PATH,
} from "@/lib/supabase/server";
import { INITIAL_CAGAR_BUDAYA } from "@/data/initialData";
import { CagarBudayaItem, FotoBangunan } from "@/lib/types";

export const dynamic = "force-dynamic";

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

async function readCloudStorageDB(): Promise<CagarBudayaItem[] | null> {
  const supabase = await ensureMediaBucket();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .download(CLOUD_DB_PATH);

    if (error || !data) return null;

    const text = await data.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return mergeWithFallbackPhotos(parsed);
    }
  } catch {
    // Ignore if file doesn't exist yet
  }
  return null;
}

async function writeCloudStorageDB(items: CagarBudayaItem[]): Promise<boolean> {
  const supabase = await ensureMediaBucket();
  if (!supabase) return false;

  try {
    const sorted = [...items].sort((a, b) => a.no - b.no);
    const jsonBuffer = Buffer.from(JSON.stringify(sorted, null, 2), "utf-8");

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(CLOUD_DB_PATH, jsonBuffer, {
        contentType: "application/json",
        cacheControl: "0",
        upsert: true,
      });

    return !error;
  } catch (err) {
    console.error("writeCloudStorageDB error:", err);
    return false;
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      source: "initial",
      items: INITIAL_CAGAR_BUDAYA,
    });
  }

  // 1. Try reading from PostgreSQL tables first
  try {
    const { data: bData, error: bError } = await supabase
      .from("bangunan_cagar_budaya")
      .select("*")
      .order("no", { ascending: true });

    if (!bError && bData && bData.length > 0) {
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

      const items = mergeWithFallbackPhotos(
        bData.map((b) => ({
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
          fit: (b.fit as "contain" | "cover") || "cover",
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }))
      );

      return NextResponse.json({ source: "postgres", items });
    }
  } catch {
    // Fall through to Supabase Cloud Storage DB
  }

  // 2. Read from Supabase Cloud Storage JSON DB
  const cloudItems = await readCloudStorageDB();
  if (cloudItems && cloudItems.length > 0) {
    return NextResponse.json({ source: "supabase-storage", items: cloudItems });
  }

  // 3. First time initialization: Seed INITIAL_CAGAR_BUDAYA into Supabase Cloud Storage
  await writeCloudStorageDB(INITIAL_CAGAR_BUDAYA);
  return NextResponse.json({
    source: "supabase-storage-seeded",
    items: INITIAL_CAGAR_BUDAYA,
  });
}

export async function POST(req: NextRequest) {
  try {
    const item = (await req.json()) as CagarBudayaItem;
    if (!item || !item.id || !item.nama) {
      return NextResponse.json(
        { success: false, error: "ID dan nama bangunan wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    let savedToPostgres = false;

    // 1. Try saving to PostgreSQL tables if they exist
    if (supabase) {
      const { error: upsertErr } = await supabase
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
          fit: item.fit || "cover",
          main_idx: item.mainIdx || 0,
          updated_at: new Date().toISOString(),
        });

      if (!upsertErr) {
        savedToPostgres = true;
        // Sync photos in bangunan_fotos table
        await supabase
          .from("bangunan_fotos")
          .delete()
          .eq("bangunan_id", item.id);

        if (item.fotos && item.fotos.length > 0) {
          const fotoRows = item.fotos.map((f, idx) => ({
            bangunan_id: item.id,
            src: f.src,
            cap: f.cap || "",
            is_main: idx === (item.mainIdx || 0),
            urutan: idx,
          }));
          await supabase.from("bangunan_fotos").insert(fotoRows);
        }
      }
    }

    // 2. Always persist to Supabase Cloud Storage JSON DB as well
    const currentList = (await readCloudStorageDB()) || [...INITIAL_CAGAR_BUDAYA];
    const idx = currentList.findIndex((b) => b.id === item.id);
    if (idx >= 0) {
      currentList[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      currentList.push({ ...item, createdAt: new Date().toISOString() });
    }
    const savedToStorage = await writeCloudStorageDB(currentList);

    if (!savedToPostgres && !savedToStorage) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan ke Supabase Cloud" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      storage: savedToPostgres ? "postgres+storage" : "supabase-storage",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter id diperlukan" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("bangunan_cagar_budaya").delete().eq("id", id);
    }

    const currentList = (await readCloudStorageDB()) || [...INITIAL_CAGAR_BUDAYA];
    const filtered = currentList.filter((b) => b.id !== id);
    await writeCloudStorageDB(filtered);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const supabase = getSupabaseAdmin();
    let postgresSeeded = false;

    if (supabase) {
      const payload = INITIAL_CAGAR_BUDAYA.map((b) => ({
        id: b.id,
        no: b.no,
        nama: b.nama,
        didirikan: b.didirikan,
        tahun_didirikan: b.tahunDidirikan,
        status: b.status,
        sk: b.sk,
        tgl_sk: b.tglSK,
        ket: b.ket,
        alamat: b.alamat,
        narasi: b.narasi,
        lat: b.lat,
        lng: b.lng,
        fit: b.fit || "cover",
        main_idx: b.mainIdx || 0,
      }));

      const { error } = await supabase
        .from("bangunan_cagar_budaya")
        .upsert(payload, { onConflict: "id" });

      if (!error) {
        postgresSeeded = true;
      }
    }

    const storageSeeded = await writeCloudStorageDB(INITIAL_CAGAR_BUDAYA);

    return NextResponse.json({
      success: postgresSeeded || storageSeeded,
      count: INITIAL_CAGAR_BUDAYA.length,
      postgresSeeded,
      storageSeeded,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal sinkronisasi";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

