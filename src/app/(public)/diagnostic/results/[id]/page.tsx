import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getScoreBand } from "@/lib/diagnostic/scoring";

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
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
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
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
        styles[band] ?? "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
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
    high: "border-l-red-500",
    medium: "border-l-amber-400",
    low: "border-l-indigo-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide">
            Business Diagnostic Report
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {submission.businessName ?? "Your Business"}
          </h1>
          <div className="flex justify-center">
            <ScoreBadge band={band} />
          </div>
        </div>

        {/* Overall score card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Overall Health Score</p>
          <p
            className={`text-6xl font-extrabold mb-2 ${
              overallScore >= 70
                ? "text-emerald-600"
                : overallScore >= 40
                ? "text-amber-500"
                : "text-red-500"
            }`}
          >
            {overallScore}
            <span className="text-2xl text-gray-400">/100</span>
          </p>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            {band === "Critical" &&
              "Your business is losing significant revenue through gaps in lead handling and operations. Immediate action recommended."}
            {band === "At Risk" &&
              "You have real gaps creating revenue leakage. Addressing these will meaningfully improve growth."}
            {band === "Developing" &&
              "You have a working foundation with clear areas to strengthen and optimize."}
            {band === "Solid" &&
              "Your operations are working well. There are targeted opportunities to push to the next level."}
            {band === "Optimized" &&
              "Your business is operating at a high level. Focus on scaling what's working."}
          </p>
        </div>

        {/* Sub-scores */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <ScoreRing score={leadLeakageScore} label="Lead Leakage" />
            <ScoreRing score={opsMaturityScore} label="Ops Maturity" />
            <ScoreRing
              score={executionVisibilityScore}
              label="Execution Visibility"
            />
          </div>
        </div>

        {/* Revenue impact */}
        {estimatedMonthlyLoss > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4">
              Estimated Revenue Impact
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  ${estimatedMonthlyLoss.toLocaleString()}
                </p>
                <p className="text-sm text-red-500 mt-0.5">per month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  ${estimatedAnnualLoss.toLocaleString()}
                </p>
                <p className="text-sm text-red-500 mt-0.5">per year</p>
              </div>
            </div>
            {submission.highestLossStage && (
              <p className="text-sm text-red-600 mt-3">
                <span className="font-semibold">Biggest leak:</span>{" "}
                {submission.highestLossStage}
              </p>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
              Top Recommendations
            </h2>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, i) => (
                <div
                  key={i}
                  className={`border-l-4 pl-4 py-1 ${
                    priorityColor[rec.priority] ?? "border-l-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{rec.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{rec.description}</p>
                  {rec.impact && (
                    <p className="text-indigo-600 text-xs font-medium mt-1">
                      Impact: {rec.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Want to fix this in 90 days?</h2>
          <p className="text-indigo-200 text-sm mb-6 max-w-sm mx-auto">
            Book a free 30-minute Clarity Call. We'll walk through your biggest gaps
            and show you exactly what to fix first.
          </p>
          <a
            href="https://calendly.com/marvellouschuyuoh-zenphry/zenphry-clarity-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Book Your Free Clarity Call →
          </a>
        </div>

        {/* Footer nav */}
        <div className="text-center">
          <Link
            href="/diagnostic"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Run another diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}
