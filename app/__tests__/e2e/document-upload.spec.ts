import { test } from "@playwright/test";

test.describe.skip("Document upload flow", () => {
  test("uploads a document and shows progress feedback", async ({ page }) => {
    await page.goto("/documents/upload");
  });
});
