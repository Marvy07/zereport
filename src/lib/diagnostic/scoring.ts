export interface DiagnosticAnswers {
  responseSpeed?: string;
  followUpConsistency?: string;
  hasCRM?: boolean;
  tracksNoShows?: boolean;
  automatesFollowUp?: boolean;
  followUpCount?: string;
  hasSOPs?: boolean;
  hasRoleClarity?: boolean;
  hasWeeklyReporting?: boolean;
  tracksBottlenecks?: boolean;
  hasKPIVisibility?: boolean;
  hasLeadOwners?: boolean;
  hasPipelineStages?: boolean;
  hasHandoffDocs?: boolean;
  monthlyLeadVolume?: string;
  avgDealValue?: string;
  estimatedCloseRate?: string;
  businessName?: string;
  businessType?: string;
  teamSize?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface DiagnosticScores {
  leadLeakageScore: number;
  opsMaturityScore: number;
  executionVisibilityScore: number;
  overallScore: number;
}

export type ScoreBand = "Strong" | "Leaking Value" | "At Risk" | "Critical";

export function calculateScores(answers: DiagnosticAnswers): DiagnosticScores {
  // Lead Leakage Score (max 44 raw points, scaled to 0-100)
  let leadRaw = 0;
  switch (answers.responseSpeed) {
    case "Within 5 minutes": leadRaw += 20; break;
    case "Within 1 hour": leadRaw += 15; break;
    case "Same day": leadRaw += 8; break;
    default: leadRaw += 0;
  }
  switch (answers.followUpConsistency) {
    case "Always": leadRaw += 8; break;
    case "Usually": leadRaw += 5; break;
    case "Sometimes": leadRaw += 2; break;
    default: leadRaw += 0;
  }
  if (answers.hasCRM) leadRaw += 4;
  if (answers.automatesFollowUp) leadRaw += 4;
  switch (answers.followUpCount) {
    case "7 or more": leadRaw += 4; break;
    case "4–6": leadRaw += 3; break;
    case "2–3": leadRaw += 2; break;
    default: leadRaw += 0;
  }
  if (answers.tracksNoShows) leadRaw += 4;
  const leadLeakageScore = Math.round((leadRaw / 44) * 100);

  // Ops Maturity Score (5 booleans, 20pts each, scaled to 0-100)
  let opsRaw = 0;
  if (answers.hasSOPs) opsRaw += 20;
  if (answers.hasRoleClarity) opsRaw += 20;
  if (answers.hasWeeklyReporting) opsRaw += 20;
  if (answers.tracksBottlenecks) opsRaw += 20;
  if (answers.hasKPIVisibility) opsRaw += 20;
  const opsMaturityScore = opsRaw;

  // Execution Visibility Score (5 factors, 20pts each, scaled to 0-100)
  let execRaw = 0;
  if (answers.hasLeadOwners) execRaw += 20;
  if (answers.hasPipelineStages) execRaw += 20;
  if (answers.hasHandoffDocs) execRaw += 20;
  if (answers.hasWeeklyReporting) execRaw += 20;
  if (answers.hasKPIVisibility) execRaw += 20;
  const executionVisibilityScore = execRaw;

  // Overall = weighted average
  const overallScore = Math.round(
    leadLeakageScore * 0.4 + opsMaturityScore * 0.3 + executionVisibilityScore * 0.3
  );

  return { leadLeakageScore, opsMaturityScore, executionVisibilityScore, overallScore };
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Leaking Value";
  if (score >= 40) return "At Risk";
  return "Critical";
}
