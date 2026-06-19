import type { PermissionCode } from "./permissions";

export const accessPolicy = {
  /*
  Implement access policies as needed, for example:

  canViewHome: [
    Permissions.SESSION_READ,
    Permissions.USER_PROFILE_READ,
    Permissions.FILES_READ,
    Permissions.ACTIVITY_READ,
  ],

  canViewFiles: [
    Permissions.FILES_READ,
  ],

  canUploadFiles: [
    Permissions.FILES_UPLOAD,
  ],

  etc
   */
} as const satisfies Record<string, readonly PermissionCode[]>;

export type AccessPolicyName = keyof typeof accessPolicy;
