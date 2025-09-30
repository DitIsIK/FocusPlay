import { test, expect } from "@playwright/test";

test.describe("FocusPlay rooktest", () => {
  test("landing en nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Minder doom. Meer doén.")).toBeVisible();
    await page.getByRole("link", { name: "Speel nu" }).click();
    await expect(page.getByText("FocusPlay")).toBeVisible();
  });
});
