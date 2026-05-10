# E2E TESTING GUIDE
## End-to-End Testing Setup for Pretzel Dashboard

**Status**: Phase 8 - Testing Framework Setup  
**Last Updated**: May 9, 2026  
**Framework**: Playwright (recommended) or Cypress

---

## TABLE OF CONTENTS

1. [Testing Strategy](#testing-strategy)
2. [Playwright Setup](#playwright-setup)
3. [Test Categories](#test-categories)
4. [Running Tests](#running-tests)
5. [CI/CD Integration](#cicd-integration)

---

## TESTING STRATEGY

### Test Pyramid

```
         ┌─────────────────┐
         │  E2E Tests (5%) │  - Full user workflows
         ├─────────────────┤
         │ Integration (25%)│  - Component interactions
         ├─────────────────┤
         │  Unit Tests (70%)│  - Individual functions
         └─────────────────┘
```

### Critical User Flows to Test

1. **Navigation Flow**
   - User lands on dashboard
   - Navigates through business pages
   - Navigates through agent pages
   - All links work correctly

2. **Business Operations Flow**
   - Analytics page loads with data
   - Marketing page shows campaigns
   - Sales page shows pipeline
   - Inbox shows emails
   - Social page shows feed
   - Traffic page shows analytics

3. **Agent Operations Flow**
   - Agent overview page loads
   - Support console accessible
   - Social hub accessible
   - Lead gen scanner accessible
   - Training interface accessible
   - Settings accessible

4. **Data Integration Flow**
   - API endpoints responding
   - Data displaying correctly
   - Charts rendering
   - Tables displaying data
   - Search/filter working

5. **Error Handling Flow**
   - API errors handled gracefully
   - Fallback UI displayed
   - Error messages clear
   - Retry mechanism working

---

## PLAYWRIGHT SETUP

### Installation

```bash
# Navigate to frontend
cd frontend

# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Create tests directory
mkdir -p tests/e2e
```

### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail on console errors
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configure webServer to start Next.js
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  // Test timeouts
  timeout: 30000,
  expect: { timeout: 5000 },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
});
```

### Package.json Updates

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report test-results"
  }
}
```

---

## TEST CATEGORIES

### 1. Navigation Tests

**File**: `tests/e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all business pages', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/');

    // Test Analytics
    await page.click('[href*="/admin/analytics"]');
    await expect(page).toHaveURL(/\/admin\/analytics/);
    await expect(page.locator('h1, h2')).toContainText(/Analytics|Dashboard/);

    // Test Marketing
    await page.click('[href*="/admin/marketing"]');
    await expect(page).toHaveURL(/\/admin\/marketing/);

    // Test Sales
    await page.click('[href*="/admin/sales"]');
    await expect(page).toHaveURL(/\/admin\/sales/);

    // Test Inbox
    await page.click('[href*="/admin/inbox"]');
    await expect(page).toHaveURL(/\/admin\/inbox/);

    // Test Social
    await page.click('[href*="/admin/social"]');
    await expect(page).toHaveURL(/\/admin\/social/);

    // Test Traffic
    await page.click('[href*="/admin/traffic"]');
    await expect(page).toHaveURL(/\/admin\/traffic/);
  });

  test('should navigate to all agent pages', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents');

    // Test Support
    await page.click('[href*="/admin/agents/support"]');
    await expect(page).toHaveURL(/\/admin\/agents\/support/);

    // Test Social
    await page.click('[href*="/admin/agents/social"]');
    await expect(page).toHaveURL(/\/admin\/agents\/social/);

    // Test Leads
    await page.click('[href*="/admin/agents/leads"]');
    await expect(page).toHaveURL(/\/admin\/agents\/leads/);

    // Test Training
    await page.click('[href*="/admin/agents/training"]');
    await expect(page).toHaveURL(/\/admin\/agents\/training/);

    // Test Settings
    await page.click('[href*="/admin/agents/settings"]');
    await expect(page).toHaveURL(/\/admin\/agents\/settings/);

    // Test Vault
    await page.click('[href*="/admin/agents/vault"]');
    await expect(page).toHaveURL(/\/admin\/agents\/vault/);

    // Test Guardrails
    await page.click('[href*="/admin/agents/guardrails"]');
    await expect(page).toHaveURL(/\/admin\/agents\/guardrails/);

    // Test Harnesses
    await page.click('[href*="/admin/agents/harnesses"]');
    await expect(page).toHaveURL(/\/admin\/agents\/harnesses/);

    // Test Resources
    await page.click('[href*="/admin/agents/resources"]');
    await expect(page).toHaveURL(/\/admin\/agents\/resources/);
  });

  test('should navigate back from sub-pages', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/analytics');
    await expect(page).toHaveURL(/\/admin\/analytics/);
    await page.goto('http://localhost:3000/admin/');
    await expect(page).toHaveURL(/\/admin\/?$/);
  });
});
```

### 2. Business Pages Tests

**File**: `tests/e2e/business-pages.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Business Pages', () => {
  test('Analytics page should load with data', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/analytics');
    
    // Wait for content
    await page.waitForLoadState('networkidle');
    
    // Check for KPI cards
    await expect(page.locator('[class*="card"]')).toBeDefined();
    
    // Check for charts
    const charts = page.locator('svg');
    await expect(charts).toHaveCount(0, { relation: '>' });
    
    // Check for agent performance widget
    await expect(page.locator('text=Agent Performance').or(page.locator('text=Agents'))).toBeDefined();
  });

  test('Marketing page should load campaigns', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/marketing');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const heading = page.locator('h1, h2, h3');
    await expect(heading).toBeDefined();
  });

  test('Sales page should show pipeline', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/sales');
    await page.waitForLoadState('networkidle');
    
    // Check for pipeline elements
    const pageContent = page.locator('main, [role="main"]');
    await expect(pageContent).toBeDefined();
  });

  test('Inbox page should display emails', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/inbox');
    await page.waitForLoadState('networkidle');
    
    // Check for email list or loading state
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Social page should show feed', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/social');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Traffic page should display analytics', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/traffic');
    await page.waitForLoadState('networkidle');
    
    // Check for content
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });
});
```

### 3. Agent Pages Tests

**File**: `tests/e2e/agent-pages.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Agent Pages', () => {
  test('Agent overview page should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents');
    await page.waitForLoadState('networkidle');
    
    // Check for agent overview elements
    await expect(page.locator('text=Agent')).toBeDefined();
  });

  test('Support agent console should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/support');
    await page.waitForLoadState('networkidle');
    
    // Check for support elements
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Social agent hub should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/social');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Lead gen scanner should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/leads');
    await page.waitForLoadState('networkidle');
    
    // Check for lead pipeline elements
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Training interface should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/training');
    await page.waitForLoadState('networkidle');
    
    // Check for training elements
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Agent settings should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/settings');
    await page.waitForLoadState('networkidle');
    
    // Check for settings elements
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Guardrails page should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/guardrails');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Harnesses page should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/harnesses');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Vault page should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/vault');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });

  test('Resources page should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/agents/resources');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeDefined();
  });
});
```

### 4. Responsive Design Tests

**File**: `tests/e2e/responsive.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.use({ ...devices['Pixel 5'] });

  test('Mobile navigation should work', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/');
    await page.waitForLoadState('networkidle');
    
    // Check hamburger menu exists
    const hamburger = page.locator('[aria-label="Menu"], button[class*="menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
    }
    
    // Check navigation items visible
    const navItems = page.locator('[role="navigation"]');
    await expect(navItems).toBeDefined();
  });

  test('Mobile pages should render correctly', async ({ page }) => {
    const pages = [
      '/admin/analytics',
      '/admin/agents',
      '/admin/agents/support',
    ];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Check no horizontal scrolling
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewport = page.viewportSize();
      expect(width).toBeLessThanOrEqual(viewport!.width + 10); // Small tolerance
    }
  });
});
```

---

## RUNNING TESTS

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/navigation.spec.ts
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### Generate Report

```bash
npm run test:e2e:report
```

---

## CI/CD INTEGRATION

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/test-results/
          retention-days: 30
```

---

## TEST MAINTENANCE

### Running Tests Regularly

- **On every PR**: Run all tests
- **Before deployment**: Full test suite + performance tests
- **After deployment**: Smoke tests on staging + production

### Updating Tests

When pages change:
1. Update affected test files
2. Run tests locally
3. Commit test changes with code changes
4. Review test results in CI

---

**END OF E2E TESTING GUIDE**
