import { NextResponse } from "next/server";
import { emulate } from "@/playwright-scripts/cian/emulate";
import type { CianData } from "@/playwright-scripts/cian/extract-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Increase timeout for Playwright operations

export async function GET() {
  try {
    console.log("🚀 Starting Cian emulation...");

    const data: CianData | null = await emulate();

    if (!data) {
      return NextResponse.json(
        {
          error: "Failed to extract data from Cian",
          data: null,
        },
        { status: 500 },
      );
    }

    console.log("✅ Cian emulation completed successfully");

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in cian-emulate API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Accept userInput parameters from request body
    // const { address, roomNumber, roomsCount, area } = body;

    console.log("🚀 Starting Cian emulation with custom parameters...", body);

    const data: CianData | null = await emulate();

    if (!data) {
      return NextResponse.json(
        {
          error: "Failed to extract data from Cian",
          data: null,
        },
        { status: 500 },
      );
    }

    console.log("✅ Cian emulation completed successfully");

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in cian-emulate API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        data: null,
      },
      { status: 500 },
    );
  }
}
