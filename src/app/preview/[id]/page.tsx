"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SiteDoc = {
  html?: string;
  url?: string;
  userId?: string;
  published?: boolean;
};

export default function PreviewPage() {
  const { user, loading: authLoading } = useAuth(true);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [html, setHtml] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const sessionEndedRef = useRef(false);

  const sendMetricEvent = async (type: string, extra: Record<string, unknown> = {}) => {
    try {
      await fetch("/api/metrics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: id, type, ...extra }),
        keepalive: true,
      });
    } catch {
      // Silent fail: analytics should never block user flow.
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setError("Debes iniciar sesion para ver este proyecto.");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        const snap = await getDoc(doc(db, "cloned_sites", id));
        if (!snap.exists()) {
          throw new Error("Proyecto no encontrado.");
        }

        const data = snap.data() as SiteDoc;
        if (data.userId && data.userId !== user.uid) {
          throw new Error("No tienes permisos para ver este proyecto.");
        }
        if (!data.html) {
          throw new Error("Proyecto sin contenido.");
        }

        setHtml(data.html);
        setSourceUrl(data.url || "");
      } catch (err: any) {
        setError(err?.message || "No se pudo cargar la vista previa.");
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [authLoading, user?.uid, id]);

  useEffect(() => {
    if (loading || error || !html || !id) return;

    sessionStartedAtRef.current = Date.now();
    sessionEndedRef.current = false;
    void sendMetricEvent("page_view", { source: "preview_wrapper" });

    const flushSession = () => {
      if (sessionEndedRef.current) return;
      sessionEndedRef.current = true;
      const startedAt = sessionStartedAtRef.current || Date.now();
      const durationMs = Math.max(0, Date.now() - startedAt);
      void sendMetricEvent("session_end", { durationMs, source: "preview_wrapper" });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushSession();
      }
    };

    window.addEventListener("beforeunload", flushSession);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", flushSession);
      flushSession();
    };
  }, [loading, error, html, id]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="h-16 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm md:text-base font-semibold">Vista previa publicada</span>
        </div>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
          >
            Sitio original
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : null}
      </header>

      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="w-full h-full min-h-[60vh] rounded-2xl border border-white/10 bg-zinc-900 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="w-full h-full min-h-[60vh] rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-center justify-center px-6 text-center">
            {error}
          </div>
        ) : (
          <iframe
            title={`preview-${id}`}
            className="w-full min-h-[75vh] rounded-2xl border border-white/10 bg-white"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
            srcDoc={html || ""}
          />
        )}
      </main>
    </div>
  );
}
