import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Farm } from "../../types/index.js";

export const farmFormSchema = z.object({
  name: z.string().trim().min(1, "Farm name is required").max(150),
  state: z.string().trim().min(1, "State is required").max(100),
  district: z.string().trim().min(1, "District is required").max(100),
  village: z.string().trim().max(100).optional().nullable(),
  area: z.coerce.number().positive("Area must be positive").max(1_000_000),
  area_unit: z.enum(["acre", "hectare", "square_meter"]),
  soil_type: z.enum([
    "sandy",
    "clay",
    "loamy",
    "silty",
    "sandy_loam",
    "clay_loam",
    "black_soil",
    "red_soil",
    "laterite",
    "unknown",
  ]),
  soil_ph: z.coerce.number().min(0).max(14).nullable().optional(),
  irrigation_type: z.enum([
    "rainfed",
    "drip",
    "sprinkler",
    "flood",
    "canal",
    "borewell",
    "mixed",
    "other",
  ]),
  water_availability: z.enum(["low", "moderate", "high", "seasonal", "unknown"]),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type FarmFormData = z.infer<typeof farmFormSchema>;

interface FarmFormProps {
  initialData?: Farm | null;
  onSubmit: (data: FarmFormData) => Promise<void>;
  isLoading?: boolean;
}

export function FarmForm({ initialData, onSubmit, isLoading = false }: FarmFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      state: initialData?.state || "Karnataka",
      district: initialData?.district || "",
      village: initialData?.village || "",
      area: initialData?.area || 5,
      area_unit: initialData?.area_unit || "acre",
      soil_type: initialData?.soil_type || "red_soil",
      soil_ph: initialData?.soil_ph ?? undefined,
      irrigation_type: initialData?.irrigation_type || "borewell",
      water_availability: initialData?.water_availability || "moderate",
      latitude: initialData?.latitude ?? undefined,
      longitude: initialData?.longitude ?? undefined,
      notes: initialData?.notes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Identification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Farm / Plot Name"
          placeholder="e.g. Green Valley Plot A"
          error={errors.name?.message}
          required
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Total Area"
            type="number"
            step="0.01"
            placeholder="5.0"
            error={errors.area?.message}
            required
            {...register("area")}
          />
          <Select
            label="Area Unit"
            options={[
              { value: "acre", label: "Acres" },
              { value: "hectare", label: "Hectares" },
              { value: "square_meter", label: "Sq. Meters" },
            ]}
            error={errors.area_unit?.message}
            {...register("area_unit")}
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="State"
          placeholder="e.g. Karnataka"
          error={errors.state?.message}
          required
          {...register("state")}
        />

        <Input
          label="District"
          placeholder="e.g. Mandya / Mysuru"
          error={errors.district?.message}
          required
          {...register("district")}
        />

        <Input
          label="Village / Hobli (Optional)"
          placeholder="e.g. Maddur"
          error={errors.village?.message}
          {...register("village")}
        />
      </div>

      {/* Soil Characteristics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Dominant Soil Type"
          options={[
            { value: "red_soil", label: "Red Soil (Sandy/Clayey Loam)" },
            { value: "black_soil", label: "Black Cotton Soil" },
            { value: "loamy", label: "Loamy Soil" },
            { value: "sandy_loam", label: "Sandy Loam" },
            { value: "clay_loam", label: "Clay Loam" },
            { value: "clay", label: "Heavy Clay" },
            { value: "sandy", label: "Sandy" },
            { value: "laterite", label: "Laterite Soil" },
            { value: "silty", label: "Silty" },
            { value: "unknown", label: "Unknown / Not Tested" },
          ]}
          error={errors.soil_type?.message}
          required
          {...register("soil_type")}
        />

        <Input
          label="Soil pH Level (Optional)"
          type="number"
          step="0.1"
          placeholder="e.g. 6.5 (Neutral 6.0-7.5)"
          helperText="Leave empty if not laboratory tested"
          error={errors.soil_ph?.message}
          {...register("soil_ph")}
        />
      </div>

      {/* Irrigation and Water */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Primary Irrigation Method"
          options={[
            { value: "drip", label: "Drip Irrigation" },
            { value: "sprinkler", label: "Sprinkler Irrigation" },
            { value: "borewell", label: "Borewell / Tube Well" },
            { value: "canal", label: "Canal Water" },
            { value: "rainfed", label: "Rainfed (Dryland / Monsoonal)" },
            { value: "flood", label: "Flood / Basin Irrigation" },
            { value: "mixed", label: "Mixed / Multiple Sources" },
            { value: "other", label: "Other" },
          ]}
          error={errors.irrigation_type?.message}
          required
          {...register("irrigation_type")}
        />

        <Select
          label="Water Availability Assessment"
          options={[
            { value: "high", label: "High (Reliable year-round)" },
            { value: "moderate", label: "Moderate (Adequate most seasons)" },
            { value: "seasonal", label: "Seasonal (Monsoon dependent)" },
            { value: "low", label: "Low (Severe summer constraints)" },
            { value: "unknown", label: "Unknown" },
          ]}
          error={errors.water_availability?.message}
          required
          {...register("water_availability")}
        />
      </div>

      {/* Optional Coordinates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="GPS Latitude (Optional)"
          type="number"
          step="0.0000001"
          placeholder="e.g. 12.5218"
          error={errors.latitude?.message}
          {...register("latitude")}
        />
        <Input
          label="GPS Longitude (Optional)"
          type="number"
          step="0.0000001"
          placeholder="e.g. 76.8951"
          error={errors.longitude?.message}
          {...register("longitude")}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Farm Observations & Field History (Optional)"
        placeholder="Add details about previous crop rotations, organic amendments, slope, or drainage issues..."
        rows={3}
        error={errors.notes?.message}
        {...register("notes")}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Update Farm Profile" : "Register Farm"}
        </Button>
      </div>
    </form>
  );
}
