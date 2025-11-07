/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from "@playwright/test";

// TODO: список сверить с google table
interface RealEstateInfo {
  price?: string;
  buildingInfo?: Record<string, string>;
  additionalInfo: { [key: string]: any };
}

interface OfferHistoryItem {
  price: string;
  info: string;
  additionalInfo: { [key: string]: any };
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
    const info: Partial<RealEstateInfo> = {};

    // Extract price information
    const priceElement = document.getElementById("estimation");
    if (priceElement) {
      info.price = priceElement.textContent?.trim() || "";
    }

    // Building Info

    // Extract all data attributes and visible text content
    const mainContainer = document.querySelector("body");
    if (mainContainer) {
      const additionalInfo: any = {};
      const allElements = mainContainer.querySelectorAll(
        "[data-testid], [data-name]",
      );
      allElements.forEach((element) => {
        const testId =
          element.getAttribute("data-testid") ||
          element.getAttribute("data-name");
        if (testId && !additionalInfo[testId]) {
          additionalInfo[testId] = element.textContent?.trim() || "";
        }
      });
      info.additionalInfo = additionalInfo;
    }

    return info as RealEstateInfo;
  });

  // Extract offers history (История объявлений)
  const offersHistory: OfferHistoryItem[] = await page.evaluate(() => {
    const history: OfferHistoryItem[] = [];

    const historyContainer = document.getElementById("offersHistory");
    if (historyContainer) {
      // Extract list items from history
      const listItems = historyContainer.querySelectorAll(
        '[data-testid*="offers_history_listing_item"]',
      );

      listItems.forEach((item, index) => {
        const historyItem: any = {};

        historyItem.info = item.querySelector(
          '[data-name="WideOfferMainInfo"]',
        )?.textContent;

        // Extract price
        historyItem.price = item.querySelector(
          '[data-name="Price"]',
        )?.textContent;

        // Extract all data attributes
        const dataElements = item.querySelectorAll(
          "[data-testid], [data-name]",
        );
        const additionalInfo: any = {};
        dataElements.forEach((element) => {
          const testId =
            element.getAttribute("data-testid") ||
            element.getAttribute("data-name");
          if (testId && !additionalInfo[testId]) {
            additionalInfo[testId] = element.textContent?.trim() || "";
          }
        });
        historyItem.additionalInfo = additionalInfo;

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
