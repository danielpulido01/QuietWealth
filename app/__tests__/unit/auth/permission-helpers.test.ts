import { accessPolicy } from "../../../src/auth/policies/accessPolicy";
import {
  isPermissionCode,
  permissionCodes,
  Permissions,
} from "../../../src/auth/policies/permissions";
import { isRoleCode, roleCodes, Roles } from "../../../src/auth/policies/roles";

describe("permission and role helpers", () => {
  it("exposes the current permission registry", () => {
    expect(Permissions).toEqual({});
    expect(permissionCodes).toEqual([]);
    expect(isPermissionCode("files.read")).toBe(false);
  });

  it("exposes the current role registry", () => {
    expect(Roles).toEqual({});
    expect(roleCodes).toEqual([]);
    expect(isRoleCode("admin")).toBe(false);
  });

  it("starts with an empty access policy map", () => {
    expect(accessPolicy).toEqual({});
  });
});
