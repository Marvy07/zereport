import { ReportStatus } from "@/generated/prisma/enums";
import { z } from "zod";

const optionalId = z.string().trim().min(1).optional().or(z.literal("")).transform((value) => (value ? value : undefined));

const optionalDate = z
  .union([z.string(), z.date()])
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    if (!value) return undefined;

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  })
  .pipe(z.date().optional());

const reportSchemaFields = {
  clientId: z.string().trim().min(1),
  projectId: optionalId,
  reportTemplateId: optionalId,
  title: z.string().trim().min(2).max(160),
  periodStart: optionalDate,
  periodEnd: optionalDate,
  status: z.nativeEnum(ReportStatus).optional(),
} satisfies Parameters<typeof z.object>[0];

const reportBaseSchema = z.object(reportSchemaFields);

export const reportSchema = reportBaseSchema.refine(
  (data) => {
    if (data.periodStart && data.periodEnd) {
      return data.periodStart <= data.periodEnd;
    }

    return true;
  },
  {
    message: "Period end must be on or after the period start.",
    path: ["periodEnd"],
  }
);

export const reportUpdateSchema = reportBaseSchema.partial().refine(
  (data) => {
    if (data.periodStart && data.periodEnd) {
      return data.periodStart <= data.periodEnd;
    }

    return true;
  },
  {
    message: "Period end must be on or after the period start.",
    path: ["periodEnd"],
  }
);

export type ReportInput = z.infer<typeof reportSchema>;
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;
