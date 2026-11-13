import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>AgriSage AI</strong> &bull; Responsible Agricultural Decision Support &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center md:text-right max-w-xl">
          <Info className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
          <span>
            Diagnostic predictions and suitability scores represent AI assistance. Verify with verified ICAR/KVK agricultural officers.
          </span>
        </div>
      </div>
    </footer>
  );
}
