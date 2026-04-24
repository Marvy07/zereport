import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zereport — Client reports, on autopilot.",
  description:
    "Zereport connects your delivery tools, turns project data into polished branded client reports, and sends them automatically on a schedule.",
  openGraph: {
    title: "Zereport — Client reports, on autopilot.",
    description: "Automated client reporting for agencies and consultants.",
    type: "website",
  },
};

const FEATURES = [
  { title: "Connect your stack", description: "Pull data from Google Sheets, Notion, Trello, GoHighLevel, or any Zapier source — no copy-paste." },
  { title: "Branded reports in minutes", description: "Use your logo, colors, and fonts. Build a template once, generate polished reports forever." },
  { title: "Auto-send on schedule", description: "Weekly, biweekly, or monthly — reports go out automatically. Your clients always stay informed." },
  { title: "Hosted client links", description: "Every report gets a private web link your clients can view in the browser, no login required." },
  { title: "PDF export included", description: "Download pixel-perfect PDFs with one click. Attach to emails or share directly." },
  { title: "Multi-client dashboard", description: "Manage all your clients from one place. Scale to Agency tier as you grow." },
];

const TESTIMONIALS = [
  { quote: "We used to spend 3 hours a week on client reports. Zereport cut that to 10 minutes.", name: "Sarah K.", title: "Digital Agency Owner" },
  { quote: "My clients actually read the reports now — they look professional and arrive without me thinking about it.", name: "Marcus T.", title: "Fractional CMO" },
  { quote: "The Google Sheets integration alone saved us from a reporting nightmare every month.", name: "Priya N.", title: "Marketing Consultant" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-medium text-blue-700">
            Built for agencies &amp; consultants
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Client reports, <span className="text-blue-600">on autopilot.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Connect your tools, build branded templates, and let Zereport send polished client reports automatically — every week, every month, without lifting a finger.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/sign-up" className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors">
              Start free — no credit card
            </Link>
            <Link href="/pricing" className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              See pricing
            </Link>
          </div>
          <p className="text-xs text-gray-400">Free plan includes 2 clients and 5 reports/month.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to report like a pro</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                </div>
                <p className="text-sm text-gray-500 pl-7">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What people are saying</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                <p className="text-sm text-gray-600 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-blue-600 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-3xl font-bold text-white">Stop building reports manually.</h2>
          <p className="text-blue-100 text-lg">Join agencies and consultants who automated their client reporting. Get started in under 5 minutes.</p>
          <Link href="/sign-up" className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Create your free account
          </Link>
        </div>
      </section>
    </>
  );
}
