import { DiagnosticAnswers, DiagnosticScores } from "./scoring";

export interface Recommendation {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
  quickWin: boolean;
}

export function generateRecommendations(
  answers: DiagnosticAnswers,
  scores: DiagnosticScores
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (answers.responseSpeed === "Next day or longer") {
    recs.push({
      title: "Cut lead response time to under 5 minutes",
      description: "Every hour of delay reduces close rates by up to 10x. Install auto-responders immediately.",
      priority: "critical",
      quickWin: false,
    });
  }

  if (scores.leadLeakageScore < 40) {
    recs.push({
      title: "Install missed-call text-back automation",
      description: "You are losing leads every day they go unanswered. Automate your first touch.",
      priority: "critical",
      quickWin: true,
    });
  }

  if (!answers.hasCRM) {
    recs.push({
      title: "Implement a CRM and track every lead",
      description: "Without a CRM, leads fall through gaps. Start with a free tier and log everything.",
      priority: "critical",
      quickWin: true,
    });
  }

  if (!answers.automatesFollowUp) {
    recs.push({
      title: "Automate your follow-up sequences",
      description: "Manual follow-up is inconsistent. A 5-touch automated sequence can double your close rate.",
      priority: "high",
      quickWin: true,
    });
  }

  if (answers.followUpCount === "0–1 follow-ups") {
    recs.push({
      title: "Increase follow-up attempts to minimum 5 touches",
      description: "80% of sales happen after the 5th follow-up. Most businesses stop at 1–2.",
      priority: "high",
      quickWin: false,
    });
  }

  if (scores.opsMaturityScore < 40) {
    recs.push({
      title: "Document your 3 core delivery SOPs this week",
      description: "Without documented processes, quality depends on who shows up. Fix this now.",
      priority: "critical",
      quickWin: false,
    });
  }

  if (!answers.hasRoleClarity) {
    recs.push({
      title: "Define clear role ownership for every function",
      description: "Role confusion is the #1 source of dropped balls in growing businesses.",
      priority: "high",
      quickWin: false,
    });
  }

  if (scores.executionVisibilityScore < 40) {
    recs.push({
      title: "Implement weekly KPI reporting",
      description: "You cannot improve what you do not measure. Start with 5 core metrics this week.",
      priority: "critical",
      quickWin: true,
    });
  }

  if (!answers.hasPipelineStages) {
    recs.push({
      title: "Define and enforce pipeline stages in your CRM",
      description: "Without stages, you have no forecast. Define 5–7 stages and enforce movement rules.",
      priority: "high",
      quickWin: false,
    });
  }

  // Sort: critical first, then high, then medium
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs.slice(0, 5);
}
