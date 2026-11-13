import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, ArrowRight, Droplets, Clock } from "lucide-react";
import { api } from "../../lib/api-client.js";
import { Crop, CropCategory } from "../../types/index.js";
import { Card, CardContent } from "../../components/ui/Card.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/Skeleton.js";

interface CategoryMeta {
  id: string;
  name: string;
  description: string;
}

export function CropListPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    api
      .get<CategoryMeta[]>("/crops/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: "50" };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get<Crop[]>("/crops", { params });
      setCrops(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load crops";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCrops();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" /> Agricultural Knowledge Library
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore agronomic cultivation guidelines, soil suitability, and water requirements for major Indian crops.
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search crop by English or scientific name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Crops
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {loading ? (
        <LoadingState message="Loading agricultural library..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCrops} />
      ) : crops.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Crops Found"
          description={`No crops match "${searchQuery}" under ${selectedCategory} category.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory("all");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card key={crop.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{crop.name}</h3>
                      {crop.scientific_name && (
                        <p className="text-xs italic text-slate-500 font-serif">{crop.scientific_name}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="capitalize text-[10px] font-bold">
                      {crop.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 my-3 leading-relaxed">
                    {crop.description || "Comprehensive agronomic guide compiled from ICAR and agricultural institutes."}
                  </p>

                  <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong>Duration:</strong>{" "}
                        {crop.cultivation_duration_days ? `${crop.cultivation_duration_days} days` : "Seasonal"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">
                        <strong>Water:</strong> {crop.water_requirements || "Moderate"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    {crop.suitable_seasons?.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link to={`/app/crops/${crop.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                      Cultivation Guide <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
