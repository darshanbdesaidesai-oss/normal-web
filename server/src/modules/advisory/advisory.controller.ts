import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { geminiAgriculturalService } from "../../ai/services/gemini.service.js";
import { GEMINI_MODEL } from "../../config/gemini.js";

export async function generateAdvisory(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const {
    farm_id,
    crop_id,
    crop_name,
    advisory_type,
    growth_stage,
    observations,
    language,
  } = req.body;

  let farmInfoText = "General regional farm conditions";

  // If farm_id provided, verify ownership and pull specifics
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

    farmInfoText = `
Farm: ${farm.name}
Location: ${farm.district}, ${farm.state}${farm.village ? `, Village: ${farm.village}` : ""}
Area: ${farm.area} ${farm.area_unit}
Soil Type: ${farm.soil_type}
Soil pH: ${farm.soil_ph !== null && farm.soil_ph !== undefined ? farm.soil_ph : "Not tested"}
Irrigation Type: ${farm.irrigation_type}
Water Availability: ${farm.water_availability}
`.trim();
  }

  let cropInfoText = `Target Crop: ${crop_name}`;
  if (crop_id) {
    const { data: crop } = await supabaseAdmin
      .from("crops")
      .select("*")
      .eq("id", crop_id)
      .single();

    if (crop) {
      cropInfoText = `
Crop: ${crop.name} (${crop.scientific_name || "N/A"})
Category: ${crop.category}
Cultivation Duration: ${crop.cultivation_duration_days ? `${crop.cultivation_duration_days} days` : "Seasonal"}
Typical Water Requirements: ${crop.water_requirements || "Moderate"}
Typical Climate: ${crop.climate_requirements || "Regional"}
`.trim();
    }
  }

  try {
    const aiResult = await geminiAgriculturalService.generateAdvisory({
      farmInformation: farmInfoText,
      cropInformation: cropInfoText,
      advisoryCategory: advisory_type.replace(/_/g, " "),
      growthStage: growth_stage || undefined,
      observations: observations || undefined,
      language: language || "en",
    });

    // Persist in advisories table
    const { data: savedRecord, error: saveError } = await supabaseAdmin
      .from("advisories")
      .insert([
        {
          owner_id: userId,
          farm_id: farm_id || null,
          crop_id: crop_id || null,
          crop_name,
          advisory_type,
          title: aiResult.title,
          summary: aiResult.summary,
          request_data: req.body,
          result_data: aiResult,
          confidence: "Evidence-conscious advisory",
          model_name: GEMINI_MODEL,
          language: language || "en",
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Error saving advisory to database:", saveError);
    }

    res.status(201).json({
      success: true,
      data: savedRecord || {
        id: "temp-" + Date.now(),
        owner_id: userId,
        farm_id,
        crop_id,
        crop_name,
        advisory_type,
        title: aiResult.title,
        summary: aiResult.summary,
        request_data: req.body,
        result_data: aiResult,
        created_at: new Date().toISOString(),
      },
      message: "Advisory generated successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate agricultural advisory";
    console.error("Advisory Generation Error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "AI_GENERATION_FAILED",
        message,
      },
    });
  }
}

export async function listAdvisories(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const { farm_id, crop_name, advisory_type } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  let query = supabaseAdmin
    .from("advisories")
    .select("*, farms(name, district, state)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (farm_id && typeof farm_id === "string") {
    query = query.eq("farm_id", farm_id);
  }

  if (crop_name && typeof crop_name === "string") {
    query = query.ilike("crop_name", `%${crop_name}%`);
  }

  if (advisory_type && typeof advisory_type === "string") {
    query = query.eq("advisory_type", advisory_type);
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

export async function getAdvisory(
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
    .from("advisories")
    .select("*, farms(name, district, state)")
    .eq("id", id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Advisory report not found" } });
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

export async function deleteAdvisory(
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
    .from("advisories")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Advisory report not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  const { error } = await supabaseAdmin
    .from("advisories")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: { id },
    message: "Advisory report deleted successfully",
  });
}
