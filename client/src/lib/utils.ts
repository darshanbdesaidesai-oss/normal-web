import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getSuitabilityBadge(score: number): {
  color: string;
  label: string;
} {
  if (score >= 80) {
    return { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Highly Suitable" };
  } else if (score >= 60) {
    return { color: "bg-green-100 text-green-800 border-green-200", label: "Moderately Suitable" };
  } else if (score >= 40) {
    return { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Fair / Conditional" };
  } else {
    return { color: "bg-rose-100 text-rose-800 border-rose-200", label: "Low Suitability" };
  }
}
