import React from "react";
import { Link } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button.js";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Plot Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The agricultural page or advisory report you are looking for does not exist or has been relocated.
      </p>
      <Link to="/app">
        <Button variant="primary" size="md" className="gap-2 font-bold">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
