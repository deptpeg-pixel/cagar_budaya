import { NextRequest, NextResponse } from "next/server";
import { ensureMediaBucket, MEDIA_BUCKET } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_GENERAL_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const fileList: File[] = files.length > 0 ? files : singleFile ? [singleFile] : [];
    const bangunanId = (formData.get("bangunanId") as string) || "general";
    const caption = (formData.get("caption") as string) || "";

    if (fileList.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang dipilih untuk diunggah" },
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

    const uploadedFotos = [];

    for (const file of fileList) {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(file.name);

      if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File gambar '${file.name}' melebihi batas ukuran 8 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
          },
          { status: 400 }
        );
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File video '${file.name}' melebihi batas ukuran 50 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
          },
          { status: 400 }
        );
      }

      if (!isImage && !isVideo && file.size > MAX_GENERAL_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File '${file.name}' melebihi batas ukuran 50 MB`,
          },
          { status: 400 }
        );
      }

      const originalName = file.name || "media.jpg";
      const ext = originalName.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
      const baseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);

      const filePath = `monumen/${bangunanId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${baseName}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const contentType = file.type || (isVideo ? "video/mp4" : "image/jpeg");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(filePath, buffer, {
          contentType,
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

      let insertedId = `foto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      try {
        const { data: insertData, error: insertError } = await supabase
          .from("bangunan_fotos")
          .insert({
            bangunan_id: bangunanId,
            src: publicUrl,
            cap: caption || file.name,
            is_main: false,
          })
          .select("id")
          .single();

        if (!insertError && insertData?.id) {
          insertedId = insertData.id;
        }
      } catch {
        // Table fallback
      }

      uploadedFotos.push({
        id: insertedId,
        src: publicUrl,
        cap: caption || file.name.replace(/\.[^/.]+$/, ""),
        isMain: false,
      });
    }

    return NextResponse.json({
      success: true,
      fotos: uploadedFotos,
      foto: uploadedFotos[0], // backward compatibility
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal mengunggah media ke Supabase Storage";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

