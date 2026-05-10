# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Pretzel Dashboard >> should load the main dashboard
- Location: tests\dashboard.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```