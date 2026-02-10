import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  // Esta es una ruta estática /api/sites/id
  // Para rutas dinámicas usar /api/sites/[id]
  return NextResponse.json({ error: "Use dynamic route /api/sites/[id]" }, { status: 400 });
}

export async function PUT(
  request: NextRequest
) {
  return NextResponse.json({ error: "Use dynamic route /api/sites/[id]" }, { status: 400 });
}
