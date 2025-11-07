# Playwright Testing Guide

This project includes Playwright for web scraping and automation.

## Cian Emulate API

A new API endpoint has been created to run the Cian emulation script programmatically.

### Endpoint

```
GET /api/cian-emulate
```

### Usage

#### GET Request

You can call the endpoint without parameters (uses default values) or with query parameters to specify property details:

```bash
# Using curl - with custom parameters
curl "http://localhost:3000/api/cian-emulate?address=Москва,%20Усиевича,%201&roomNumber=27&roomsCount=2&area=52.7"
```

### Response Format

```typescript
{
  success: true,
  data: {
    realEstateInfo: {
      address: string;
      totalArea: number;
      roomsCount: number;
      price?: string;
      pricePerMeter?: string;
      estimatedValue?: string;
      category: string;
    },
    offersHistory: Array<{
      date: string;
      price: string;
      pricePerMeter?: string;
      source?: string;
      status?: string;
    }>
  }
}
```

### Notes

- The endpoint has a 60-second timeout for Playwright operations
- The script runs in headless mode when called from the API
- For GET requests, all parameters should be URL-encoded

---

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

### Cian Emulation Script

The Cian emulation script is available at `playwright-scripts/cian/emulate.ts`:

```bash
# Run in headless mode (default)
tsx playwright-scripts/cian/emulate.ts

# Run with visible browser (UI mode)
tsx playwright-scripts/cian/emulate.ts --ui
# or
npm run playwright:cian:ui
```

This script:
- Navigates to Cian.ru calculator
- Fills in property information (address, room number, area, etc.)
- Extracts real estate data and offers history
- Returns structured CianData object
- Can be run standalone or via API endpoint

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
