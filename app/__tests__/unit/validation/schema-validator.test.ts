import { z } from "zod";
import { AppError } from "../../../src/models/app-error";
import { parseWithSchema } from "../../../src/data-validation/schema-validator";

describe("parseWithSchema", () => {
  it("returns parsed data for valid payloads", () => {
    const schema = z.object({
      id: z.string(),
      amount: z.number(),
    });

    expect(
      parseWithSchema(schema, { id: "doc-1", amount: 42 }, { schemaName: "document" }),
    ).toEqual({
      id: "doc-1",
      amount: 42,
    });
  });

  it("throws AppError with schema validation metadata for invalid payloads", () => {
    const schema = z.object({
      id: z.string(),
      amount: z.number(),
    });

    try {
      parseWithSchema(
        schema,
        { id: 12, amount: "oops" },
        {
          schemaName: "document",
          context: { scope: "unit-test" },
        },
      );
      throw new Error("Expected parseWithSchema to throw.");
    } catch (error) {
      expect(error).toEqual(
        expect.objectContaining<AppError>({
          name: "AppError",
          message: "Invalid document data.",
          source: "application",
          code: "schema_validation_error",
          context: { scope: "unit-test" },
        }),
      );
    }
  });
});
