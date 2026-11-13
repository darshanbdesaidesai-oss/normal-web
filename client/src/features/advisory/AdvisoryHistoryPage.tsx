import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Search, Filter, Trash2, ArrowRight, Calendar, Trees } from "lucide-react";
import { api } from "../../lib/api-client.js";
import { AdvisoryReport, Farm } from "../../types/index.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/Skeleton.js";
import { ConfirmDialog } from "../../components/ui/Dialog.js";
import { formatDate } from "../../lib/utils.js";
import { toast } from "sonner";

export function AdvisoryHistoryPage() {
  const [advisories, setAdvisories] = useState<AdvisoryReport[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchCrop, setSearchCrop] = useState("");
  const [selectedFarm, setSelectedFarm] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchCrop.trim()) params.crop_name = searchCrop.trim();
      if (selectedFarm !== "all") params.farm_id = selectedFarm;
      if (selectedType !== "all") params.advisory_type = selectedType;

      const [advRes, farmsRes] = await Promise.all([
        api.get<AdvisoryReport[]>("/advisories", { params }),
        api.get<Farm[]>("/farms"),
      ]);

      setAdvisories(advRes.data || []);
      setFarms(farmsRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load advisory history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedFarm, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/advisories/${deleteId}`);
      toast.success("Advisory report removed");
      setDeleteId(null);
      fetchHistory();
    } catch {
      toast.error("Failed to delete advisory");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" /> Advisory History & Saved Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, reference, or export previously generated agricultural advisories.
          </p>
        </div>
        <Link to="/app/advisory">
          <Button variant="primary" size="md" className="font-bold gap-2">
            + Generate New Advisory
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by crop name..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              options={[
                { value: "all", label: "All Farms" },
                ...farms.map((f) => ({ value: f.id, label: f.name })),
              ]}
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
            />

            <Select
              options={[
                { value: "all", label: "All Advisory Types" },
                { value: "cultivation", label: "Cultivation" },
                { value: "nutrient_management", label: "Nutrient Plan" },
                { value: "irrigation", label: "Irrigation" },
                { value: "pest_management", label: "Pest Management" },
                { value: "disease_prevention", label: "Disease Prevention" },
                { value: "harvesting", label: "Harvesting" },
              ]}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            />
          </form>
        </CardContent>
      </Card>

      {/* Reports List */}
      {loading ? (
        <LoadingState message="Loading advisory history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : advisories.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Advisory Reports Found"
          description="You haven't generated any agricultural advisories matching this filter."
          actionLabel="Generate Advisory"
          onAction={() => (window.location.href = "/app/advisory")}
        />
      ) : (
        <div className="space-y-4">
          {advisories.map((report) => (
            <Card key={report.id} className="hover:shadow-sm transition-all border-slate-200">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="font-bold text-[10px] uppercase">
                      {report.crop_name}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {report.advisory_type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-slate-400">&bull; {formatDate(report.created_at)}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800">{report.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">{report.summary}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    {report.farms?.name && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Trees className="w-3.5 h-3.5" /> Farm: {report.farms.name} ({report.farms.district})
                      </span>
                    )}
                    <span>Language: {report.language?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-600"
                    title="Delete Report"
                    onClick={() => setDeleteId(report.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Link to={`/app/history/${report.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                      Read Full Report <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Advisory Report"
        message="Are you sure you want to remove this saved report from your history?"
        confirmLabel="Delete Report"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
