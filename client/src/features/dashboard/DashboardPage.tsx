import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trees,
  Sprout,
  Compass,
  CalendarCheck2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Stethoscope,
  Droplets,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { DashboardMetrics, FarmingActivity } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/Skeleton.js";
import { formatDate, getSuitabilityBadge } from "../../lib/utils.js";
import { toast } from "sonner";

export function DashboardPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardMetrics>("/dashboard");
      setData(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard metrics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await api.patch(`/activities/${activityId}`, { status: "completed" });
      toast.success("Activity marked as completed!");
      fetchDashboard();
    } catch {
      toast.error("Failed to update activity status");
    }
  };

  if (loading) {
    return <LoadingState message="Loading agricultural dashboard..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || "Failed to load dashboard"} onRetry={fetchDashboard} />;
  }

  const { stats, farms, recentAdvisories, upcomingActivities, overdueActivities, latestRecommendations, recentDiseaseReports } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5" /> Farm Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Agricultural Intelligence Dashboard
          </h1>
          <p className="text-sm text-emerald-100 mt-1 max-w-xl">
            Monitor farm health, AI advisory insights, crop suitability, and timely field activities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/crop-recommendations">
            <Button variant="secondary" size="sm" className="font-bold gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" /> Recommend Crops
            </Button>
          </Link>
          <Link to="/app/disease-detection">
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold gap-1.5">
              <Stethoscope className="w-4 h-4" /> Diagnose Crop
            </Button>
          </Link>
          <Link to="/app/farms/new">
            <Button variant="outline" size="sm" className="bg-white text-emerald-900 hover:bg-emerald-50 border-white font-bold gap-1.5">
              <Plus className="w-4 h-4" /> Add Farm
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Farms</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalFarms}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Trees className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Total Managed: <span className="font-semibold text-slate-700">{stats.totalArea} Acres</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Crops</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.activeCropsCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              In advisories & cultivation guides
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Tasks</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.pendingActivitiesCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-2 font-medium">
              {stats.overdueActivitiesCount > 0 ? `⚠️ ${stats.overdueActivitiesCount} Overdue` : "All on schedule"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Advisories</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalAdvisoriesCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Evidence-conscious crop reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Upcoming Tasks + Recent Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Farming Tasks & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Farming Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                  Upcoming Farming Activities
                </CardTitle>
                <CardDescription>Scheduled field activities, irrigations, and inspections</CardDescription>
              </div>
              <Link to="/app/activities">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {overdueActivities.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Overdue Activities ({overdueActivities.length})
                  </div>
                  <div className="space-y-2">
                    {overdueActivities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-rose-100 text-xs">
                        <div>
                          <span className="font-semibold text-slate-800">{act.title}</span>
                          <span className="text-slate-500 ml-2">Due {formatDate(act.scheduled_date)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleCompleteActivity(act.id)}
                        >
                          Mark Done
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingActivities.length === 0 && overdueActivities.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck2}
                  title="No Upcoming Tasks Scheduled"
                  description="Add your first farming activity like sowing, fertilizer dressing, or irrigation."
                  actionLabel="+ Schedule Task"
                  onAction={() => (window.location.href = "/app/activities")}
                />
              ) : (
                <div className="space-y-3">
                  {upcomingActivities.map((act: FarmingActivity) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{act.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{formatDate(act.scheduled_date)}</span>
                            {act.farms?.name && <span>&bull; Farm: {act.farms.name}</span>}
                            {act.crop_name && <span>&bull; Crop: {act.crop_name}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => handleCompleteActivity(act.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Done
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Crop Recommendations Snapshot */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Latest Crop Suitability Recommendations
                </CardTitle>
                <CardDescription>AI-ranked crop options matching your soil and seasonal factors</CardDescription>
              </div>
              <Link to="/app/crop-recommendations">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-700 gap-1">
                  New Recommendation <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {latestRecommendations.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No Recommendations Generated Yet"
                  description="Run your first AI crop suitability analysis based on your farm conditions."
                  actionLabel="Analyze Crop Suitability"
                  onAction={() => (window.location.href = "/app/crop-recommendations")}
                />
              ) : (
                <div className="space-y-4">
                  {latestRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" className="uppercase font-bold text-[10px]">
                            {rec.season}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {rec.farms?.name ? `Farm: ${rec.farms.name}` : "Custom Farm"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(rec.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{rec.recommendations.summary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {rec.recommendations.recommendations.slice(0, 3).map((item, idx) => {
                          const badge = getSuitabilityBadge(item.suitability_score);
                          return (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800">{item.crop_name}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                                  {item.suitability_score}%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{item.recommendation_reason}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Quick Hub, Recent Advisories, Plant Disease */}
        <div className="space-y-8">
          {/* Quick Hub Navigation Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Advisory Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/app/advisory"
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-1.5"
              >
                <Compass className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-800">Crop Advisory</span>
              </Link>
              <Link
                to="/app/disease-detection"
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-1.5"
              >
                <Stethoscope className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-slate-800">Disease Check</span>
              </Link>
              <Link
                to="/app/irrigation"
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-1.5"
              >
                <Droplets className="w-5 h-5 text-sky-600" />
                <span className="font-semibold text-slate-800">Irrigation Plan</span>
              </Link>
              <Link
                to="/app/nutrients"
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-1.5"
              >
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-800">Soil & Nutrients</span>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Advisories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Advisories</CardTitle>
                <CardDescription>Saved field guides</CardDescription>
              </div>
              <Link to="/app/history" className="text-xs text-emerald-700 hover:underline">
                View History
              </Link>
            </CardHeader>
            <CardContent>
              {recentAdvisories.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No advisories generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentAdvisories.map((adv) => (
                    <Link
                      key={adv.id}
                      to={`/app/history/${adv.id}`}
                      className="block p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 truncate">{adv.title}</span>
                      </div>
                      <p className="text-slate-500 line-clamp-2">{adv.summary}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="capitalize text-emerald-700 font-medium">
                          {adv.advisory_type?.replace(/_/g, " ")}
                        </span>
                        <span>{formatDate(adv.created_at || "")}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Plant Disease Reports */}
          {recentDiseaseReports.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-amber-600" /> Recent Disease Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {recentDiseaseReports.map((dr) => (
                  <div key={dr.id} className="p-2.5 rounded-lg border border-amber-100 bg-amber-50/40">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{dr.crop_name}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(dr.created_at)}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">{dr.symptoms}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Farm List Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Registered Farms</CardTitle>
              <Link to="/app/farms" className="text-xs text-emerald-700 hover:underline">
                Manage ({farms.length})
              </Link>
            </CardHeader>
            <CardContent>
              {farms.length === 0 ? (
                <EmptyState
                  icon={Trees}
                  title="No Farms Added Yet"
                  description="Register your agricultural land to unlock tailored advice."
                  actionLabel="+ Add Farm"
                  onAction={() => (window.location.href = "/app/farms/new")}
                />
              ) : (
                <div className="space-y-2 text-xs">
                  {farms.map((farm) => (
                    <Link
                      key={farm.id}
                      to={`/app/farms/${farm.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{farm.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {farm.district}, {farm.state} &bull; {farm.area} {farm.area_unit}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {farm.soil_type.replace(/_/g, " ")}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
