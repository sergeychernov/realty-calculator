export const dynamic = "force-dynamic";
import CianSnippet from "./CianSnippet";
import DadataSnippet from "./DadataSnippet";
import { headers } from "next/headers";
import type { DadataResponse } from "@/lib/dadata/types";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string; rooms?: string; area?: string }>;
}) {
  const params = await searchParams;
  const address = params?.address ?? "";
  const rooms = params?.rooms ?? "";
  const area = params?.area ?? "";
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const dadataData: DadataResponse | null = await (async () => {
    if (!address) return null;
    try {
      const url = new URL(`/api/dadata`, baseUrl);
      url.searchParams.set("q", address);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as DadataResponse;
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start gap-6 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Отчёт
        </h1>
        <div className="w-full max-w-xl space-y-4 text-zinc-800 dark:text-zinc-300">
          <p>
            <span className="font-medium">Адрес:</span> {address || "—"}
          </p>
          <p>
            <span className="font-medium">Комнаты:</span> {rooms || "—"}
          </p>
          <p>
            <span className="font-medium">Метраж:</span> {area || "—"}
          </p>
        </div>
        <div className="w-full max-w-xl pt-4">
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">Секция CIAN</h2>
          <CianSnippet address={address} rooms={rooms} area={area} />
        </div>
        <div className="w-full max-w-xl pt-2">
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">Секция Dadata</h2>
          <DadataSnippet data={dadataData} />
        </div>
      </main>
    </div>
  );
}



