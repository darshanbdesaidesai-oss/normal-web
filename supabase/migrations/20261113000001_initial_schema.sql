-- ============================================================================
-- AgriSage AI - PostgreSQL Schema & Row Level Security Migration
-- Version: 20261113000001
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.area_unit AS ENUM (
    'acre',
    'hectare',
    'square_meter'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.soil_type AS ENUM (
    'sandy',
    'clay',
    'loamy',
    'silty',
    'sandy_loam',
    'clay_loam',
    'black_soil',
    'red_soil',
    'laterite',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.irrigation_type AS ENUM (
    'rainfed',
    'drip',
    'sprinkler',
    'flood',
    'canal',
    'borewell',
    'mixed',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.water_availability AS ENUM (
    'low',
    'moderate',
    'high',
    'seasonal',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.crop_category AS ENUM (
    'cereal',
    'pulse',
    'oilseed',
    'vegetable',
    'fruit',
    'commercial',
    'plantation',
    'spice',
    'fodder',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.crop_season AS ENUM (
    'kharif',
    'rabi',
    'zaid',
    'year_round',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.advisory_type AS ENUM (
    'crop_recommendation',
    'cultivation',
    'soil_management',
    'nutrient_management',
    'irrigation',
    'pest_management',
    'disease_prevention',
    'disease_diagnosis',
    'weed_management',
    'harvesting',
    'post_harvest'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.activity_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 10.2 User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  full_name TEXT NOT NULL
    CHECK (char_length(full_name) BETWEEN 1 AND 120),

  phone TEXT,

  preferred_language TEXT NOT NULL DEFAULT 'en',

  state TEXT,

  district TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.3 Farms
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL
    CHECK (char_length(name) BETWEEN 1 AND 150),

  state TEXT NOT NULL,

  district TEXT NOT NULL,

  village TEXT,

  area NUMERIC(12, 3) NOT NULL
    CHECK (area > 0),

  area_unit public.area_unit NOT NULL,

  soil_type public.soil_type NOT NULL DEFAULT 'unknown',

  soil_ph NUMERIC(4, 2)
    CHECK (soil_ph BETWEEN 0 AND 14),

  irrigation_type public.irrigation_type NOT NULL,

  water_availability public.water_availability
    NOT NULL DEFAULT 'unknown',

  latitude NUMERIC(10, 7)
    CHECK (latitude BETWEEN -90 AND 90),

  longitude NUMERIC(10, 7)
    CHECK (longitude BETWEEN -180 AND 180),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.4 Crop Catalog
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL UNIQUE,

  scientific_name TEXT,

  category public.crop_category NOT NULL,

  description TEXT,

  suitable_soils JSONB NOT NULL DEFAULT '[]'::jsonb,

  suitable_seasons JSONB NOT NULL DEFAULT '[]'::jsonb,

  cultivation_duration_days INTEGER
    CHECK (cultivation_duration_days > 0),

  water_requirements TEXT,

  climate_requirements TEXT,

  cultivation_guide JSONB NOT NULL DEFAULT '{}'::jsonb,

  source_references JSONB NOT NULL DEFAULT '[]'::jsonb,

  is_published BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.5 Advisory Reports
CREATE TABLE IF NOT EXISTS public.advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  farm_id UUID
    REFERENCES public.farms(id)
    ON DELETE SET NULL,

  crop_id UUID
    REFERENCES public.crops(id)
    ON DELETE SET NULL,

  crop_name TEXT NOT NULL,

  advisory_type public.advisory_type NOT NULL,

  title TEXT NOT NULL,

  summary TEXT NOT NULL,

  request_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  result_data JSONB NOT NULL,

  confidence TEXT,

  model_name TEXT,

  language TEXT NOT NULL DEFAULT 'en',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.6 Crop Recommendations
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  farm_id UUID
    REFERENCES public.farms(id)
    ON DELETE SET NULL,

  season public.crop_season NOT NULL,

  input_data JSONB NOT NULL,

  recommendations JSONB NOT NULL,

  model_name TEXT,

  language TEXT NOT NULL DEFAULT 'en',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.7 Disease Reports
CREATE TABLE IF NOT EXISTS public.disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  farm_id UUID
    REFERENCES public.farms(id)
    ON DELETE SET NULL,

  crop_id UUID
    REFERENCES public.crops(id)
    ON DELETE SET NULL,

  crop_name TEXT NOT NULL,

  image_storage_path TEXT,

  symptoms TEXT,

  analysis_result JSONB NOT NULL,

  model_name TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.8 Farming Activities
CREATE TABLE IF NOT EXISTS public.farming_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  farm_id UUID NOT NULL
    REFERENCES public.farms(id)
    ON DELETE CASCADE,

  crop_id UUID
    REFERENCES public.crops(id)
    ON DELETE SET NULL,

  crop_name TEXT,

  title TEXT NOT NULL,

  description TEXT,

  scheduled_date DATE NOT NULL,

  completed_at TIMESTAMPTZ,

  status public.activity_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.9 Indexes
CREATE INDEX IF NOT EXISTS idx_farms_owner
  ON public.farms(owner_id);

CREATE INDEX IF NOT EXISTS idx_farms_location
  ON public.farms(state, district);

CREATE INDEX IF NOT EXISTS idx_advisories_owner_created
  ON public.advisories(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advisories_farm
  ON public.advisories(farm_id);

CREATE INDEX IF NOT EXISTS idx_advisories_type
  ON public.advisories(advisory_type);

CREATE INDEX IF NOT EXISTS idx_recommendations_owner_created
  ON public.crop_recommendations(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_farm
  ON public.crop_recommendations(farm_id);

CREATE INDEX IF NOT EXISTS idx_disease_reports_owner_created
  ON public.disease_reports(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_owner_date
  ON public.farming_activities(owner_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_activities_farm
  ON public.farming_activities(farm_id);

CREATE INDEX IF NOT EXISTS idx_crops_category
  ON public.crops(category);

CREATE INDEX IF NOT EXISTS idx_crops_published
  ON public.crops(is_published);

-- 10.10 Updated Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS farms_updated_at ON public.farms;
CREATE TRIGGER farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS crops_updated_at ON public.crops;
CREATE TRIGGER crops_updated_at
BEFORE UPDATE ON public.crops
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS advisories_updated_at ON public.advisories;
CREATE TRIGGER advisories_updated_at
BEFORE UPDATE ON public.advisories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS activities_updated_at ON public.farming_activities;
CREATE TRIGGER activities_updated_at
BEFORE UPDATE ON public.farming_activities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 10.11 Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    preferred_language
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      'Farmer'
    ),
    'en'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Section 11: Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- 11.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- 11.2 Farm Policies
DROP POLICY IF EXISTS "Users can view own farms" ON public.farms;
CREATE POLICY "Users can view own farms"
ON public.farms
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own farms" ON public.farms;
CREATE POLICY "Users can create own farms"
ON public.farms
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own farms" ON public.farms;
CREATE POLICY "Users can update own farms"
ON public.farms
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own farms" ON public.farms;
CREATE POLICY "Users can delete own farms"
ON public.farms
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- 11.3 Advisory Policies
DROP POLICY IF EXISTS "Users can view own advisories" ON public.advisories;
CREATE POLICY "Users can view own advisories"
ON public.advisories
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own advisories" ON public.advisories;
CREATE POLICY "Users can create own advisories"
ON public.advisories
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own advisories" ON public.advisories;
CREATE POLICY "Users can delete own advisories"
ON public.advisories
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- 11.4 Recommendation Policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can view own recommendations"
ON public.crop_recommendations
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can create own recommendations"
ON public.crop_recommendations
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own recommendations" ON public.crop_recommendations;
CREATE POLICY "Users can delete own recommendations"
ON public.crop_recommendations
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- 11.5 Disease Report Policies
DROP POLICY IF EXISTS "Users can view own disease reports" ON public.disease_reports;
CREATE POLICY "Users can view own disease reports"
ON public.disease_reports
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own disease reports" ON public.disease_reports;
CREATE POLICY "Users can create own disease reports"
ON public.disease_reports
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own disease reports" ON public.disease_reports;
CREATE POLICY "Users can delete own disease reports"
ON public.disease_reports
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- 11.6 Activity Policies
DROP POLICY IF EXISTS "Users can view own activities" ON public.farming_activities;
CREATE POLICY "Users can view own activities"
ON public.farming_activities
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own activities" ON public.farming_activities;
CREATE POLICY "Users can create own activities"
ON public.farming_activities
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own activities" ON public.farming_activities;
CREATE POLICY "Users can update own activities"
ON public.farming_activities
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own activities" ON public.farming_activities;
CREATE POLICY "Users can delete own activities"
ON public.farming_activities
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- 11.7 Crop Catalog Policies
DROP POLICY IF EXISTS "Authenticated users can view published crops" ON public.crops;
CREATE POLICY "Authenticated users can view published crops"
ON public.crops
FOR SELECT
TO authenticated
USING (is_published = TRUE);

-- Also allow anon read on published crops if viewing catalog before login
DROP POLICY IF EXISTS "Public can view published crops" ON public.crops;
CREATE POLICY "Public can view published crops"
ON public.crops
FOR SELECT
TO anon
USING (is_published = TRUE);
