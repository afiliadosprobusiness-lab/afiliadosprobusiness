import { NextRequest, NextResponse } from "next/server";
import { sitesStorage } from "@/lib/sitesStorage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await sitesStorage.get(id);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return new Response(site.html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { html } = body;

    const success = await sitesStorage.update(id, html);
    if (!success) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await sitesStorage.publish(id);
    if (!success) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to publish site" }, { status: 500 });
  }
}
