import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { geminiAgriculturalService } from "../../ai/services/gemini.service.js";
import { GEMINI_MODEL } from "../../config/gemini.js";

export async function generateCropRecommendations(
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
    season,
    soil_type,
    soil_ph,
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    rainfall,
    humidity,
    irrigation,
    farming_objective,
    crop_category,
    preferred_crop,
    language,
  } = req.body;

  // 1. Verify Farm Ownership (Section 11.8)
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

  // 2. Prepare Agricultural Context
  const farmInfoText = `
Farm Name: ${farm.name}
Location: District ${farm.district}, State ${farm.state}${farm.village ? `, Village ${farm.village}` : ""}
Area: ${farm.area} ${farm.area_unit}
Farm Primary Soil Type: ${farm.soil_type}
Recorded Soil pH: ${farm.soil_ph !== null && farm.soil_ph !== undefined ? farm.soil_ph : "Not tested"}
Primary Irrigation: ${farm.irrigation_type}
Water Availability: ${farm.water_availability}
`.trim();

  const environmentalText = `
Evaluation Season: ${season}
Field Soil Type: ${soil_type}
Tested Soil pH: ${soil_ph !== null && soil_ph !== undefined ? soil_ph : "Not specified"}
Nitrogen (N): ${nitrogen !== null && nitrogen !== undefined ? `${nitrogen} kg/ha` : "Not tested"}
Phosphorus (P): ${phosphorus !== null && phosphorus !== undefined ? `${phosphorus} kg/ha` : "Not tested"}
Potassium (K): ${potassium !== null && potassium !== undefined ? `${potassium} kg/ha` : "Not tested"}
Ambient Temperature: ${temperature !== null && temperature !== undefined ? `${temperature}°C` : "Seasonal average"}
Expected Rainfall: ${rainfall !== null && rainfall !== undefined ? `${rainfall} mm` : "Seasonal average"}
Relative Humidity: ${humidity !== null && humidity !== undefined ? `${humidity}%` : "Not specified"}
Field Irrigation Method: ${irrigation}
`.trim();

  try {
    // 3. Invoke Gemini Agricultural Engine with Schema Validation
    const aiRecommendations = await geminiAgriculturalService.generateCropRecommendations({
      farmInformation: farmInfoText,
      environmentalInformation: environmentalText,
      farmingObjective: farming_objective,
      season,
      cropCategory: crop_category || undefined,
      preferredCrop: preferred_crop || undefined,
      language: language || "en",
    });

    // 4. Persist in PostgreSQL
    const { data: savedRecord, error: saveError } = await supabaseAdmin
      .from("crop_recommendations")
      .insert([
        {
          owner_id: userId,
          farm_id,
          season,
          input_data: req.body,
          recommendations: aiRecommendations,
          model_name: GEMINI_MODEL,
          language: language || "en",
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Error saving crop recommendation to database:", saveError);
    }

    res.status(201).json({
      success: true,
      data: savedRecord || {
        id: "temp-" + Date.now(),
        owner_id: userId,
        farm_id,
        season,
        input_data: req.body,
        recommendations: aiRecommendations,
        created_at: new Date().toISOString(),
      },
      message: "Crop recommendations generated successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate crop recommendations";
    console.error("Crop Recommendation Error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "AI_GENERATION_FAILED",
        message,
      },
    });
  }
}

export async function listCropRecommendations(
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
    .from("crop_recommendations")
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

export async function getCropRecommendation(
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
    .from("crop_recommendations")
    .select("*, farms(name, district, state)")
    .eq("id", id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Recommendation report not found" } });
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

export async function deleteCropRecommendation(
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
    .from("crop_recommendations")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Report not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  const { error } = await supabaseAdmin
    .from("crop_recommendations")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: { id },
    message: "Recommendation report deleted successfully",
  });
}
