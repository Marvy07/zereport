import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy — Zereport" };
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: 2026</p>
      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>Zereport takes your privacy seriously. We collect only the data necessary to provide our service and never sell your information to third parties.</p>
        <section><h2 className="font-semibold text-gray-900 mb-2">Data we collect</h2><ul className="list-disc pl-5 space-y-1"><li>Account information (email, name) via Clerk</li><li>Workspace and client data you enter into the platform</li><li>Integration tokens (encrypted at rest) used to fetch your data</li><li>Usage and audit logs for security purposes</li></ul></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">How we use your data</h2><ul className="list-disc pl-5 space-y-1"><li>To provide and improve the Zereport service</li><li>To send reports on your behalf to configured recipients</li><li>To manage billing via Stripe</li></ul></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Data retention</h2><p>Your data is retained for as long as your account is active. You may request deletion at any time by contacting support.</p></section>
        <section><h2 className="font-semibold text-gray-900 mb-2">Contact</h2><p>For privacy inquiries: privacy@zereport.com</p></section>
      </div>
    </div>
  );
}
