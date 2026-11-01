import { test, expect } from "@playwright/test";

test.describe("Authentication & Navigation E2E Flow", () => {
  test("should render login screen with Quiet Luxury branding and authenticate demo leader", async ({ page }) => {
    // 1. Visit login page
    await page.goto("/login");
    await expect(page).toHaveTitle(/Capstone OS/);

    // 2. Verify academic branding and input fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 3. Fill in Team Leader credentials
    await emailInput.fill("leader@example.edu");
    await passwordInput.fill("Capstone2026!");

    // 4. Submit login
    await page.click('button[type="submit"]');

    // 5. Verify redirection to project workspace
    await page.waitForURL(/\/app/);
    expect(page.url()).toContain("/app");
  });
});

