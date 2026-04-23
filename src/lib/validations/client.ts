import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const clientSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: optionalTrimmedString(120),
  primaryEmail: z.email().trim(),
  website: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  notes: optionalTrimmedString(5000),
});

export type ClientInput = z.infer<typeof clientSchema>;
