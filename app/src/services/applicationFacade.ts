import { authServiceFacade, type AuthServiceFacade } from "../auth/authService";
import { httpClientFacade, type HttpClientFacade } from "./client";

export interface ApplicationServiceFacade {
  readonly auth: AuthServiceFacade;
  readonly http: HttpClientFacade;
}

class DefaultApplicationServiceFacade implements ApplicationServiceFacade {
  private static instance: DefaultApplicationServiceFacade | null = null;

  static getInstance() {
    if (!DefaultApplicationServiceFacade.instance) {
      DefaultApplicationServiceFacade.instance = new DefaultApplicationServiceFacade();
    }

    return DefaultApplicationServiceFacade.instance;
  }

  readonly auth: AuthServiceFacade;
  readonly http: HttpClientFacade;

  private constructor() {
    this.auth = authServiceFacade;
    this.http = httpClientFacade;
  }
}

export const applicationServiceFacade = DefaultApplicationServiceFacade.getInstance();
