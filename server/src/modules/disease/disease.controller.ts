import { Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { geminiAgriculturalService } from "../../ai/services/gemini.service.js";
import { GEMINI_MODEL } from "../../config/gemini.js";

// Configure Multer for secure in-memory reception (up to 8MB)
const storage = multer.memoryStorage();
export const uploadCropImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are permitted for diagnostic analysis"));
    }
  },
});

export async function analyzeCropDisease(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({
      success: false,
      error: { code: "MISSING_IMAGE", message: "Please upload an image of the affected plant or crop leaf" },
    });
    return;
  }

  const { farm_id, crop_id, crop_name, symptoms, language } = req.body;

  if (!crop_name || !symptoms) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Crop name and symptom description are required" },
    });
    return;
  }

  let locationText = "Regional Agricultural Field";

  // Ownership verification for farm if referenced
  if (farm_id) {
    const { data: farm, error: farmError } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("id", farm_id)
      .single();

    if (farmError || !farm) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Selected farm not found" } });
      return;
    }

    if (farm.owner_id !== userId) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to the specified farm" } });
      return;
    }

    locationText = `${farm.district}, ${farm.state}`;
  }

  try {
    // 1. Verify and normalize image safely using Sharp (Section 13.5)
    const imageMetadata = await sharp(file.buffer).metadata();
    if (!imageMetadata.format || !["jpeg", "png", "webp"].includes(imageMetadata.format)) {
      res.status(400).json({
        success: false,
        error: { code: "MALFORMED_IMAGE", message: "The uploaded file is not a valid or readable image" },
      });
      return;
    }

    // Resize/normalize image if excessively large to protect bandwidth & token limits
    const processedBuffer = await sharp(file.buffer)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .toFormat("jpeg", { quality: 85 })
      .toBuffer();

    // 2. Storage handling: attempt upload to Supabase Storage or use safe data path
    const fileExt = "jpg";
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    let storagePath: string | null = null;

    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("crop-images")
        .upload(fileName, processedBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (!uploadError && uploadData) {
        storagePath = uploadData.path;
      }
    } catch {
      // Storage bucket might not exist yet; continue with image analysis
      storagePath = `local-uploads/${fileName}`;
    }

    // 3. Multimodal Analysis with Gemini AI
    const analysisResult = await geminiAgriculturalService.analyzeDisease(
      {
        cropName: crop_name,
        location: locationText,
        symptoms,
        language: language || "en",
      },
      processedBuffer,
      "image/jpeg"
    );

    // 4. Persist in disease_reports table
    const { data: savedReport, error: saveError } = await supabaseAdmin
      .from("disease_reports")
      .insert([
        {
          owner_id: userId,
          farm_id: farm_id || null,
          crop_id: crop_id || null,
          crop_name,
          image_storage_path: storagePath,
          symptoms,
          analysis_result: analysisResult,
          model_name: GEMINI_MODEL,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Error saving disease report to database:", saveError);
    }

    res.status(201).json({
      success: true,
      data: savedReport || {
        id: "temp-" + Date.now(),
        owner_id: userId,
        farm_id,
        crop_id,
        crop_name,
        symptoms,
        analysis_result: analysisResult,
        created_at: new Date().toISOString(),
      },
      message: "Crop disease analysis completed successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Crop disease analysis failed";
    console.error("Disease Analysis Error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "AI_DIAGNOSIS_FAILED",
        message,
      },
    });
  }
}

export async function listDiseaseReports(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const { farm_id } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  let query = supabaseAdmin
    .from("disease_reports")
    .select("*, farms(name, district, state)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (farm_id && typeof farm_id === "string") {
    query = query.eq("farm_id", farm_id);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: data || [],
  });
}

export async function getDiseaseReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const id = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("disease_reports")
    .select("*, farms(name, district, state)")
    .eq("id", id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Disease report not found" } });
    return;
  }

  if (data.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  res.json({
    success: true,
    data,
  });
}

export async function deleteDiseaseReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const id = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("disease_reports")
    .select("owner_id, image_storage_path")
    .eq("id", id)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Disease report not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  // Delete image from storage if present
  if (existing.image_storage_path && !existing.image_storage_path.startsWith("local-uploads")) {
    try {
      await supabaseAdmin.storage.from("crop-images").remove([existing.image_storage_path]);
    } catch {
      // Ignore storage cleanup errors
    }
  }

  const { error } = await supabaseAdmin
    .from("disease_reports")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: { id },
    message: "Disease report deleted successfully",
  });
}
