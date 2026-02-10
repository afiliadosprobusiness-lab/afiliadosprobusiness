import { NextRequest, NextResponse } from "next/server";
import { sitesStorage } from "@/lib/sitesStorage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const site = sitesStorage.get(id);

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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { html } = body;

    const success = sitesStorage.update(id, html);
    if (!success) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  }
}
