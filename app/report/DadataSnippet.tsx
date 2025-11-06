import type { DadataResponse } from "@/lib/dadata/types";

export default function DadataSnippet({ data }: { data: DadataResponse | null }) {
  const suggestions = data?.suggestions || [];
  const first = suggestions[0];
  if (!first) {
    return (
      <div className="w-full rounded-lg border border-black/10 p-4 dark:border-white/15">
        <div className="text-zinc-700 dark:text-zinc-300">Нет результатов</div>
      </div>
    );
  }

  const title = first.unrestricted_value || first.value || "—";
  const lat = first.data?.geo_lat || "";
  const lon = first.data?.geo_lon || "";

  return (
    <div className="w-full rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="space-y-2">
        <div className="text-zinc-900 dark:text-zinc-100">{title}</div>
        {(lat || lon) && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">lat: {lat || "—"} · lon: {lon || "—"}</div>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-zinc-600 hover:underline dark:text-zinc-400">Показать все поля</summary>
          <div className="mt-2 overflow-auto rounded-md border border-black/10 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(first, null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}


