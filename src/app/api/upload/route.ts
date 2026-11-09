import { NextRequest, NextResponse } from "next/server";
import { ensureMediaBucket, MEDIA_BUCKET } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bangunanId = (formData.get("bangunanId") as string) || "general";
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan dalam permintaan" },
        { status: 400 }
      );
    }

    const supabase = await ensureMediaBucket();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase Storage belum terkonfigurasi" },
        { status: 500 }
      );
    }

    const originalName = file.name || "media.jpg";
    const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    const filePath = `monumen/${bangunanId}/${Date.now()}_${baseName}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(uploadData.path);

    // Optional: Also insert into bangunan_fotos table if SQL schema is active
    let insertedId = `foto_${Date.now()}`;
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("bangunan_fotos")
        .insert({
          bangunan_id: bangunanId,
          src: publicUrl,
          cap: caption,
          is_main: false,
        })
        .select("id")
        .single();

      if (!insertError && insertData?.id) {
        insertedId = insertData.id;
      }
    } catch {
      // Table may not exist yet; storage URL is still valid and saved via /api/cagar-budaya
    }

    return NextResponse.json({
      success: true,
      foto: {
        id: insertedId,
        src: publicUrl,
        cap: caption,
        isMain: false,
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal mengunggah media ke Supabase Storage";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

