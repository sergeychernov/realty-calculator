import { NextResponse } from "next/server";
import { CianParser, mapRoomsToCount } from "@/lib/cian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

		const parser = new CianParser(html);
		const summary = parser.getSummary();
		if (!summary) {
			return NextResponse.json(
				{ error: "Target element not found", url: targetUrlStr },
				{ status: 404 }
			);
		}

		const house = parser.getHouse();

		return NextResponse.json(
			{
				url: targetUrlStr,
				data: { summary, house },
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}


