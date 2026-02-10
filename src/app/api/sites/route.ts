import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sitesStorage } from "@/lib/sitesStorage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, url } = body;

    if (!html) {
      return NextResponse.json({ error: "No HTML provided" }, { status: 400 });
    }

    const siteId = uuidv4().slice(0, 8);
    sitesStorage.set(siteId, {
      html,
      url,
      createdAt: Date.now(),
    });

    return NextResponse.json({ siteId });
  } catch (error) {
    console.error("Error saving site:", error);
    return NextResponse.json({ error: "Failed to save site" }, { status: 500 });
  }
}
