"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Save, Eye, Code, Smartphone, Monitor, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showSaved, setShowSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/sites/${id}`);
        if (!res.ok) throw new Error("Site not found");
        const text = await res.text();
        setHtml(text);
      } catch (error) {
        console.error("Error loading site:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real editor, we would extract the modified HTML from the iframe
      // For this demo, we'll simulate saving the current HTML
      const res = await fetch(`/api/sites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (res.ok) {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving site:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">Cargando editor multi-tenant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Link href="/cloner/web" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Editor de Sitio <span className="text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">#{id}</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tenant Instance</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded-lg transition-all ${viewMode === "desktop" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded-lg transition-all ${viewMode === "mobile" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {showSaved && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              ¡Guardado!
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Tools (Placeholder for Elite Feel) */}
        <aside className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-6 bg-zinc-900/30">
          <div className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <Code className="w-5 h-5" />
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <Eye className="w-5 h-5" />
          </div>
        </aside>

        {/* Iframe Container */}
        <main className="flex-1 bg-zinc-800/30 p-8 flex justify-center items-start overflow-auto custom-scrollbar">
          <div className={`bg-white shadow-2xl transition-all duration-500 ${viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"} rounded-lg overflow-hidden border-8 border-zinc-900`}>
            {html ? (
              <iframe
                ref={iframeRef}
                title="Editor View"
                className="w-full h-full"
                srcDoc={html}
                sandbox="allow-scripts allow-forms allow-same-origin"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-900">
                No se pudo cargar el contenido
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Instruction */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="bg-cyan-500 text-black px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-3 border-2 border-black/10">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          MODO EDICIÓN MULTI-TENANT ACTIVADO
        </div>
      </div>
    </div>
  );
}
