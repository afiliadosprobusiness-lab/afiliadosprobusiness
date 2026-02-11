import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const ALLOWED_EVENT_TYPES = new Set([
  "page_view",
  "click",
  "conversion",
  "session_end",
]);

function clampDuration(value: unknown) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  // Max 30 minutes per session event to avoid poisoning.
  return Math.max(0, Math.min(Math.round(n), 30 * 60 * 1000));
}

function normalizeLabel(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin no configurado para registrar metricas." },
        { status: 503 },
      );
    }
    const db = adminDb;

    const body = await request.json();
    const siteId = String(body?.siteId || "").trim();
    const type = String(body?.type || "").trim().toLowerCase();
    const label = normalizeLabel(body?.label);

    if (!siteId) {
      return NextResponse.json({ error: "siteId es requerido" }, { status: 400 });
    }
    if (!ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json({ error: "Tipo de evento invalido" }, { status: 400 });
    }

    const siteRef = db.collection("cloned_sites").doc(siteId);
    const siteSnap = await siteRef.get();
    if (!siteSnap.exists) {
      return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 });
    }

    const site = siteSnap.data() || {};
    const userId = String(site.userId || "");
    if (!userId) {
      return NextResponse.json(
        { error: "El sitio no tiene owner para asociar metricas." },
        { status: 422 },
      );
    }

    const now = Date.now();
    const dateKey = new Date(now).toISOString().slice(0, 10);

    const visitsInc = type === "page_view" ? 1 : 0;
    const clicksInc = type === "click" ? 1 : 0;
    const conversionsInc = type === "conversion" ? 1 : 0;
    const durationInc = type === "session_end" ? clampDuration(body?.durationMs) : 0;

    const inc = admin.firestore.FieldValue.increment;

    const totalsRef = db.collection("site_metrics_totals").doc(siteId);
    const dailyRef = db.collection("site_metrics_daily").doc(`${siteId}_${dateKey}`);

    const totalsPatch: Record<string, any> = {
      siteId,
      userId,
      siteName: String(site.name || site.url || `Proyecto ${siteId}`),
      type: String(site.type || "Clonador"),
      status: site.published ? "Live" : "Draft",
      updatedAt: now,
      lastEventAt: now,
      lastEventType: type,
    };

    const dailyPatch: Record<string, any> = {
      siteId,
      userId,
      date: dateKey,
      siteName: String(site.name || site.url || `Proyecto ${siteId}`),
      type: String(site.type || "Clonador"),
      status: site.published ? "Live" : "Draft",
      updatedAt: now,
      lastEventAt: now,
      lastEventType: type,
    };

    if (label) {
      totalsPatch.lastLabel = label;
      dailyPatch.lastLabel = label;
    }
    if (visitsInc) {
      totalsPatch.visits = inc(visitsInc);
      totalsPatch.sessions = inc(visitsInc);
      dailyPatch.visits = inc(visitsInc);
      dailyPatch.sessions = inc(visitsInc);
    }
    if (clicksInc) {
      totalsPatch.clicks = inc(clicksInc);
      dailyPatch.clicks = inc(clicksInc);
    }
    if (conversionsInc) {
      totalsPatch.conversions = inc(conversionsInc);
      dailyPatch.conversions = inc(conversionsInc);
    }
    if (durationInc) {
      totalsPatch.totalDurationMs = inc(durationInc);
      dailyPatch.totalDurationMs = inc(durationInc);
    }

    const batch = db.batch();
    batch.set(totalsRef, totalsPatch, { merge: true });
    batch.set(dailyRef, dailyPatch, { merge: true });
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Metrics Event API] Error:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el evento", details: error?.message },
      { status: 500 },
    );
  }
}
