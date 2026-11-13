import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  UploadCloud,
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Trees,
  Sparkles,
  Info,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, Crop, DiseaseReport, DiseaseAnalysisResult } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/Skeleton.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { toast } from "sonner";

export function DiseaseDetectionPage() {
  const { aiLanguage } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [cropName, setCropName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState(aiLanguage || "en");

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState<DiseaseReport | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Farm[]>("/farms"),
      api.get<Crop[]>("/crops", { params: { limit: 100 } }),
    ])
      .then(([farmsRes, cropsRes]) => {
        setFarms(farmsRes.data || []);
        setCrops(cropsRes.data || []);
      })
      .finally(() => setLoadingInitial(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file size must be less than 8 MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please upload a photograph of the affected crop leaf, fruit, or stem");
      return;
    }

    if (!cropName.trim()) {
      toast.error("Please specify the crop name");
      return;
    }

    if (!symptoms.trim() || symptoms.trim().length < 3) {
      toast.error("Please describe the visible symptoms or pattern observed");
      return;
    }

    setIsAnalyzing(true);
    setReportResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("crop_name", cropName.trim());
    formData.append("symptoms", symptoms.trim());
    formData.append("language", language);
    if (selectedFarmId) formData.append("farm_id", selectedFarmId);

    try {
      const res = await api.upload<DiseaseReport>("/ai/disease-analysis", formData);
      setReportResult(res.data);
      toast.success("Disease diagnosis completed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Crop image diagnostic failed";
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loadingInitial) {
    return <LoadingState message="Loading diagnostic clinic..." />;
  }

  const analysis: DiseaseAnalysisResult | undefined = reportResult?.analysis_result;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-emerald-600" /> AI Crop Disease Diagnostic Assistance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload clear close-up photos of leaves, stems, or fruits showing discoloration, spots, or pest damage for
          preliminary AI triage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column (Left 1 Col) */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload & Observation</CardTitle>
            <CardDescription>Provide crop photo & field context</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Uploader & Preview */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Crop Photograph <span className="text-rose-500">*</span>
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Click to upload crop image</p>
                    <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, or WebP up to 8 MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={imagePreview}
                      alt="Crop specimen"
                      className="w-full h-48 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Crop selection */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Target Crop <span className="text-rose-500">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                >
                  <option value="">-- Choose Crop or Type --</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Or enter custom crop (e.g. Chilli, Cotton)"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                />
              </div>

              {/* Farm plot */}
              <Select
                label="Farm Plot Location (Optional)"
                options={[
                  { value: "", label: "-- General Location --" },
                  ...farms.map((f) => ({ value: f.id, label: `${f.name} (${f.district})` })),
                ]}
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
              />

              {/* Symptoms Description */}
              <Textarea
                label="Visible Symptoms"
                placeholder="e.g. Circular brown spots with yellow halos on lower leaves, drooping stems during daytime..."
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />

              <Select
                label="Response Language"
                options={[
                  { value: "en", label: "English" },
                  { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
                  { value: "hi", label: "Hindi (हिन्दी)" },
                ]}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />

              <Button type="submit" variant="primary" className="w-full font-bold shadow-sm" isLoading={isAnalyzing}>
                <Sparkles className="w-4 h-4 mr-2" /> Submit Photo for Diagnosis
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Diagnostic Results (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isAnalyzing && (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <LoadingState message="Analyzing image patterns, lesions, and symptomology with Gemini Vision..." />
            </Card>
          )}

          {!isAnalyzing && !reportResult && (
            <Card className="p-10 text-center bg-slate-50/50 border-dashed border-slate-300">
              <Stethoscope className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Ready for Diagnostic Examination</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload a clear close-up photo of the symptomatic leaf or plant area and submit for preliminary identification.
              </p>
            </Card>
          )}

          {!isAnalyzing && reportResult && analysis && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Diagnostic Overview Banner */}
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Badge variant="primary" className="uppercase text-[10px] font-bold">
                        {reportResult.crop_name}
                      </Badge>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        Preliminary Diagnostic Report
                      </h2>
                    </div>
                    {analysis.expert_consultation_recommended && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200 shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-700" /> Professional Consultation Advised
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 text-xs">
                  {/* Observed Symptoms */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Observed Visual Symptoms:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.observed_symptoms.map((s, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-slate-500 text-[11px]">
                    Assessed Image Quality: <span className="font-semibold text-slate-700">{analysis.image_quality}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Possible Causes Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Identified Possible Causes ({analysis.possible_causes.length})
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {analysis.possible_causes.map((cause, idx) => (
                    <Card key={idx} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-bold text-slate-900">{cause.name}</h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              cause.confidence.toLowerCase().includes("high")
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Confidence: {cause.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{cause.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Immediate Safe Actions & Prevention */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <Card className="bg-emerald-50/50 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Immediate Safe Field Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-700">
                    {analysis.immediate_actions.map((act, i) => (
                      <p key={i}>&bull; {act}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-sky-50/50 border-sky-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-sky-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Integrated Prevention & Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-slate-700">
                    {analysis.prevention.map((prev, i) => (
                      <p key={i}>&bull; {prev}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Observations Needed */}
              {analysis.additional_observations_needed.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Additional Observations Recommended in Field:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {analysis.additional_observations_needed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strict Disclaimer Notice (Section 4.6 & 15.3) */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Preliminary Diagnostic Notice:</span>{" "}
                  {analysis.disclaimer ||
                    "This automated image assessment provides preliminary assistance and cannot replace laboratory diagnostic assays. Do not apply hazardous chemical treatments without verification from qualified agricultural extension officers."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
