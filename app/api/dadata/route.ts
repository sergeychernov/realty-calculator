import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    if (!q) {
      return NextResponse.json({ error: "Missing 'q' parameter" }, { status: 400 });
    }

    const apiKey = process.env.DADATA_API;
    const secret = process.env.DADATA_SECRET;
    if (!apiKey || !secret) {
      return NextResponse.json({ error: "Dadata credentials not configured" }, { status: 500 });
    }

    const countParam = searchParams.get("count");
    const count = countParam ? Math.max(1, Math.min(20, Number(countParam) || 10)) : 10;
    const body = {
      query: q,
      count,
      language: "ru",
    } as const;

    const upstream = await fetch(DADATA_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "X-Secret": secret,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream error: ${upstream.status}` }, { status: 502 });
    }

    const json = await upstream.json();
    // Возвращаем полностью всё, что прислал Dadata
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}


