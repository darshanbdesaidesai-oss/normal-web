import { z } from "zod";

// 15.1 Crop Recommendation Output Schema
export const cropRecommendationItemSchema = z.object({
  crop_name: z.string().min(1),
  category: z.string().min(1),
  suitability_score: z.number().int().min(0).max(100),
  score_explanation: z.string().min(1),
  advantages: z.array(z.string()),
  risks: z.array(z.string()),
  soil_requirements: z.string().min(1),
  water_requirements: z.string().min(1),
  climate_requirements: z.string().min(1),
  cultivation_duration_days: z.number().int().positive().nullable().optional(),
  recommendation_reason: z.string().min(1),
});

export const cropRecommendationOutputSchema = z.object({
  summary: z.string().min(1),
  recommendations: z.array(cropRecommendationItemSchema).min(1),
  missing_information: z.array(z.string()),
  general_warnings: z.array(z.string()),
});

export type CropRecommendationOutput = z.infer<typeof cropRecommendationOutputSchema>;

// 15.2 Advisory Output Schema
export const advisoryRecommendationItemSchema = z.object({
  heading: z.string().min(1),
  description: z.string().min(1),
  priority: z.string().min(1),
  reason: z.string().min(1),
});

export const advisoryActionStepSchema = z.object({
  action: z.string().min(1),
  timing: z.string().min(1),
  details: z.string().min(1),
});

export const advisoryOutputSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  recommendations: z.array(advisoryRecommendationItemSchema),
  action_steps: z.array(advisoryActionStepSchema),
  risks: z.array(z.string()),
  warnings: z.array(z.string()),
  missing_information: z.array(z.string()),
  expert_verification_required: z.boolean(),
});

export type AdvisoryOutput = z.infer<typeof advisoryOutputSchema>;

// 15.3 Disease Diagnosis Schema
export const diseasePossibleCauseSchema = z.object({
  name: z.string().min(1),
  confidence: z.string().min(1),
  reason: z.string().min(1),
});

export const diseaseOutputSchema = z.object({
  crop_identification: z.string().min(1),
  image_quality: z.string().min(1),
  observed_symptoms: z.array(z.string()),
  possible_causes: z.array(diseasePossibleCauseSchema),
  alternative_explanations: z.array(z.string()),
  immediate_actions: z.array(z.string()),
  prevention: z.array(z.string()),
  additional_observations_needed: z.array(z.string()),
  expert_consultation_recommended: z.boolean(),
  disclaimer: z.string().min(1),
});

export type DiseaseOutput = z.infer<typeof diseaseOutputSchema>;

// 15.4 Irrigation Output Schema
export const irrigationOutputSchema = z.object({
  summary: z.string().min(1),
  irrigation_guidance: z.array(z.string()),
  monitoring_indicators: z.array(z.string()),
  water_stress_signs: z.array(z.string()),
  excess_water_warnings: z.array(z.string()),
  missing_information: z.array(z.string()),
});

export type IrrigationOutput = z.infer<typeof irrigationOutputSchema>;

// 15.5 Nutrient Output Schema
export const nutrientOutputSchema = z.object({
  summary: z.string().min(1),
  nutrient_considerations: z.array(z.string()),
  possible_deficiencies: z.array(z.string()),
  soil_testing_recommendations: z.array(z.string()),
  application_guidance: z.array(z.string()),
  environmental_precautions: z.array(z.string()),
  warnings: z.array(z.string()),
  missing_information: z.array(z.string()),
});

export type NutrientOutput = z.infer<typeof nutrientOutputSchema>;
