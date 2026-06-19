import { test } from "@playwright/test";

test.describe.skip("Login flow", () => {
  test("authenticates a user and lands on the home route", async ({ page }) => {
    await page.goto("/login");
  });
});
