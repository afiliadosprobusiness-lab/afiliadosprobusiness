"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Eye, Code, Smartphone, Monitor, ArrowLeft, CheckCircle, Globe, Rocket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function EditorPage() {
  const { user: session, loading: authLoading } = useAuth(true);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [html, setHtml] = useState<string | null>(null);

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.builder"), href: "/builder" },
    { name: t("nav.templates"), href: "/cloner" },
    { name: t("nav.cloner"), href: "/cloner/web" },
    { name: t("nav.hub"), href: "/hub" },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isVisualEditActive, setIsVisualEditActive] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inyectar script de edición en el iframe
  const injectEditorScript = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    
    // 1. Deshabilitar todos los enlaces para evitar navegación y permitir edición
    const interactiveElements = doc.querySelectorAll("a, button, input[type='submit'], input[type='button']");
    interactiveElements.forEach(el => {
      if (el.tagName === "A") {
        el.addEventListener("click", (e) => e.preventDefault());
        (el as HTMLElement).style.cursor = "default";
      }
      (el as HTMLElement).contentEditable = isVisualEditActive ? "true" : "false";
    });

    // 2. Manejo de imágenes
    const images = doc.querySelectorAll("img");
    images.forEach(img => {
      if (isVisualEditActive) {
        img.style.cursor = "pointer";
        img.title = "Haz clic para cambiar la imagen";
        
        // Evitar que el clic se propague si hay enlaces
        img.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const newUrl = prompt("Introduce la URL de la nueva imagen:", img.src);
          if (newUrl && newUrl !== img.src) {
            img.src = newUrl;
            // Forzar actualización visual si es necesario
            img.classList.add("img-updated");
          }
        });
      } else {
        img.style.cursor = "";
        img.title = "";
      }
    });

    // 3. Hacer el body editable o elementos específicos
    if (isVisualEditActive) {
      doc.body.contentEditable = "true";
      doc.body.style.outline = "none";
      doc.body.style.minHeight = "100vh";
      
      // Permitir que los elementos hijos hereden la edición pero tengan mejor UX
      doc.querySelectorAll('div, section, main, header, footer, p, h1, h2, h3, h4, h5, h6, span').forEach(el => {
        (el as HTMLElement).contentEditable = "true";
      });
      
      // Añadir estilos para resaltar elementos al pasar el mouse
      const style = doc.createElement("style");
      style.id = "editor-styles";
      style.innerHTML = `
        [contenteditable="true"]:hover {
          outline: 2px dashed #06b6d4 !important;
          outline-offset: 2px;
        }
        img:hover {
          outline: 3px solid #06b6d4 !important;
          filter: brightness(0.8);
        }
        * {
          user-select: auto !important;
        }
      `;
      doc.head.appendChild(style);
    } else {
      doc.body.contentEditable = "false";
      const style = doc.getElementById("editor-styles");
      if (style) style.remove();
    }
  };

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

  // Reinyectar cuando el iframe cargue o cambie el modo
  useEffect(() => {
    if (!loading && html) {
      const timer = setTimeout(injectEditorScript, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, html, isVisualEditActive]);

  const handleSave = async () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    setSaving(true);
    try {
      // 1. Limpiar el HTML antes de guardar (quitar contentEditable y estilos de edición)
      const doc = iframe.contentDocument.cloneNode(true) as Document;
      doc.body.contentEditable = "false";
      const style = doc.getElementById("editor-styles");
      if (style) style.remove();
      
      const updatedHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

      const res = await fetch(`/api/sites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: updatedHtml }),
      });

      if (res.ok) {
        setHtml(updatedHtml);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving site:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // First save current changes
      await handleSave();
      
      const res = await fetch(`/api/sites/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        setShowPublished(true);
        // Redireccionar al clonador web después de publicar
        setTimeout(() => {
          router.push("/cloner/web");
        }, 1500);
      }
    } catch (error) {
      console.error("Error publishing site:", error);
    } finally {
      setPublishing(false);
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
      <header className="h-20 md:h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-zinc-900/50 backdrop-blur-md z-20">
        {/* Lado Izquierdo: Controles del Editor */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2">
          <Link href="/cloner/web" className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="h-6 w-px bg-white/10 mx-1 md:mx-2 flex-shrink-0 hidden sm:block" />
          
          <div className="flex items-center gap-1 md:gap-2 bg-zinc-800/50 p-1 rounded-xl border border-white/5 flex-shrink-0">
            <button 
              onClick={() => setIsVisualEditActive(true)}
              className={`p-1.5 md:p-2 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 ${isVisualEditActive ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
              title="Edición Visual"
            >
              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase">Visual</span>
            </button>
            <button 
              onClick={() => setIsVisualEditActive(false)}
              className={`p-1.5 md:p-2 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 ${!isVisualEditActive ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
              title="Vista Previa"
            >
              <Code className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase">Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2 bg-zinc-800/50 p-1 rounded-xl border border-white/5 flex-shrink-0">
            <button 
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === "desktop" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
            >
              <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button 
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === "mobile" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Centro: Navegación Global (Solo en PC) */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Lado Derecho: Usuario y Acciones */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-2">
          {session && (
            <div className="hidden 2xl:flex items-center gap-3 mr-4 border-r border-white/10 pr-4">
              <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{session.email}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem("fastPageUser");
                  localStorage.removeItem("fp_session");
                  window.location.href = "/auth";
                }}
                className="text-[10px] font-bold uppercase text-zinc-500 hover:text-red-400 transition-colors"
              >
                {t("nav.logout")}
              </button>
            </div>
          )}

          {(showSaved || showPublished) && (
            <div className={`hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-bold animate-fade-in ${showPublished ? "text-cyan-400" : "text-emerald-400"}`}>
              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline">{showPublished ? "¡Publicado!" : "¡Guardado!"}</span>
            </div>
          )}
          
          <button 
            onClick={handleSave}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 md:gap-2 bg-zinc-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50 border border-white/10"
          >
            {saving ? <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            <span className="hidden xs:inline">Guardar</span>
          </button>
          
          <button 
            onClick={handlePublish}
            disabled={saving || publishing}
            className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {publishing ? <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            <span>Publicar</span>
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
