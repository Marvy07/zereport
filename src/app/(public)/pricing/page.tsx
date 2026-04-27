import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Zereport",
  description: "Simple, transparent pricing. Start free, upgrade as you grow.",
};

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Run your first diagnostic. No card needed.",
    cta: "Get started free",
    ctaHref: "/sign-up",
    highlighted: false,
    badge: null,
    features: [
      { text: "3 diagnostics / month", ok: true },
      { text: "Business health score", ok: true },
      { text: "5-dimension analysis", ok: true },
      { text: "1 workspace user", ok: true },
      { text: "PDF report download", ok: false },
      { text: "Team benchmarks", ok: false },
      { text: "AI recommendations", ok: false },
      { text: "Priority support", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "For operators tracking improvement over time.",
    cta: "Start Pro",
    ctaHref: "/sign-up?plan=PRO",
    highlighted: true,
    badge: "Most popular",
    features: [
      { text: "Unlimited diagnostics", ok: true },
      { text: "Business health score", ok: true },
      { text: "5-dimension analysis", ok: true },
      { text: "5 workspace users", ok: true },
      { text: "PDF report download", ok: true },
      { text: "Team benchmarks", ok: true },
      { text: "AI recommendations", ok: true },
      { text: "Priority support", ok: false },
    ],
  },
  {
    name: "Growth",
    price: "$199",
    period: "/ month",
    description: "For multi-team orgs that need full visibility.",
    cta: "Start Growth",
    ctaHref: "/sign-up?plan=AGENCY",
    highlighted: false,
    badge: null,
    features: [
      { text: "Unlimited diagnostics", ok: true },
      { text: "Business health score", ok: true },
      { text: "5-dimension analysis", ok: true },
      { text: "Unlimited users", ok: true },
      { text: "PDF report download", ok: true },
      { text: "Team benchmarks", ok: true },
      { text: "AI recommendations", ok: true },
      { text: "Priority support", ok: true },
    ],
  },
];

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Starter plan is completely free — no card required. You only need one when upgrading to Pro or Growth.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade or downgrade anytime. Changes take effect immediately and are prorated.",
  },
  {
    q: "What counts as a diagnostic?",
    a: "Any completed 30-question business health assessment counts. Saved drafts do not count toward your limit.",
  },
  {
    q: "Is there an annual plan?",
    a: "Annual pricing is coming soon — save ~20%. Sign up and we'll notify you when it's available.",
  },
  {
    q: "Do you offer white-label or enterprise pricing?",
    a: "Yes. For consulting firms, HR platforms, and enterprise teams that want to run diagnostics under their own brand, we offer custom enterprise plans. Contact us at marvellous@zenphry.com.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500">
            Start free. Upgrade when your team is ready. No hidden fees.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col gap-6 ${
                plan.highlighted
                  ? "border-indigo-600 ring-2 ring-indigo-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="text-center">
                  <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise callout */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Enterprise</div>
              <h3 className="text-lg font-bold text-gray-900">Need white-label or custom volumes?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Custom domain, branded experience, API access, SLA, and dedicated support for consulting firms and enterprise teams.
              </p>
            </div>
            <a
              href="mailto:marvellous@zenphry.com?subject=Zereport Enterprise"
              className="shrink-0 rounded-lg border border-indigo-600 text-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b pb-6 last:border-0">
                <p className="font-semibold text-gray-900 mb-1">{faq.q}</p>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-indigo-600 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Run your first business diagnostic free
          </h2>
          <p className="text-indigo-200 text-sm">No credit card. 8 minutes. Know exactly where your operations stand.</p>
          <Link
            href="/diagnostic"
            className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Start free diagnostic →
          </Link>
        </div>
      </section>
    </>
  );
}
