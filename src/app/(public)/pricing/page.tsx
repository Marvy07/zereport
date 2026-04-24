import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Zereport",
  description: "Simple, transparent pricing for every stage of your agency. Start free, upgrade when you need more.",
};

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever",
    description: "Perfect for trying it out.",
    cta: "Get started free", ctaHref: "/sign-up", highlighted: false,
    features: [
      { text: "2 clients", ok: true },
      { text: "5 reports / month", ok: true },
      { text: "1 integration", ok: true },
      { text: "1 workspace user", ok: true },
      { text: "Basic templates", ok: true },
      { text: "Custom branding", ok: false },
      { text: "Scheduled delivery", ok: false },
      { text: "White-label reports", ok: false },
      { text: "Priority support", ok: false },
    ],
  },
  {
    name: "Pro", price: "$49", period: "/ month",
    description: "For growing agencies with multiple clients.",
    cta: "Start Pro", ctaHref: "/sign-up", highlighted: true,
    features: [
      { text: "30 clients", ok: true },
      { text: "100 reports / month", ok: true },
      { text: "10 integrations", ok: true },
      { text: "5 workspace users", ok: true },
      { text: "Custom branding", ok: true },
      { text: "Scheduled delivery", ok: true },
      { text: "White-label reports", ok: false },
      { text: "Priority support", ok: false },
    ],
  },
  {
    name: "Agency", price: "$99", period: "/ month",
    description: "For high-volume agencies that need everything.",
    cta: "Start Agency", ctaHref: "/sign-up", highlighted: false,
    features: [
      { text: "100 clients", ok: true },
      { text: "500 reports / month", ok: true },
      { text: "25 integrations", ok: true },
      { text: "15 workspace users", ok: true },
      { text: "Custom branding", ok: true },
      { text: "Scheduled delivery", ok: true },
      { text: "White-label reports", ok: true },
      { text: "Priority support", ok: true },
    ],
  },
];

const FAQS = [
  { q: "Do I need a credit card to start?", a: "No. The Free plan requires no payment information. You only need a card when upgrading to Pro or Agency." },
  { q: "Can I change plans later?", a: "Yes — upgrade or downgrade anytime. Changes take effect immediately and are prorated." },
  { q: "What counts as a report?", a: "Any report you generate and send (or download as PDF) counts toward your monthly quota. Drafts do not count." },
  { q: "What integrations are supported?", a: "Google Sheets, Notion, Trello, GoHighLevel, and any Zapier webhook source. More coming soon." },
  { q: "Is there an annual plan?", a: "Annual pricing is coming soon. Sign up and we'll notify you when it's available." },
];

export default function PricingPage() {
  return (
    <>
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-500">Start free. Upgrade when your client list grows. No surprises.</p>
        </div>
      </section>

      <section className="pb-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-8 flex flex-col gap-6 ${plan.highlighted ? "border-blue-600 ring-2 ring-blue-600 shadow-lg" : "border-gray-200"}`}>
              {plan.highlighted && (
                <div className="text-center">
                  <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>
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
                    {f.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" /> : <X className="h-4 w-4 shrink-0 text-gray-300" />}
                    <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref} className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${plan.highlighted ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Frequently asked questions</h2>
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

      <section className="py-16 px-6 bg-blue-600 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to automate your reporting?</h2>
          <Link href="/sign-up" className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Create your free account
          </Link>
        </div>
      </section>
    </>
  );
}
