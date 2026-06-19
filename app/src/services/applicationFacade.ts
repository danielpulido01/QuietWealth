import { authFacade, type AuthFacade } from "../auth/AuthFacade";
import { httpClientFacade, type HttpClientFacade } from "./client";

export interface ApplicationServiceFacade {
  readonly auth: AuthFacade;
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

  readonly auth: AuthFacade;
  readonly http: HttpClientFacade;

  private constructor() {
    this.auth = authFacade;
    this.http = httpClientFacade;
  }
}

export const applicationServiceFacade = DefaultApplicationServiceFacade.getInstance();
