import { toast } from "sonner";
import { logger } from "./logger";
import { type AppError, type ErrorContext, normalizeError } from "../models/app-error";

export type ErrorMiddleware = (
  error: AppError,
  context: ErrorContext,
  next: () => void,
) => void;

class ErrorHandler {
  private static instance: ErrorHandler | null = null;
  private middlewares: ErrorMiddleware[] = [];

  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }

    return ErrorHandler.instance;
  }

  private constructor() {}

  use(middleware: ErrorMiddleware) {
    this.middlewares.push(middleware);
  }

  handle(error: unknown, context: ErrorContext = {}) {
    const normalized = normalizeError(error, context);
    let idx = 0;

    const next = () => {
      const middleware = this.middlewares[idx];
      idx += 1;
      if (middleware) {
        middleware(normalized, context, next);
      }
    };

    next();
  }
}

const logMiddleware: ErrorMiddleware = (error, context, next) => {
  const logData = {
    source: error.source,
    status: error.status,
    code: error.code,
    scope: context.scope,
    request: context.request,
  };

  if (context.scope === "global") {
    logger.fatal(error.message, logData);
  } else {
    logger.error(error.message, logData);
  }

  next();
};

const userNotificationMiddleware: ErrorMiddleware = (error, context, next) => {
  if (context.notifyUser) {
    toast.error(error.message);
  }
  next();
};

export const errorHandler = ErrorHandler.getInstance();
errorHandler.use(logMiddleware);
errorHandler.use(userNotificationMiddleware);

let globalHandlersInstalled = false;

export function installGlobalErrorHandlers() {
  if (globalHandlersInstalled) {
    return;
  }

  window.addEventListener("error", (event) => {
    errorHandler.handle(event.error ?? new Error(event.message), {
      scope: "global",
      notifyUser: true,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    errorHandler.handle(event.reason, {
      scope: "global",
      notifyUser: true,
    });
  });

  globalHandlersInstalled = true;
}

