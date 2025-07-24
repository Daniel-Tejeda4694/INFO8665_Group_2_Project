// src/app/api/transcript/latest/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
//   const filePath = path.join(process.cwd(), "output", "latest.txt");
  const filePath = path.join(process.cwd(), "..", "speech_to_text", "output", "latest.txt");

  try {
    console.log("Reading file:", filePath)

    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ text });
    } else {
      return NextResponse.json({ text: "" }); // File not exists
    }
  } catch (error) {
    console.error("Error reading transcript:", error);
    return NextResponse.json(
      { error: "Failed to read transcript." },
      { status: 500 }
    );
  }
}
