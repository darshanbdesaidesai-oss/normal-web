import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Trees,
  Droplets,
  AlertTriangle,
  HelpCircle,
  Compass,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, CropRecommendationReport, CropRecommendationItem } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/Skeleton.js";
import { getSuitabilityBadge, formatDate } from "../../lib/utils.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { toast } from "sonner";

const recommendationSchema = z.object({
  farm_id: z.string().uuid("Please select a farm"),
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
  soil_ph: z.coerce.number().min(0).max(14).nullable().optional(),
  nitrogen: z.coerce.number().min(0).max(1000).nullable().optional(),
  phosphorus: z.coerce.number().min(0).max(1000).nullable().optional(),
  potassium: z.coerce.number().min(0).max(1000).nullable().optional(),
  temperature: z.coerce.number().min(-20).max(60).nullable().optional(),
  rainfall: z.coerce.number().min(0).max(5000).nullable().optional(),
  humidity: z.coerce.number().min(0).max(100).nullable().optional(),
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
  crop_category: z
    .enum([
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
    ])
    .optional()
    .nullable(),
  preferred_crop: z.string().max(100).optional().nullable(),
  language: z.string().default("en"),
});

type RecommendationFormData = z.infer<typeof recommendationSchema>;

export function CropRecommendationsPage() {
  const [searchParams] = useSearchParams();
  const preselectedFarmId = searchParams.get("farm_id");
  const { aiLanguage } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CropRecommendationReport | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      season: "kharif",
      farming_objective: "General Suitability",
      soil_type: "red_soil",
      irrigation: "borewell",
      language: aiLanguage || "en",
    },
  });

  const selectedFarmId = watch("farm_id");

  // Load farms on mount
  useEffect(() => {
    api
      .get<Farm[]>("/farms")
      .then((res) => {
        const farmList = res.data || [];
        setFarms(farmList);
        if (preselectedFarmId && farmList.some((f) => f.id === preselectedFarmId)) {
          setValue("farm_id", preselectedFarmId);
        } else if (farmList.length > 0 && farmList[0]) {
          setValue("farm_id", farmList[0].id);
        }
      })
      .finally(() => setLoadingFarms(false));
  }, [preselectedFarmId, setValue]);

  // When selected farm changes, pre-fill soil and irrigation defaults from the farm
  useEffect(() => {
    if (!selectedFarmId) return;
    const farm = farms.find((f) => f.id === selectedFarmId);
    if (farm) {
      setValue("soil_type", farm.soil_type);
      setValue("irrigation", farm.irrigation_type);
      if (farm.soil_ph) setValue("soil_ph", farm.soil_ph);
    }
  }, [selectedFarmId, farms, setValue]);

  const onSubmit = async (data: RecommendationFormData) => {
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await api.post<CropRecommendationReport>("/ai/crop-recommendations", data);
      setResult(res.data);
      toast.success("Crop suitability recommendations generated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate recommendations";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingFarms) {
    return <LoadingState message="Loading farm parameters..." />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600" /> AI Crop Suitability Recommendations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate crop suitability for your field based on soil characteristics, seasonal conditions, and farming objectives.
        </p>
      </div>

      {farms.length === 0 ? (
        <Card className="p-8 text-center bg-emerald-50/50 border-emerald-200">
          <Trees className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Farms Registered</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
            To generate personalized crop recommendations, please register at least one farm with location and soil information.
          </p>
          <Link to="/app/farms/new">
            <Button variant="primary" size="md">
              + Register Your Farm
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Card (Left Column) */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommendation Parameters</CardTitle>
              <CardDescription>Select farm & environmental details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Farm Selector */}
                <Select
                  label="Select Farm"
                  options={farms.map((f) => ({
                    value: f.id,
                    label: `${f.name} (${f.district}, ${f.area} ${f.area_unit})`,
                  }))}
                  error={errors.farm_id?.message}
                  required
                  {...register("farm_id")}
                />

                {/* Season & Objective */}
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Target Season"
                    options={[
                      { value: "kharif", label: "Kharif (Monsoon)" },
                      { value: "rabi", label: "Rabi (Winter)" },
                      { value: "zaid", label: "Zaid (Summer)" },
                      { value: "year_round", label: "Year-Round" },
                    ]}
                    error={errors.season?.message}
                    required
                    {...register("season")}
                  />

                  <Select
                    label="Farming Objective"
                    options={[
                      { value: "General Suitability", label: "General Suitability" },
                      { value: "Maximum Productivity", label: "High Productivity" },
                      { value: "Low Water Usage", label: "Low Water Need" },
                      { value: "Low Input Cost", label: "Low Input Cost" },
                      { value: "Sustainable Farming", label: "Sustainable" },
                      { value: "Soil Improvement", label: "Soil Health" },
                      { value: "Diversification", label: "Diversification" },
                    ]}
                    error={errors.farming_objective?.message}
                    required
                    {...register("farming_objective")}
                  />
                </div>

                {/* Soil & Irrigation from farm */}
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Soil Type"
                    options={[
                      { value: "red_soil", label: "Red Soil" },
                      { value: "black_soil", label: "Black Soil" },
                      { value: "loamy", label: "Loamy" },
                      { value: "sandy_loam", label: "Sandy Loam" },
                      { value: "clay_loam", label: "Clay Loam" },
                      { value: "sandy", label: "Sandy" },
                      { value: "laterite", label: "Laterite" },
                      { value: "clay", label: "Clay" },
                    ]}
                    error={errors.soil_type?.message}
                    required
                    {...register("soil_type")}
                  />

                  <Select
                    label="Irrigation"
                    options={[
                      { value: "drip", label: "Drip" },
                      { value: "borewell", label: "Borewell" },
                      { value: "sprinkler", label: "Sprinkler" },
                      { value: "canal", label: "Canal" },
                      { value: "rainfed", label: "Rainfed" },
                      { value: "flood", label: "Flood" },
                    ]}
                    error={errors.irrigation?.message}
                    required
                    {...register("irrigation")}
                  />
                </div>

                {/* Soil Test / Environmental Inputs (Optional) */}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Soil pH"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.5"
                    error={errors.soil_ph?.message}
                    {...register("soil_ph")}
                  />
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    step="1"
                    placeholder="e.g. 28"
                    error={errors.temperature?.message}
                    {...register("temperature")}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="N (kg/ha)"
                    type="number"
                    placeholder="N"
                    error={errors.nitrogen?.message}
                    {...register("nitrogen")}
                  />
                  <Input
                    label="P (kg/ha)"
                    type="number"
                    placeholder="P"
                    error={errors.phosphorus?.message}
                    {...register("phosphorus")}
                  />
                  <Input
                    label="K (kg/ha)"
                    type="number"
                    placeholder="K"
                    error={errors.potassium?.message}
                    {...register("potassium")}
                  />
                </div>

                {/* Filter preference */}
                <Input
                  label="Specific Crop Candidate (Optional)"
                  placeholder="e.g. Finger Millet or Tomato"
                  error={errors.preferred_crop?.message}
                  {...register("preferred_crop")}
                />

                <Select
                  label="Advisory Language"
                  options={[
                    { value: "en", label: "English" },
                    { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
                    { value: "hi", label: "Hindi (हिन्दी)" },
                  ]}
                  {...register("language")}
                />

                <Button type="submit" variant="primary" className="w-full font-bold shadow-sm" isLoading={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-2" /> Run Crop Suitability Analysis
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Area (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {isGenerating && (
              <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
                <LoadingState message="AgriSage AI is evaluating crop options with Indian agronomic benchmarks..." />
              </Card>
            )}

            {!isGenerating && !result && (
              <Card className="p-10 text-center bg-slate-50/50 border-dashed border-slate-300">
                <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Ready to Analyze</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Adjust parameters on the left and submit to view ranked crop recommendations with risk profiles.
                </p>
              </Card>
            )}

            {!isGenerating && result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Summary Card */}
                <Card className="bg-emerald-50/60 border-emerald-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-800">Suitability Assessment Summary</span>
                      <span className="text-xs text-slate-400">{formatDate(result.created_at)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-800 leading-relaxed">
                    {result.recommendations.summary}
                  </CardContent>
                </Card>

                {/* Ranked Crop Cards */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                    Recommended Crop Options ({result.recommendations.recommendations.length})
                  </h3>

                  {result.recommendations.recommendations.map((crop: CropRecommendationItem, idx: number) => {
                    const badge = getSuitabilityBadge(crop.suitability_score);

                    return (
                      <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-extrabold text-slate-900">{crop.crop_name}</h4>
                                <Badge variant="secondary" className="capitalize text-[10px]">
                                  {crop.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{crop.score_explanation}</p>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${badge.color}`}>
                                {crop.suitability_score}% &bull; {badge.label}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Comparative AI Assessment</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                            <div>
                              <span className="font-semibold text-slate-700">Soil Condition:</span>
                              <p className="text-slate-600 mt-0.5">{crop.soil_requirements}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Water Needs:</span>
                              <p className="text-slate-600 mt-0.5">{crop.water_requirements}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Climate Needs:</span>
                              <p className="text-slate-600 mt-0.5">{crop.climate_requirements}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Expected Duration:</span>
                              <p className="text-slate-600 mt-0.5">
                                {crop.cultivation_duration_days ? `${crop.cultivation_duration_days} days` : "Seasonal"}
                              </p>
                            </div>
                          </div>

                          {/* Advantages & Risks */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                            <div>
                              <h5 className="font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Agronomic Advantages
                              </h5>
                              <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                                {crop.advantages.map((adv, i) => (
                                  <li key={i}>{adv}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Considerations & Risks
                              </h5>
                              <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                                {crop.risks.map((risk, i) => (
                                  <li key={i}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action footer */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500 italic max-w-sm truncate">
                              "{crop.recommendation_reason}"
                            </span>
                            <Link
                              to={`/app/advisory?farm_id=${result.farm_id}&crop_name=${encodeURIComponent(crop.crop_name)}`}
                            >
                              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                                <Compass className="w-3.5 h-3.5" /> Generate Advisory
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Missing Info & Warnings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {result.recommendations.missing_information.length > 0 && (
                    <Card className="bg-amber-50/40 border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs flex items-center gap-1.5 text-amber-900">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Information for Greater Accuracy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-slate-700">
                        {result.recommendations.missing_information.map((item, i) => (
                          <p key={i}>&bull; {item}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {result.recommendations.general_warnings.length > 0 && (
                    <Card className="bg-rose-50/40 border-rose-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs flex items-center gap-1.5 text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> General Agricultural Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-slate-700">
                        {result.recommendations.general_warnings.map((warn, i) => (
                          <p key={i}>&bull; {warn}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
