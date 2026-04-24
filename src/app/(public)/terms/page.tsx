import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service — Zereport" };
export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: 2026</p>
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>By using Zereport, you agree to these terms. Please read them carefully.</p>
        <section><h2 className="font-semibold text-gray-900 mb-2">Use of service</h2><p>Zereport is a SaaS platform for client report automation. You may use the service for lawful business purposes only. You are responsible for all content you add to the platform.</p></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Subscriptions and billing</h2><p>Paid plans are billed monthly via Stripe. You may cancel at any time; access continues until the end of your billing period.</p></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Intellectual property</h2><p>Your data and reports remain yours. Zereport claims no ownership over content you create on the platform.</p></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Limitation of liability</h2><p>Zereport is provided as-is. We are not liable for indirect damages arising from use of the service.</p></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Contact</h2><p>For legal inquiries: legal@zereport.com</p></section>
      </div>
    </div>
  );
}
