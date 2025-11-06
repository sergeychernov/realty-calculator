import { JSDOM } from "jsdom";
import { SUMMARY_XPATH, HOUSE_XPATH } from "@/lib/cian/xpath";
import type { CianSummary, CianHouse } from "@/lib/cian/types";

export class CianParser {
	private dom: JSDOM;
	private doc: Document;

	constructor(html: string) {
		this.dom = new JSDOM(html);
		this.doc = this.dom.window.document;
	}

	private norm(input: string | null | undefined): string {
		return (input ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
	}

	private parseNumber(text: string): number | null {
		const t = text
			.replace(/\u00A0/g, ' ')
			.replace(/[^0-9,\.\-]/g, '')
			.replace(/,(?=\d{1,2}(?:\D|$))/g, '.');
		const n = parseFloat(t);
		return Number.isFinite(n) ? n : null;
	}

	private parseRangeMillionRub(text: string): { min: number | null; max: number | null; currency: 'RUB'; unit: 'million' } {
		const parts = this.norm(text).split(/[-–—]/).map((s) => s.trim());
		const min = parts[0] ? this.parseNumber(parts[0]) : null;
		const max = parts[1] ? this.parseNumber(parts[1]) : null;
		return { min, max, currency: 'RUB', unit: 'million' };
	}

	private parsePercent(text: string): number | null {
		const m = this.norm(text).match(/[-+]?\d+[\.,]?\d*/);
		return m ? this.parseNumber(m[0]) : null;
	}

	private getNode(xpath: string): Element | null {
		const res = this.doc.evaluate(
			xpath,
			this.doc,
			null,
			this.dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		);
		return (res.singleNodeValue as Element | null) ?? null;
	}

	public getSummary(): CianSummary | null {
		const targetNode = this.getNode(SUMMARY_XPATH);
		if (!targetNode) return null;

		const q = (sel: string, root: Element): Element | null => root.querySelector(sel);
		const qa = (sel: string, root: Element): Element[] => Array.from(root.querySelectorAll(sel));

		const objectInfo = q('[data-testid="ObjectInfoId"]', targetNode);
		const priceAvgContainer = q('[data-testid="market_price_value"]', targetNode);
		const priceRangeContainer = q('[data-testid="market_price_range_value"]', targetNode);
		const preciseFilters = q('[data-testid="precise_filters"]', targetNode) !== null;

		const title = objectInfo ? this.norm(q('[data-testid="ObjectInfoTextId"]', objectInfo)?.textContent) : "";
		let addressText = "";
		if (objectInfo) {
			const spans = qa('span', objectInfo);
			const addrCandidate = spans.find((el) => !el.getAttribute('data-testid'));
			addressText = this.norm(addrCandidate?.textContent || "");
		}
		const titleParts = title.split('·').map((s) => this.norm(s));
		const roomsLabel = titleParts[0] || '';
		const areaLabel = titleParts[1] || '';
		const areaSqm = this.parseNumber(areaLabel);

		let priceRangeText = "";
		if (priceAvgContainer) {
			const spanTexts = qa('span', priceAvgContainer).map((el) => this.norm(el.textContent || '')).filter(Boolean);
			priceRangeText = spanTexts.find((t) => /(млн|\d\s*[–—-]\s*\d)/i.test(t)) || "";
			if (!priceRangeText) {
				const full = this.norm(priceAvgContainer.textContent || '');
				const m = full.match(/\d+[\.,]?\d*\s*[–—-]\s*\d+[\.,]?\d*\s*млн/i);
				priceRangeText = m ? m[0] : "";
			}
		}
		const averageRange: CianSummary['marketPrice']['averageRange'] = priceRangeText
			? this.parseRangeMillionRub(priceRangeText)
			: { min: null, max: null, currency: 'RUB', unit: 'million' };
		const priceAvgDesc = priceAvgContainer ? this.norm(q('[data-testid="description"]', priceAvgContainer)?.textContent || "") : "";
		const averageValue = (() => {
			const m = priceAvgDesc.match(/([0-9]+[\.,]?[0-9]*)\s*млн/);
			return m ? this.parseNumber(m[1] || '') : null;
		})();

		let changePercentText = "";
		let changePercent: number | null = null;
		const changeDesc = priceRangeContainer ? this.norm(q('[data-testid="description"]', priceRangeContainer)?.textContent || "") : "";
		if (priceRangeContainer) {
			const full = this.norm(priceRangeContainer.textContent || '');
			const m = full.match(/[-+]?\d+[\.,]?\d*\s*%/);
			if (m) {
				changePercentText = m[0].replace(/\s+/g, '');
				changePercent = this.parsePercent(changePercentText);
			} else {
				const spanTexts = qa('span', priceRangeContainer).map((el) => this.norm(el.textContent || ''));
				const s = spanTexts.find((t) => /%/.test(t));
				if (s) {
					changePercentText = s;
					changePercent = this.parsePercent(changePercentText);
				}
			}
		}

		const testIdMap: Record<string, string | string[]> = {};
		qa('[data-testid]', targetNode).forEach((el) => {
			const key = el.getAttribute('data-testid');
			if (!key) return;
			const val = this.norm(el.textContent || '');
			if (key in testIdMap) {
				const prev = testIdMap[key];
				testIdMap[key] = Array.isArray(prev) ? [...prev, val] : [prev, val];
			} else {
				testIdMap[key] = val;
			}
		});

		const data: CianSummary = {
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

		return data;
	}

	public getHouse(): CianHouse | null {
		const targetNode = this.getNode(HOUSE_XPATH);
		if (!targetNode) return null;

		const q = (sel: string, root: Element): Element | null => root.querySelector(sel);
		const qa = (sel: string, root: Element): Element[] => Array.from(root.querySelectorAll(sel));

		const container = q('[data-testid="AboutHome"]', targetNode) || targetNode;
		const title = this.norm(q('[data-testid="AboutHome"] .x4800526d--dc75cc--text, [data-testid="AboutHome"] span', container)?.textContent || "О доме");

		// Извлекаем строки вида: name -> value
		const rowEls = qa('div[class*="--row"]', container);
		const rows: Array<{ name: string; value: string }> = rowEls.map((row) => {
			const name = this.norm(q('div[class*="--name"] p', row)?.textContent || (q('div[class*="--name"]', row)?.textContent || ""));
			const value = this.norm(q('div[class*="--val"] p', row)?.textContent || (q('div[class*="--val"]', row)?.textContent || ""));
			return { name, value };
		}).filter(r => r.name || r.value);

		const getVal = (label: string): string => {
			const found = rows.find(r => r.name.toLowerCase() === label.toLowerCase());
			return this.norm(found?.value || "");
		};

		const parseBool = (value: string): boolean | null => {
			if (!value) return null;
			const v = value.toLowerCase();
			if (/(^да$)|(^есть$)/i.test(v)) return true;
			if (/(^нет$)|(^отсутствует$)/i.test(v)) return false;
			return null;
		};

		// Парсинг известных полей
		const yearBuilt = this.parseNumber(getVal('Год постройки'));
		const houseType = getVal('Тип дома') || null;
		const series = getVal('Строительная серия') || null;
		const ceilingHeightMeters = this.parseNumber(getVal('Высота потолков'));
		const gasSupply = parseBool(getVal('Газоснабжение'));
		const heating = getVal('Отопление') || null;
		const slabType = getVal('Тип перекрытий') || null;
		const entrancesCount = this.parseNumber(getVal('Подъездов'));
		const apartmentsCount = this.parseNumber(getVal('Квартир'));
		const renovation = parseBool(getVal('Реновация'));
		const emergency = parseBool(getVal('Аварийность'));
		const playground = parseBool(getVal('Детская площадка'));
		const sportsGround = parseBool(getVal('Спортивная площадка'));

		// Лифты: "14 пассажирских, 18 грузовых"
		const elevatorsText = getVal('Количество лифтов');
		let elevatorsPassenger: number | null = null;
		let elevatorsFreight: number | null = null;
		if (elevatorsText) {
			const passengerMatch = elevatorsText.match(/(\d+[\.,]?\d*)\s*пассажир/i);
			const freightMatch = elevatorsText.match(/(\d+[\.,]?\d*)\s*грузов/i);
			elevatorsPassenger = passengerMatch ? this.parseNumber(passengerMatch[1]) : null;
			elevatorsFreight = freightMatch ? this.parseNumber(freightMatch[1]) : null;
		}

		const data: CianHouse = {
			title: title || 'О доме',
			rows,
			parsed: {
				yearBuilt,
				houseType,
				series,
				ceilingHeightMeters,
				gasSupply,
				heating,
				slabType,
				entrancesCount,
				elevatorsPassenger,
				elevatorsFreight,
				apartmentsCount,
				renovation,
				emergency,
				playground,
				sportsGround,
			},
			meta: {
				fetchedAt: new Date().toISOString(),
			},
		};

		return data;
	}
}


