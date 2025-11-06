import { chromium } from "@playwright/test";

// Check if UI mode is enabled via command-line argument
const uiMode =
  process.argv.includes("--ui") || process.argv.includes("--headed");

// TODO: список сверить с google table
interface RealEstateProperties {
  price: string;
  // TODO: extend ...
}

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

async function scrape(): Promise<RealEstateProperties> {
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
    await addresses.locator('[class*="item"]').first().click();

    await page
      .locator('[data-name="RoomNumberInput"]')
      .locator("input")
      .fill(userInput.roomNumber);

    const rooms = page.locator('[data-name="roomsCount_filter"]');
    await rooms
      .getByText(
        userInput.roomsCount <= 4 ? userInput.roomsCount.toString() : "4+",
      )
      .click();

    await page
      .locator('[data-name="AreaInput"]')
      .locator("input")
      .fill(userInput.area.toFixed());

    const receiveUpdatesChecked = await page
      .locator('[data-name="SwitchComponent"]')
      .locator('input[type="checkbox"]')
      .getAttribute("checked");
    if (receiveUpdatesChecked) {
      await page.locator('[data-name="SwitchComponent"]').click();
    }

    await page
      .locator('[data-name="AddNewCardButton"]')
      .locator("button")
      .click();

    // https://www.cian.ru/valuation-form/?houseId=1761177&address=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C+%D1%83%D0%BB%D0%B8%D1%86%D0%B0+%D0%A3%D1%81%D0%B8%D0%B5%D0%B2%D0%B8%D1%87%D0%B0%2C+1&totalArea=49.3&roomsCount=2&estimationId=5960110&myHome=2756519
    // TODO: use this page with query string, skip step 1?

    // Step 2.
    // 2 Options: 1. "В другой раз" (сразу отчет),
    await page.getByText("В другой раз").click();
    await page
      .locator('[data-name="CardsQuestion"]')
      .locator('[data-name="Card"]')
      .nth(0) // TODO: randomize number
      .click();

    // 2 Options: 2. "Вперед к анкете" (добавление еще информации об объекте)
    // TODO:

    const myEstimationCard = page.locator('[data-name="ListCard"]');
    console.log({ myEstimationCard });

    // TODO: close modal "Войдите чтобы получать обновления цены"
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
    return { price: "N/A" };
  } finally {
    if (!uiMode) {
      await context.close();
      await browser.close();
    }
  }

  return { price: "N/A" };
}

scrape().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
