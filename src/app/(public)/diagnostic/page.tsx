import Link from "next/link";
import { CheckCircle2, TrendingDown, BarChart3, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Business Diagnostic — Find Where Your Revenue Is Leaking | Zereport",
  description:
    "Answer 20 questions. Get your Lead Leakage Score, Ops Maturity Score, and a personalised revenue loss estimate in under 5 minutes. Free, no account required.",
};

const WHAT_YOU_GET = [
  {
    icon: TrendingDown,
    title: "Lead Leakage Score (0–100)",
    description: "See exactly how many leads are slipping through your follow-up gaps.",
  },
  {
    icon: BarChart3,
    title: "Ops Maturity Score (0–100)",
    description: "Understand how mature your operations are versus where they need to be.",
  },
  {
    icon: Zap,
    title: "Estimated Revenue Leakage",
    description: "Get a monthly and annual estimate of revenue lost to operational gaps.",
  },
  {
    icon: CheckCircle2,
    title: "Top 3 Bottlenecks + 30-Day Action Plan",
    description: "Walk away with specific fixes and a prioritised action plan.",
  },
];

const WHO_ITS_FOR = [
  "Agencies",
  "Consulting firms",
  "Clinics & MedSpas",
  "Law firms",
  "Accounting firms",
  "Service businesses",
  "Ops teams",
];

export default function DiagnosticLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            Free Business Diagnostic
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Find where your leads and{" "}
            <span className="text-indigo-600">revenue are leaking.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Answer 20 questions. Get your Lead Leakage Score, Ops Maturity Score, and a
            personalised revenue loss estimate — in under 5 minutes.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <Link
              href="/diagnostic/start"
              className="inline-block rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              Start your free diagnostic →
            </Link>
            <p className="text-sm text-gray-400">No account required. Takes 5 minutes.</p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            What you get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHAT_YOU_GET.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-indigo-200 transition-colors"
              >
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-indigo-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-12 px-6 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Built for</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {WHO_ITS_FOR.map((type) => (
              <span
                key={type}
                className="rounded-full bg-white border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to find your leaks?
          </h2>
          <p className="text-gray-500">
            Free. No account. Results in 5 minutes.
          </p>
          <Link
            href="/diagnostic/start"
            className="inline-block rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md"
          >
            Start your free diagnostic →
          </Link>
        </div>
      </section>
    </div>
  );
}
