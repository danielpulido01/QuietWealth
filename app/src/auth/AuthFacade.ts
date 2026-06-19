import {
  AuthServiceError,
  NoTenantAccessError,
  authServiceFacade,
  type AuthServiceFacade,
  type LoginInput,
} from "./authService";

export type AuthFacade = AuthServiceFacade;
export type { LoginInput };
export { AuthServiceError, NoTenantAccessError };

export const authFacade: AuthFacade = authServiceFacade;
