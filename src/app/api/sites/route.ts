import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sitesStorage } from "@/lib/sitesStorage";

export async function GET() {
  try {
    const allSites = await sitesStorage.getAll();
    const sites = allSites.filter((s) => s.published);
    return NextResponse.json(sites);
  } catch (error) {
    console.error("[Sites API GET] Error:", error);
    // Keep Web Cloner functional even if listing fails.
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, url } = body;

    if (!html) {
      return NextResponse.json({ error: "No HTML provided" }, { status: 400 });
    }

    // Limit payload size to 1MB for Firestore (Firestore limit is 1MB per document)
    const MAX_SIZE = 1024 * 1024; // 1MB
    let processedHtml = html;
    if (Buffer.byteLength(html, 'utf8') > MAX_SIZE) {
      console.warn("HTML exceeds 1MB, truncating for Firestore storage");
      // Basic truncation, though ideally we'd remove non-essential scripts/styles first
      processedHtml = html.slice(0, MAX_SIZE / 2); // Conservative slice
    }

    const siteId = uuidv4().slice(0, 8);
    await sitesStorage.set(siteId, {
      html: processedHtml,
      url,
      createdAt: Date.now(),
      published: false,
    });

    return NextResponse.json({ siteId });
  } catch (error: any) {
    console.error("[Sites API POST] Error saving site:", error);
    return NextResponse.json({ 
      error: "No se pudo guardar el proyecto. Verifica la configuración de Firebase y permisos."
    }, { status: 500 });
  }
}
