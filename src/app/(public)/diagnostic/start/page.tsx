"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  businessName: string;
  businessType: string;
  monthlyLeadVolume: string;
  avgDealValue: string;
  teamSize: string;
  responseSpeed: string;
  followUpConsistency: string;
  hasCRM: boolean | null;
  tracksNoShows: boolean | null;
  automatesFollowUp: boolean | null;
  estimatedCloseRate: string;
  followUpCount: string;
  hasLeadOwners: boolean | null;
  hasPipelineStages: boolean | null;
  hasHandoffDocs: boolean | null;
  hasSOPs: boolean | null;
  hasRoleClarity: boolean | null;
  hasWeeklyReporting: boolean | null;
  tracksBottlenecks: boolean | null;
  hasKPIVisibility: boolean | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
};

const INITIAL: FormData = {
  businessName: "",
  businessType: "",
  monthlyLeadVolume: "",
  avgDealValue: "",
  teamSize: "",
  responseSpeed: "",
  followUpConsistency: "",
  hasCRM: null,
  tracksNoShows: null,
  automatesFollowUp: null,
  estimatedCloseRate: "",
  followUpCount: "",
  hasLeadOwners: null,
  hasPipelineStages: null,
  hasHandoffDocs: null,
  hasSOPs: null,
  hasRoleClarity: null,
  hasWeeklyReporting: null,
  tracksBottlenecks: null,
  hasKPIVisibility: null,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
};

const STEP_LABELS = [
  "Business Profile",
  "Lead Handling",
  "Sales Process",
  "Operations",
  "Contact Info",
];

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">Select an option</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            value === true
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            value === false
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function DiagnosticStartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string | boolean | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      const { id } = await res.json();
      router.push(`/diagnostic/results/${id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Business Diagnostic</h1>
          <p className="text-gray-500 text-sm mt-1">
            Step {step} of 5 — {STEP_LABELS[step - 1]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
          {step === 1 && (
            <>
              <TextField
                label="Business name"
                value={form.businessName}
                onChange={(v) => set("businessName", v)}
                placeholder="e.g. Acme Agency"
              />
              <SelectField
                label="Industry / business type"
                value={form.businessType}
                onChange={(v) => set("businessType", v)}
                options={[
                  "Agency",
                  "Consulting Firm",
                  "Clinic / MedSpa",
                  "Law Firm",
                  "Accounting Firm",
                  "Home Services",
                  "Other",
                ]}
              />
              <SelectField
                label="Monthly lead volume"
                value={form.monthlyLeadVolume}
                onChange={(v) => set("monthlyLeadVolume", v)}
                options={["Less than 10", "10–50", "50–200", "200+"]}
              />
              <SelectField
                label="Average deal value"
                value={form.avgDealValue}
                onChange={(v) => set("avgDealValue", v)}
                options={["Less than $1K", "$1K–$5K", "$5K–$20K", "$20K+"]}
              />
              <SelectField
                label="Team size"
                value={form.teamSize}
                onChange={(v) => set("teamSize", v)}
                options={["1–5", "6–20", "21–100", "100+"]}
              />
            </>
          )}

          {step === 2 && (
            <>
              <SelectField
                label="How fast do you respond to inbound leads?"
                value={form.responseSpeed}
                onChange={(v) => set("responseSpeed", v)}
                options={[
                  "Within 5 minutes",
                  "Within 1 hour",
                  "Same day",
                  "Next day or longer",
                ]}
              />
              <SelectField
                label="How consistent is your follow-up?"
                value={form.followUpConsistency}
                onChange={(v) => set("followUpConsistency", v)}
                options={["Always", "Usually", "Sometimes", "Rarely/Never"]}
              />
              <YesNoField
                label="Do you use a CRM to track leads?"
                value={form.hasCRM}
                onChange={(v) => set("hasCRM", v)}
              />
              <YesNoField
                label="Do you track no-shows or missed appointments?"
                value={form.tracksNoShows}
                onChange={(v) => set("tracksNoShows", v)}
              />
              <YesNoField
                label="Do you automate any part of your follow-up?"
                value={form.automatesFollowUp}
                onChange={(v) => set("automatesFollowUp", v)}
              />
            </>
          )}

          {step === 3 && (
            <>
              <SelectField
                label="Estimated close rate"
                value={form.estimatedCloseRate}
                onChange={(v) => set("estimatedCloseRate", v)}
                options={[
                  "Less than 10%",
                  "10–25%",
                  "25–50%",
                  "50% or more",
                ]}
              />
              <SelectField
                label="How many follow-up touches per lead?"
                value={form.followUpCount}
                onChange={(v) => set("followUpCount", v)}
                options={[
                  "0–1 follow-ups",
                  "2–3",
                  "4–6",
                  "7 or more",
                ]}
              />
              <YesNoField
                label="Does every lead have a clear owner?"
                value={form.hasLeadOwners}
                onChange={(v) => set("hasLeadOwners", v)}
              />
              <YesNoField
                label="Do you have defined pipeline stages?"
                value={form.hasPipelineStages}
                onChange={(v) => set("hasPipelineStages", v)}
              />
              <YesNoField
                label="Are your sales-to-ops handoffs documented?"
                value={form.hasHandoffDocs}
                onChange={(v) => set("hasHandoffDocs", v)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <YesNoField
                label="Do you have documented SOPs for core processes?"
                value={form.hasSOPs}
                onChange={(v) => set("hasSOPs", v)}
              />
              <YesNoField
                label="Are roles and responsibilities clearly defined?"
                value={form.hasRoleClarity}
                onChange={(v) => set("hasRoleClarity", v)}
              />
              <YesNoField
                label="Do you have weekly operational reporting?"
                value={form.hasWeeklyReporting}
                onChange={(v) => set("hasWeeklyReporting", v)}
              />
              <YesNoField
                label="Do you actively track delivery bottlenecks?"
                value={form.tracksBottlenecks}
                onChange={(v) => set("tracksBottlenecks", v)}
              />
              <YesNoField
                label="Does leadership have clear KPI visibility?"
                value={form.hasKPIVisibility}
                onChange={(v) => set("hasKPIVisibility", v)}
              />
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-sm text-gray-500 border-l-4 border-indigo-200 pl-3">
                Optional — enter your details to receive a copy of your full report by email.
              </p>
              <TextField
                label="Your name"
                value={form.contactName}
                onChange={(v) => set("contactName", v)}
                placeholder="Jane Smith"
              />
              <TextField
                label="Email address"
                value={form.contactEmail}
                onChange={(v) => set("contactEmail", v)}
                placeholder="jane@company.com"
                type="email"
              />
              <TextField
                label="Phone number"
                value={form.contactPhone}
                onChange={(v) => set("contactPhone", v)}
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
              <TextField
                label="Website"
                value={form.website}
                onChange={(v) => set("website", v)}
                placeholder="https://yourcompany.com"
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Generating your report…" : "Get my diagnostic report →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
