import { z } from "zod";

// Farm Schemas
export const farmInputSchema = z.object({
  name: z.string().trim().min(1, "Farm name is required").max(150),
  state: z.string().trim().min(1, "State is required").max(100),
  district: z.string().trim().min(1, "District is required").max(100),
  village: z.string().trim().max(100).optional().nullable(),
  area: z.number().positive("Area must be positive").max(1_000_000),
  area_unit: z.enum(["acre", "hectare", "square_meter"]),
  soil_type: z.enum([
    "sandy",
    "clay",
    "loamy",
    "silty",
    "sandy_loam",
    "clay_loam",
    "black_soil",
    "red_soil",
    "laterite",
    "unknown",
  ]),
  soil_ph: z.number().min(0).max(14).nullable().optional(),
  irrigation_type: z.enum([
    "rainfed",
    "drip",
    "sprinkler",
    "flood",
    "canal",
    "borewell",
    "mixed",
    "other",
  ]),
  water_availability: z.enum([
    "low",
    "moderate",
    "high",
    "seasonal",
    "unknown",
  ]),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const farmUpdateSchema = farmInputSchema.partial();

// Profile Schema
export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  preferred_language: z.string().trim().min(2).max(10).optional(),
  state: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
});

// Crop Recommendation Request Schema
export const cropRecommendationRequestSchema = z.object({
  farm_id: z.string().uuid("A valid farm selection is required"),
  season: z.enum(["kharif", "rabi", "zaid", "year_round", "other"]),
  soil_type: z.enum([
    "sandy",
    "clay",
    "loamy",
    "silty",
    "sandy_loam",
    "clay_loam",
    "black_soil",
    "red_soil",
    "laterite",
    "unknown",
  ]),
  soil_ph: z.number().min(0).max(14).nullable().optional(),
  nitrogen: z.number().min(0).max(1000).nullable().optional(),
  phosphorus: z.number().min(0).max(1000).nullable().optional(),
  potassium: z.number().min(0).max(1000).nullable().optional(),
  temperature: z.number().min(-20).max(60).nullable().optional(),
  rainfall: z.number().min(0).max(5000).nullable().optional(),
  humidity: z.number().min(0).max(100).nullable().optional(),
  irrigation: z.enum([
    "rainfed",
    "drip",
    "sprinkler",
    "flood",
    "canal",
    "borewell",
    "mixed",
    "other",
  ]),
  farming_objective: z.enum([
    "Maximum Productivity",
    "Low Water Usage",
    "Low Input Cost",
    "Sustainable Farming",
    "Soil Improvement",
    "Diversification",
    "General Suitability",
  ]),
  crop_category: z.enum([
    "cereal",
    "pulse",
    "oilseed",
    "vegetable",
    "fruit",
    "commercial",
    "plantation",
    "spice",
    "fodder",
    "other",
  ]).optional().nullable(),
  preferred_crop: z.string().max(100).optional().nullable(),
  language: z.string().default("en"),
});

// Advisory Request Schema
export const advisoryRequestSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop_id: z.string().uuid().optional().nullable(),
  crop_name: z.string().trim().min(1, "Crop name is required"),
  advisory_type: z.enum([
    "crop_recommendation",
    "cultivation",
    "soil_management",
    "nutrient_management",
    "irrigation",
    "pest_management",
    "disease_prevention",
    "disease_diagnosis",
    "weed_management",
    "harvesting",
    "post_harvest",
  ]),
  growth_stage: z.string().max(100).optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
  language: z.string().default("en"),
});

// Irrigation Advisory Request Schema
export const irrigationRequestSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop: z.string().trim().min(1, "Crop is required"),
  growth_stage: z.string().trim().min(1, "Growth stage is required"),
  soil_type: z.string().trim().min(1, "Soil type is required"),
  irrigation_method: z.string().trim().min(1, "Irrigation method is required"),
  water_availability: z.string().trim().min(1, "Water availability is required"),
  rainfall: z.string().max(200).optional().nullable(),
  language: z.string().default("en"),
});

// Nutrient Advisory Request Schema
export const nutrientRequestSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop: z.string().trim().min(1, "Crop is required"),
  growth_stage: z.string().trim().min(1, "Growth stage is required"),
  soil_type: z.string().trim().min(1, "Soil type is required"),
  soil_test: z.string().max(500).optional().nullable(),
  fertilizer_history: z.string().max(500).optional().nullable(),
  farm_area: z.string().trim().min(1, "Farm area is required"),
  language: z.string().default("en"),
});

// Disease Diagnosis Request Schema (fields accompanying image)
export const diseaseRequestSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop_name: z.string().trim().min(1, "Crop name is required"),
  symptoms: z.string().trim().min(3, "Please describe the symptoms observed"),
  language: z.string().default("en"),
});

// Farming Activity Schemas
export const activityInputSchema = z.object({
  farm_id: z.string().uuid("A valid farm reference is required"),
  crop_id: z.string().uuid().optional().nullable(),
  crop_name: z.string().max(100).optional().nullable(),
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().max(1000).optional().nullable(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

export const activityUpdateSchema = activityInputSchema.partial();
