import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";

export async function getDashboardData(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  try {
    // 1. Fetch user's farms
    const { data: farms } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    const totalFarms = farms?.length || 0;
    const totalArea = farms?.reduce((acc, f) => acc + (Number(f.area) || 0), 0) || 0;

    // 2. Fetch recent advisories
    const { data: recentAdvisories } = await supabaseAdmin
      .from("advisories")
      .select("id, crop_name, advisory_type, title, summary, confidence, created_at, farm_id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Fetch upcoming farming activities
    const today = new Date().toISOString().split("T")[0];
    const { data: upcomingActivities } = await supabaseAdmin
      .from("farming_activities")
      .select("*, farms(name)")
      .eq("owner_id", userId)
      .eq("status", "pending")
      .gte("scheduled_date", today)
      .order("scheduled_date", { ascending: true })
      .limit(6);

    // 4. Fetch overdue activities
    const { data: overdueActivities } = await supabaseAdmin
      .from("farming_activities")
      .select("*, farms(name)")
      .eq("owner_id", userId)
      .eq("status", "pending")
      .lt("scheduled_date", today)
      .order("scheduled_date", { ascending: true })
      .limit(5);

    // 5. Fetch latest crop recommendations
    const { data: latestRecommendations } = await supabaseAdmin
      .from("crop_recommendations")
      .select("id, season, recommendations, created_at, farm_id, farms(name)")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(2);

    // 6. Fetch recent disease reports
    const { data: recentDiseaseReports } = await supabaseAdmin
      .from("disease_reports")
      .select("id, crop_name, symptoms, analysis_result, created_at, farm_id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    // Compute distinct active crops mentioned in farms/activities/advisories
    const cropNamesSet = new Set<string>();
    recentAdvisories?.forEach((a) => {
      if (a.crop_name) cropNamesSet.add(a.crop_name);
    });
    upcomingActivities?.forEach((act) => {
      if (act.crop_name) cropNamesSet.add(act.crop_name);
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalFarms,
          totalArea,
          activeCropsCount: cropNamesSet.size,
          pendingActivitiesCount: (upcomingActivities?.length || 0) + (overdueActivities?.length || 0),
          overdueActivitiesCount: overdueActivities?.length || 0,
          totalAdvisoriesCount: recentAdvisories?.length || 0,
        },
        farms: farms?.slice(0, 4) || [],
        recentAdvisories: recentAdvisories || [],
        upcomingActivities: upcomingActivities || [],
        overdueActivities: overdueActivities || [],
        latestRecommendations: latestRecommendations || [],
        recentDiseaseReports: recentDiseaseReports || [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard metrics";
    res.status(500).json({
      success: false,
      error: { code: "DASHBOARD_ERROR", message },
    });
  }
}
