import React from "react";
import { Settings, Globe, Shield, Database, Cpu } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../lib/i18n.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Select } from "../../components/ui/Select.js";
import { toast } from "sonner";

export function SettingsPage() {
  const { uiLanguage, setUiLanguage, aiLanguage, setAiLanguage, t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" /> Platform Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure multilingual interfaces, AI response language, and review system configuration.
        </p>
      </div>

      {/* Multilingual Settings (Section 4.13) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" /> Multilingual Agriculture Settings
          </CardTitle>
          <CardDescription>
            Independent controls for application interface and AI advisory generation language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Application User Interface Language"
              options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: `${l.name} (${l.nativeName})` }))}
              value={uiLanguage}
              onChange={(e) => {
                setUiLanguage(e.target.value as SupportedLanguage);
                toast.success("Interface language updated");
              }}
            />

            <Select
              label="AI Advisory & Diagnostics Language"
              options={[
                { value: "English", label: "English" },
                { value: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
                { value: "Hindi", label: "Hindi (हिन्दी)" },
              ]}
              value={aiLanguage}
              onChange={(e) => {
                setAiLanguage(e.target.value);
                toast.success("AI response language updated");
              }}
            />
          </div>
          <p className="text-xs text-slate-500 italic">
            Note: You can view the dashboard in English while instructing Gemini to generate your agricultural advisory
            in Kannada (ಕನ್ನಡ) or Hindi (हिन्दी).
          </p>
        </CardContent>
      </Card>

      {/* Security & System Architecture Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" /> Security & Data Isolation
          </CardTitle>
          <CardDescription>Technical safeguards protecting your farm records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Database className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">PostgreSQL Row Level Security (RLS):</span>
              <p className="mt-0.5 text-slate-500">
                All farm profiles, soil tests, activity logs, and disease photographs are strictly isolated at the
                database layer using JWT auth verification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Cpu className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Server-Side GenAI SDK:</span>
              <p className="mt-0.5 text-slate-500">
                AI requests are orchestrated server-side using the official Google GenAI SDK with structured Zod
                schemas, input sanitization, rate limiting, and zero exposure of API keys.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
