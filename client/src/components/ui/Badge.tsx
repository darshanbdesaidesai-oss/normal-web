import React from "react";
import { cn } from "../../lib/utils.js";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const variants = {
    primary: "bg-emerald-50 text-emerald-700 border-emerald-200",
    secondary: "bg-amber-50 text-amber-700 border-amber-200",
    outline: "border-slate-300 text-slate-700 bg-white",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
