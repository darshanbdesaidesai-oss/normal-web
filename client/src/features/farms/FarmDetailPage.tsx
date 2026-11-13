import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Trees,
  MapPin,
  Droplets,
  Edit3,
  Trash2,
  Sparkles,
  Compass,
  ArrowLeft,
  CalendarCheck2,
  Info,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm, FarmingActivity } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState } from "../../components/ui/Skeleton.js";
import { ConfirmDialog } from "../../components/ui/Dialog.js";
import { formatDate } from "../../lib/utils.js";
import { toast } from "sonner";

export function FarmDetailPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!farmId) return;
    const fetchFarmAndActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const [farmRes, actRes] = await Promise.all([
          api.get<Farm>(`/farms/${farmId}`),
          api.get<FarmingActivity[]>("/activities", { params: { farm_id: farmId } }),
        ]);
        setFarm(farmRes.data);
        setActivities(actRes.data || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load farm details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmAndActivities();
  }, [farmId]);

  const handleDelete = async () => {
    if (!farmId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/farms/${farmId}`);
      toast.success("Farm deleted successfully");
      navigate("/app/farms");
    } catch {
      toast.error("Failed to delete farm");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading farm records..." />;
  if (error || !farm) return <ErrorState message={error || "Farm not found"} />;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/app/farms" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-semibold mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farms
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Trees className="w-6 h-6 text-emerald-600" /> {farm.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {farm.district}, {farm.state} {farm.village && `(${farm.village})`}
            </span>
            <span>&bull; Registered {formatDate(farm.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/app/farms/${farm.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5" /> Edit Farm
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-rose-600 hover:bg-rose-50"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Action shortcuts banner for this farm */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Run AI Analysis for {farm.name}</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Pre-populate recommendations and crop guidance with this farm's soil and water parameters.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to={`/app/crop-recommendations?farm_id=${farm.id}`} className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full text-xs font-bold gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Recommend Crops
            </Button>
          </Link>
          <Link to={`/app/advisory?farm_id=${farm.id}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1.5 bg-white border-emerald-300 text-emerald-800">
              <Compass className="w-3.5 h-3.5" /> Generate Advisory
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Characteristics & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil & Land Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Soil & Field Parameters</CardTitle>
            <CardDescription>Baseline characteristics for agricultural models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-slate-500 font-medium">Total Area</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {farm.area} {farm.area_unit}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Dominant Soil Type</p>
                <p className="text-base font-bold text-slate-800 capitalize mt-0.5">
                  {farm.soil_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-slate-500 font-medium">Soil pH Reaction</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {farm.soil_ph !== null && farm.soil_ph !== undefined ? farm.soil_ph : "Not tested"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">GPS Coordinates</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {farm.latitude && farm.longitude ? `${farm.latitude}, ${farm.longitude}` : "Not logged"}
                </p>
              </div>
            </div>

            {farm.notes && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">Farmer Observations:</span>
                <p className="text-slate-600 mt-1 italic leading-relaxed">"{farm.notes}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Irrigation Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Water & Irrigation Resources</CardTitle>
            <CardDescription>Hydrological context for scheduling algorithms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-slate-500 font-medium">Irrigation Method</p>
                <p className="text-base font-bold text-slate-800 capitalize mt-0.5">
                  {farm.irrigation_type}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Water Availability</p>
                <p className="text-base font-bold text-slate-800 capitalize mt-0.5">
                  {farm.water_availability}
                </p>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-3 rounded-lg text-sky-900 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Droplets className="w-4 h-4 text-sky-600" /> Irrigation Advisory Note
              </div>
              <span>
                Based on {farm.irrigation_type} system and {farm.water_availability} availability, AI crop recommendations
                will bias toward water-efficient varieties and flag high water-stress vulnerabilities during summer months.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farming Activities Log for this Farm */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
              Activities for this Farm ({activities.length})
            </CardTitle>
            <CardDescription>Cultivation tasks scheduled for {farm.name}</CardDescription>
          </div>
          <Link to={`/app/activities?farm_id=${farm.id}`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              + Add Farm Task
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No tasks currently scheduled for this farm.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{act.title}</span>
                    {act.crop_name && <span className="text-slate-500 ml-2">({act.crop_name})</span>}
                    <div className="text-[11px] text-slate-400 mt-0.5">Scheduled: {formatDate(act.scheduled_date)}</div>
                  </div>
                  <Badge variant={act.status === "completed" ? "success" : "warning"} className="uppercase text-[10px]">
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${farm.name}`}
        message="Are you sure you want to delete this farm? This action cannot be undone."
        confirmLabel="Delete Farm"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
