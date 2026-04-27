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

  let highestLossStage = "Pipeline Leakage";
  if (answers.responseSpeed === "Next day or longer") {
    highestLossStage = "Slow Lead Response";
  } else if (!answers.automatesFollowUp) {
    highestLossStage = "Follow-Up Gaps";
  } else if (!answers.hasCRM) {
    highestLossStage = "No CRM / Lead Tracking";
  }

  return { estimatedMonthlyLoss, estimatedAnnualLoss, highestLossStage };
}
