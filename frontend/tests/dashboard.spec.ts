import { test, expect } from '@playwright/test';

test.describe('Pretzel Dashboard', () => {
    test('should load the main dashboard', async ({ page }) => {
        await page.goto('/');

        // Check if the main dashboard loads
        await expect(page).toHaveTitle(/Pretzel Dashboard/);

        // Check for main navigation elements
        await expect(page.locator('text=Analytics')).toBeVisible();
        await expect(page.locator('text=Agents')).toBeVisible();
        await expect(page.locator('text=Traffic')).toBeVisible();
    });

    test('should navigate to analytics page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Analytics');

        // Check if we're on the analytics page
        await expect(page).toHaveURL(/.*analytics/);
        await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    });

    test('should navigate to agents overview', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Agents');

        // Check if we're on the agents page
        await expect(page).toHaveURL(/.*agents/);
        await expect(page.locator('text=Agent Overview')).toBeVisible();
    });

    test('should navigate to traffic analytics', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Traffic');

        // Check if we're on the traffic page
        await expect(page).toHaveURL(/.*traffic/);
        await expect(page.locator('text=Traffic Analytics')).toBeVisible();
    });

    test('should display agent management sections', async ({ page }) => {
        await page.goto('/admin/agents');

        // Check for different agent types
        await expect(page.locator('text=Support Agent')).toBeVisible();
        await expect(page.locator('text=Lead Generation')).toBeVisible();
        await expect(page.locator('text=Social Media')).toBeVisible();
    });

    test('should load traffic data visualization', async ({ page }) => {
        await page.goto('/admin/traffic');

        // Check for traffic visualization elements
        await expect(page.locator('text=Traffic Sources')).toBeVisible();
        await expect(page.locator('text=Real-time Visitors')).toBeVisible();
    });
});