"use client";

import { useState } from "react";
import type { CianData } from "@/playwright-scripts/cian/extract-data";

export default function EmulationPage() {
  const [address, setAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomsCount, setRoomsCount] = useState("1");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data: CianData;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        address,
        roomNumber,
        roomsCount,
        area,
      });

      const response = await fetch(`/api/cian-emulate?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch data");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Cian Emulation
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="address"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Адрес
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="Например: Москва, ул. Тверская, 1"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="roomNumber"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Номер квартиры
            </label>
            <input
              id="roomNumber"
              name="roomNumber"
              type="text"
              required
              placeholder="Например: 42"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="roomsCount"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Количество комнат
            </label>
            <select
              id="roomsCount"
              name="roomsCount"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:focus:ring-white/20"
              value={roomsCount}
              onChange={(e) => setRoomsCount(e.target.value)}
              disabled={loading}
            >
              <option value="0">студия</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="area"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Метраж (м²)
            </label>
            <input
              id="area"
              name="area"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              required
              placeholder="Например: 42.5"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Загрузка..." : "Запустить эмуляцию"}
            </button>
          </div>
        </form>

        {error && (
          <div className="w-full max-w-xl p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 font-medium">Ошибка</p>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && result.success && (
          <div className="w-full max-w-xl space-y-6">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Результат
            </h2>

            <div className="space-y-4 p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                Информация о недвижимости
              </h3>
              <div className="space-y-2 text-zinc-800 dark:text-zinc-300">
                <p>
                  <span className="font-medium">Адрес:</span>{" "}
                  {result.data.realEstateInfo.address}
                </p>
                <p>
                  <span className="font-medium">Площадь:</span>{" "}
                  {result.data.realEstateInfo.totalArea} м²
                </p>
                <p>
                  <span className="font-medium">Комнат:</span>{" "}
                  {result.data.realEstateInfo.roomsCount}
                </p>
                {result.data.realEstateInfo.price && (
                  <p>
                    <span className="font-medium">Цена:</span>{" "}
                    {result.data.realEstateInfo.price}
                  </p>
                )}
                {result.data.realEstateInfo.pricePerMeter && (
                  <p>
                    <span className="font-medium">Цена за м²:</span>{" "}
                    {result.data.realEstateInfo.pricePerMeter}
                  </p>
                )}
                {result.data.realEstateInfo.estimatedValue && (
                  <p>
                    <span className="font-medium">Оценочная стоимость:</span>{" "}
                    {result.data.realEstateInfo.estimatedValue}
                  </p>
                )}
                <p>
                  <span className="font-medium">Категория:</span>{" "}
                  {result.data.realEstateInfo.category}
                </p>
              </div>
            </div>

            {result.data.offersHistory &&
              result.data.offersHistory.length > 0 && (
                <div className="space-y-4 p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                    История предложений
                  </h3>
                  <div className="space-y-3">
                    {result.data.offersHistory.map((offer, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {offer.date}
                        </p>
                        <p className="font-medium text-black dark:text-zinc-50">
                          {offer.price}
                        </p>
                        {offer.pricePerMeter && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {offer.pricePerMeter}
                          </p>
                        )}
                        {offer.source && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Источник: {offer.source}
                          </p>
                        )}
                        {offer.status && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Статус: {offer.status}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="w-full max-w-xl pt-6">
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
            Тестовый объект
          </h2>
          <ul className="list-disc pl-5 text-zinc-800 dark:text-zinc-300">
            <li>
              <button
                type="button"
                className="underline hover:no-underline"
                onClick={() => {
                  setAddress("Москва, улица Усиевича, 1");
                  setRoomNumber("27");
                  setRoomsCount("2");
                  setArea("52.7");
                }}
              >
                Москва, улица Усиевича, 1 · кв. 27 · 2 комнаты · 52.7 м²
              </button>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
