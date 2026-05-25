export const Permissions = {
  /*
  Implement permissions as needed, for example:

  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",

  SESSION_READ: "session.read",

  USER_PROFILE_READ: "user.profile.read",

  FILES_READ: "files.read",
  FILES_UPLOAD: "files.upload",
  FILES_DELETE: "files.delete",

  etc
  */
  
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions];

export type PermissionOrWildcard = PermissionCode | "*";

export const permissionCodes = Object.values(Permissions) as PermissionCode[];

export function isPermissionCode(value: string): value is PermissionCode {
  return permissionCodes.includes(value as PermissionCode);
}