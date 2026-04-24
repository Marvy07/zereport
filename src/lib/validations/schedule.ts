import { ScheduleFrequency } from "@/generated/prisma/enums";
import { z } from "zod";

export const scheduleSchema = z.object({
  projectId: z.string().trim().min(1).optional().or(z.literal("")).transform((v) => v || undefined),
  reportTemplateId: z.string().trim().min(1).optional().or(z.literal("")).transform((v) => v || undefined),
  frequency: z.nativeEnum(ScheduleFrequency),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  hour: z.number().int().min(0).max(23).default(9),
  timezone: z.string().min(1).default("America/Chicago"),
  isActive: z.boolean().default(true),
});

export const scheduleUpdateSchema = scheduleSchema.partial();

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
