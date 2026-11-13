import { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type AreaUnit = "acre" | "hectare" | "square_meter";

export type SoilType =
  | "sandy"
  | "clay"
  | "loamy"
  | "silty"
  | "sandy_loam"
  | "clay_loam"
  | "black_soil"
  | "red_soil"
  | "laterite"
  | "unknown";

export type IrrigationType =
  | "rainfed"
  | "drip"
  | "sprinkler"
  | "flood"
  | "canal"
  | "borewell"
  | "mixed"
  | "other";

export type WaterAvailability = "low" | "moderate" | "high" | "seasonal" | "unknown";

export type CropCategory =
  | "cereal"
  | "pulse"
  | "oilseed"
  | "vegetable"
  | "fruit"
  | "commercial"
  | "plantation"
  | "spice"
  | "fodder"
  | "other";

export type CropSeason = "kharif" | "rabi" | "zaid" | "year_round" | "other";

export type AdvisoryType =
  | "crop_recommendation"
  | "cultivation"
  | "soil_management"
  | "nutrient_management"
  | "irrigation"
  | "pest_management"
  | "disease_prevention"
  | "disease_diagnosis"
  | "weed_management"
  | "harvesting"
  | "post_harvest";

export type ActivityStatus = "pending" | "completed" | "cancelled";
