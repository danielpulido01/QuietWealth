import { z } from "zod";
import {
  authUserSchema,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  resetPasswordRequestSchema,
} from "../../../src/auth/auth-schemas";
import { dateTimeStringSchema, nonEmptyStringSchema } from "../../../src/models/common-schemas";
import { loginRequestSchema as legacyLoginRequestSchema } from "../../../src/models/loginRequest-schema";

describe("validation schemas", () => {
  it("normalizes auth users and derives a display name from the email", () => {
    expect(
      authUserSchema.parse({
        sub: "user-1",
        email: "user@example.com",
        tenantIds: ["tenant-1"],
        tenantRoles: ["operator"],
      }),
    ).toEqual({
      userId: "user-1",
      email: "user@example.com",
      displayName: "user",
      isGlobalAdmin: false,
      tenantIds: ["tenant-1"],
      tenantRoles: ["operator"],
    });
  });

  it("accepts valid auth payloads and rejects invalid ones", () => {
    expect(loginRequestSchema.safeParse({ email: "user@example.com", password: "secret" }).success).toBe(true);
    expect(forgotPasswordRequestSchema.safeParse({
      email: "user@example.com",
      redirectTo: "https://quietwealth.example/reset",
    }).success).toBe(true);
    expect(resetPasswordRequestSchema.safeParse({
      accessToken: "access",
      refreshToken: "refresh",
      newPassword: "new-password",
    }).success).toBe(true);

    const invalidLogin = loginRequestSchema.safeParse({ email: "bad-email", password: "" });
    expect(invalidLogin.success).toBe(false);
    if (!invalidLogin.success) {
      expect(invalidLogin.error.flatten().fieldErrors).toEqual({
        email: expect.any(Array),
        password: expect.any(Array),
      });
    }
  });

  it("enforces common and legacy request schema shapes", () => {
    expect(nonEmptyStringSchema.safeParse(" value ").success).toBe(true);
    expect(nonEmptyStringSchema.safeParse("   ").success).toBe(false);
    expect(dateTimeStringSchema.safeParse("2026-06-19T10:15:00.000Z").success).toBe(true);
    expect(dateTimeStringSchema.safeParse("not-a-date").success).toBe(false);

    expect(
      legacyLoginRequestSchema.safeParse({
        username: "user",
        password: "secret",
        oneTimeToken: "123456",
      }).success,
    ).toBe(true);

    const invalidLegacy = legacyLoginRequestSchema.safeParse({
      username: "",
      password: "",
      oneTimeToken: "",
    });
    expect(invalidLegacy.success).toBe(false);
    if (!invalidLegacy.success) {
      expect(invalidLegacy.error.issues).toHaveLength(3);
    }
  });

  it("still exposes standard zod parse errors for raw schema consumers", () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    const result = schema.safeParse({ id: "not-a-uuid" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["id"]);
    }
  });
});
