import { test, expect } from "@playwright/test";

test.describe("Capstone Project Command Center E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as team leader
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("leader@example.edu");
    await page.locator('input[type="password"]').fill("Capstone2026!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/);
  });

  test("should load project overview, verify health ring and navigate modules", async ({ page }) => {
    // Navigate to projects list and click on the Smart Campus project
    await page.goto("/app/projects");
    const projectCard = page.locator('a[href*="/app/p/"]').first();
    await expect(projectCard).toBeVisible();
    await projectCard.click();

    // Verify Overview loaded
    await page.waitForURL(/\/overview/);
    await expect(page.locator("text=مؤشر صحة المشروع")).toBeVisible();

    // Navigate to Tasks
    const tasksNav = page.locator('a[href*="/tasks"]').first();
    await tasksNav.click();
    await page.waitForURL(/\/tasks/);
    await expect(page.locator("text=لوحة المهام والتنفيذ")).toBeVisible();

    // Navigate to Submissions
    const submissionsNav = page.locator('a[href*="/submissions"]').first();
    await submissionsNav.click();
    await page.waitForURL(/\/submissions/);
    await expect(page.locator("text=بوابة التسليمات والتحقق الأكاديمي")).toBeVisible();
  });
});

