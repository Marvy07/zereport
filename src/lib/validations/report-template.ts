import { z } from "zod";

const colorRegex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const optionalTrimmedString = (maxLength = 5000) =>
  z.string().trim().max(maxLength).optional().or(z.literal("")).transform((value) => (value ? value : undefined));

export const reportTemplateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalTrimmedString(1000),
  isDefault: z.boolean().optional(),
  primaryColor: z
    .string()
    .trim()
    .regex(colorRegex, "Primary color must be a valid hex code.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  secondaryColor: z
    .string()
    .trim()
    .regex(colorRegex, "Secondary color must be a valid hex code.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  fontFamily: z.string().trim().max(120).optional().or(z.literal("")).transform((value) => (value ? value : undefined)),
  emailSubjectTemplate: optionalTrimmedString(255),
  emailBodyTemplate: optionalTrimmedString(5000),
});

export const reportTemplateUpdateSchema = reportTemplateSchema.partial();

export type ReportTemplateInput = z.infer<typeof reportTemplateSchema>;
export type ReportTemplateUpdateInput = z.infer<typeof reportTemplateUpdateSchema>;
