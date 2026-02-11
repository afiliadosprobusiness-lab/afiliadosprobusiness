"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { Globe, ArrowRight, AlertCircle, ExternalLink, Clock, Trash2, Edit3, Rocket, HelpCircle, BookOpen, ShieldCheck, Zap } from "lucide-react";

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(input: string) {
  const value = input.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `https://${value}`;
}

export default function WebClonerPage() {
  const { user, loading: authLoading } = useAuth(true);
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingToEditor, setSavingToEditor] = useState(false);
  const [publishedSites, setPublishedSites] = useState<any[]>([]);
  const [fetchingSites, setFetchingSites] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  const debouncedUrl = useMemo(() => normalizeUrl(url), [url]);

  const fetchPublishedSites = async (uid: string) => {
    setFetchingSites(true);
    setSitesError(null);
    try {
      const q = query(collection(db, "cloned_sites"), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const published = data
        .filter((site: any) => Boolean(site?.published))
        .sort((a: any, b: any) => {
          const timeA = Number(a?.publishedAt || a?.updatedAt || a?.createdAt || 0);
          const timeB = Number(b?.publishedAt || b?.updatedAt || b?.createdAt || 0);
          return timeB - timeA;
        });
      setPublishedSites(published);
    } catch (err: any) {
      console.error("Error fetching sites:", err);
      setPublishedSites([]);
      setSitesError("No se pudieron cargar los proyectos publicados de tu cuenta.");
    } finally {
      setFetchingSites(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setPublishedSites([]);
      setFetchingSites(false);
      return;
    }
    fetchPublishedSites(user.uid);
  }, [authLoading, user?.uid]);

  const handleOpenEditor = async () => {
    if (!html || !isValidUrl(debouncedUrl)) return;

    setSavingToEditor(true);
    try {
      if (authLoading) {
        throw new Error("Espera un momento mientras validamos tu sesion.");
      }
      if (!user?.uid) {
        throw new Error("Debes iniciar sesion para guardar y editar.");
      }

      const siteId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);

      const sitePayload = {
        id: siteId,
        html,
        url: debouncedUrl,
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        published: false,
        status: "draft",
      };

      await setDoc(doc(db, "cloned_sites", siteId), sitePayload);
      window.open(`/editor/${siteId}`, "_blank");
    } catch (e: any) {
      const msg = String(e?.message || "");
      const low = msg.toLowerCase();
      if (low.includes("permission") || low.includes("insufficient")) {
        setError("No tienes permisos para guardar en Firebase. Revisa reglas de Firestore para cloned_sites.");
      } else {
        setError(msg || "No se pudo guardar el proyecto. Verifica tu sesion y permisos.");
      }
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

  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Help Button */}
        <button 
          onClick={() => setShowGuide(true)}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 group"
        >
          <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>

        {/* User Manual Modal */}
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Manual de Usuario: Clonador Web PRO</h2>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    1. Clonación de Sitios
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Ingresa cualquier URL válida en el campo principal. Nuestro motor inteligente extraerá el HTML, CSS y recursos, sanitizando el código para que sea completamente editable.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-cyan-400" />
                    2. Editor Visual Intuitivo
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Haz clic en cualquier elemento (texto, imágenes, fondos) para editarlo. Aparecerá una barra de herramientas flotante para modificar colores, tamaños y estilos en tiempo real.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    3. Guardado Automático
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Tus cambios se guardan automáticamente cada 15 segundos mientras editas. También puedes usar el botón "Guardar" para asegurar tus cambios manualmente.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                    4. Publicación en un Clic
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Una vez satisfecho con los cambios, pulsa "Publicar". El sistema optimizará el código, validará los recursos y generará la versión final de tu landing page.
                  </p>
                </section>
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <p className="text-xs text-cyan-400/80 leading-relaxed">
                    <strong>Nota de Seguridad:</strong> Todos los sitios clonados pasan por un proceso de limpieza para eliminar scripts maliciosos y rastreadores, garantizando que tu nueva página sea rápida y segura.
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-white/10 bg-black/20">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all"
                >
                  Entendido, ¡empezar a clonar!
                </button>
              </div>
            </div>
          </div>
        )}
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
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={() => {
                    if (!url.trim()) return;
                    setUrl(normalizeUrl(url));
                  }}
                />
              </div>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                disabled={!isValidUrl(debouncedUrl) || !html || savingToEditor || authLoading || !user?.uid}
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

          {/* Published Projects Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold">Proyectos Publicados</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-white/5 font-bold">
                {publishedSites.length}
              </span>
            </div>

            {fetchingSites ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-3xl bg-zinc-900/40 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : publishedSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedSites.map((site) => (
                  <div 
                    key={site.id} 
                    className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-5 hover:bg-zinc-800/60 transition-all hover:border-cyan-500/30 overflow-hidden"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open(`/editor/${site.id}`, "_blank")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            title="Editar Proyecto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-zinc-200 line-clamp-1 mb-1">Proyecto #{site.id}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-1">{site.url}</p>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {new Date(site.publishedAt || site.createdAt).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={() => {
                            window.open(`/preview/${site.id}`, "_blank");
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Ver Sitio <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-white/5 border-dashed rounded-3xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-zinc-400 font-bold mb-1">No hay proyectos publicados</h3>
                <p className="text-zinc-600 text-sm">Clona un sitio y dale a "Publicar" para que aparezca aquí.</p>
              </div>
            )}
            {sitesError && (
              <div className="mt-4 flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{sitesError}</span>
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
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                srcDoc={html}
              />
            )}
            {!loading && !html && (
              <div className="p-8 text-center text-zinc-500">Ingresa una URL válida para ver el preview.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
