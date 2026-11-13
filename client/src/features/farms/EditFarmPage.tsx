import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api-client.js";
import { Farm } from "../../types/index.js";
import { FarmForm, FarmFormData } from "./FarmForm.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { LoadingState, ErrorState } from "../../components/ui/Skeleton.js";
import { toast } from "sonner";
import { Edit3 } from "lucide-react";

export function EditFarmPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;
    const fetchFarm = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Farm>(`/farms/${farmId}`);
        setFarm(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load farm details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [farmId]);

  const handleSubmit = async (data: FarmFormData) => {
    if (!farmId) return;
    setSaving(true);
    try {
      await api.patch(`/farms/${farmId}`, data);
      toast.success("Farm updated successfully!");
      navigate(`/app/farms/${farmId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update farm";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading farm profile..." />;
  if (error || !farm) return <ErrorState message={error || "Farm not found"} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Edit3 className="w-6 h-6 text-emerald-600" /> Edit Farm Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">Update agricultural characteristics and resources for {farm.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farm Details Form</CardTitle>
          <CardDescription>Modify properties below and save changes</CardDescription>
        </CardHeader>
        <CardContent>
          <FarmForm initialData={farm} onSubmit={handleSubmit} isLoading={saving} />
        </CardContent>
      </Card>
    </div>
  );
}
