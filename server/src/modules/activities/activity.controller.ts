import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";

export async function listActivities(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const { farm_id, status } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  let query = supabaseAdmin
    .from("farming_activities")
    .select("*, farms(name, district, state)")
    .eq("owner_id", userId)
    .order("scheduled_date", { ascending: true });

  if (farm_id && typeof farm_id === "string") {
    query = query.eq("farm_id", farm_id);
  }

  if (status && typeof status === "string") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: data || [],
  });
}

export async function getActivity(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const id = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("farming_activities")
    .select("*, farms(name, district, state)")
    .eq("id", id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Activity not found" } });
    return;
  }

  if (data.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  res.json({
    success: true,
    data,
  });
}

export async function createActivity(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { farm_id } = req.body;

  // Farm ownership check
  const { data: farm, error: farmError } = await supabaseAdmin
    .from("farms")
    .select("owner_id")
    .eq("id", farm_id)
    .single();

  if (farmError || !farm) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Farm not found" } });
    return;
  }

  if (farm.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to the specified farm" } });
    return;
  }

  const activityData = {
    ...req.body,
    owner_id: userId,
  };

  const { data, error } = await supabaseAdmin
    .from("farming_activities")
    .insert([activityData])
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.status(201).json({
    success: true,
    data,
    message: "Farming activity scheduled successfully",
  });
}

export async function updateActivity(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const id = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("farming_activities")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Activity not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  const updates = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  // If status changed to completed, stamp completed_at
  if (req.body.status === "completed") {
    updates.completed_at = new Date().toISOString();
  } else if (req.body.status === "pending") {
    updates.completed_at = null;
  }

  delete updates.owner_id;
  delete updates.id;

  const { data, error } = await supabaseAdmin
    .from("farming_activities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data,
    message: "Farming activity updated successfully",
  });
}

export async function deleteActivity(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  const id = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("farming_activities")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Activity not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  const { error } = await supabaseAdmin
    .from("farming_activities")
    .delete()
    .eq("id", id);

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: { id },
    message: "Farming activity removed successfully",
  });
}
