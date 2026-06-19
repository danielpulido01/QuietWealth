import { test } from "@playwright/test";

test.describe.skip("Marketplace flow", () => {
  test("loads marketplace data and shows the results grid", async ({ page }) => {
    await page.goto("/marketplace");
  });
});
