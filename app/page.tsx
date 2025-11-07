"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [rooms, setRooms] = useState("студия");
  const [area, setArea] = useState("");
  const [entrance, setEntrance] = useState("");

  const roomsCountParam = rooms === "студия" ? "0" : rooms === "5+" ? "5" : rooms;
  const emulationHref = `/emulation?${new URLSearchParams({
    address,
    roomNumber,
    roomsCount: roomsCountParam,
    area,
  }).toString()}`;
  const reportHref = `/report?${new URLSearchParams({
    address,
    rooms,
    area,
    entrance,
  }).toString()}`;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Калькулятор недвижимости
        </h1>
        <form method="GET" action="/report" className="w-full max-w-xl space-y-6">
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
              placeholder="Например: 27"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="rooms"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Количество комнат
            </label>
            <select
              id="rooms"
              name="rooms"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:focus:ring-white/20"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            >
              <option value="студия">студия</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
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
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="entrance" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Подъезд
            </label>
            <input
              id="entrance"
              name="entrance"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="Например: 11"
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-[#0a0a0a] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              value={entrance}
              onChange={(e) => setEntrance(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={reportHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Получить отчёт
            </Link>
            <Link
              href={emulationHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-200 px-6 text-black font-medium transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Получить отчёт через эмуляцию
            </Link>
          </div>
        </form>

        <div className="w-full max-w-xl pt-6">
          <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
            Тестовые объекты
          </h2>
          <ul className="list-disc pl-5 text-zinc-800 dark:text-zinc-300">
            <li>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setAddress("Москва, Красноказарменная улица, 14ак6");
                  setRoomNumber("27");
                  setRooms("4");
                  setArea("96");
                  setEntrance("11");
                }}
              >
                Москва, Красноказарменная улица, 14ак6 · 4 комнаты · 96 м² · подъезд 11
              </button>
            </li>
            <li>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setAddress("Москва, улица Усиевича, 1");
                  setRoomNumber("27");
                  setRooms("2");
                  setArea("52.7");
                  setEntrance("");
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
