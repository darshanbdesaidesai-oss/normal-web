export type AreaUnit = 'acre' | 'hectare' | 'square_meter';

export type SoilType =
  | 'sandy'
  | 'clay'
  | 'loamy'
  | 'silty'
  | 'sandy_loam'
  | 'clay_loam'
  | 'black_soil'
  | 'red_soil'
  | 'laterite'
  | 'unknown';

export type IrrigationType =
  | 'rainfed'
  | 'drip'
  | 'sprinkler'
  | 'flood'
  | 'canal'
  | 'borewell'
  | 'mixed'
  | 'other';

export type WaterAvailability = 'low' | 'moderate' | 'high' | 'seasonal' | 'unknown';

export type CropCategory =
  | 'cereal'
  | 'pulse'
  | 'oilseed'
  | 'vegetable'
  | 'fruit'
  | 'commercial'
  | 'plantation'
  | 'spice'
  | 'fodder'
  | 'other';

export type CropSeason = 'kharif' | 'rabi' | 'zaid' | 'year_round' | 'other';

export type AdvisoryType =
  | 'crop_recommendation'
  | 'cultivation'
  | 'soil_management'
  | 'nutrient_management'
  | 'irrigation'
  | 'pest_management'
  | 'disease_prevention'
  | 'disease_diagnosis'
  | 'weed_management'
  | 'harvesting'
  | 'post_harvest';

export type ActivityStatus = 'pending' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string | null;
  preferred_language: string;
  state?: string | null;
  district?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  state: string;
  district: string;
  village?: string | null;
  area: number;
  area_unit: AreaUnit;
  soil_type: SoilType;
  soil_ph?: number | null;
  irrigation_type: IrrigationType;
  water_availability: WaterAvailability;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CultivationGuide {
  land_preparation?: string;
  sowing?: string;
  nutrient_management?: string;
  irrigation?: string;
  pest_and_disease?: string;
  harvesting?: string;
}

export interface Crop {
  id: string;
  name: string;
  scientific_name?: string | null;
  category: CropCategory;
  description?: string | null;
  suitable_soils: SoilType[];
  suitable_seasons: CropSeason[];
  cultivation_duration_days?: number | null;
  water_requirements?: string | null;
  climate_requirements?: string | null;
  cultivation_guide?: CultivationGuide;
  source_references?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropRecommendationItem {
  crop_name: string;
  category: string;
  suitability_score: number;
  score_explanation: string;
  advantages: string[];
  risks: string[];
  soil_requirements: string;
  water_requirements: string;
  climate_requirements: string;
  cultivation_duration_days?: number | null;
  recommendation_reason: string;
}

export interface CropRecommendationReport {
  id: string;
  owner_id: string;
  farm_id: string;
  season: CropSeason;
  input_data: Record<string, unknown>;
  recommendations: {
    summary: string;
    recommendations: CropRecommendationItem[];
    missing_information: string[];
    general_warnings: string[];
  };
  model_name?: string;
  language: string;
  created_at: string;
  farms?: {
    name: string;
    district: string;
    state: string;
  };
}

export interface AdvisoryRecommendationItem {
  heading: string;
  description: string;
  priority: string;
  reason: string;
}

export interface AdvisoryActionStep {
  action: string;
  timing: string;
  details: string;
}

export interface AdvisoryData {
  title: string;
  summary: string;
  recommendations: AdvisoryRecommendationItem[];
  action_steps: AdvisoryActionStep[];
  risks: string[];
  warnings: string[];
  missing_information: string[];
  expert_verification_required: boolean;
}

export interface AdvisoryReport {
  id: string;
  owner_id: string;
  farm_id?: string | null;
  crop_id?: string | null;
  crop_name: string;
  advisory_type: AdvisoryType;
  title: string;
  summary: string;
  request_data: Record<string, unknown>;
  result_data: AdvisoryData;
  confidence?: string | null;
  model_name?: string | null;
  language: string;
  created_at: string;
  updated_at: string;
  farms?: {
    name: string;
    district: string;
    state: string;
  };
}

export interface DiseaseCause {
  name: string;
  confidence: string;
  reason: string;
}

export interface DiseaseAnalysisResult {
  crop_identification: string;
  image_quality: string;
  observed_symptoms: string[];
  possible_causes: DiseaseCause[];
  alternative_explanations: string[];
  immediate_actions: string[];
  prevention: string[];
  additional_observations_needed: string[];
  expert_consultation_recommended: boolean;
  disclaimer: string;
}

export interface DiseaseReport {
  id: string;
  owner_id: string;
  farm_id?: string | null;
  crop_id?: string | null;
  crop_name: string;
  image_storage_path?: string | null;
  symptoms?: string | null;
  analysis_result: DiseaseAnalysisResult;
  model_name?: string | null;
  created_at: string;
  farms?: {
    name: string;
    district: string;
    state: string;
  };
}

export interface IrrigationAdvisoryResult {
  summary: string;
  irrigation_guidance: string[];
  monitoring_indicators: string[];
  water_stress_signs: string[];
  excess_water_warnings: string[];
  missing_information: string[];
}

export interface NutrientAdvisoryResult {
  summary: string;
  nutrient_considerations: string[];
  possible_deficiencies: string[];
  soil_testing_recommendations: string[];
  application_guidance: string[];
  environmental_precautions: string[];
  warnings: string[];
  missing_information: string[];
}

export interface FarmingActivity {
  id: string;
  owner_id: string;
  farm_id: string;
  crop_id?: string | null;
  crop_name?: string | null;
  title: string;
  description?: string | null;
  scheduled_date: string;
  completed_at?: string | null;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
  farms?: {
    name: string;
    district: string;
    state: string;
  };
}

export interface DashboardMetrics {
  stats: {
    totalFarms: number;
    totalArea: number;
    activeCropsCount: number;
    pendingActivitiesCount: number;
    overdueActivitiesCount: number;
    totalAdvisoriesCount: number;
  };
  farms: Farm[];
  recentAdvisories: Partial<AdvisoryReport>[];
  upcomingActivities: FarmingActivity[];
  overdueActivities: FarmingActivity[];
  latestRecommendations: CropRecommendationReport[];
  recentDiseaseReports: DiseaseReport[];
}
