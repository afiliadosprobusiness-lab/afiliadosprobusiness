import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

type DailyMetric = {
  siteId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  visits?: number;
  clicks?: number;
  conversions?: number;
  totalDurationMs?: number;
  sessions?: number;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(base: Date, days: number) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function formatPct(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe >= 0 ? "+" : ""}${safe.toFixed(1)}%`;
}

function formatSecDelta(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe >= 0 ? "+" : ""}${safe.toFixed(1)}s`;
}

function calcTrend(current: number, previous: number) {
  if (previous > 0) {
    return ((current - previous) / previous) * 100;
  }
  if (current > 0) return 100;
  return 0;
}

function getWeekdayLabel(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  const labels = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  return labels[d.getUTCDay()] || "Dia";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = (searchParams.get("userId") || "").trim();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const last7Keys = Array.from({ length: 7 }, (_, i) => toDateKey(shiftDate(now, -6 + i)));
    const prev7Keys = Array.from({ length: 7 }, (_, i) => toDateKey(shiftDate(now, -13 + i)));
    const last7Set = new Set(last7Keys);
    const prev7Set = new Set(prev7Keys);
    const last14Set = new Set([...last7Keys, ...prev7Keys]);

    // If Admin SDK is missing, return deterministic empty real-data response (no random fallback).
    if (!adminDb) {
      return NextResponse.json({
        timestamp: Date.now(),
        summary: {
          totalSites: 0,
          totalVisits: "0",
          avgConversion: "0.0%",
          avgLoadTime: "0.0s",
          totalClicks: "0",
          trends: {
            visits: { label: "+0.0%", positive: true },
            conversion: { label: "+0.0%", positive: true },
            loadTime: { label: "+0.0s", positive: true },
            clicks: { label: "+0.0%", positive: true },
          },
        },
        details: [],
        chartData: last7Keys.map((key) => ({
          name: getWeekdayLabel(key),
          visitas: 0,
          conversiones: 0,
        })),
      });
    }
    const db = adminDb;

    const sitesSnapshot = await db
      .collection("cloned_sites")
      .where("userId", "==", userId)
      .get();

    const sites = sitesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    const siteIds = sites.map((site) => String(site.id));
    const siteIdSet = new Set(siteIds);

    const totalDocs = await Promise.all(
      siteIds.map((siteId) => db.collection("site_metrics_totals").doc(siteId).get()),
    );
    const totalsBySite = new Map<string, any>();
    totalDocs.forEach((doc) => {
      if (doc.exists) {
        totalsBySite.set(doc.id, doc.data() || {});
      }
    });

    const dailySnapshot = await db
      .collection("site_metrics_daily")
      .where("userId", "==", userId)
      .get();

    const dailyMetrics: DailyMetric[] = dailySnapshot.docs
      .map((doc) => doc.data() as DailyMetric)
      .filter((row) => siteIdSet.has(String(row.siteId || "")) && last14Set.has(String(row.date || "")));

    const aggregateByDate = new Map<string, { visits: number; conversions: number; clicks: number; durationMs: number; sessions: number }>();
    [...last7Keys, ...prev7Keys].forEach((k) => {
      aggregateByDate.set(k, { visits: 0, conversions: 0, clicks: 0, durationMs: 0, sessions: 0 });
    });

    const siteCurrentById = new Map<string, { visits: number; clicks: number; conversions: number; durationMs: number; sessions: number }>();
    const sitePreviousById = new Map<string, { visits: number; clicks: number; conversions: number; durationMs: number; sessions: number }>();

    for (const row of dailyMetrics) {
      const date = String(row.date || "");
      const siteId = String(row.siteId || "");
      const visits = Number(row.visits || 0);
      const clicks = Number(row.clicks || 0);
      const conversions = Number(row.conversions || 0);
      const durationMs = Number(row.totalDurationMs || 0);
      const sessions = Number(row.sessions || 0);

      const byDate = aggregateByDate.get(date);
      if (byDate) {
        byDate.visits += visits;
        byDate.clicks += clicks;
        byDate.conversions += conversions;
        byDate.durationMs += durationMs;
        byDate.sessions += sessions;
      }

      if (last7Set.has(date)) {
        const current = siteCurrentById.get(siteId) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
        current.visits += visits;
        current.clicks += clicks;
        current.conversions += conversions;
        current.durationMs += durationMs;
        current.sessions += sessions;
        siteCurrentById.set(siteId, current);
      } else if (prev7Set.has(date)) {
        const previous = sitePreviousById.get(siteId) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
        previous.visits += visits;
        previous.clicks += clicks;
        previous.conversions += conversions;
        previous.durationMs += durationMs;
        previous.sessions += sessions;
        sitePreviousById.set(siteId, previous);
      }
    }

    const details = sites.map((site: any) => {
      const totals = totalsBySite.get(site.id) || {};
      const visits = Number(totals.visits || 0);
      const clicks = Number(totals.clicks || 0);
      const conversions = Number(totals.conversions || 0);
      const sessions = Number(totals.sessions || 0);
      const totalDurationMs = Number(totals.totalDurationMs || 0);

      const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;
      const bounceRate = visits > 0 ? Math.max(0, 100 - (clicks / visits) * 100) : 0;
      const avgLoadTimeSec = sessions > 0 ? totalDurationMs / sessions / 1000 : 0;

      const curr = siteCurrentById.get(site.id) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
      const prev = sitePreviousById.get(site.id) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
      const trend = calcTrend(curr.visits, prev.visits);

      return {
        id: site.id,
        name: String(site.name || site.url || `Proyecto ${site.id}`),
        type: String(site.type || "Clonador"),
        visits,
        conversion: `${conversionRate.toFixed(1)}%`,
        bounceRate: `${bounceRate.toFixed(1)}%`,
        loadTime: `${avgLoadTimeSec.toFixed(1)}s`,
        status: site.published ? "Live" : "Draft",
        trend: formatPct(trend),
      };
    });

    details.sort((a, b) => b.visits - a.visits);

    const totalVisits = details.reduce((acc, curr) => acc + curr.visits, 0);

    const totalsReal = Array.from(totalsBySite.values()).reduce(
      (acc, curr) => {
        acc.visits += Number(curr.visits || 0);
        acc.clicks += Number(curr.clicks || 0);
        acc.conversions += Number(curr.conversions || 0);
        acc.totalDurationMs += Number(curr.totalDurationMs || 0);
        acc.sessions += Number(curr.sessions || 0);
        return acc;
      },
      { visits: 0, clicks: 0, conversions: 0, totalDurationMs: 0, sessions: 0 },
    );

    const avgConversionRate = totalVisits > 0 ? (totalsReal.conversions / totalVisits) * 100 : 0;
    const avgLoadTimeSec = totalsReal.sessions > 0 ? totalsReal.totalDurationMs / totalsReal.sessions / 1000 : 0;

    const currentWindow = { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
    const previousWindow = { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };

    for (const key of last7Keys) {
      const m = aggregateByDate.get(key) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
      currentWindow.visits += m.visits;
      currentWindow.clicks += m.clicks;
      currentWindow.conversions += m.conversions;
      currentWindow.durationMs += m.durationMs;
      currentWindow.sessions += m.sessions;
    }
    for (const key of prev7Keys) {
      const m = aggregateByDate.get(key) || { visits: 0, clicks: 0, conversions: 0, durationMs: 0, sessions: 0 };
      previousWindow.visits += m.visits;
      previousWindow.clicks += m.clicks;
      previousWindow.conversions += m.conversions;
      previousWindow.durationMs += m.durationMs;
      previousWindow.sessions += m.sessions;
    }

    const currentConvRate = currentWindow.visits > 0 ? (currentWindow.conversions / currentWindow.visits) * 100 : 0;
    const previousConvRate = previousWindow.visits > 0 ? (previousWindow.conversions / previousWindow.visits) * 100 : 0;
    const currentAvgLoadSec = currentWindow.sessions > 0 ? currentWindow.durationMs / currentWindow.sessions / 1000 : 0;
    const previousAvgLoadSec = previousWindow.sessions > 0 ? previousWindow.durationMs / previousWindow.sessions / 1000 : 0;

    const visitsTrend = calcTrend(currentWindow.visits, previousWindow.visits);
    const conversionTrend = calcTrend(currentConvRate, previousConvRate);
    const clicksTrend = calcTrend(currentWindow.clicks, previousWindow.clicks);
    const loadDeltaSec = currentAvgLoadSec - previousAvgLoadSec;

    const chartData = last7Keys.map((key) => {
      const m = aggregateByDate.get(key) || { visits: 0, conversions: 0, clicks: 0, durationMs: 0, sessions: 0 };
      return {
        name: getWeekdayLabel(key),
        visitas: m.visits,
        conversiones: m.conversions,
      };
    });

    return NextResponse.json({
      timestamp: Date.now(),
      summary: {
        totalSites: sites.length,
        totalVisits: totalVisits.toLocaleString(),
        avgConversion: `${avgConversionRate.toFixed(1)}%`,
        avgLoadTime: `${avgLoadTimeSec.toFixed(1)}s`,
        totalClicks: totalsReal.clicks.toLocaleString(),
        trends: {
          visits: { label: formatPct(visitsTrend), positive: visitsTrend >= 0 },
          conversion: { label: formatPct(conversionTrend), positive: conversionTrend >= 0 },
          loadTime: { label: formatSecDelta(loadDeltaSec), positive: loadDeltaSec <= 0 },
          clicks: { label: formatPct(clicksTrend), positive: clicksTrend >= 0 },
        },
      },
      details,
      chartData,
    });
  } catch (error: any) {
    console.error("[Metrics API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error?.message },
      { status: 500 },
    );
  }
}
