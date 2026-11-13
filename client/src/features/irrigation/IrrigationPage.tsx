import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Droplets,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, Crop, IrrigationAdvisoryResult, AdvisoryReport } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/Skeleton.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { toast } from "sonner";

const irrigationSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop: z.string().trim().min(1, "Crop is required"),
  growth_stage: z.string().trim().min(1, "Growth stage is required"),
  soil_type: z.string().trim().min(1, "Soil type is required"),
  irrigation_method: z.string().trim().min(1, "Irrigation method is required"),
  water_availability: z.string().trim().min(1, "Water availability is required"),
  rainfall: z.string().max(200).optional().nullable(),
  language: z.string().default("en"),
});

type IrrigationFormData = z.infer<typeof irrigationSchema>;

export function IrrigationPage() {
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
  } = useForm<IrrigationFormData>({
    resolver: zodResolver(irrigationSchema),
    defaultValues: {
      growth_stage: "Tillering / Active Vegetative",
      soil_type: "Red Loam",
      irrigation_method: "Drip Irrigation",
      water_availability: "Moderate",
      rainfall: "No significant rainfall in the last 7 days",
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
      setValue("irrigation_method", farm.irrigation_type);
      setValue("water_availability", farm.water_availability);
    }
  }, [selectedFarmId, farms, setValue]);

  const onSubmit = async (data: IrrigationFormData) => {
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await api.post<AdvisoryReport>("/ai/irrigation-advisory", data);
      setResult(res.data);
      toast.success("Irrigation schedule guidance generated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate irrigation guidance";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingInitial) return <LoadingState message="Loading irrigation module..." />;

  const irrigationData: IrrigationAdvisoryResult | undefined = result?.result_data as unknown as IrrigationAdvisoryResult;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-sky-600" /> Precision Irrigation Advisory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Water stewardship guidelines tailored to crop moisture needs, soil retention characteristics, and delivery system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form (Left 1 Col) */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Field Moisture Parameters</CardTitle>
            <CardDescription>Enter hydrological context</CardDescription>
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

              <Input
                label="Crop Growth Stage"
                placeholder="e.g. Flowering, Panicle initiation"
                error={errors.growth_stage?.message}
                required
                {...register("growth_stage")}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Soil Type"
                  placeholder="e.g. Red Sandy Loam"
                  error={errors.soil_type?.message}
                  required
                  {...register("soil_type")}
                />
                <Input
                  label="Irrigation Method"
                  placeholder="e.g. Drip, Furrow"
                  error={errors.irrigation_method?.message}
                  required
                  {...register("irrigation_method")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Water Availability"
                  options={[
                    { value: "High", label: "High" },
                    { value: "Moderate", label: "Moderate" },
                    { value: "Low", label: "Low / Constrained" },
                    { value: "Seasonal", label: "Seasonal" },
                  ]}
                  {...register("water_availability")}
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

              <Input
                label="Recent Rainfall / Weather"
                placeholder="e.g. 15mm shower 3 days ago"
                helperText="Live weather is not simulated; based on your report"
                error={errors.rainfall?.message}
                {...register("rainfall")}
              />

              <Button type="submit" variant="primary" className="w-full font-bold shadow-sm" isLoading={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Irrigation Schedule
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isGenerating && (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <LoadingState message="Formulating moisture budget and irrigation intervals..." />
            </Card>
          )}

          {!isGenerating && !result && (
            <Card className="p-10 text-center bg-slate-50/50 border-dashed border-slate-300">
              <Droplets className="w-10 h-10 text-sky-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Irrigation Advisory Calculated</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Enter your crop, soil type, and irrigation delivery system to receive tailored watering recommendations.
              </p>
            </Card>
          )}

          {!isGenerating && result && irrigationData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary Card */}
              <Card className="border-l-4 border-l-sky-500">
                <CardHeader className="pb-2">
                  <Badge variant="primary" className="uppercase text-[10px] w-fit">
                    {result.crop_name}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Irrigation Management Plan</h3>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  {irrigationData.summary}
                </CardContent>
              </Card>

              {/* Step-by-step guidance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" /> Irrigation Scheduling Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {irrigationData.irrigation_guidance?.map((g, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-sky-50/40 border border-sky-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800">{g}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Monitoring & Stress Signs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-800">
                      Field Soil & Canopy Monitoring Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-600">
                    {irrigationData.monitoring_indicators?.map((m, i) => (
                      <p key={i}>&bull; {m}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Early Water Stress Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-700">
                    {irrigationData.water_stress_signs?.map((s, i) => (
                      <p key={i}>&bull; {s}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Excess water warnings */}
              {irrigationData.excess_water_warnings?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                  <h4 className="font-bold flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Warnings on Waterlogging & Excessive Saturation
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {irrigationData.excess_water_warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
