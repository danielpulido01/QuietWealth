import { z } from "zod";
import { nonEmptyStringSchema } from "../models/common-schemas";

const nullableStringSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? null);
const stringArraySchema = z
  .array(nonEmptyStringSchema)
  .nullish()
  .transform((value) => value ?? []);

function deriveDisplayNameFromEmail(email: string | null) {
  if (!email) {
    return null;
  }

  const localPart = email.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : null;
}

export const authUserSchema = z
  .object({
    userId: nullableStringSchema,
    appUserId: nullableStringSchema,
    id: nullableStringSchema,
    sub: nullableStringSchema,
    displayName: nullableStringSchema,
    fullName: nullableStringSchema,
    name: nullableStringSchema,
    givenName: nullableStringSchema,
    email: nullableStringSchema,
    isGlobalAdmin: z
      .boolean()
      .nullish()
      .transform((value) => value ?? false),
    tenantIds: stringArraySchema,
    tenantRoles: stringArraySchema,
  })
  .transform((value) => ({
    email: value.email,
    userId: value.userId ?? value.appUserId ?? value.id ?? value.sub,
    displayName:
      value.displayName
      ?? value.fullName
      ?? value.name
      ?? value.givenName
      ?? deriveDisplayNameFromEmail(value.email),
    isGlobalAdmin: value.isGlobalAdmin,
    tenantIds: value.tenantIds,
    tenantRoles: value.tenantRoles,
  }));

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: nonEmptyStringSchema,
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email(),
  redirectTo: nonEmptyStringSchema,
});

export const resetPasswordRequestSchema = z.object({
  accessToken: nonEmptyStringSchema,
  refreshToken: nonEmptyStringSchema,
  newPassword: nonEmptyStringSchema,
});

