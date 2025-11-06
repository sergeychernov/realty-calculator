import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    if (!q) {
      return NextResponse.json({ error: "Missing 'q' parameter" }, { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "ru");

    const res = await fetch(url.toString(), {
      headers: {
        // Укажите свой контакт для соблюдения правил Nominatim
        "User-Agent": "realty-calculator/1.0 (contact@example.com)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const first = Array.isArray(json) ? json[0] : null;
    if (!first) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const data = {
      found: true,
      lat: typeof first.lat === 'string' ? first.lat : String(first.lat ?? ''),
      lon: typeof first.lon === 'string' ? first.lon : String(first.lon ?? ''),
      displayName: first.display_name as string | undefined,
      raw: first,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}


