"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  Trash2, 
  Download, 
  Trash, 
  ChevronUp, 
  ChevronDown, 
  Monitor, 
  Smartphone, 
  Eye, 
  Settings as SettingsIcon,
  Layout,
  Type,
  Image as ImageIcon,
  MousePointer2,
  Zap,
  Star,
  Check,
  Play,
  ArrowRight,
  Copy
} from "lucide-react";

type BlockType = "hero" | "features" | "cta" | "pricing" | "testimonials" | "faq" | "footer";

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

const DEFAULT_BLOCKS: Record<BlockType, any> = {
  hero: {
    title: "Impulsa tu Negocio con una Landing Page de Alto Impacto 🚀",
    subtitle: "Crea páginas profesionales en minutos, sin código y optimizadas para convertir visitantes en clientes leales.",
    primaryBtn: "Empieza Ahora Gratis",
    secondaryBtn: "Ver Demo",
    badge: "NUEVA FUNCIÓN: IA GENERATIVA",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
  },
  features: {
    title: "Todo lo que necesitas para vender más 💎",
    items: [
      { icon: "⚡", title: "Velocidad Extrema", desc: "Optimizado para cargar en menos de 1 segundo." },
      { icon: "🎨", title: "Diseño Profesional", desc: "Plantillas creadas por expertos en marketing." },
      { icon: "📱", title: "100% Responsivo", desc: "Tu página se verá perfecta en cualquier dispositivo." }
    ]
  },
  cta: {
    title: "¿Listo para llevar tu marca al siguiente nivel? 🔥",
    desc: "Únete a más de 10,000 emprendedores que ya están escalando sus ventas con Fast Page.",
    btn: "Crear Mi Landing Ahora"
  },
  pricing: {
    title: "Planes que crecen contigo 📈",
    plans: [
      { name: "Emprendedor", price: "0", features: ["1 Proyecto", "Dominio FastPage", "Soporte Comunidad"] },
      { name: "Profesional", price: "29", features: ["10 Proyectos", "Dominio Propio", "Sin Marca de Agua", "Soporte 24/7"], popular: true },
      { name: "Agencia", price: "99", features: ["Proyectos Ilimitados", "Acceso API", "Multi-usuario", "White Label"] }
    ]
  },
  testimonials: {
    title: "Lo que dicen nuestros clientes ⭐",
    items: [
      { name: "Ana García", role: "CEO de TechFlow", text: "Fast Page cambió la forma en que lanzamos productos. Es increíblemente rápido.", avatar: "https://i.pravatar.cc/150?u=ana" },
      { name: "Carlos Ruiz", role: "Marketer Independiente", text: "La mejor inversión para mis campañas de Ads. Las conversiones subieron un 40%.", avatar: "https://i.pravatar.cc/150?u=carlos" }
    ]
  },
  faq: {
    title: "Preguntas Frecuentes ❓",
    items: [
      { q: "¿Necesito conocimientos técnicos?", a: "Absolutamente no. Fast Page está diseñado para ser usado por cualquier persona." },
      { q: "¿Puedo usar mi propio dominio?", a: "Sí, en los planes Profesional y Agencia puedes conectar tus propios dominios." }
    ]
  },
  footer: {
    text: "© 2026 Fast Page. Todos los derechos reservados. Hecho con ❤️ para marketers."
  }
};

export default function BuilderPage() {
  const { user, loading } = useAuth(true);
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"add" | "styles">("add");
  const [showExportModal, setShowExportModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#fbbf24");
  const [secondaryColor, setSecondaryColor] = useState("#d97706");

  const themes = [
    { name: "Gold", primary: "#fbbf24", secondary: "#d97706" },
    { name: "Cyan", primary: "#06b6d4", secondary: "#0891b2" },
    { name: "Purple", primary: "#8b5cf6", secondary: "#7c3aed" },
    { name: "Pink", primary: "#ec4899", secondary: "#db2777" },
    { name: "Emerald", primary: "#10b981", secondary: "#059669" },
    { name: "Orange", primary: "#f97316", secondary: "#ea580c" },
    { name: "Blue", primary: "#3b82f6", secondary: "#2563eb" },
    { name: "Red", primary: "#ef4444", secondary: "#dc2626" },
  ];

  useEffect(() => {
    setIsClient(true);
    const savedColor = localStorage.getItem("fastpage_builder_primary_color");
    if (savedColor) setPrimaryColor(savedColor);
    const savedSecondary = localStorage.getItem("fastpage_builder_secondary_color");
    if (savedSecondary) setSecondaryColor(savedSecondary);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("fastpage_builder_primary_color", primaryColor);
      localStorage.setItem("fastpage_builder_secondary_color", secondaryColor);
    }
  }, [primaryColor, secondaryColor, isClient]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      "251, 191, 36";
  };

  const updateTheme = (primary: string, secondary?: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary || primary);
  };

  // Load from local storage
  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem("fastpage_builder_draft");
    if (saved) {
      try {
        setBlocks(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }
  }, [isClient]);

  // Save to local storage
  useEffect(() => {
    if (isClient && blocks.length > 0) {
      localStorage.setItem("fastpage_builder_draft", JSON.stringify(blocks));
    }
  }, [blocks, isClient]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: { ...DEFAULT_BLOCKS[type] }
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const duplicateBlock = (index: number) => {
    const newBlocks = [...blocks];
    const blockToDuplicate = { ...newBlocks[index], id: Math.random().toString(36).substr(2, 9) };
    newBlocks.splice(index + 1, 0, blockToDuplicate);
    setBlocks(newBlocks);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const clearBuilder = () => {
    if (confirm("¿Estás seguro de que quieres limpiar todo el constructor?")) {
      setBlocks([]);
      localStorage.removeItem("fastpage_builder_draft");
      localStorage.removeItem("fastpage_builder_primary_color");
      localStorage.removeItem("fastpage_builder_secondary_color");
      setPrimaryColor("#fbbf24");
      setSecondaryColor("#d97706");
    }
  };

  const exportHtml = () => {
    setSaving(true);
    const previewElement = document.getElementById("builder-preview-content");
    if (!previewElement) return;

    // Clone to remove editor-only elements
    const clone = previewElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".editor-controls").forEach(el => el.remove());
    clone.querySelectorAll("[contenteditable]").forEach(el => {
      (el as HTMLElement).removeAttribute("contenteditable");
      (el as HTMLElement).classList.remove("hover:outline-dashed", "hover:outline-cyan-500/50");
    });

    const htmlContent = clone.innerHTML;

    const fullHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi Landing Page Profesional - Fast Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${primaryColor};
      --primary-rgb: ${hexToRgb(primaryColor)};
      --secondary: ${secondaryColor};
    }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #030712; color: #f9fafb; }
    .text-gradient { background: linear-gradient(to right, var(--primary), var(--secondary), #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .bg-glass { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .btn-primary { background: linear-gradient(to bottom, var(--primary), var(--secondary)); color: #000; font-weight: 800; border-radius: 12px; transition: all 0.3s; box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.5); }
    section { position: relative; overflow: hidden; }
  </style>
</head>
<body class="antialiased">
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-fastpage-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <Nav />
      
      <div className="flex-grow flex pt-20">
        {/* Left Sidebar - Toolbar */}
        <aside className="w-80 border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl fixed left-0 top-20 bottom-0 z-30 hidden lg:flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layout className="w-5 h-5 text-amber-500" />
              Constructor <span className="text-amber-500">Pro</span>
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Arrastra o haz clic para añadir bloques</p>
          </div>

          <div className="flex p-2 gap-1 border-b border-white/5 bg-black/20">
            <button 
              onClick={() => setActiveTab("add")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "add" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Bloques
            </button>
            <button 
              onClick={() => setActiveTab("styles")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "styles" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Estilos
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3 no-scrollbar">
            {activeTab === "add" ? (
              <>
                <BlockButton icon={<Zap />} label="Hero Principal" onClick={() => addBlock("hero")} />
                <BlockButton icon={<Layout />} label="Características" onClick={() => addBlock("features")} />
                <BlockButton icon={<Star />} label="Testimonios" onClick={() => addBlock("testimonials")} />
                <BlockButton icon={<MousePointer2 />} label="Llamada a la Acción" onClick={() => addBlock("cta")} />
                <BlockButton icon={<Plus />} label="Planes de Precios" onClick={() => addBlock("pricing")} />
                <BlockButton icon={<Type />} label="Preguntas (FAQ)" onClick={() => addBlock("faq")} />
                <BlockButton icon={<ImageIcon />} label="Pie de Página" onClick={() => addBlock("footer")} />
              </>
            ) : (
              <div className="p-4 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Paleta de Temas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {themes.map(t => (
                      <button 
                        key={t.name} 
                        onClick={() => updateTheme(t.primary, t.secondary)}
                        className={`group relative w-full aspect-square rounded-xl border transition-all overflow-hidden ${primaryColor === t.primary ? "border-white scale-110 z-10 shadow-lg shadow-black/50" : "border-white/10 hover:border-white/30"}`}
                        title={t.name}
                      >
                        <div className="absolute inset-0 flex flex-col">
                          <div className="flex-1" style={{backgroundColor: t.primary}} />
                          <div className="flex-1" style={{backgroundColor: t.secondary}} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Personalizado (RGB)</label>
                  <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => updateTheme(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                    />
                    <div className="flex-grow">
                      <p className="text-[10px] font-bold text-white uppercase">{primaryColor}</p>
                      <p className="text-[8px] text-zinc-500">Color Primario</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipografía</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500/50 transition-colors">
                    <option>Plus Jakarta Sans</option>
                    <option>Inter</option>
                    <option>Montserrat</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 space-y-2">
            <button 
              onClick={exportHtml}
              disabled={blocks.length === 0 || saving}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar Proyecto
            </button>
            <button 
              onClick={clearBuilder}
              className="w-full bg-white/5 text-zinc-400 py-2 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              Limpiar Todo
            </button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-grow lg:ml-80 bg-[#020617] p-4 md:p-8 flex flex-col items-center overflow-y-auto no-scrollbar">
          
          {/* Top Canvas Toolbar */}
          <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => setViewMode("desktop")}
                className={`p-2 rounded-lg transition-all ${viewMode === "desktop" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("mobile")}
                className={`p-2 rounded-lg transition-all ${viewMode === "mobile" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 animate-pulse">
                Auto-guardado activo
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          {/* Builder Surface */}
          <div 
            className={`transition-all duration-500 ease-in-out bg-black rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ${viewMode === "mobile" ? "max-w-[375px] h-[667px]" : "w-full max-w-5xl min-h-[80vh]"}`}
          >
          <div id="builder-preview-content" className="flex-grow overflow-y-auto no-scrollbar scroll-smooth bg-[#030712]">
            <style>{`
              :root {
                --primary: ${primaryColor};
                --primary-rgb: ${hexToRgb(primaryColor)};
                --secondary: ${secondaryColor};
              }
              .dynamic-primary-text { color: var(--primary); }
              .dynamic-primary-bg { background-color: var(--primary); }
              .dynamic-primary-border { border-color: var(--primary); }
              .dynamic-primary-bg-light { background-color: rgba(var(--primary-rgb), 0.1); }
              .dynamic-primary-border-light { border-color: rgba(var(--primary-rgb), 0.2); }
              .dynamic-primary-shadow { shadow: 0 0 30px rgba(var(--primary-rgb), 0.3); }
              .dynamic-gradient-text { 
                background: linear-gradient(to right, var(--primary), #ffffff, var(--secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
            `}</style>
              {blocks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 animate-bounce">
                    <Plus className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tu lienzo está listo</h3>
                  <p className="text-zinc-500 max-w-xs">Añade tu primer bloque desde la barra lateral para empezar a crear tu landing page profesional.</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div key={block.id} className="group relative">
                    {/* Block Controls */}
                    <div className="editor-controls absolute top-4 right-4 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(index, "up")} className="p-2 bg-zinc-900/90 text-white rounded-lg hover:bg-amber-500 hover:text-black transition-all border border-white/5" title="Mover arriba"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveBlock(index, "down")} className="p-2 bg-zinc-900/90 text-white rounded-lg hover:bg-amber-500 hover:text-black transition-all border border-white/5" title="Mover abajo"><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => duplicateBlock(index)} className="p-2 bg-zinc-900/90 text-white rounded-lg hover:bg-blue-500 hover:text-white transition-all border border-white/5" title="Duplicar"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => removeBlock(block.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <EditableBlock 
                      block={block} 
                      onUpdate={(content) => updateBlockContent(block.id, content)} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function BlockButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group text-left"
    >
      <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{label}</span>
    </button>
  );
}

function EditableBlock({ block, onUpdate }: { block: Block, onUpdate: (content: any) => void }) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...block.content, [field]: value });
  };

  const handleListItemChange = (field: string, index: number, subfield: string, value: string) => {
    const newList = [...block.content[field]];
    newList[index] = { ...newList[index], [subfield]: value };
    onUpdate({ ...block.content, [field]: newList });
  };

  const handleImageUpload = (field: string) => {
    const url = prompt("Introduce la URL de la imagen:");
    if (url) {
      handleChange(field, url);
    }
  };

  const handleListItemImageUpload = (field: string, index: number, subfield: string) => {
    const url = prompt("Introduce la URL de la imagen:");
    if (url) {
      handleListItemChange(field, index, subfield, url);
    }
  };

  switch (block.type) {
    case "hero":
      return (
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_70%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-left">
                <span 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => handleChange("badge", e.currentTarget.textContent || "")}
                  className="inline-block px-4 py-1.5 rounded-full dynamic-primary-bg-light border dynamic-primary-border-light dynamic-primary-text text-[10px] font-black uppercase tracking-widest mb-8 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                >
                  {block.content.badge}
                </span>
                <h1 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
                  className="text-4xl md:text-6xl font-black tracking-tight mb-8 dynamic-gradient-text leading-tight outline-none hover:outline-dashed hover:outline-cyan-500/50"
                >
                  {block.content.title}
                </h1>
                <p 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => handleChange("subtitle", e.currentTarget.textContent || "")}
                  className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed outline-none hover:outline-dashed hover:outline-cyan-500/50"
                >
                  {block.content.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleChange("primaryBtn", e.currentTarget.textContent || "")}
                    className="px-8 py-4 dynamic-primary-bg text-black font-black rounded-2xl hover:brightness-110 transition-all hover:scale-105 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] outline-none"
                  >
                    {block.content.primaryBtn}
                  </button>
                  <button 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleChange("secondaryBtn", e.currentTarget.textContent || "")}
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all outline-none"
                  >
                    {block.content.secondaryBtn}
                  </button>
                </div>
              </div>
              <div className="flex-1 relative group">
                <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={block.content.image} 
                  alt="Hero" 
                  className="relative rounded-[2rem] border border-white/10 shadow-2xl w-full object-cover aspect-video lg:aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageUpload("image")}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Cambiar Imagen
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case "features":
      return (
        <section className="py-24 px-6 bg-zinc-950/50">
          <div className="max-w-6xl mx-auto">
            <h2 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
              className="text-3xl md:text-5xl font-black text-center mb-16 outline-none hover:outline-dashed hover:outline-cyan-500/50"
            >
              {block.content.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {block.content.items.map((item: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all group">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                  <h3 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("items", i, "title", e.currentTarget.textContent || "")}
                    className="text-xl font-bold mb-4 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    {item.title}
                  </h3>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("items", i, "desc", e.currentTarget.textContent || "")}
                    className="text-zinc-500 leading-relaxed outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
              className="text-3xl md:text-5xl font-black text-center mb-16 outline-none hover:outline-dashed hover:outline-cyan-500/50"
            >
              {block.content.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {block.content.items.map((item: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 relative">
                  <div className="absolute top-8 right-8 dynamic-primary-text opacity-20"><Star className="w-12 h-12 fill-current" /></div>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("items", i, "text", e.currentTarget.textContent || "")}
                    className="text-lg italic text-zinc-300 mb-8 relative z-10 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    "{item.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-full border dynamic-primary-border-light cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => handleListItemImageUpload("items", i, "avatar")}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 pointer-events-none">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleListItemChange("items", i, "name", e.currentTarget.textContent || "")}
                        className="font-bold outline-none hover:outline-dashed hover:outline-cyan-500/50"
                      >
                        {item.name}
                      </h4>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleListItemChange("items", i, "role", e.currentTarget.textContent || "")}
                        className="text-sm text-zinc-500 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                      >
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "pricing":
      return (
        <section className="py-24 px-6 bg-zinc-950/50">
          <div className="max-w-6xl mx-auto">
            <h2 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
              className="text-3xl md:text-5xl font-black text-center mb-16 outline-none hover:outline-dashed hover:outline-cyan-500/50"
            >
              {block.content.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {block.content.plans.map((plan: any, i: number) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border ${plan.popular ? "dynamic-primary-bg-light dynamic-primary-border shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]" : "bg-zinc-900/50 border-white/5"} flex flex-col`}>
                  {plan.popular && <span className="text-[10px] font-black uppercase tracking-widest dynamic-primary-text mb-6 block text-center">Más Popular</span>}
                  <h3 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("plans", i, "name", e.currentTarget.textContent || "")}
                    className="text-xl font-bold mb-2 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black">$</span>
                    <span 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleListItemChange("plans", i, "price", e.currentTarget.textContent || "")}
                      className="text-6xl font-black outline-none hover:outline-dashed hover:outline-cyan-500/50"
                    >
                      {plan.price}
                    </span>
                    <span className="text-zinc-500">/mes</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((f: string, fi: number) => (
                      <li key={fi} className="flex items-center gap-3 text-sm text-zinc-400">
                        <Check className="w-4 h-4 dynamic-primary-text flex-shrink-0" />
                        <span 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newFeatures = [...plan.features];
                            newFeatures[fi] = e.currentTarget.textContent || "";
                            handleListItemChange("plans", i, "features", newFeatures as any);
                          }}
                          className="outline-none hover:outline-dashed hover:outline-cyan-500/50"
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider transition-all ${plan.popular ? "dynamic-primary-bg text-black hover:brightness-110" : "bg-white/5 text-white hover:bg-white/10"}`}>
                    Elegir Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[3rem] dynamic-primary-bg text-black text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <h2 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
                className="text-4xl md:text-6xl font-black mb-8 leading-tight outline-none hover:outline-dashed hover:outline-black/20"
              >
                {block.content.title}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleChange("desc", e.currentTarget.textContent || "")}
                className="text-xl font-medium mb-12 max-w-2xl mx-auto opacity-80 outline-none hover:outline-dashed hover:outline-black/20"
              >
                {block.content.desc}
              </p>
              <button 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleChange("btn", e.currentTarget.textContent || "")}
                className="px-12 py-5 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all shadow-2xl outline-none"
              >
                {block.content.btn}
              </button>
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="py-24 px-6 bg-zinc-950/50">
          <div className="max-w-4xl mx-auto">
            <h2 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => handleChange("title", e.currentTarget.textContent || "")}
              className="text-3xl md:text-5xl font-black text-center mb-16 outline-none hover:outline-dashed hover:outline-cyan-500/50"
            >
              {block.content.title}
            </h2>
            <div className="space-y-6">
              {block.content.items.map((item: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5">
                  <h4 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("items", i, "q", e.currentTarget.textContent || "")}
                    className="text-xl font-bold mb-4 flex items-center gap-3 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    <span className="dynamic-primary-text">Q.</span> {item.q}
                  </h4>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleListItemChange("items", i, "a", e.currentTarget.textContent || "")}
                    className="text-zinc-400 leading-relaxed pl-8 outline-none hover:outline-dashed hover:outline-cyan-500/50"
                  >
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "footer":
      return (
        <footer className="py-12 px-6 border-t border-white/5 text-center">
          <div className="flex flex-col items-center gap-6">
            <Zap className="w-8 h-8 dynamic-primary-text" />
            <p 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => handleChange("text", e.currentTarget.textContent || "")}
              className="text-zinc-500 text-sm outline-none hover:outline-dashed hover:outline-cyan-500/50"
            >
              {block.content.text}
            </p>
            <div className="flex gap-6 text-[10px] uppercase font-black tracking-widest text-zinc-600">
              <a href="#" className="hover:text-amber-500 transition-colors">Términos</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Soporte</a>
            </div>
          </div>
        </footer>
      );

    default:
      return null;
  }
}

