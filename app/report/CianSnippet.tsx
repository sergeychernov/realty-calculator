"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  address: string;
  rooms: string;
  area: string;
  entrance?: string;
};

function mapRooms(rooms: string): string {
  const v = (rooms || "").trim().toLowerCase();
  if (v === "студия" || v === "studio") return "0";
  if (v === "5+" || v === "5plus") return "5";
  if (["1", "2", "3", "4", "5"].includes(v)) return v;
  return "";
}

export default function CianSnippet({ address, rooms, area, entrance }: Props) {
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (address) params.set("address", address);
    if (area) params.set("totalArea", area);
    const roomsCount = mapRooms(rooms);
    if (roomsCount) params.set("roomsCount", roomsCount);
    if (entrance) params.set("entrance", entrance);
    params.set("valuationType", "sale");
    return params.toString();
  }, [address, rooms, area, entrance]);

  type CianData = {
    url: string;
    data?: {
      summary: {
        object: { title: string; address: string };
        marketPrice: {
          averageRangeText: string;
          averageRange: { min: number | null; max: number | null; currency: 'RUB'; unit: 'million' };
          averageDescription: string;
          averageValueMillionRub: number | null;
          changePercentText: string;
          changePercent: number | null;
          changeDescription: string;
        };
      };
      house?: {
        title: string;
        rows: Array<{ name: string; value: string }>;
        parsed: Record<string, unknown>;
      } | null;
      nearest?: {
        items: Array<{
          id: string | null;
          title: string;
          priceText: string;
          pricePerSqmText: string;
          onCianDaysText: string;
          publishedDateText: string;
          statusText: string;
          imageUrl?: string;
          url?: string | null;
        }>;
        meta: { total: number };
      } | null;
    };
    error?: string;
  };

  const [data, setData] = useState<CianData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    const load = async () => {
      try {
        const res = await fetch(`/api/cian?${query}`, { cache: "no-store" });
        const json: CianData = await res.json();
        if (!res.ok) throw new Error(json?.error || "Request failed");
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(message);
      }
    };
    if (query) load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-200">
        Не удалось получить данные с CIAN: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        Загрузка…
      </div>
    );
  }

  const d = data.data;

  if (!d) {
    return (
      <div className="w-full rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
        Данные не найдены
      </div>
    );
  }

  // Форматирование полей, которые могут приходить как объекты/числа
  const rangeText = d.summary.marketPrice.averageRangeText
    || (d.summary.marketPrice.averageRange.min != null && d.summary.marketPrice.averageRange.max != null
      ? `${d.summary.marketPrice.averageRange.min} – ${d.summary.marketPrice.averageRange.max} млн ₽`
      : "");
  const changePctText = d.summary.marketPrice.changePercentText
    || (d.summary.marketPrice.changePercent != null ? `${d.summary.marketPrice.changePercent}%` : "");

  const fmt = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const minText = d.summary.marketPrice.averageRange.min != null ? `${fmt(d.summary.marketPrice.averageRange.min)} млн ₽` : "";
  const maxText = d.summary.marketPrice.averageRange.max != null ? `${fmt(d.summary.marketPrice.averageRange.max)} млн ₽` : "";

  return (
    <div className="space-y-3">
      <div className="w-full rounded-lg border border-black/10 p-4 dark:border-white/15">
        <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          Источник: <a href={data.url} target="_blank" rel="noreferrer" className="underline">CIAN</a>
        </div>
        <div className="space-y-2">
          <div className="text-lg font-semibold text-black dark:text-zinc-50">{d.summary.object.title}</div>
          <div className="text-zinc-700 dark:text-zinc-300">{d.summary.object.address}</div>
          <div className="pt-3">
            {rangeText && (
              <div className="text-xl font-semibold text-black dark:text-zinc-50">{rangeText}</div>
            )}
            {d.summary.marketPrice.averageDescription && (
              <div className="text-zinc-700 dark:text-zinc-300">{d.summary.marketPrice.averageDescription}</div>
            )}
            {(minText || maxText) && (
              <div className="text-zinc-700 dark:text-zinc-300">
                {minText && (<span>Мин: {minText}</span>)}
                {minText && maxText && <span> · </span>}
                {maxText && (<span>Макс: {maxText}</span>)}
              </div>
            )}
          </div>
          <div className="pt-1">
            {(changePctText || d.summary.marketPrice.changeDescription) && (
              <div className="text-zinc-700 dark:text-zinc-300">
                {d.summary.marketPrice.changeDescription || 'Изменение'}{changePctText ? `: ${changePctText}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {d.house && (
        <div className="w-full rounded-lg border border-black/10 p-4 dark:border-white/15">
          <div className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">{d.house.title || 'О доме'}</div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {d.house.rows.map((r, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 py-2">
                <div className="text-zinc-600 dark:text-zinc-400">{r.name}</div>
                <div className="text-zinc-900 dark:text-zinc-100">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {d.nearest && d.nearest.items.length > 0 && (
        <div className="w-full rounded-lg border border-black/10 p-4 dark:border-white/15">
          <div className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">Ближайшие объявления</div>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {d.nearest.items.slice(0, 8).map((it, idx) => (
              <li key={`${it.id ?? idx}`} className="flex gap-3 py-3">
                {it.imageUrl && (
                  <img src={it.imageUrl} alt="" className="h-16 w-26 shrink-0 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-zinc-900 dark:text-zinc-100">{it.title || '—'}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {it.publishedDateText || ''}{it.onCianDaysText ? ` · ${it.onCianDaysText}` : ''}{it.statusText ? ` · ${it.statusText}` : ''}
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <div className="text-zinc-900 dark:text-zinc-100">{it.priceText || '—'}</div>
                  {it.pricePerSqmText && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{it.pricePerSqmText}</div>
                  )}
                  {it.url && (
                    <a href={it.url} target="_blank" rel="noreferrer" className="text-xs underline">Открыть</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


