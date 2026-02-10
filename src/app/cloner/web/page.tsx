"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, ArrowRight, AlertCircle } from "lucide-react";

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function WebClonerPage() {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingToEditor, setSavingToEditor] = useState(false);

  const debouncedUrl = useMemo(() => url, [url]);

  const handleOpenEditor = async () => {
    if (!html || !isValidUrl(url)) return;
    
    setSavingToEditor(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, url }),
      });
      
      if (!res.ok) throw new Error("Failed to initialize editor session");
      
      const { siteId } = await res.json();
      window.open(`/editor/${siteId}`, "_blank");
    } catch (e: any) {
      setError(e.message || "Error al abrir el editor");
    } finally {
      setSavingToEditor(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      setError(null);
      setHtml(null);
      if (!debouncedUrl || !isValidUrl(debouncedUrl)) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/clone?url=${encodeURIComponent(debouncedUrl)}`);
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          const j = ct.includes("application/json") ? await res.json() : null;
          throw new Error(j?.error || `Error ${res.status}`);
        }
        const text = await res.text();
        setHtml(text);
      } catch (e: any) {
        setError(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [debouncedUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,255,0.03),transparent_70%)]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[90px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("hub.webcloner.title")}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">{t("hub.webcloner.desc")}</p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-4 md:p-6 mb-8">
            <label htmlFor="clone-url" className="block text-sm font-semibold text-zinc-400 mb-3">
              URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3 flex-1">
                <div className="flex items-center px-3 rounded-xl bg-white/5 border border-white/10">
                  <Globe className="w-5 h-5 text-cyan-400" />
                </div>
                <input
                  id="clone-url"
                  type="url"
                  placeholder="https://ejemplo.com"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 outline-none text-sm md:text-base"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.trim())}
                />
              </div>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                disabled={!isValidUrl(url) || !html || savingToEditor}
                onClick={handleOpenEditor}
                aria-label="Abrir editor"
              >
                {savingToEditor ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Preview & Edit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10 bg-black">
            {loading && (
              <div className="p-8 text-center text-zinc-400">Cargando preview...</div>
            )}
            {!loading && html && (
              <iframe
                title="preview"
                className="w-full h-[70vh] bg-white"
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                srcDoc={html}
              />
            )}
            {!loading && !html && (
              <div className="p-8 text-center text-zinc-500">Ingresa una URL válida para ver el preview.</div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

