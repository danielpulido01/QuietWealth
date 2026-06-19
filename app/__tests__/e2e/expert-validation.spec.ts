import { test } from "@playwright/test";

test.describe.skip("Expert validation flow", () => {
  test("opens a validation task and submits the review outcome", async ({ page }) => {
    await page.goto("/expert-validation");
  });
});
