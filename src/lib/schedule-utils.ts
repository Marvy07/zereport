import { ScheduleFrequency } from "@/generated/prisma/enums";

interface ScheduleParams {
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  timezone: string;
  isActive?: boolean;
}

/**
 * Compute the next scheduled run time from now based on schedule parameters.
 * Uses a simple UTC-based heuristic. For production, consider a proper tz-aware scheduler.
 *
 * Always returns a non-null Date. The `nextRunAt` field in the database schema is nullable
 * to represent "never run" or "paused" states — do not confuse that with this return type.
 */
export function computeNextRunAt(params: ScheduleParams): Date {
  const now = new Date();
  const next = new Date(now);

  // Set to the configured hour (UTC approximation)
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(params.hour);

  // If the time has already passed today, start from tomorrow
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  switch (params.frequency) {
    case ScheduleFrequency.WEEKLY: {
      const targetDay = params.dayOfWeek ?? 1; // default Monday
      const currentDay = next.getUTCDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0 && next <= now) daysUntil = 7;
      next.setUTCDate(next.getUTCDate() + daysUntil);
      break;
    }
    case ScheduleFrequency.BIWEEKLY: {
      const targetDay = params.dayOfWeek ?? 1;
      const currentDay = next.getUTCDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0 && next <= now) daysUntil = 14;
      next.setUTCDate(next.getUTCDate() + daysUntil);
      break;
    }
    case ScheduleFrequency.MONTHLY: {
      const targetDate = params.dayOfMonth ?? 1;
      next.setUTCDate(targetDate);
      // If we're past that day this month, move to next month
      if (next <= now) {
        next.setUTCMonth(next.getUTCMonth() + 1);
        next.setUTCDate(targetDate);
      }
      break;
    }
  }

  return next;
}

/**
 * Given a schedule's parameters and the current lastRunAt, compute the next run after lastRunAt.
 */
export function computeNextRunAfter(params: ScheduleParams, lastRunAt: Date): Date {
  const next = new Date(lastRunAt);

  switch (params.frequency) {
    case ScheduleFrequency.WEEKLY:
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case ScheduleFrequency.BIWEEKLY:
      next.setUTCDate(next.getUTCDate() + 14);
      break;
    case ScheduleFrequency.MONTHLY:
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
  }

  return next;
}
