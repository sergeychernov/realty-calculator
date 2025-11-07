import { chromium } from "@playwright/test";
import { extractData, CianData } from "./extract-data";

// Check if UI mode is enabled via command-line argument
const uiMode =
  process.argv.includes("--ui") || process.argv.includes("--headed");

const userContext = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  // TODO: extend ...
};

const userInput = {
  address: "Москва, Усиевича, 1",
  roomNumber: "27",
  roomsCount: 2,
  area: 52.7, // might be optional for well known addresses
  // TODO: extend ...
};

// TODO: POM PageObjectModel for all page steps

async function emulate(): Promise<CianData | null> {
  const browser = await chromium.launch({
    headless: !uiMode,
  });

  const context = await browser.newContext({
    userAgent: userContext.userAgent,
    // proxy, locale, ...
  });

  const page = await context.newPage();

  const url = "https://www.cian.ru/my-home/";
  try {
    console.log(`📍 Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 10_000,
    });
    console.log("✅ Page loaded successfully\n");

    // 2 Possible starting points:
    // 1. inline form with address
    // 2. button "add real estate" - opens modal form with address

    // Step 1.
    await page.locator("#geo-suggest-input").fill(userInput.address);
    const addresses = page.locator('[data-group="addresses"]');
    await addresses.locator('[class*="item"]').first().click({ force: true });

    await page
      .locator('[data-name="RoomNumberInput"]')
      .locator("input")
      .fill(userInput.roomNumber, { force: true });

    const rooms = page.locator('[data-name="roomsCount_filter"]');
    await rooms
      .getByText(
        userInput.roomsCount <= 4 ? userInput.roomsCount.toString() : "4+",
      )
      .click({ force: true });

    await page
      .locator('[data-name="AreaInput"]')
      .locator("input")
      .fill(userInput.area.toFixed(), { force: true });

    // const receiveUpdatesChecked = await page
    //   .locator('[data-name="SwitchComponent"]')
    //   .locator('input[type="checkbox"]')
    //   .getAttribute("checked");
    // console.log({ receiveUpdatesChecked });
    // if (receiveUpdatesChecked) {
    await page.locator('[data-name="SwitchComponent"]').click();
    // }

    await page.locator('[data-name="AddNewCardButton"]').click({ force: true });

    // https://www.cian.ru/valuation-form/?houseId=1761177&address=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C+%D1%83%D0%BB%D0%B8%D1%86%D0%B0+%D0%A3%D1%81%D0%B8%D0%B5%D0%B2%D0%B8%D1%87%D0%B0%2C+1&totalArea=49.3&roomsCount=2&estimationId=5960110&myHome=2756519
    // TODO: use this page with query string, skip step 1?

    // await closeAuthModal(page);

    // Step 2.
    // 2 Options: 1. "В другой раз" (сразу отчет),
    await page.getByText("В другой раз").click();
    await page
      .locator('[data-name="CardsQuestion"]')
      .locator('[data-name="Card"]')
      .nth(0) // TODO: randomize number
      .click({ force: true });

    // 2 Options: 2. "Вперед к анкете" (добавление еще информации об объекте)
    // TODO:

    const myEstimationCard = await page
      .locator('[data-name="ListCard"]')
      .innerHTML();
    console.log({ myEstimationCard });

    // Открытие полной информации и аналогов
    const referenceObject = page
      .locator('[data-name="OfferHistoryLayout"]')
      .getByText("Продажа", { exact: false });
    await referenceObject.click();

    // Парсинг итоговой информации
    const data = await extractData(page);
    console.log(data);
    return data;

    // TODO: закрытие опросника
    // TODO: parse result  and return it as RealEstateProperties
    //  При клике на аналоге "Объявления в этом и соседних домах - Посмотреть все"
    //  открывается страница с новыми деталями: график цены, больше аналогов
    //  (только нужно именно у "Продажа", тк есть еще "Аренда").
    //  "Узнать подробнее о доме"
    // TODO: userInput from ui and return result on ui
    // TODO: как запускать на бэкенде и передавать данные
  } catch (error) {
    console.error(`⚠️  Could not extract all data from ${url}`, error);
  } finally {
    if (!uiMode) {
      await context.close();
      await browser.close();
    }
  }

  return null;
}

// Close authentication modal "Войдите чтобы получать обновления цены"
// async function closeAuthModal(page: Page) {
//   // const authModal = page.locator('[data-name="AuthenticationModal"]');
//   const closeButton = page.locator('[role="button"][aria-label="Закрыть"]');
//   const isVisible = await closeButton.isVisible({ timeout: 2000 });
//   if (isVisible) {
//     await page.keyboard.press("Escape", { delay: 1_000 });
//     await closeButton.click({ force: true });
//     console.log("✅ Authentication modal closed");
//   }
// }

emulate().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
