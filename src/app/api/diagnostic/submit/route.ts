import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";
import { calculateScores } from "@/lib/diagnostic/scoring";
import { calculateRevenueLoss } from "@/lib/diagnostic/revenue";
import { generateRecommendations } from "@/lib/diagnostic/recommendations";

export async function POST(req: NextRequest) {
  try {
    const answers = await req.json();

    const scores = calculateScores(answers);
    const revenue = calculateRevenueLoss(answers, scores);
    const recommendations = generateRecommendations(answers, scores);

    const submission = await prisma.diagnosticSubmission.create({
      data: {
        businessName: answers.businessName || null,
        businessType: answers.businessType || null,
        monthlyLeadVolume: answers.monthlyLeadVolume || null,
        avgDealValue: answers.avgDealValue || null,
        teamSize: answers.teamSize || null,
        responseSpeed: answers.responseSpeed || null,
        followUpConsistency: answers.followUpConsistency || null,
        hasCRM: answers.hasCRM ?? null,
        tracksNoShows: answers.tracksNoShows ?? null,
        automatesFollowUp: answers.automatesFollowUp ?? null,
        estimatedCloseRate: answers.estimatedCloseRate || null,
        followUpCount: answers.followUpCount || null,
        hasLeadOwners: answers.hasLeadOwners ?? null,
        hasPipelineStages: answers.hasPipelineStages ?? null,
        hasHandoffDocs: answers.hasHandoffDocs ?? null,
        hasSOPs: answers.hasSOPs ?? null,
        hasRoleClarity: answers.hasRoleClarity ?? null,
        hasWeeklyReporting: answers.hasWeeklyReporting ?? null,
        tracksBottlenecks: answers.tracksBottlenecks ?? null,
        hasKPIVisibility: answers.hasKPIVisibility ?? null,
        contactName: answers.contactName || null,
        contactEmail: answers.contactEmail || null,
        contactPhone: answers.contactPhone || null,
        website: answers.website || null,
        answersJson: answers,
        leadLeakageScore: scores.leadLeakageScore,
        opsMaturityScore: scores.opsMaturityScore,
        executionVisibilityScore: scores.executionVisibilityScore,
        overallScore: scores.overallScore,
        estimatedMonthlyLoss: revenue.estimatedMonthlyLoss,
        estimatedAnnualLoss: revenue.estimatedAnnualLoss,
        highestLossStage: revenue.highestLossStage,
        recommendationsJson: recommendations as object[],
        source: req.headers.get("referer") ?? "direct",
      },
    });

    try {
      const resend = getResendClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zereport.com";
      await resend.emails.send({
        from: "Zereport Diagnostics <alex@zenphry.us>",
        to: "alex@zenphry.us",
        subject: `New Diagnostic — ${answers.businessName || "Anonymous"} | Score: ${scores.overallScore}/100`,
        html: `
          <h2 style="color:#1e1b4b;">New Diagnostic Submission</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Business</td><td style="padding:8px 0;font-weight:600;">${answers.businessName || "Not provided"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Type</td><td style="padding:8px 0;">${answers.businessType || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Contact</td><td style="padding:8px 0;">${answers.contactName || "—"} · ${answers.contactEmail || "No email"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Overall Score</td><td style="padding:8px 0;font-weight:700;font-size:18px;color:#4f46e5;">${scores.overallScore}/100</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Lead Leakage</td><td style="padding:8px 0;">${scores.leadLeakageScore}/100</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Ops Maturity</td><td style="padding:8px 0;">${scores.opsMaturityScore}/100</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Monthly Loss Est.</td><td style="padding:8px 0;font-weight:600;color:#dc2626;">$${revenue.estimatedMonthlyLoss.toLocaleString()}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Highest Loss Stage</td><td style="padding:8px 0;">${revenue.highestLossStage}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Top Recommendation</td><td style="padding:8px 0;">${recommendations[0]?.title || "N/A"}</td></tr>
          </table>
          <p style="margin-top:24px;">
            <a href="${appUrl}/diagnostic/results/${submission.id}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Full Report →</a>
          </p>
        `,
      });
    } catch (emailErr) {
      console.error("Diagnostic notification email failed:", emailErr);
    }

    return NextResponse.json({ id: submission.id });
  } catch (err) {
    console.error("Diagnostic submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
