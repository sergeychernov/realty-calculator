# Playwright Testing Guide

This project includes Playwright for web scraping.

## Installation

Playwright is already installed as a dev dependency. If you need to reinstall browsers:

```bash
npx playwright install
```

Or install specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Standalone Script Example

A standalone Playwright script is available at `playwright-scripts/playwright-example.ts` that demonstrates programmatic usage:

```bash
# Run the standalone script
npx ts-node playwright-scripts/playwright-example.ts
```

```bash
# Run the standalone script with a visible browser
tsx playwright-scripts/scrape-realty-example.ts --ui
# npm run playwright:realty:ui
```

This script:
- Launches a browser programmatically
- ...
- Logs the results

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Scripts Directory**: `./playwright-scripts`
- **Base URL**: `http://localhost:3000` (your Next.js app)
- **Web Server**: Automatically starts your dev server before tests
- **Browsers**: Configured for Chromium, Firefox, and WebKit
- **Screenshots**: Captured on test failure
- **Traces**: Captured on first retry

## Common Use Cases

### Getting H1 Text

```typescript
// Get first H1
const h1Text = await page.locator('h1').first().textContent();

// Get all H1s
const allH1s = await page.locator('h1').allTextContents();

// Get H1 count
const h1Count = await page.locator('h1').count();
```

### Navigation

```typescript
// Go to URL
await page.goto('https://example.com');

// Go to relative URL (uses baseURL)
await page.goto('/about');

// Wait for load
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');
```

### Selectors

```typescript
// CSS selector
page.locator('h1')
page.locator('.class-name')
page.locator('#id')

// Text selector
page.locator('text=Example')

// Multiple selectors
page.locator('h1, h2, h3')

// Chaining
page.locator('header').locator('h1')
```

## Programmatic Usage (Non-Test)

If you want to use Playwright outside of tests (e.g., for web scraping):

```typescript
import { chromium } from '@playwright/test';

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://example.com');
    const h1 = await page.locator('h1').first().textContent();
    console.log('H1:', h1);
  } finally {
    await context.close();
    await browser.close();
  }
}
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Best Practices](https://playwright.dev/docs/best-practices)

## Troubleshooting

### Browser not installed
```bash
npx playwright install chromium
```

### Timeout
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```
