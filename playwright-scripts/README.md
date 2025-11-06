# Scripts Directory

This directory contains standalone scripts for various automation tasks.

## Creating Your Own Scripts

### TypeScript Script

Create a new `.ts` file and add a script to `package.json`:

```typescript
import { chromium } from '@playwright/test';

async function myScript() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://example.com');
    // Your logic here
  } finally {
    await browser.close();
  }
}

myScript();
```

## Common Playwright Operations

### Getting Text Content

```javascript
// Get first element's text
const text = await page.locator('h1').first().textContent();

// Get all matching elements' text
const allText = await page.locator('h1').allTextContents();

// Get count of matching elements
const count = await page.locator('h1').count();
```

### Navigation

```javascript
// Go to URL
await page.goto('https://example.com');

// Wait for different states
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');
await page.waitForLoadState('load');

// Wait for specific selector
await page.waitForSelector('h1');
```

### Selectors

```javascript
// CSS selectors
page.locator('h1')
page.locator('.class-name')
page.locator('#id')
page.locator('[data-testid="my-element"]')

// Text content
page.locator('text=Click me')

// Combining selectors
page.locator('header h1')
page.locator('h1, h2, h3')
```

### Browser Options

```javascript
const browser = await chromium.launch({
  headless: false,  // Show browser window
  slowMo: 100,      // Slow down operations by 100ms
  devtools: true,   // Open DevTools
});

// Set viewport size
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 }
});
```

### Taking Screenshots

```javascript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Element screenshot
const element = page.locator('h1');
await element.screenshot({ path: 'h1.png' });
```

### Getting Element Attributes

```javascript
// Get attribute
const href = await page.locator('a').first().getAttribute('href');

// Get inner text
const text = await page.locator('div').first().innerText();

// Get inner HTML
const html = await page.locator('div').first().innerHTML();
```

## Best Practices

1. **Always clean up**: Use try-finally blocks to ensure browser.close() is called
2. **Wait for load states**: Don't interact with elements before the page is ready
3. **Use headless mode for automation**: Set `headless: false` only for debugging
4. **Handle errors gracefully**: Wrap operations in try-catch blocks
5. **Use specific selectors**: Prefer data-testid or unique selectors over generic ones

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
