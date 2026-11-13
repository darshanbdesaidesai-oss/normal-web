import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";

export async function listFarms(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("farms")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: data || [],
  });
}

export async function getFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const farmId = req.params.farmId;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("farms")
    .select("*")
    .eq("id", farmId)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Farm not found" } });
    return;
  }

  // Strict ownership verification (Section 11.8)
  if (data.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to this farm" } });
    return;
  }

  res.json({
    success: true,
    data,
  });
}

export async function createFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  // Bind owner_id from authenticated session, never from client body
  const farmData = {
    ...req.body,
    owner_id: userId,
  };

  const { data, error } = await supabaseAdmin
    .from("farms")
    .insert([farmData])
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.status(201).json({
    success: true,
    data,
    message: "Farm created successfully",
  });
}

export async function updateFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const farmId = req.params.farmId;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  // Check existence and ownership first
  const { data: existing, error: checkError } = await supabaseAdmin
    .from("farms")
    .select("owner_id")
    .eq("id", farmId)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Farm not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to this farm" } });
    return;
  }

  // Update without modifying owner_id
  const updates = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  delete updates.owner_id;
  delete updates.id;

  const { data, error } = await supabaseAdmin
    .from("farms")
    .update(updates)
    .eq("id", farmId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data,
    message: "Farm updated successfully",
  });
}

export async function deleteFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const farmId = req.params.farmId;

  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("farms")
    .select("owner_id")
    .eq("id", farmId)
    .single();

  if (checkError || !existing) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Farm not found" } });
    return;
  }

  if (existing.owner_id !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to this farm" } });
    return;
  }

  const { error } = await supabaseAdmin
    .from("farms")
    .delete()
    .eq("id", farmId);

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: { id: farmId },
    message: "Farm deleted successfully",
  });
}
