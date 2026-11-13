import { Request, Response } from "express";
import { supabaseAdmin } from "../../config/supabase.js";

export async function listCrops(req: Request, res: Response): Promise<void> {
  const { category, search, page = "1", limit = "20" } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("crops")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("name", { ascending: true })
    .range(from, to);

  if (category && typeof category === "string") {
    query = query.eq("category", category);
  }

  if (search && typeof search === "string") {
    query = query.or(`name.ilike.%${search}%,scientific_name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: { code: "DB_ERROR", message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: data || [],
    pagination: {
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  });
}

export async function getCropCategories(_req: Request, res: Response): Promise<void> {
  const categories = [
    { id: "cereal", name: "Cereals", description: "Staple food grains (Rice, Wheat, Maize, Millets)" },
    { id: "pulse", name: "Pulses", description: "Legumes and lentils providing plant protein (Chickpea, Arhar, Moong)" },
    { id: "oilseed", name: "Oilseeds", description: "Crops cultivated for edible oils (Groundnut, Soybean, Mustard)" },
    { id: "vegetable", name: "Vegetables", description: "Horticultural vegetable crops (Tomato, Onion, Chilli)" },
    { id: "fruit", name: "Fruits", description: "Orchard fruit trees and perennials (Mango, Banana, Papaya)" },
    { id: "commercial", name: "Commercial Crops", description: "Industrial cash crops (Sugarcane, Cotton, Tobacco)" },
    { id: "plantation", name: "Plantation Crops", description: "High-elevation estate crops (Coffee, Tea, Coconut)" },
    { id: "spice", name: "Spices", description: "Aromatic and pungent spices (Turmeric, Black Pepper, Cardamom)" },
    { id: "fodder", name: "Fodder Crops", description: "Livestock grazing and feed crops" },
    { id: "other", name: "Other Crops", description: "Miscellaneous agricultural crops" },
  ];

  res.json({
    success: true,
    data: categories,
  });
}

export async function getCrop(req: Request, res: Response): Promise<void> {
  const cropId = req.params.cropId;

  const { data, error } = await supabaseAdmin
    .from("crops")
    .select("*")
    .eq("id", cropId)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Crop information not found" } });
    return;
  }

  res.json({
    success: true,
    data,
  });
}
