import { DiagnosticAnswers, DiagnosticScores } from "./scoring";

export interface RevenueEstimate {
  estimatedMonthlyLoss: number;
  estimatedAnnualLoss: number;
  highestLossStage: string;
}

const VOLUME_MIDPOINTS: Record<string, number> = {
  "Less than 10": 5,
  "10–50": 30,
  "50–200": 125,
  "200+": 300,
};

const DEAL_MIDPOINTS: Record<string, number> = {
  "Less than $1K": 500,
  "$1K–$5K": 3000,
  "$5K–$20K": 12500,
  "$20K+": 30000,
};

const CLOSE_RATE_MIDPOINTS: Record<string, number> = {
  "Less than 10%": 0.05,
  "10–25%": 0.175,
  "25–50%": 0.375,
  "50% or more": 0.6,
};

export function calculateRevenueLoss(
  answers: DiagnosticAnswers,
  scores: DiagnosticScores
): RevenueEstimate {
  const volume = VOLUME_MIDPOINTS[answers.monthlyLeadVolume ?? ""] ?? 30;
  const deal = DEAL_MIDPOINTS[answers.avgDealValue ?? ""] ?? 3000;
  const closeRate = CLOSE_RATE_MIDPOINTS[answers.estimatedCloseRate ?? ""] ?? 0.175;

  const leakageFactor = (100 - scores.leadLeakageScore) / 100;
  const estimatedMonthlyLoss = Math.round(volume * deal * closeRate * leakageFactor);
  const estimatedAnnualLoss = estimatedMonthlyLoss * 12;

  // Compute which stage contributes most to loss
  const stages: { name: string; score: number }[] = [
    { name: "Slow Lead Response", score: answers.responseSpeed === "Next day or longer" ? 40 : answers.responseSpeed === "Same day" ? 20 : 5 },
    { name: "Follow-Up Gaps", score: !answers.automatesFollowUp ? 30 : answers.followUpConsistency === "Rarely/Never" ? 25 : 5 },
    { name: "No CRM / Lead Tracking", score: !answers.hasCRM ? 25 : 0 },
    { name: "Pipeline Leakage", score: !answers.hasPipelineStages ? 20 : 5 },
  ];
  const highestLossStage = stages.sort((a, b) => b.score - a.score)[0].name;

  return { estimatedMonthlyLoss, estimatedAnnualLoss, highestLossStage };
}
