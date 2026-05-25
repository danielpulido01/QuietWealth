export type ErrorSource = "api" | "network" | "application" | "unknown";

export type ErrorContext = {
  scope?: string;
  request?: {
    method?: string;
    url?: string;
    status?: number;
  };
  notifyUser?: boolean;
};

export class AppError extends Error {
  readonly source: ErrorSource;
  readonly code?: string;
  readonly status?: number;
  readonly context?: ErrorContext;

  constructor(message: string, options: {
    source: ErrorSource;
    code?: string;
    status?: number;
    context?: ErrorContext;
    cause?: unknown;
  }) {
    super(message);
    this.name = "AppError";
    this.source = options.source;
    this.code = options.code;
    this.status = options.status;
    this.context = options.context;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export class ApiError extends AppError {
  constructor(message: string, options: { status: number; code?: string; context?: ErrorContext; cause?: unknown }) {
    super(message, {
      source: "api",
      status: options.status,
      code: options.code,
      context: options.context,
      cause: options.cause,
    });
    this.name = "ApiError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, options?: { code?: string; context?: ErrorContext; cause?: unknown }) {
    super(message, {
      source: "network",
      code: options?.code,
      context: options?.context,
      cause: options?.cause,
    });
    this.name = "NetworkError";
  }
}

export function normalizeError(error: unknown, context?: ErrorContext): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      source: "application",
      context,
      cause: error,
    });
  }

  return new AppError("An unexpected error occurred.", {
    source: "unknown",
    context,
    cause: error,
  });
}

