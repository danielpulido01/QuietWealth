import { authServiceFacade } from "../../../src/auth/authService";
import { applicationServiceFacade } from "../../../src/services/applicationFacade";
import { httpClientFacade } from "../../../src/services/client";

describe("applicationServiceFacade", () => {
  it("exposes the shared auth and http facades", () => {
    expect(applicationServiceFacade.auth).toBe(authServiceFacade);
    expect(applicationServiceFacade.http).toBe(httpClientFacade);
  });
});
