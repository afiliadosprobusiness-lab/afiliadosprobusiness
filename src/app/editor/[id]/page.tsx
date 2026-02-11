"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Eye, Code, Smartphone, Monitor, ArrowLeft, CheckCircle, Globe, Rocket, Trash2, Zap, ShieldCheck, Gauge } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc as firestoreDoc, getDoc, setDoc } from "firebase/firestore";

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
    { name: t("nav.templates"), href: "/templates" },
    { name: t("nav.cloner"), href: "/cloner/web" },
    { name: t("nav.hub"), href: "/hub" },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isVisualEditActive, setIsVisualEditActive] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; issues: string[]; url?: string } | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inyectar script de edición en el iframe
  const injectEditorScript = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    
    // 1. Estilos de edición (inyectar solo una vez)
    if (!doc.getElementById("editor-styles")) {
      const style = doc.createElement("style");
      style.id = "editor-styles";
      style.innerHTML = `
        [contenteditable="true"] {
          outline: none;
          transition: all 0.2s ease;
        }
        [contenteditable="true"]:hover {
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.4);
          cursor: text;
        }
        [contenteditable="true"]:focus {
          box-shadow: 0 0 0 2px #06b6d4;
        }
        .selected-element {
          box-shadow: 0 0 0 2px #06b6d4 !important;
          position: relative;
        }
        img:hover {
          outline: 2px solid #06b6d4;
          cursor: pointer;
        }
        /* Desactivar puntero en modo edición para que no parezca clickeable */
        body:not(.preview-mode) a, body:not(.preview-mode) button {
          cursor: default !important;
        }
      `;
      doc.head.appendChild(style);
    }

    // Actualizar clase del body según el modo
    if (isPreviewMode) {
      doc.body.classList.add("preview-mode");
    } else {
      doc.body.classList.remove("preview-mode");
    }

    // 2. Manejo de clics en enlaces y botones (Re-adjuntar según modo)
    doc.querySelectorAll("a, button").forEach(el => {
      // Clonar para limpiar listeners previos
      const newEl = el.cloneNode(true);
      el.parentNode?.replaceChild(newEl, el);
      
      newEl.addEventListener("click", (e) => {
        if (!isPreviewMode) {
          e.preventDefault();
          e.stopPropagation();
          // Al hacer clic en un elemento, lo seleccionamos para edición
          selectElement(newEl as HTMLElement);
        }
      });
    });

    // 3. Hacer elementos editables con mejor UX
    const makeEditable = (el: HTMLElement) => {
      el.contentEditable = (!isPreviewMode && isVisualEditActive) ? "true" : "false";
      
      // Limpiar listeners previos si existen
      const newEl = el.cloneNode(true);
      if (el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
        
        const targetEl = newEl as HTMLElement;
        targetEl.addEventListener("focus", () => {
          if (!isPreviewMode && isVisualEditActive) selectElement(targetEl);
        });
        targetEl.addEventListener("input", () => {
          if (!isPreviewMode && isVisualEditActive) markAsDirty();
        });
      }
    };

    doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, div, section, li, td, th").forEach(el => {
      // Solo hacer editable si tiene contenido de texto directo o es un contenedor simple
      if (el.children.length === 0 || Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent?.trim())) {
        if (el.tagName !== 'A' && el.tagName !== 'BUTTON') { // Evitar doble manejo
          makeEditable(el as HTMLElement);
        }
      }
    });

    // 4. Manejo de imágenes
    doc.querySelectorAll("img").forEach(img => {
      const newImg = img.cloneNode(true) as HTMLImageElement;
      img.parentNode?.replaceChild(newImg, img);

      newImg.addEventListener("click", (e) => {
        if (!isPreviewMode && isVisualEditActive) {
          e.preventDefault();
          e.stopPropagation();
          selectElement(newImg);
          const newUrl = prompt("URL de la imagen:", newImg.src);
          if (newUrl) {
            newImg.src = newUrl;
            markAsDirty();
          }
        }
      });
    });

    doc.body.contentEditable = (!isPreviewMode && isVisualEditActive) ? "true" : "false";
  };

  const [isDirty, setIsDirty] = useState(false);
  const markAsDirty = () => setIsDirty(true);

  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);

  const selectElement = (el: HTMLElement) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    
    iframe.contentDocument.querySelectorAll(".selected-element").forEach(e => e.classList.remove("selected-element"));
    el.classList.add("selected-element");
    setSelectedEl(el);
  };

  const updateSelectedStyle = (property: string, value: string) => {
    if (selectedEl) {
      selectedEl.style.setProperty(property, value);
      markAsDirty();
    }
  };

  const updatePageBackgroundColor = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const color = prompt("Color de fondo de la pagina (ej: #111111, white):", iframe.contentDocument.body.style.backgroundColor || "");
    if (!color) return;
    iframe.contentDocument.body.style.backgroundColor = color;
    markAsDirty();
  };

  const updatePageBackgroundImage = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const current = iframe.contentDocument.body.style.backgroundImage?.replace(/^url\(["']?/, "").replace(/["']?\)$/, "") || "";
    const imageUrl = prompt("URL de imagen de fondo para la pagina:", current);
    if (!imageUrl) return;
    iframe.contentDocument.body.style.backgroundImage = `url("${imageUrl}")`;
    iframe.contentDocument.body.style.backgroundSize = "cover";
    iframe.contentDocument.body.style.backgroundPosition = "center";
    iframe.contentDocument.body.style.backgroundRepeat = "no-repeat";
    markAsDirty();
  };

  // Auto-save logic
  useEffect(() => {
    if (!isDirty) return;
    
    const timer = setTimeout(() => {
      handleSave();
      setIsDirty(false);
    }, 15000); // Auto-save every 15 seconds if dirty

    return () => clearTimeout(timer);
  }, [isDirty]);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.uid) {
      setError("Debes iniciar sesion para cargar este proyecto.");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        const snap = await getDoc(firestoreDoc(db, "cloned_sites", id));
        if (!snap.exists()) {
          throw new Error("Proyecto no encontrado.");
        }
        const data = snap.data() as { html?: string; userId?: string };
        if (data.userId && data.userId !== session.uid) {
          throw new Error("No tienes permisos para abrir este proyecto.");
        }
        if (!data.html) {
          throw new Error("Proyecto sin contenido.");
        }
        setHtml(data.html);
      } catch (error: any) {
        console.error("Error loading site:", error);
        setError(error?.message || "No se pudo cargar el proyecto desde Firebase.");
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id, authLoading, session?.uid]);

  // Reinyectar cuando el iframe cargue o cambie el modo
  useEffect(() => {
    if (!loading && html) {
      const timer = setTimeout(injectEditorScript, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, html, isVisualEditActive, isPreviewMode]);

  const handleSave = async () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return null;

    setSaving(true);
    setError(null);
    try {
      if (authLoading) {
        throw new Error("Espera un momento mientras validamos tu sesion.");
      }
      // 1. Limpiar el HTML antes de guardar
      const doc = iframe.contentDocument.cloneNode(true) as Document;
      
      // Asegurarse de que el modo edición esté desactivado en la copia
      doc.body.contentEditable = "false";
      
      // Eliminar elementos y clases de edición
      const style = doc.getElementById("editor-styles");
      if (style) style.remove();
      
      doc.querySelectorAll(".selected-element").forEach(e => e.classList.remove("selected-element"));
      
      // Asegurar que los scripts de edición no se guarden
      // Persistir como HTML estatico para evitar que scripts del sitio original
      // restauren el contenido original despues de editar.
      doc.querySelectorAll("script").forEach((scriptEl) => scriptEl.remove());
      doc.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          if (attr.name.toLowerCase().startsWith("on")) {
            el.removeAttribute(attr.name);
          }
        });
      });

      const updatedHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      if (!session?.uid) {
        throw new Error("Debes iniciar sesion para guardar.");
      }

      const savePayload: Record<string, any> = {
        id,
        html: updatedHtml,
        userId: session.uid,
        updatedAt: Date.now()
      };
      await setDoc(firestoreDoc(db, "cloned_sites", id), savePayload, { merge: true });

      setHtml(updatedHtml);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      setIsDirty(false);
      return updatedHtml;
    } catch (error: any) {
      console.error("Error saving site:", error);
      setError("Error al guardar: " + error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      if (authLoading) {
        throw new Error("Espera un momento mientras validamos tu sesion.");
      }
      // 1. Primero guardamos los cambios actuales y obtenemos el HTML limpio
      const cleanHtml = await handleSave();
      
      if (!cleanHtml) {
        // El error ya lo maneja handleSave via setError
        return;
      }

      // 2. Publicar directamente en Firestore usando la sesión del usuario
      if (!session?.uid) {
        throw new Error("Debes iniciar sesion para publicar.");
      }

      const publishPayload: Record<string, any> = {
        id,
        html: cleanHtml,
        userId: session.uid,
        published: true,
        status: "published",
        publishedAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(firestoreDoc(db, "cloned_sites", id), publishPayload, { merge: true });

      setPublishResult({
        success: true,
        issues: [],
        url: `/preview/${id}`
      });
      setShowPublished(true);
    } catch (error: any) {
      console.error("Error publishing site:", error);
      setError("Error al publicar: " + error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top Bar Editor */}
      <header className="h-16 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-zinc-300 max-w-[200px] truncate">
              Editor: {id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isPreviewMode ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-400 hover:text-white"}`}
          >
            Editar
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPreviewMode ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-400 hover:text-white"}`}
          >
            Vista Previa
          </button>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded-lg transition-all ${viewMode === "desktop" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-400 hover:text-white"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded-lg transition-all ${viewMode === "mobile" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-zinc-400 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={updatePageBackgroundColor}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 hover:bg-white/10 transition-all"
            title="Fondo de pagina"
          >
            Fondo
          </button>
          <button
            onClick={updatePageBackgroundImage}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 hover:bg-white/10 transition-all"
            title="Imagen de fondo de pagina"
          >
            Fondo Img
          </button>
          <div className="flex items-center gap-2 mr-4">
            {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            <span className="text-xs text-zinc-500 font-medium">
              {isDirty ? "Cambios sin guardar" : "Guardado"}
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar</span>
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-6 py-2 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            <span>Publicar</span>
          </button>
        </div>
      </header>

      <div className="flex-grow flex relative overflow-hidden bg-zinc-900">
        {/* Floating Toolbar for Element Editing */}
        {selectedEl && isVisualEditActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-40 flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-top-4 duration-200">
            <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase border-r border-white/10 mr-1">
              {selectedEl.tagName}
            </div>
            
            <input 
              type="color" 
              className="w-8 h-8 rounded-lg bg-transparent cursor-pointer overflow-hidden"
              onChange={(e) => updateSelectedStyle("color", e.target.value)}
              title="Color de texto"
            />
            
            <div className="h-6 w-px bg-white/10 mx-1" />
            
            <button 
              onClick={() => {
                const size = prompt("Tamaño de fuente (ej: 20px, 2rem):", selectedEl.style.fontSize);
                if (size) updateSelectedStyle("font-size", size);
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all text-xs font-bold"
            >
              Size
            </button>

            <button 
              onClick={() => {
                const currentWeight = selectedEl.style.fontWeight;
                updateSelectedStyle("font-weight", currentWeight === "bold" ? "normal" : "bold");
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all font-bold"
            >
              B
            </button>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <button 
              onClick={() => {
                const bg = prompt("Color de fondo (ej: #ff0000, transparent):");
                if (bg) updateSelectedStyle("background-color", bg);
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all text-xs"
            >
              BG
            </button>

            <button 
              onClick={() => setSelectedEl(null)}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-zinc-900/50">
          <div 
            className={`bg-white shadow-2xl transition-all duration-500 ease-in-out relative ${
              viewMode === "mobile" ? "w-[375px] h-[667px] rounded-[40px] border-[12px] border-zinc-800" : "w-full h-full rounded-lg"
            }`}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400 font-medium">Cargando sitio para edición...</p>
                </div>
              </div>
            ) : html ? (
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="w-full h-full border-none rounded-[inherit]"
                title="Editor Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-400">Error al cargar el contenido.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-8 z-[100]">
          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:bg-white/10 rounded-lg p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {showSaved && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-8 z-[100]">
          <CheckCircle className="w-5 h-5" />
          <span>Cambios guardados con éxito</span>
        </div>
      )}

      {showPublished && publishResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md z-[200] animate-in fade-in duration-300 p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            
            <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <Rocket className="w-10 h-10 text-cyan-400" />
            </div>
            
            <h3 className="text-3xl font-bold text-center mb-2">¡Lanzamiento Exitoso!</h3>
            <p className="text-zinc-400 text-center mb-8">Tu landing page ha sido optimizada y publicada.</p>
            
            {publishResult.issues.length > 0 && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Sugerencias de Optimización:
                </div>
                <ul className="space-y-1">
                  {publishResult.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-amber-400/80 flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <a 
                href={publishResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Eye className="w-5 h-5" />
                Ver Sitio en Vivo
              </a>
              
              <button 
                onClick={() => router.push("/cloner/web")}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                Volver al Panel
              </button>
              
              <button 
                onClick={() => setShowPublished(false)}
                className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-all"
              >
                Seguir Editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
