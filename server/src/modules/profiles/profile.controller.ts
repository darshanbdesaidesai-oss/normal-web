import { Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { supabaseAdmin } from "../../config/supabase.js";

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  // If profile doesn't exist yet, return a base profile from auth metadata
  const profile = data || {
    id: userId,
    full_name: req.user?.email?.split("@")[0] || "Farmer",
    preferred_language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: profile,
  });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const updates = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data,
    message: "Profile updated successfully",
  });
}
