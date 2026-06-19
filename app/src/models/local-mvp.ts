import { z } from "zod";

export const userRoleSchema = z.enum(["Investor", "SME", "Expert"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const certificationStatusSchema = z.enum(["Certified", "UnderReview", "Rejected"]);
export type CertificationStatus = z.infer<typeof certificationStatusSchema>;

export const smeSchema = z.object({
  id: z.string(),
  name: z.string(),
  sector: z.string(),
  certificationStatus: certificationStatusSchema,
  trustLevel: z.number(),
  growthRate: z.number(),
  totalRaised: z.number(),
  activeInvestors: z.number(),
  averageRoi: z.number(),
  retentionRate: z.number(),
  mrr: z.number(),
  profitMargin: z.number(),
  description: z.string(),
  financialSeries: z.array(z.number()),
});

export const smeListSchema = z.array(smeSchema);
export type SmeProfile = z.infer<typeof smeSchema>;

export const validationRequestSchema = z.object({
  id: z.string(),
  smeId: z.string(),
  company: z.string(),
  sector: z.string(),
  submittedAt: z.string(),
  status: certificationStatusSchema,
  documents: z.array(z.string()),
  reason: z.string().nullable().optional(),
});

export const validationRequestListSchema = z.array(validationRequestSchema);
export type ValidationRequest = z.infer<typeof validationRequestSchema>;

export const localLoginResponseSchema = z.object({
  role: userRoleSchema.optional(),
  email: z.string().optional(),
});

export const uploadDocumentPayloadSchema = z.object({
  smeId: z.string(),
  fileName: z.string().min(1),
  size: z.number().positive(),
  contentType: z.string().min(1),
  dataUrl: z.string().min(1),
});

export type UploadDocumentPayload = z.infer<typeof uploadDocumentPayloadSchema>;
