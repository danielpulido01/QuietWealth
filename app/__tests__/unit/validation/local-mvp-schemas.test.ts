import { validationRequestListSchema } from "../../../src/models/local-mvp";

describe("local MVP schemas", () => {
  it("accepts validation requests with a null reason", () => {
    expect(
      validationRequestListSchema.parse([
        {
          id: "10000000-0000-0000-0000-000000000001",
          smeId: "00000000-0000-0000-0000-000000000004",
          company: "AgroPulse",
          sector: "Technology",
          submittedAt: "2026-06-19T10:15:00.000Z",
          status: "UnderReview",
          documents: ["estado-resultados.pdf"],
          reason: null,
        },
      ]),
    ).toEqual([
      {
        id: "10000000-0000-0000-0000-000000000001",
        smeId: "00000000-0000-0000-0000-000000000004",
        company: "AgroPulse",
        sector: "Technology",
        submittedAt: "2026-06-19T10:15:00.000Z",
        status: "UnderReview",
        documents: ["estado-resultados.pdf"],
        reason: null,
      },
    ]);
  });
});
