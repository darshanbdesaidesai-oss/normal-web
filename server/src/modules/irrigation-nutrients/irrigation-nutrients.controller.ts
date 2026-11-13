import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";
import { geminiAgriculturalService } from "../../ai/services/gemini.service.js";
import { GEMINI_MODEL } from "../../config/gemini.js";

export async function generateIrrigationAdvisory(
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
    crop,
    growth_stage,
    soil_type,
    irrigation_method,
    water_availability,
    rainfall,
    language,
  } = req.body;

  let soilInfo = soil_type;

  if (farm_id) {
    const { data: farm, error } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("id", farm_id)
      .single();

    if (!error && farm && farm.owner_id === userId) {
      soilInfo = `${farm.soil_type} (pH: ${farm.soil_ph ?? "N/A"}), Farm: ${farm.name} (${farm.district}, ${farm.state})`;
    }
  }

  try {
    const aiResult = await geminiAgriculturalService.generateIrrigationAdvisory({
      crop,
      growthStage: growth_stage,
      soilInformation: soilInfo,
      irrigationMethod: irrigation_method,
      waterAvailability: water_availability,
      rainfall: rainfall || undefined,
      language: language || "en",
    });

    // Save report in advisories history
    const { data: savedRecord } = await supabaseAdmin
      .from("advisories")
      .insert([
        {
          owner_id: userId,
          farm_id: farm_id || null,
          crop_name: crop,
          advisory_type: "irrigation",
          title: `Irrigation Advisory: ${crop} (${growth_stage})`,
          summary: aiResult.summary,
          request_data: req.body,
          result_data: aiResult,
          confidence: "Evidence-conscious irrigation guidance",
          model_name: GEMINI_MODEL,
          language: language || "en",
        },
      ])
      .select()
      .single();

    res.status(201).json({
      success: true,
      data: savedRecord || {
        id: "temp-" + Date.now(),
        crop_name: crop,
        advisory_type: "irrigation",
        title: `Irrigation Advisory: ${crop}`,
        summary: aiResult.summary,
        result_data: aiResult,
        created_at: new Date().toISOString(),
      },
      message: "Irrigation advisory generated successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate irrigation advisory";
    console.error("Irrigation Advisory Error:", err);
    res.status(500).json({
      success: false,
      error: { code: "AI_GENERATION_FAILED", message },
    });
  }
}

export async function generateNutrientAdvisory(
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
    crop,
    growth_stage,
    soil_type,
    soil_test,
    fertilizer_history,
    farm_area,
    language,
  } = req.body;

  let soilTypeWithDetails = soil_type;

  if (farm_id) {
    const { data: farm, error } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("id", farm_id)
      .single();

    if (!error && farm && farm.owner_id === userId) {
      soilTypeWithDetails = `${farm.soil_type} (pH: ${farm.soil_ph ?? "N/A"}), Farm: ${farm.name} (${farm.district}, ${farm.state})`;
    }
  }

  try {
    const aiResult = await geminiAgriculturalService.generateNutrientAdvisory({
      crop,
      growthStage: growth_stage,
      soilType: soilTypeWithDetails,
      soilTest: soil_test || undefined,
      fertilizerHistory: fertilizer_history || undefined,
      farmArea: farm_area,
      language: language || "en",
    });

    // Save report in advisories history
    const { data: savedRecord } = await supabaseAdmin
      .from("advisories")
      .insert([
        {
          owner_id: userId,
          farm_id: farm_id || null,
          crop_name: crop,
          advisory_type: "nutrient_management",
          title: `Nutrient Management Plan: ${crop} (${growth_stage})`,
          summary: aiResult.summary,
          request_data: req.body,
          result_data: aiResult,
          confidence: "Soil health & nutrient stewardship guidance",
          model_name: GEMINI_MODEL,
          language: language || "en",
        },
      ])
      .select()
      .single();

    res.status(201).json({
      success: true,
      data: savedRecord || {
        id: "temp-" + Date.now(),
        crop_name: crop,
        advisory_type: "nutrient_management",
        title: `Nutrient Management Plan: ${crop}`,
        summary: aiResult.summary,
        result_data: aiResult,
        created_at: new Date().toISOString(),
      },
      message: "Nutrient advisory generated successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate nutrient advisory";
    console.error("Nutrient Advisory Error:", err);
    res.status(500).json({
      success: false,
      error: { code: "AI_GENERATION_FAILED", message },
    });
  }
}
