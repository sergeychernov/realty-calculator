"use client";

import { Suspense, useEffect, useState } from "react";
import type { CianData } from "@/playwright-scripts/cian/extract-data";
import { useSearchParams } from "next/navigation";

function EmulationPageContent() {
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
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const initialAddress = searchParams.get("address");
    const initialRoomNumber = searchParams.get("roomNumber");
    const initialRoomsCount = searchParams.get("roomsCount");
    const initialArea = searchParams.get("area");

    if (initialAddress) setAddress(initialAddress);
    if (initialRoomNumber) setRoomNumber(initialRoomNumber);
    if (initialRoomsCount) setRoomsCount(initialRoomsCount);
    if (initialArea) setArea(initialArea);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setScreenshot(null);

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
        if (data.screenshot) {
          setScreenshot(data.screenshot);
        }
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
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Cian Emulation
          </h1>
        </div>
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
          <div className="w-full max-w-xl space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Ошибка
              </p>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
            {screenshot && (
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Screenshot браузера:
                </p>
                <img
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Browser screenshot on error"
                  className="w-full rounded border border-zinc-300 dark:border-zinc-700"
                />
              </div>
            )}
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
                {result.data.realEstateInfo.price && (
                  <p className="text-l font-bold text-black dark:text-zinc-50 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
                    <span className="font-medium">Оценочная стоимость:</span>
                    <br />
                    {result.data.realEstateInfo.price.replace(
                      "Средняя",
                      ", Средняя",
                    )}
                  </p>
                )}

                {Object.keys(result.data.realEstateInfo.buildingInfo).length >
                  0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Информация о здании:</h4>
                      <div className="space-y-1 pl-4">
                        {Object.entries(
                          result.data.realEstateInfo.buildingInfo,
                        ).map(([key, value]) => (
                          <p key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                {Object.keys(result.data.realEstateInfo.additionalInfo).length >
                  0 && (
                    <div className="mt-4">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                          Дополнительная информация:
                        </summary>
                        <div className="space-y-1 pl-4 max-h-60 overflow-y-auto">
                          {Object.entries(
                            result.data.realEstateInfo.additionalInfo,
                          ).map(([key, value]) => (
                            <p key={key} className="text-sm break-words">
                              <span className="font-medium">{key}:</span>{" "}
                              {String(value)}
                            </p>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
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
                        {offer.price && (
                          <p className="font-medium text-black dark:text-zinc-50 mb-2">
                            {offer.price}
                          </p>
                        )}
                        {offer.info && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            {offer.info}
                          </p>
                        )}
                        {Object.keys(offer.additionalInfo).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                Дополнительная информация
                              </summary>
                              <div className="mt-2 space-y-1 pl-4">
                                {Object.entries(offer.additionalInfo).map(
                                  ([key, value]) => (
                                    <p
                                      key={key}
                                      className="text-xs text-zinc-600 dark:text-zinc-400 break-words"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{" "}
                                      {String(value)}
                                    </p>
                                  ),
                                )}
                              </div>
                            </details>
                          </div>
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

export default function EmulationPage() {
  return (
    <Suspense fallback={<div />}>
      <EmulationPageContent />
    </Suspense>
  );
}
