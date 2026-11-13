import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trees, Plus, MapPin, Droplets, ArrowRight, Trash2, Edit3, Compass } from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Farm } from "../../types/index.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/Skeleton.js";
import { ConfirmDialog } from "../../components/ui/Dialog.js";
import { toast } from "sonner";

export function FarmListPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Farm[]>("/farms");
      setFarms(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load farms";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/farms/${deleteId}`);
      toast.success("Farm profile deleted successfully");
      setDeleteId(null);
      fetchFarms();
    } catch {
      toast.error("Failed to delete farm");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your farms..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchFarms} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Agricultural Farms</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your land plots, recorded soil characteristics, and irrigation resources
          </p>
        </div>
        <Link to="/app/farms/new">
          <Button variant="primary" size="md" className="gap-2 font-bold shadow-sm">
            <Plus className="w-4 h-4" /> Register New Farm
          </Button>
        </Link>
      </div>

      {farms.length === 0 ? (
        <EmptyState
          icon={Trees}
          title="No Farms Registered Yet"
          description="Register your first plot to enable AI crop suitability recommendations and field advisories."
          actionLabel="+ Register Farm"
          onAction={() => (window.location.href = "/app/farms/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <Card key={farm.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{farm.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {farm.district}, {farm.state} {farm.village && `(${farm.village})`}
                      </span>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-xs capitalize font-semibold">
                    {farm.area} {farm.area_unit}
                  </Badge>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Soil Classification:</span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {farm.soil_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Soil pH:</span>
                    <span className="font-semibold text-slate-700">
                      {farm.soil_ph !== null && farm.soil_ph !== undefined ? farm.soil_ph : "Not tested"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Irrigation Setup:</span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {farm.irrigation_type} ({farm.water_availability})
                    </span>
                  </div>
                </div>

                {farm.notes && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic">
                    "{farm.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Link to={`/app/farms/${farm.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" title="Edit Farm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      title="Delete Farm"
                      onClick={() => setDeleteId(farm.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Link to={`/app/farms/${farm.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Farm Record"
        message="Are you sure you want to delete this farm? Associated activity and advisory records will remain in history."
        confirmLabel="Delete Farm"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
