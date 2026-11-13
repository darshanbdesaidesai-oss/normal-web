import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Printer,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { api } from "../../lib/api-client.js";
import { AdvisoryReport, AdvisoryData } from "../../types/index.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState, ErrorState } from "../../components/ui/Skeleton.js";
import { formatDate } from "../../lib/utils.js";

export function AdvisoryDetailPage() {
  const { advisoryId } = useParams<{ advisoryId: string }>();
  const [report, setReport] = useState<AdvisoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!advisoryId) return;
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AdvisoryReport>(`/advisories/${advisoryId}`);
        setReport(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load advisory report";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [advisoryId]);

  if (loading) return <LoadingState message="Loading advisory report..." />;
  if (error || !report) return <ErrorState message={error || "Report not found"} />;

  const data: AdvisoryData = report.result_data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back and Action bar */}
      <div className="flex items-center justify-between">
        <Link to="/app/history" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to History
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </Button>
      </div>

      {/* Main Advisory Report Container */}
      <Card className="border-t-4 border-t-emerald-600 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="primary" className="uppercase text-[10px] font-bold">
                  {report.crop_name}
                </Badge>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {report.advisory_type.replace(/_/g, " ")}
                </Badge>
                {report.farms?.name && (
                  <span className="text-xs text-slate-500">
                    &bull; Farm: {report.farms.name} ({report.farms.district}, {report.farms.state})
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{data.title || report.title}</h1>
            </div>

            <div className="text-right text-xs text-slate-400 shrink-0">
              <p>Generated: {formatDate(report.created_at)}</p>
              <p>Model: {report.model_name || "Gemini AI"}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              Agronomic Summary & Objective
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">{data.summary || report.summary}</p>
          </div>

          {/* Expert Review Tag */}
          {data.expert_verification_required && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Expert Verification Recommended:</strong> Certain physiological conditions or complex symptomology
                require confirmatory testing by a local agricultural extension officer (KVK).
              </span>
            </div>
          )}

          {/* Detailed Recommendations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" /> Agronomic Recommendations & Technical Guidance
            </h3>

            <div className="space-y-3">
              {data.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{rec.heading}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{rec.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">Scientific Reason: {rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Steps Timeline */}
          {data.action_steps && data.action_steps.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Action Checklist & Recommended Timeline
              </h3>
              <div className="space-y-2">
                {data.action_steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span>{step.action}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {step.timing}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks & Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            {data.risks?.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Agronomic Risks
                </h4>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {data.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.warnings?.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                <h4 className="font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Critical Agricultural Warnings
                </h4>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {data.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Missing info */}
          {data.missing_information?.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Missing Information:</span>
                <span className="ml-1">{data.missing_information.join("; ")}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Evidence-conscious digital advisory
            </span>
            <span>Language: {report.language?.toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
