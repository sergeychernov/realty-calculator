import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapRoomsToCount(rooms?: string): string | undefined {
	if (!rooms) return undefined;
	const value = rooms.trim().toLowerCase();
	if (value === "студия" || value === "studio") return "9";
	if (value === "5+" || value === "5plus" || value === "5") return "5";
	if (["1", "2", "3", "4"].includes(value)) return value;
	return undefined;
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		const address = searchParams.get("address") ?? "";
		const totalArea = searchParams.get("totalArea") ?? searchParams.get("area") ?? "";
		const roomsCount = searchParams.get("roomsCount") ?? mapRoomsToCount(searchParams.get("rooms") || undefined) ?? "";
		const valuationType = searchParams.get("valuationType") ?? "sale";

		if (!address || !totalArea) {
			return NextResponse.json(
				{ error: "Missing required parameters: address and totalArea" },
				{ status: 400 }
			);
		}

		const targetBase = "https://www.cian.ru/kalkulator-nedvizhimosti/";
		const pairs: Array<[string, string]> = [
			["address", address],
			["totalArea", totalArea],
			["valuationType", valuationType],
		];
		if (roomsCount) pairs.push(["roomsCount", roomsCount]);
		const search = pairs
			.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
			.join("&");
		const targetUrlStr = `${targetBase}?${search}`;

		console.log(targetUrlStr);

		const response = await fetch(targetUrlStr, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
				Connection: "keep-alive",
			},
			redirect: "follow",
			next: { revalidate: 0 },
		});

		const html = await response.text();

		// Если страница защиты от ботов — вернём информативную ошибку
		if (response.status !== 200 || /робот/i.test(html) || /captcha/i.test(html)) {
			return NextResponse.json(
				{
					error: "Blocked by remote site (anti-bot)",
					status: response.status,
					url: targetUrlStr,
				},
				{ status: 502 }
			);
		}

		// Парсинг через jsdom и извлечение по XPath
		const dom = new JSDOM(html);
		const doc = dom.window.document;
		const xpathExpr =
			"/html/body/div[1]/div/div[2]/div/div/div[1]/div[3]/div[1]/div";
		const result = doc.evaluate(
			xpathExpr,
			doc,
			null,
			dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		);
		const targetNode = result.singleNodeValue as Element | null;

		if (!targetNode) {
			return NextResponse.json(
				{ error: "Target element not found", url: targetUrlStr },
				{ status: 404 }
			);
		}

		// Вспомогательные функции парсинга
		const q = (sel: string, root: Element): Element | null => root.querySelector(sel);
		const qa = (sel: string, root: Element): Element[] => Array.from(root.querySelectorAll(sel));
		const norm = (s: string | null | undefined): string =>
			(s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
		const parseNumber = (text: string): number | null => {
			const t = text.replace(/\u00A0/g, ' ').replace(/[^0-9,\.\-]/g, '').replace(/,(?=\d{1,2}(?:\D|$))/g, '.');
			const n = parseFloat(t);
			return Number.isFinite(n) ? n : null;
		};
		const parseRangeMillionRub = (text: string): { min: number | null; max: number | null; currency: 'RUB'; unit: 'million' } => {
			// Пример: "37,1 – 45,3 млн ₽"
			const parts = norm(text).split(/[-–—]/).map((s) => s.trim());
			const min = parts[0] ? parseNumber(parts[0]) : null;
			const max = parts[1] ? parseNumber(parts[1]) : null;
			return { min, max, currency: 'RUB', unit: 'million' };
		};
		const parsePercent = (text: string): number | null => {
			const m = norm(text).match(/[-+]?\d+[\.,]?\d*/);
			return m ? parseNumber(m[0]) : null;
		};

		// Контейнеры
		const objectInfo = q('[data-testid="ObjectInfoId"]', targetNode);
		const priceAvgContainer = q('[data-testid="market_price_value"]', targetNode);
		const priceRangeContainer = q('[data-testid="market_price_range_value"]', targetNode);
		const preciseFilters = q('[data-testid="precise_filters"]', targetNode) !== null;

		// Поля ObjectInfo
		const title = objectInfo ? norm(q('[data-testid="ObjectInfoTextId"]', objectInfo)?.textContent) : "";
		// Адрес — span без data-testid внутри ObjectInfo
		let addressText = "";
		if (objectInfo) {
			const spans = qa('span', objectInfo);
			const addrCandidate = spans.find((el) => !el.getAttribute('data-testid'));
			addressText = norm(addrCandidate?.textContent || "");
		}
		// Произвести более детальный парсинг из title
		// Примеры title: "Студия · 95 м²" или "2-комн. · 45 м²"
		const titleParts = title.split('·').map((s) => norm(s));
		const roomsLabel = titleParts[0] || '';
		const areaLabel = titleParts[1] || '';
		const areaSqm = parseNumber(areaLabel);

		// Средняя оценка (блок market_price_value) — берём первый осмысленный span с диапазоном/"млн"
		let priceRangeText = "";
		if (priceAvgContainer) {
			const spanTexts = qa('span', priceAvgContainer).map((el) => norm(el.textContent || '')).filter(Boolean);
			priceRangeText = spanTexts.find((t) => /(млн|\d\s*[–—-]\s*\d)/i.test(t)) || "";
			if (!priceRangeText) {
				// Фолбэк: возьмём текст всего контейнера и ищем шаблон
				const full = norm(priceAvgContainer.textContent || '');
				const m = full.match(/\d+[\.,]?\d*\s*[–—-]\s*\d+[\.,]?\d*\s*млн/i);
				priceRangeText = m ? m[0] : "";
			}
		}
		const averageRange = priceRangeText ? parseRangeMillionRub(priceRangeText) : { min: null, max: null, currency: 'RUB', unit: 'million' as const };
		const priceAvgDesc = priceAvgContainer ? norm(q('[data-testid="description"]', priceAvgContainer)?.textContent || "") : "";
		// Из desc попробуем вынуть среднюю (например, "Средняя оценка: 41,2 млн ₽")
		const averageValue = (() => {
			const m = priceAvgDesc.match(/([0-9]+[\.,]?[0-9]*)\s*млн/);
			return m ? parseNumber(m[1] || '') : null;
		})();

		// Изменение за период (блок market_price_range_value) — берём из полного текста контейнера
		let changePercentText = "";
		let changePercent: number | null = null;
		const changeDesc = priceRangeContainer ? norm(q('[data-testid="description"]', priceRangeContainer)?.textContent || "") : "";
		if (priceRangeContainer) {
			const full = norm(priceRangeContainer.textContent || '');
			const m = full.match(/[-+]?\d+[\.,]?\d*\s*%/);
			if (m) {
				changePercentText = m[0].replace(/\s+/g, '');
				changePercent = parsePercent(changePercentText);
			} else {
				// Фолбэк по span-ам
				const spanTexts = qa('span', priceRangeContainer).map((el) => norm(el.textContent || ''));
				const s = spanTexts.find((t) => /%/.test(t));
				if (s) {
					changePercentText = s;
					changePercent = parsePercent(changePercentText);
				}
			}
		}

		// Соберём карту всех data-testid -> текст
		const testIdMap: Record<string, string | string[]> = {};
		qa('[data-testid]', targetNode).forEach((el) => {
			const key = el.getAttribute('data-testid');
			if (!key) return;
			const val = norm(el.textContent || '');
			if (key in testIdMap) {
				const prev = testIdMap[key];
				testIdMap[key] = Array.isArray(prev) ? [...prev, val] : [prev, val];
			} else {
				testIdMap[key] = val;
			}
		});

		const data = {
			object: {
				title,
				address: addressText,
				roomsLabel,
				areaLabel,
				areaSqm,
			},
			marketPrice: {
				averageRangeText: priceRangeText,
				averageRange,
				averageDescription: priceAvgDesc,
				averageValueMillionRub: averageValue,
				changePercentText,
				changePercent,
				changeDescription: changeDesc,
			},
			ui: {
				hasPreciseFilters: preciseFilters,
			},
			allTestIds: testIdMap,
			meta: {
				fetchedAt: new Date().toISOString(),
			},
		};
		console.log(data);

		return NextResponse.json(
			{
				url: targetUrlStr,
				data,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}


