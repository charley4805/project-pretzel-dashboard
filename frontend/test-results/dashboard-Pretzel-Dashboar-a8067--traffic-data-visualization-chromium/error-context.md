# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Pretzel Dashboard >> should load traffic data visualization
- Location: tests\dashboard.spec.ts:52:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/admin/traffic", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Pretzel Dashboard', () => {
  4  |   test('should load the main dashboard', async ({ page }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     // Check if the main dashboard loads
  8  |     await expect(page).toHaveTitle(/Pretzel Dashboard/);
  9  | 
  10 |     // Check for main navigation elements
  11 |     await expect(page.locator('text=Analytics')).toBeVisible();
  12 |     await expect(page.locator('text=Agents')).toBeVisible();
  13 |     await expect(page.locator('text=Traffic')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should navigate to analytics page', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     await page.click('text=Analytics');
  19 | 
  20 |     // Check if we're on the analytics page
  21 |     await expect(page).toHaveURL(/.*analytics/);
  22 |     await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('should navigate to agents overview', async ({ page }) => {
  26 |     await page.goto('/');
  27 |     await page.click('text=Agents');
  28 | 
  29 |     // Check if we're on the agents page
  30 |     await expect(page).toHaveURL(/.*agents/);
  31 |     await expect(page.locator('text=Agent Overview')).toBeVisible();
  32 |   });
  33 | 
  34 |   test('should navigate to traffic analytics', async ({ page }) => {
  35 |     await page.goto('/');
  36 |     await page.click('text=Traffic');
  37 | 
  38 |     // Check if we're on the traffic page
  39 |     await expect(page).toHaveURL(/.*traffic/);
  40 |     await expect(page.locator('text=Traffic Analytics')).toBeVisible();
  41 |   });
  42 | 
  43 |   test('should display agent management sections', async ({ page }) => {
  44 |     await page.goto('/admin/agents');
  45 | 
  46 |     // Check for different agent types
  47 |     await expect(page.locator('text=Support Agent')).toBeVisible();
  48 |     await expect(page.locator('text=Lead Generation')).toBeVisible();
  49 |     await expect(page.locator('text=Social Media')).toBeVisible();
  50 |   });
  51 | 
  52 |   test('should load traffic data visualization', async ({ page }) => {
> 53 |     await page.goto('/admin/traffic');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  54 | 
  55 |     // Check for traffic visualization elements
  56 |     await expect(page.locator('text=Traffic Sources')).toBeVisible();
  57 |     await expect(page.locator('text=Real-time Visitors')).toBeVisible();
  58 |   });
  59 | });
```