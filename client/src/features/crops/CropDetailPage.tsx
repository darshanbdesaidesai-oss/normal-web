import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Droplets,
  Clock,
  Compass,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Crop } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState } from "../../components/ui/Skeleton.js";

export function CropDetailPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("land_prep");

  useEffect(() => {
    if (!cropId) return;
    const fetchCrop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Crop>(`/crops/${cropId}`);
        setCrop(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load crop details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, [cropId]);

  if (loading) return <LoadingState message="Loading crop agronomic guide..." />;
  if (error || !crop) return <ErrorState message={error || "Crop not found"} />;

  const guide = crop.cultivation_guide || {};

  return (
    <div className="space-y-6">
      {/* Header and Back Link */}
      <div>
        <Link to="/app/crops" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-semibold mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Knowledge Library
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{crop.name}</h1>
              <Badge variant="secondary" className="capitalize text-xs font-bold">
                {crop.category}
              </Badge>
            </div>
            {crop.scientific_name && (
              <p className="text-sm italic text-slate-500 font-serif mt-0.5">{crop.scientific_name}</p>
            )}
          </div>

          <Link to={`/app/advisory?crop_id=${crop.id}&crop_name=${encodeURIComponent(crop.name)}`}>
            <Button variant="primary" size="md" className="font-bold gap-2 shadow-sm">
              <Compass className="w-4 h-4" /> Generate Advisory for {crop.name}
            </Button>
          </Link>
        </div>
      </div>

      {/* Description Overview */}
      {crop.description && (
        <Card className="bg-emerald-50/50 border-emerald-200/80">
          <CardContent className="p-5 text-sm text-slate-700 leading-relaxed">
            {crop.description}
          </CardContent>
        </Card>
      )}

      {/* Core Agronomic Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</span>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {crop.cultivation_duration_days ? `${crop.cultivation_duration_days} Days` : "Seasonal"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Seasons</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {crop.suitable_seasons?.map((s, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] uppercase font-bold">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Soil Suitability</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {crop.suitable_soils?.slice(0, 3).map((s, idx) => (
                <Badge key={idx} variant="primary" className="text-[10px] capitalize">
                  {s.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Water Needs</span>
            <p className="text-xs font-semibold text-sky-700 mt-1 line-clamp-2">
              {crop.water_requirements || "Moderate"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cultivation Guide Tabs */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Step-by-Step Cultivation Guide</CardTitle>
              <CardDescription>Verified practices from Indian agronomy institutes</CardDescription>
            </div>
          </div>
          {/* Guide Sub-Tabs */}
          <div className="flex gap-2 overflow-x-auto pt-3 scrollbar-none">
            {[
              { id: "land_prep", label: "Land Preparation" },
              { id: "sowing", label: "Sowing & Spacing" },
              { id: "nutrition", label: "Nutrient Management" },
              { id: "irrigation", label: "Irrigation Scheduling" },
              { id: "pests", label: "Pest & Disease IPM" },
              { id: "harvest", label: "Harvesting & Curing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeTab === "land_prep" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Land & Seedbed Preparation</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.land_preparation || "Ensure thorough deep ploughing followed by harrowing to achieve optimal soil tilth and weed eradication."}
              </p>
            </div>
          )}

          {activeTab === "sowing" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Sowing, Seed Rate & Spacing</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.sowing || "Use certified pathogen-free seeds treated with recommended biofertilizers (Rhizobium/PSB) or mild fungicides prior to sowing."}
              </p>
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Balanced Nutrient Management (NPK & Micro-nutrients)</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.nutrient_management || "Apply balanced NPK according to regional soil-test recommendations. Incorporate organic FYM (10-15 t/ha) prior to final ploughing."}
              </p>
            </div>
          )}

          {activeTab === "irrigation" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Irrigation Management & Critical Moisture Stages</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.irrigation || "Irrigate during critical physiological growth stages (branching, flowering, grain/pod filling). Avoid water stagnation."}
              </p>
            </div>
          )}

          {activeTab === "pests" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Integrated Pest & Disease Management (IPM)</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.pest_and_disease || "Monitor regularly with pheromone traps. Employ biological controls (neem seed kernel extract, Trichoderma) before chemical interventions."}
              </p>
            </div>
          )}

          {activeTab === "harvest" && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Maturity Indices, Harvesting & Storage</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {guide.harvesting || "Harvest at full physiological maturity during dry morning hours. Dry to recommended moisture percentage before warehousing."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institutional Sources */}
      {crop.source_references && crop.source_references.length > 0 && (
        <Card className="bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Agronomic Verification Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-1">
            {crop.source_references.map((ref, idx) => (
              <p key={idx}>&bull; {ref}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
