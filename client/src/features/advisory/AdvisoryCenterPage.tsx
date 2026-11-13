import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Compass,
  Trees,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Save,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, Crop, AdvisoryReport, AdvisoryData } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/Skeleton.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { toast } from "sonner";

const advisoryFormSchema = z.object({
  farm_id: z.string().uuid().optional().nullable(),
  crop_id: z.string().uuid().optional().nullable(),
  crop_name: z.string().trim().min(1, "Crop name is required"),
  advisory_type: z.enum([
    "cultivation",
    "crop_recommendation",
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

type AdvisoryFormData = z.infer<typeof advisoryFormSchema>;

export function AdvisoryCenterPage() {
  const [searchParams] = useSearchParams();
  const preselectedFarmId = searchParams.get("farm_id");
  const preselectedCropName = searchParams.get("crop_name");
  const preselectedCropId = searchParams.get("crop_id");
  const { aiLanguage } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [advisoryResult, setAdvisoryResult] = useState<AdvisoryReport | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdvisoryFormData>({
    resolver: zodResolver(advisoryFormSchema),
    defaultValues: {
      crop_name: preselectedCropName || "",
      crop_id: preselectedCropId || undefined,
      advisory_type: "cultivation",
      growth_stage: "Vegetative Phase",
      language: aiLanguage || "en",
    },
  });

  const selectedCropName = watch("crop_name");

  useEffect(() => {
    Promise.all([
      api.get<Farm[]>("/farms"),
      api.get<Crop[]>("/crops", { params: { limit: 100 } }),
    ])
      .then(([farmsRes, cropsRes]) => {
        const farmList = farmsRes.data || [];
        setFarms(farmList);
        setCrops(cropsRes.data || []);

        if (preselectedFarmId && farmList.some((f) => f.id === preselectedFarmId)) {
          setValue("farm_id", preselectedFarmId);
        } else if (farmList.length > 0 && farmList[0]) {
          setValue("farm_id", farmList[0].id);
        }
      })
      .finally(() => setLoadingInitial(false));
  }, [preselectedFarmId, setValue]);

  const onSubmit = async (data: AdvisoryFormData) => {
    setIsGenerating(true);
    setAdvisoryResult(null);
    try {
      const res = await api.post<AdvisoryReport>("/ai/advisory", data);
      setAdvisoryResult(res.data);
      toast.success("Advisory generated and saved to history!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate agricultural advisory";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingInitial) {
    return <LoadingState message="Loading advisory center..." />;
  }

  const advisoryData: AdvisoryData | undefined = advisoryResult?.result_data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" /> Agricultural Advisory Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate practical, step-by-step crop advisories tailored to your farm soil, irrigation, and crop stage.
          </p>
        </div>
        <Link to="/app/history">
          <Button variant="outline" size="sm" className="font-semibold text-xs gap-1.5">
            View Saved Advisories <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel (Left 1 Col) */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Advisory Request</CardTitle>
            <CardDescription>Select crop and guidance category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Optional Farm */}
              <Select
                label="Select Farm Plot"
                options={[
                  { value: "", label: "-- General / No Specific Farm --" },
                  ...farms.map((f) => ({
                    value: f.id,
                    label: `${f.name} (${f.district}, ${f.area} ${f.area_unit})`,
                  })),
                ]}
                error={errors.farm_id?.message}
                {...register("farm_id")}
              />

              {/* Crop Quick Fill or Custom */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Target Crop <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => {
                      const selected = crops.find((c) => c.name === e.target.value);
                      if (selected) {
                        setValue("crop_name", selected.name);
                        setValue("crop_id", selected.id);
                      }
                    }}
                    value={crops.some((c) => c.name === selectedCropName) ? selectedCropName : ""}
                  >
                    <option value="">-- Choose from Catalog or Type --</option>
                    {crops.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Or type custom crop name (e.g. Groundnut)"
                  error={errors.crop_name?.message}
                  {...register("crop_name")}
                />
              </div>

              {/* Advisory Category */}
              <Select
                label="Advisory Category"
                options={[
                  { value: "cultivation", label: "Full Cultivation Practice" },
                  { value: "crop_recommendation", label: "Crop Selection Advice" },
                  { value: "soil_management", label: "Soil Health & Tilth" },
                  { value: "nutrient_management", label: "Fertilizer & Nutrition" },
                  { value: "irrigation", label: "Irrigation Scheduling" },
                  { value: "pest_management", label: "Pest Control & IPM" },
                  { value: "disease_prevention", label: "Disease Prevention" },
                  { value: "disease_diagnosis", label: "Symptom Diagnosis" },
                  { value: "weed_management", label: "Weed Control" },
                  { value: "harvesting", label: "Harvesting Readiness" },
                  { value: "post_harvest", label: "Post-Harvest Handling" },
                ]}
                error={errors.advisory_type?.message}
                required
                {...register("advisory_type")}
              />

              {/* Growth Stage */}
              <Select
                label="Current Crop Stage"
                options={[
                  { value: "Land Preparation / Pre-sowing", label: "Land Prep / Pre-sowing" },
                  { value: "Sowing & Germination", label: "Sowing & Germination" },
                  { value: "Early Vegetative Phase", label: "Early Vegetative Phase" },
                  { value: "Tillering / Branching", label: "Tillering / Branching" },
                  { value: "Flowering & Fruit/Earhead Set", label: "Flowering & Fruit/Earhead Set" },
                  { value: "Grain Filling / Pod Development", label: "Grain Filling / Pod Development" },
                  { value: "Ripening & Maturity", label: "Ripening & Maturity" },
                  { value: "Post-Harvest & Storage", label: "Post-Harvest & Storage" },
                ]}
                error={errors.growth_stage?.message}
                {...register("growth_stage")}
              />

              {/* Farmer Observations */}
              <Textarea
                label="Specific Observations or Concerns"
                placeholder="Describe any yellowing leaves, pest sightings, recent rain, or fertilizer applied..."
                rows={3}
                error={errors.observations?.message}
                {...register("observations")}
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

              <Button type="submit" variant="primary" className="w-full font-bold shadow-sm" isLoading={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Agricultural Advisory
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Panel (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isGenerating && (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <LoadingState message="Generating structured agronomic advisory with verified ICAR practices..." />
            </Card>
          )}

          {!isGenerating && !advisoryResult && (
            <Card className="p-10 text-center bg-slate-50/50 border-dashed border-slate-300">
              <Compass className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Advisory Active</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Select your crop, current growth stage, and category on the left to receive customized advisory guidance.
              </p>
            </Card>
          )}

          {!isGenerating && advisoryResult && advisoryData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Card */}
              <Card className="border-l-4 border-l-emerald-600">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="uppercase text-[10px] font-bold">
                          {advisoryResult.crop_name}
                        </Badge>
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          {advisoryResult.advisory_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">{advisoryData.title}</h2>
                    </div>
                    {advisoryData.expert_verification_required && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Expert Review Advised
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                  <p>{advisoryData.summary}</p>
                </CardContent>
              </Card>

              {/* Detailed Recommendations */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Key Recommendations ({advisoryData.recommendations.length})
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {advisoryData.recommendations.map((rec, idx) => (
                    <Card key={idx} className="border-slate-200/90 shadow-2xs">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {rec.heading}
                          </h4>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-7">{rec.description}</p>
                        <p className="text-[11px] text-slate-400 mt-2 pl-7 italic">Reason: {rec.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Action Timeline */}
              {advisoryData.action_steps.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" /> Recommended Action Steps & Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {advisoryData.action_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{step.action}</span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {step.timing}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Risks & Warnings Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {advisoryData.risks.length > 0 && (
                  <Card className="bg-amber-50/50 border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Agronomic Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-slate-700">
                      {advisoryData.risks.map((risk, i) => (
                        <p key={i}>&bull; {risk}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {advisoryData.warnings.length > 0 && (
                  <Card className="bg-rose-50/50 border-rose-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5 text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Agricultural Cautions & Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-slate-700">
                      {advisoryData.warnings.map((warn, i) => (
                        <p key={i}>&bull; {warn}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Missing Information Notice */}
              {advisoryData.missing_information.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Information that would improve accuracy:</span>
                    <span className="ml-1">{advisoryData.missing_information.join("; ")}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
