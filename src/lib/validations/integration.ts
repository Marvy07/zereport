import { IntegrationStatus, IntegrationType, Prisma } from "@/generated/prisma";
import { z } from "zod";

const jsonObjectSchema = z.custom<Prisma.InputJsonObject>(
  (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value),
  "Config JSON must be an object."
);

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const integrationTypeSchema = z.enum([
  IntegrationType.GOOGLE_SHEETS,
  IntegrationType.NOTION,
  IntegrationType.TRELLO,
  IntegrationType.GOHIGHLEVEL,
  IntegrationType.ZAPIER_WEBHOOK,
  IntegrationType.MANUAL,
]);

export const integrationStatusSchema = z.enum([
  IntegrationStatus.CONNECTED,
  IntegrationStatus.EXPIRED,
  IntegrationStatus.ERROR,
  IntegrationStatus.DISCONNECTED,
]);

export const createIntegrationSchema = z.object({
  type: integrationTypeSchema,
  name: z.string().trim().min(2).max(100),
  externalAccountId: optionalTrimmedString(255),
  configJson: jsonObjectSchema.optional(),
});

export const updateIntegrationSchema = z
  .object({
    type: integrationTypeSchema.optional(),
    name: z.string().trim().min(2).max(100).optional(),
    status: integrationStatusSchema.optional(),
    externalAccountId: optionalTrimmedString(255),
    configJson: jsonObjectSchema.optional(),
    lastError: optionalTrimmedString(2000),
    lastSyncedAt: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Update payload cannot be empty.",
  });

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
