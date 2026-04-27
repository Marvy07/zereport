import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getScoreBand } from "@/lib/diagnostic/scoring";
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Gauge } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70
      ? "text-emerald-600"
      : score >= 40
      ? "text-amber-500"
      : "text-red-500";

  const ring =
    score >= 70
      ? "from-emerald-500 to-emerald-300"
      : score >= 40
      ? "from-amber-500 to-yellow-300"
      : "from-red-500 to-rose-300";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
      <div className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${ring} text-white shadow-inner`}>
        <span className="text-2xl font-bold">{score}</span>
      </div>
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
    </div>
  );
}

function ScoreBadge({ band }: { band: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
    Developing: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Solid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Optimized: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${styles[band] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {band}
    </span>
  );
}

export default async function DiagnosticResultsPage({ params }: PageProps) {
  const { id } = await params;

  const submission = await prisma.diagnosticSubmission.findUnique({
    where: { id },
  });

  if (!submission) notFound();

  const overallScore = submission.overallScore ?? 0;
  const leadLeakageScore = submission.leadLeakageScore ?? 0;
  const opsMaturityScore = submission.opsMaturityScore ?? 0;
  const executionVisibilityScore = submission.executionVisibilityScore ?? 0;
  const estimatedMonthlyLoss = submission.estimatedMonthlyLoss ?? 0;
  const estimatedAnnualLoss = submission.estimatedAnnualLoss ?? 0;

  const band = getScoreBand(overallScore) as string;
  const recommendations = (submission.recommendationsJson ?? []) as Array<{
    title: string;
    description: string;
    priority: string;
    impact: string;
  }>;

  const priorityColor: Record<string, string> = {
    high: "border-l-red-500 bg-red-50",
    medium: "border-l-amber-400 bg-amber-50",
    low: "border-l-indigo-400 bg-indigo-50",
  };

  const summary =
    band === "Critical"
      ? "Your business has serious operational leakage. The good news: fixing the biggest gaps can create fast wins."
      : band === "At Risk"
      ? "You're carrying meaningful revenue and execution gaps. Tightening the system should improve performance quickly."
      : band === "Developing"
      ? "You have a workable foundation, but a few bottlenecks are limiting efficiency and visibility."
      : band === "Solid"
      ? "Your operations are in good shape. A few upgrades can move you from stable to exceptional."
      : "You're operating at a strong level. The next move is refining systems for scale and consistency.";

  const strongestArea = [
    { label: "Lead Leakage", score: leadLeakageScore },
    { label: "Ops Maturity", score: opsMaturityScore },
    { label: "Execution Visibility", score: executionVisibilityScore },
  ].sort((a, b) => b.score - a.score)[0];

  const weakestArea = [
    { label: "Lead Leakage", score: leadLeakageScore },
    { label: "Ops Maturity", score: opsMaturityScore },
    { label: "Execution Visibility", score: executionVisibilityScore },
  ].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-slate-900 px-8 py-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Business Diagnostic Report</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{submission.businessName ?? "Your Business"}</h1>
                <p className="mt-2 max-w-2xl text-sm md:text-base text-indigo-100">{summary}</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur px-5 py-4 border border-white/10 min-w-[180px]">
                <div className="text-xs uppercase tracking-wide text-indigo-200">Overall Score</div>
                <div className="mt-1 text-5xl font-extrabold leading-none">{overallScore}<span className="text-xl text-indigo-200">/100</span></div>
                <div className="mt-3"><ScoreBadge band={band} /></div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 p-6 bg-slate-50 border-t border-slate-100">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><TrendingUp className="h-4 w-4 text-emerald-600" /> Strongest Area</div>
              <p className="mt-3 text-xl font-bold text-slate-900">{strongestArea.label}</p>
              <p className="text-sm text-slate-500 mt-1">Score: {strongestArea.score}/100</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldAlert className="h-4 w-4 text-red-500" /> Biggest Risk</div>
              <p className="mt-3 text-xl font-bold text-slate-900">{weakestArea.label}</p>
              <p className="text-sm text-slate-500 mt-1">Score: {weakestArea.score}/100</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Gauge className="h-4 w-4 text-indigo-600" /> Priority Focus</div>
              <p className="mt-3 text-xl font-bold text-slate-900">Fix the biggest leak first</p>
              <p className="text-sm text-slate-500 mt-1">Start with the lowest-scoring area for the fastest improvement.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ScoreRing score={leadLeakageScore} label="Lead Leakage" />
          <ScoreRing score={opsMaturityScore} label="Ops Maturity" />
          <ScoreRing score={executionVisibilityScore} label="Execution Visibility" />
        </div>

        {estimatedMonthlyLoss > 0 && (
          <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="w-full">
                <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4">Estimated Revenue Impact</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 p-5 border border-red-100">
                    <p className="text-3xl font-bold text-red-600">${estimatedMonthlyLoss.toLocaleString()}</p>
                    <p className="text-sm text-red-500 mt-1">Estimated monthly leakage</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-5 border border-red-100">
                    <p className="text-3xl font-bold text-red-600">${estimatedAnnualLoss.toLocaleString()}</p>
                    <p className="text-sm text-red-500 mt-1">Estimated annual leakage</p>
                  </div>
                </div>
                {submission.highestLossStage && (
                  <p className="text-sm text-red-700 mt-4">
                    <span className="font-semibold">Biggest leak:</span> {submission.highestLossStage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Top Recommendations</h2>
                <p className="text-sm text-slate-500 mt-1">These are the highest-impact actions based on your answers.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4" /> Prioritized by likely business impact
              </div>
            </div>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className={`rounded-2xl border border-slate-100 border-l-4 p-5 ${priorityColor[rec.priority] ?? "border-l-gray-300 bg-slate-50"}`}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-base">{rec.title}</p>
                      <p className="text-slate-600 text-sm mt-1 max-w-2xl">{rec.description}</p>
                    </div>
                    <span className="inline-flex self-start rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 border border-slate-200">
                      {rec.priority} priority
                    </span>
                  </div>
                  {rec.impact && (
                    <p className="text-indigo-700 text-sm font-medium mt-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Likely impact: {rec.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-slate-900 p-8 text-white shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Want to fix this in 90 days?</h2>
            <p className="text-indigo-100 text-sm md:text-base mb-6">
              Book a free 30-minute Clarity Call. We'll walk through your biggest gaps and show you exactly what to fix first.
            </p>
            <a
              href="https://calendly.com/marvellouschuyuoh-zenphry/zenphry-clarity-call"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              Book Your Free Clarity Call <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link href="/diagnostic" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Run another diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}
