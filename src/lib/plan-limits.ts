export const PLAN_LIMITS = {
  FREE: { clients: 3, reports: 10, users: 1 },
  PRO: { clients: 25, reports: 100, users: 5 },
  AGENCY: { clients: -1, reports: -1, users: -1 }, // -1 = unlimited
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  const key = plan as PlanKey;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.FREE;
}
