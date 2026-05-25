export const Roles = {
  /*
  Implement roles as needed, for example:
  ADMIN: "admin",
  OPERATOR: "operator",
  REVIEWER: "reviewer",
  VIEWER: "viewer",
  */
} as const;

export type RoleCode = (typeof Roles)[keyof typeof Roles];

export const roleCodes = Object.values(Roles) as RoleCode[];

export function isRoleCode(value: string): value is RoleCode {
  return roleCodes.includes(value as RoleCode);
}
