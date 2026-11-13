import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FlaskConical,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, Crop, NutrientAdvisoryResult, AdvisoryReport } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/Skeleton.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { toast } from "sonner";

const nutrientSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop: z.string().trim().min(1, "Crop is required"),
  growth_stage: z.string().trim().min(1, "Growth stage is required"),
  soil_type: z.string().trim().min(1, "Soil type is required"),
  soil_test: z.string().max(500).optional().nullable(),
  fertilizer_history: z.string().max(500).optional().nullable(),
  farm_area: z.string().trim().min(1, "Farm area is required"),
  language: z.string().default("en"),
});

type NutrientFormData = z.infer<typeof nutrientSchema>;

export function NutrientsPage() {
  const { aiLanguage } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AdvisoryReport | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NutrientFormData>({
    resolver: zodResolver(nutrientSchema),
    defaultValues: {
      growth_stage: "Early Vegetative",
      soil_type: "Red Soil",
      farm_area: "5 Acres",
      soil_test: "Medium organic carbon, available P low, available K medium",
      fertilizer_history: "10 tonnes FYM applied at basal ploughing",
      language: aiLanguage || "en",
    },
  });

  const selectedFarmId = watch("farm_id");

  useEffect(() => {
    Promise.all([
      api.get<Farm[]>("/farms"),
      api.get<Crop[]>("/crops", { params: { limit: 100 } }),
    ])
      .then(([farmsRes, cropsRes]) => {
        const farmList = farmsRes.data || [];
        setFarms(farmList);
        setCrops(cropsRes.data || []);
        if (farmList.length > 0 && farmList[0]) {
          setValue("farm_id", farmList[0].id);
        }
      })
      .finally(() => setLoadingInitial(false));
  }, [setValue]);

  useEffect(() => {
    if (!selectedFarmId) return;
    const farm = farms.find((f) => f.id === selectedFarmId);
    if (farm) {
      setValue("soil_type", farm.soil_type.replace(/_/g, " "));
      setValue("farm_area", `${farm.area} ${farm.area_unit}`);
    }
  }, [selectedFarmId, farms, setValue]);

  const onSubmit = async (data: NutrientFormData) => {
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await api.post<AdvisoryReport>("/ai/nutrient-advisory", data);
      setResult(res.data);
      toast.success("Nutrient management plan generated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate nutrient plan";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingInitial) return <LoadingState message="Loading nutrient stewardship module..." />;

  const nutrientData: NutrientAdvisoryResult | undefined = result?.result_data as unknown as NutrientAdvisoryResult;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-indigo-600" /> Fertilizer & Crop Nutrition Stewardship
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Responsible nutrient management, deficiency symptom diagnosis, and organic soil health practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form (Left 1 Col) */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Soil & Fertility Input</CardTitle>
            <CardDescription>Enter nutrient history & plot context</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Associated Farm"
                options={[
                  { value: "", label: "-- General Field --" },
                  ...farms.map((f) => ({ value: f.id, label: `${f.name} (${f.district})` })),
                ]}
                {...register("farm_id")}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Target Crop <span className="text-rose-500">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => setValue("crop", e.target.value)}
                >
                  <option value="">-- Choose Crop from Catalog --</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Input placeholder="Or enter crop name" error={errors.crop?.message} {...register("crop")} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Growth Stage"
                  placeholder="e.g. Sowing, Flowering"
                  error={errors.growth_stage?.message}
                  required
                  {...register("growth_stage")}
                />
                <Input
                  label="Plot Area"
                  placeholder="e.g. 5 Acres"
                  error={errors.farm_area?.message}
                  required
                  {...register("farm_area")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Soil Type"
                  placeholder="e.g. Red Soil"
                  error={errors.soil_type?.message}
                  required
                  {...register("soil_type")}
                />
                <Select
                  label="Language"
                  options={[
                    { value: "en", label: "English" },
                    { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
                    { value: "hi", label: "Hindi (हिन्दी)" },
                  ]}
                  {...register("language")}
                />
              </div>

              <Textarea
                label="Soil Test Results (Optional)"
                placeholder="Mention organic carbon %, NPK levels, or Micronutrient (Zn, B, Fe) status if available..."
                rows={2}
                error={errors.soil_test?.message}
                {...register("soil_test")}
              />

              <Textarea
                label="Previous Fertilizer / Manure Applied"
                placeholder="e.g. 100 kg DAP, 5 tonnes FYM at basal..."
                rows={2}
                error={errors.fertilizer_history?.message}
                {...register("fertilizer_history")}
              />

              <Button type="submit" variant="primary" className="w-full font-bold shadow-sm" isLoading={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Nutrient Strategy
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isGenerating && (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <LoadingState message="Calculating balanced nutrition, deficiency indicators, and organic recommendations..." />
            </Card>
          )}

          {!isGenerating && !result && (
            <Card className="p-10 text-center bg-slate-50/50 border-dashed border-slate-300">
              <FlaskConical className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Nutrient Plan Generated</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Enter your crop, soil type, and existing fertilizer history to receive balanced agronomic guidance.
              </p>
            </Card>
          )}

          {!isGenerating && result && nutrientData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary Card */}
              <Card className="border-l-4 border-l-indigo-600">
                <CardHeader className="pb-2">
                  <Badge variant="primary" className="uppercase text-[10px] w-fit">
                    {result.crop_name}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Balanced Nutrient Management Plan</h3>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  {nutrientData.summary}
                </CardContent>
              </Card>

              {/* Core Nutrient Considerations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-indigo-600" /> Agronomic Nutrient Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {nutrientData.nutrient_considerations?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Deficiencies & Soil Testing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <Card className="border-amber-200 bg-amber-50/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Possible Nutrient Deficiency Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-700">
                    {nutrientData.possible_deficiencies?.map((def, i) => (
                      <p key={i}>&bull; {def}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Soil Testing Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-700">
                    {nutrientData.soil_testing_recommendations?.map((st, i) => (
                      <p key={i}>&bull; {st}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Environmental Precautions & Application Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-800">
                      Application Timing & Method Guidance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-600">
                    {nutrientData.application_guidance?.map((app, i) => (
                      <p key={i}>&bull; {app}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-800">
                      Environmental & Runoff Precautions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-600">
                    {nutrientData.environmental_precautions?.map((env, i) => (
                      <p key={i}>&bull; {env}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
