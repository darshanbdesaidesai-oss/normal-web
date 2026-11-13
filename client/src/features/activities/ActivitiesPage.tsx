import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarCheck2,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Calendar,
  Trees,
  Filter,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { FarmingActivity, Farm, Crop, ActivityStatus } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Badge } from "../../components/ui/Badge.js";
import { Dialog, ConfirmDialog } from "../../components/ui/Dialog.js";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/Skeleton.js";
import { formatDate } from "../../lib/utils.js";
import { toast } from "sonner";

export function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const preselectedFarmId = searchParams.get("farm_id");

  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedFarm, setSelectedFarm] = useState<string>(preselectedFarmId || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FarmingActivity | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [farmId, setFarmId] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropName, setCropName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<ActivityStatus>("pending");

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (selectedFarm !== "all") params.farm_id = selectedFarm;
      if (statusFilter !== "all") params.status = statusFilter;

      const [actRes, farmsRes, cropsRes] = await Promise.all([
        api.get<FarmingActivity[]>("/activities", { params }),
        api.get<Farm[]>("/farms"),
        api.get<Crop[]>("/crops", { params: { limit: 100 } }),
      ]);

      setActivities(actRes.data || []);
      setFarms(farmsRes.data || []);
      setCrops(cropsRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load activities";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedFarm, statusFilter]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setFarmId(farms[0]?.id || "");
    setCropId("");
    setCropName("");
    setTitle("");
    setDescription("");
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split("T")[0] || "");
    setStatus("pending");
    setIsModalOpen(true);
  };

  const openEditModal = (act: FarmingActivity) => {
    setEditingActivity(act);
    setFarmId(act.farm_id);
    setCropId(act.crop_id || "");
    setCropName(act.crop_name || "");
    setTitle(act.title);
    setDescription(act.description || "");
    setScheduledDate(act.scheduled_date);
    setStatus(act.status);
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) {
      toast.error("Please select a farm");
      return;
    }
    if (!title.trim()) {
      toast.error("Activity title is required");
      return;
    }
    if (!scheduledDate) {
      toast.error("Scheduled date is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      farm_id: farmId,
      crop_id: cropId || null,
      crop_name: cropName || null,
      title: title.trim(),
      description: description.trim() || null,
      scheduled_date: scheduledDate,
      status,
    };

    try {
      if (editingActivity) {
        await api.patch(`/activities/${editingActivity.id}`, payload);
        toast.success("Activity updated successfully");
      } else {
        await api.post("/activities", payload);
        toast.success("Activity scheduled successfully");
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save activity";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleComplete = async (act: FarmingActivity) => {
    const nextStatus = act.status === "completed" ? "pending" : "completed";
    try {
      await api.patch(`/activities/${act.id}`, { status: nextStatus });
      toast.success(nextStatus === "completed" ? "Activity marked as completed!" : "Activity reopened");
      fetchActivities();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/activities/${deleteId}`);
      toast.success("Activity removed");
      setDeleteId(null);
      fetchActivities();
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-600" /> Farming Activity Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule and track essential field operations: sowing, fertilizer application, irrigation, and harvest.
          </p>
        </div>

        <Button variant="primary" size="md" className="gap-2 font-bold shadow-sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Schedule New Activity
        </Button>
      </div>

      {/* Filter Row */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              options={[
                { value: "all", label: "All Farms" },
                ...farms.map((f) => ({ value: f.id, label: f.name })),
              ]}
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-48 text-xs"
            />

            <Select
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending Tasks" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 text-xs"
            />
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{activities.length}</strong> tasks
          </span>
        </CardContent>
      </Card>

      {/* Activities Timeline / Cards */}
      {loading ? (
        <LoadingState message="Loading activities schedule..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchActivities} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No Activities Scheduled"
          description="Plan your next field task, irrigation, or pest monitoring inspection."
          actionLabel="+ Schedule Task"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const isCompleted = act.status === "completed";
            const today = new Date().toISOString().split("T")[0] || "";
            const isOverdue = !isCompleted && act.scheduled_date < today;

            return (
              <Card
                key={act.id}
                className={`transition-all ${
                  isCompleted
                    ? "bg-slate-50/70 border-slate-200 opacity-80"
                    : isOverdue
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-slate-200"
                }`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(act)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-emerald-500 text-transparent"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted ? "line-through text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {act.title}
                        </h4>
                        {isOverdue && (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Overdue
                          </Badge>
                        )}
                        <Badge
                          variant={isCompleted ? "success" : "outline"}
                          className="capitalize text-[10px]"
                        >
                          {act.status}
                        </Badge>
                      </div>

                      {act.description && (
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">{act.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Clock className="w-3.5 h-3.5" /> Scheduled: {formatDate(act.scheduled_date)}
                        </span>
                        {act.farms?.name && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Trees className="w-3.5 h-3.5" /> {act.farms.name}
                          </span>
                        )}
                        {act.crop_name && <span>&bull; Crop: {act.crop_name}</span>}
                        {act.completed_at && (
                          <span className="text-emerald-700 font-medium">
                            &bull; Completed {formatDate(act.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-800"
                      onClick={() => openEditModal(act)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      onClick={() => setDeleteId(act.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? "Edit Farming Activity" : "Schedule Farming Activity"}
        description="Enter scheduled date, target plot, and operational notes"
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <Input
            label="Activity Title"
            placeholder="e.g. Sowing hybrid seeds, Urea top dressing, Drip flush"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Select Farm"
            options={farms.map((f) => ({ value: f.id, label: `${f.name} (${f.district})` }))}
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Target Crop (Optional)</label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={cropName}
                onChange={(e) => {
                  setCropName(e.target.value);
                  const found = crops.find((c) => c.name === e.target.value);
                  if (found) setCropId(found.id);
                }}
              >
                <option value="">-- Choose Crop from Catalog --</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Or enter custom crop"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />

            <Select
              label="Status"
              options={[
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as ActivityStatus)}
            />
          </div>

          <Textarea
            label="Activity Notes & Dosages"
            placeholder="e.g. Apply 25kg urea/acre after weeding, check drip lateral pressure..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {editingActivity ? "Save Changes" : "Schedule Task"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Activity"
        message="Are you sure you want to remove this scheduled activity?"
        confirmLabel="Delete"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
