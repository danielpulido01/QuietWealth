import { AppError, type ErrorContext } from "../models/app-error";
import type { ZodTypeAny } from "zod";

type SchemaValidationOptions = {
  schemaName: string;
  context?: ErrorContext;
};

export function parseWithSchema<TSchema extends ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
  options: SchemaValidationOptions,
): TSchema["_output"] {
  const result = schema.safeParse(payload);
  if (result.success) {
    return result.data;
  }

  throw new AppError(`Invalid ${options.schemaName} data.`, {
    source: "application",
    code: "schema_validation_error",
    context: options.context,
    cause: result.error,
  });
}

