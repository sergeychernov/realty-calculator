import { NextResponse } from "next/server";
import { emulate, type UserInput } from "@/playwright-scripts/cian/emulate";
import type { CianData } from "@/playwright-scripts/cian/extract-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Increase timeout for Playwright operations

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const userInput: Partial<UserInput> = {};

    const address = searchParams.get("address");
    if (address) userInput.address = address;

    const roomNumber = searchParams.get("roomNumber");
    if (roomNumber) userInput.roomNumber = roomNumber;

    const roomsCount = searchParams.get("roomsCount");
    if (roomsCount) userInput.roomsCount = parseInt(roomsCount, 10);

    const area = searchParams.get("area");
    if (area) userInput.area = parseFloat(area);

    // Validate that all required fields are present
    const requiredFields: (keyof UserInput)[] = [
      "address",
      "roomNumber",
      "roomsCount",
      "area",
    ];
    const missingFields = requiredFields.filter(
      (field) => userInput[field] === undefined,
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          data: null,
        },
        { status: 400 },
      );
    }

    console.log("🚀 Starting Cian emulation...", userInput);
    const data: CianData | null = await emulate(userInput as UserInput);

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
