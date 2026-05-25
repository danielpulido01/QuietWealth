import { sessionManager } from "../state/sessionManager";
import { logger } from "../utils/logger";

export type UnauthorizedRequestMeta = {
  method: string;
  url: string;
};

export type UnauthorizedHandlingInput = {
  request: UnauthorizedRequestMeta;
};

export interface UnauthorizedHandlingStrategy {
  readonly name: string;
  shouldHandle(input: UnauthorizedHandlingInput): boolean;
  handle(input: UnauthorizedHandlingInput): void;
}

function isAuthBootstrapRequest(url: string) {
  return /\/api\/auth\/(login|refresh|forgot-password|reset-password)$/i.test(url);
}

export class HttpOnlyCookieUnauthorizedHandlingStrategy implements UnauthorizedHandlingStrategy {
  readonly name = "http-only-cookie-session";

  shouldHandle({ request }: UnauthorizedHandlingInput) {
    return !isAuthBootstrapRequest(request.url);
  }

  handle({ request }: UnauthorizedHandlingInput) {
    logger.warn("401 intercepted. Clearing session.", {
      method: request.method,
      url: request.url,
      strategy: this.name,
    });
    sessionManager.handleUnauthorized();
  }
}

export class PlaceholderUnauthorizedHandlingStrategy implements UnauthorizedHandlingStrategy {
  readonly name: string;

  constructor(name = "placeholder-unauthorized-strategy") {
    this.name = name;
  }

  shouldHandle() {
    return true;
  }

  handle() {
    // Placeholder for future unauthorized handling mechanisms.
  }
}

class UnauthorizedHandlingStrategyContext {
  private strategy: UnauthorizedHandlingStrategy;

  constructor(defaultStrategy: UnauthorizedHandlingStrategy) {
    this.strategy = defaultStrategy;
  }

  setStrategy(strategy: UnauthorizedHandlingStrategy) {
    this.strategy = strategy;
  }

  getStrategy() {
    return this.strategy;
  }
}

const defaultUnauthorizedHandlingStrategy = new HttpOnlyCookieUnauthorizedHandlingStrategy();
const unauthorizedHandlingStrategyContext = new UnauthorizedHandlingStrategyContext(
  defaultUnauthorizedHandlingStrategy,
);

export function setUnauthorizedHandlingStrategy(strategy: UnauthorizedHandlingStrategy) {
  unauthorizedHandlingStrategyContext.setStrategy(strategy);
}

export function getUnauthorizedHandlingStrategy() {
  return unauthorizedHandlingStrategyContext.getStrategy();
}

export function handleUnauthorizedRequest(
  request: UnauthorizedRequestMeta,
  strategy?: UnauthorizedHandlingStrategy,
) {
  const resolvedStrategy = strategy ?? getUnauthorizedHandlingStrategy();
  if (!resolvedStrategy.shouldHandle({ request })) {
    return;
  }

  resolvedStrategy.handle({ request });
}
