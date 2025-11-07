/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from "@playwright/test";

// TODO: список сверить с google table
interface RealEstateInfo {
  address: string;
  totalArea: number;
  roomsCount: number;
  price?: string;
  pricePerMeter?: string;
  estimatedValue?: string;
  category: string;
  [key: string]: any;
}

interface OfferHistoryItem {
  date: string;
  price: string;
  pricePerMeter?: string;
  source?: string;
  status?: string;
  [key: string]: any;
}

interface CianData {
  realEstateInfo: RealEstateInfo;
  offersHistory: OfferHistoryItem[];
}

/**
 * Extract all real estate information and offers history from Cian.ru calculator page
 * @param page - Playwright Page object
 * @returns Object containing real estate info and offers history
 */
async function extractData(page: Page): Promise<CianData> {
  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Extract real estate object information
  const realEstateInfo: RealEstateInfo = await page.evaluate(() => {
    const info: any = {};

    // Extract address
    const addressElement = document.querySelector(
      '[data-testid="address"], .address, h1',
    );
    if (addressElement) {
      info.address = addressElement.textContent?.trim() || "";
    }

    // Extract total area
    const areaElement = document.querySelector(
      '[data-testid="total-area"], [data-name="totalArea"]',
    );
    if (areaElement) {
      const areaText = areaElement.textContent?.trim() || "";
      const areaMatch = areaText.match(/(\d+(?:\.\d+)?)/);
      if (areaMatch) {
        info.totalArea = parseFloat(areaMatch[1]);
      }
    }

    // Extract rooms count
    const roomsElement = document.querySelector(
      '[data-testid="rooms-count"], [data-name="roomsCount"]',
    );
    if (roomsElement) {
      const roomsText = roomsElement.textContent?.trim() || "";
      const roomsMatch = roomsText.match(/(\d+)/);
      if (roomsMatch) {
        info.roomsCount = parseInt(roomsMatch[1]);
      }
    }

    // Extract price information
    const priceElement = document.querySelector(
      '[data-testid="price"], .price, [class*="price"]',
    );
    if (priceElement) {
      info.price = priceElement.textContent?.trim() || "";
    }

    // Extract price per meter
    const pricePerMeterElement = document.querySelector(
      '[data-testid="price-per-meter"], [class*="pricePerMeter"]',
    );
    if (pricePerMeterElement) {
      info.pricePerMeter = pricePerMeterElement.textContent?.trim() || "";
    }

    // Extract estimated value
    const estimatedValueElement = document.querySelector(
      '[data-testid="estimated-value"], [class*="estimation"]',
    );
    if (estimatedValueElement) {
      info.estimatedValue = estimatedValueElement.textContent?.trim() || "";
    }

    // Extract category
    const categoryElement = document.querySelector('[data-testid="category"]');
    if (categoryElement) {
      info.category = categoryElement.textContent?.trim() || "flat";
    } else {
      info.category = "flat";
    }

    // Extract all data attributes and visible text content
    const mainContainer = document.querySelector(
      '[data-testid="calculator-container"], main, .calculator',
    );
    if (mainContainer) {
      const allElements = mainContainer.querySelectorAll(
        "[data-testid], [data-name]",
      );
      allElements.forEach((element) => {
        const testId =
          element.getAttribute("data-testid") ||
          element.getAttribute("data-name");
        if (testId && !info[testId]) {
          info[testId] = element.textContent?.trim() || "";
        }
      });
    }

    return info;
  });

  // Extract offers history (История объявлений)
  const offersHistory: OfferHistoryItem[] = await page.evaluate(() => {
    const history: OfferHistoryItem[] = [];

    // Look for the offers history section
    const historySelectors = [
      '[data-testid="offers-history"]',
      '[id="offersHistory"]',
      '[class*="offersHistory"]',
      '[class*="history"]',
    ];

    let historyContainer: Element | null = null;
    for (const selector of historySelectors) {
      historyContainer = document.querySelector(selector);
      if (historyContainer) break;
    }

    if (!historyContainer) {
      // Try to find by heading text
      const headings = Array.from(
        document.querySelectorAll("h2, h3, h4, .heading"),
      );
      for (const heading of headings) {
        if (
          heading.textContent?.includes("История") ||
          heading.textContent?.includes("объявлений")
        ) {
          historyContainer =
            heading.closest('section, div[class*="section"]') ||
            heading.parentElement;
          break;
        }
      }
    }

    if (historyContainer) {
      // Extract list items from history
      const listItems = historyContainer.querySelectorAll(
        '[data-testid*="offer"], [class*="offer-item"], [class*="history-item"], li, tr',
      );

      listItems.forEach((item, index) => {
        const historyItem: any = {};

        // Extract date
        const dateElement = item.querySelector(
          '[data-testid*="date"], [class*="date"], time',
        );
        if (dateElement) {
          historyItem.date = dateElement.textContent?.trim() || "";
        }

        // Extract price
        const priceElement = item.querySelector(
          '[data-testid*="price"], [class*="price"]',
        );
        if (priceElement) {
          historyItem.price = priceElement.textContent?.trim() || "";
        }

        // Extract price per meter
        const pricePerMeterElement = item.querySelector(
          '[data-testid*="price-per-meter"], [class*="pricePerMeter"]',
        );
        if (pricePerMeterElement) {
          historyItem.pricePerMeter =
            pricePerMeterElement.textContent?.trim() || "";
        }

        // Extract source
        const sourceElement = item.querySelector(
          '[data-testid*="source"], [class*="source"]',
        );
        if (sourceElement) {
          historyItem.source = sourceElement.textContent?.trim() || "";
        }

        // Extract status
        const statusElement = item.querySelector(
          '[data-testid*="status"], [class*="status"]',
        );
        if (statusElement) {
          historyItem.status = statusElement.textContent?.trim() || "";
        }

        // Extract all text content if specific fields not found
        if (!historyItem.price && !historyItem.date) {
          historyItem.rawText = item.textContent?.trim() || "";
          historyItem.index = index;
        }

        // Extract all data attributes
        const dataElements = item.querySelectorAll(
          "[data-testid], [data-name]",
        );
        dataElements.forEach((element) => {
          const testId =
            element.getAttribute("data-testid") ||
            element.getAttribute("data-name");
          if (testId && !historyItem[testId]) {
            historyItem[testId] = element.textContent?.trim() || "";
          }
        });

        if (Object.keys(historyItem).length > 0) {
          history.push(historyItem);
        }
      });
    }

    return history;
  });

  return {
    realEstateInfo,
    offersHistory,
  };
}

export {
  extractData,
  type RealEstateInfo,
  type OfferHistoryItem,
  type CianData,
};
