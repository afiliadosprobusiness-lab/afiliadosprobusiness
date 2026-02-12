"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc as firestoreDoc, getDoc, setDoc } from "firebase/firestore";
import { injectMetricsTracking } from "@/lib/metricsTracking";
import PublishSuccessModal from "@/components/PublishSuccessModal";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  FileText,
  Loader2,
  Monitor,
  Palette,
  Plus,
  Rocket,
  Save,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  X,
} from "lucide-react";
import {
  generateStorefrontHtml,
  STORE_THEMES,
  type StoreConfig,
  type StoreFeature,
  type StoreProduct,
  type StoreThemeId,
} from "@/lib/storefrontGenerator";

const FIREBASE_PUBLIC_CONFIG = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAkb9GtjFXt2NPjuM_-M41Srd6aUK7Ch2Y",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "fastpage-7ceb3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fastpage-7ceb3",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "fastpage-7ceb3.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "812748660444",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:812748660444:web:4bf4184a13a377bc26de19",
};

function isValidHttpUrl(input: string) {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function newId(prefix = "") {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}${rand}` : rand;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function formatMoney(cents: number, currency: StoreConfig["currency"]) {
  const v = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(
      v,
    );
  } catch {
    return `${v.toFixed(2)} ${currency}`;
  }
}

function safeFeatures(input: StoreConfig["features"]): StoreFeature[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(Boolean)
    .map((f) => ({
      title: String((f as any)?.title || ""),
      subtitle: String((f as any)?.subtitle || ""),
      color: (f as any)?.color ? String((f as any).color) : undefined,
    }))
    .slice(0, 8);
}

function clampRgbValue(n: number) {
  return Math.max(0, Math.min(255, Math.trunc(n)));
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if ([r, g, b].every((v) => Number.isFinite(v))) return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if ([r, g, b].every((v) => Number.isFinite(v))) return { r, g, b };
  }
  return { r: 0, g: 0, b: 0 };
}

function sanitizeRichTextClient(input: string) {
  if (!input) return "";
  if (!input.includes("<")) return input.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return input.replace(/<[^>]*>/g, "");
  }

  const allowedTags = new Set(["SPAN", "B", "STRONG", "I", "EM", "U", "BR"]);
  const allowedStyleProps = new Set([
    "color",
    "font-size",
    "font-family",
    "font-weight",
    "letter-spacing",
    "text-transform",
    "text-decoration",
    "font-style",
    "line-height",
  ]);

  const isSafeStyleValue = (prop: string, valueRaw: string) => {
    const value = String(valueRaw || "").trim();
    if (!value) return false;
    const lower = value.toLowerCase();
    if (lower.includes("url(") || lower.includes("expression(")) return false;

    if (prop === "color") {
      return (
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
        /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.test(value) ||
        /^hsla?\(/i.test(value) ||
        /^var\(--(accent|accent2)\)$/i.test(value) ||
        /^(white|black|transparent|currentcolor)$/i.test(value)
      );
    }
    if (prop === "font-size" || prop === "letter-spacing" || prop === "line-height") {
      return /^-?\d+(\.\d+)?(px|rem|em|%)$/.test(value) || /^\d+(\.\d+)?$/.test(value);
    }
    if (prop === "font-family") {
      return /^[a-z0-9\s,'"-]+$/i.test(value);
    }
    if (prop === "font-weight") {
      return /^(normal|bold|bolder|lighter|[1-9]00)$/.test(lower);
    }
    if (prop === "text-transform") {
      return /^(none|uppercase|lowercase|capitalize)$/.test(lower);
    }
    if (prop === "text-decoration") {
      return /^(none|underline|line-through|overline)$/.test(lower);
    }
    if (prop === "font-style") {
      return /^(normal|italic|oblique)$/.test(lower);
    }
    return false;
  };

  const cleanStyle = (styleAttr: string) => {
    const pieces = String(styleAttr || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const kept: string[] = [];
    for (const part of pieces) {
      const idx = part.indexOf(":");
      if (idx <= 0) continue;
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      if (!allowedStyleProps.has(prop)) continue;
      if (!isSafeStyleValue(prop, value)) continue;
      kept.push(`${prop}:${value}`);
    }
    return kept.join(";");
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(String(input || ""), "text/html");
  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (!allowedTags.has(el.tagName)) {
        const txt = doc.createTextNode(el.textContent || "");
        el.replaceWith(txt);
        return;
      }
      const style = el.getAttribute("style") || "";
      const cls = el.getAttribute("class") || "";
      for (const attr of Array.from(el.attributes)) {
        const n = attr.name.toLowerCase();
        if (n === "style" || n === "class") continue;
        el.removeAttribute(attr.name);
      }
      if (style) {
        const cleaned = cleanStyle(style);
        if (cleaned) el.setAttribute("style", cleaned);
        else el.removeAttribute("style");
      }
      if (cls && el.tagName === "SPAN") {
        const keep = cls
          .split(/\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((c) => c === "fp-accent");
        if (keep.length) el.setAttribute("class", keep.join(" "));
        else el.removeAttribute("class");
      } else {
        el.removeAttribute("class");
      }
    }
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(doc.body);
  return doc.body.innerHTML || "";
}

function applyInlineStyleToSelection(root: HTMLElement, style: Record<string, string>) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  const focus = sel.focusNode;
  if (!anchor || !focus) return false;
  if (!root.contains(anchor) || !root.contains(focus)) return false;
  if (range.collapsed) return false;

  const span = document.createElement("span");
  for (const [k, v] of Object.entries(style)) {
    span.style.setProperty(k, v);
  }
  span.appendChild(range.extractContents());
  range.insertNode(span);
  sel.removeAllRanges();
  const next = document.createRange();
  next.selectNodeContents(span);
  sel.addRange(next);
  return true;
}

function wrapSelectionWithTag(root: HTMLElement, tagName: "strong" | "em" | "u" | "span", className?: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  const focus = sel.focusNode;
  if (!anchor || !focus) return false;
  if (!root.contains(anchor) || !root.contains(focus)) return false;
  if (range.collapsed) return false;

  const el = document.createElement(tagName);
  if (className && tagName === "span") el.className = className;
  el.appendChild(range.extractContents());
  range.insertNode(el);
  sel.removeAllRanges();
  const next = document.createRange();
  next.selectNodeContents(el);
  sel.addRange(next);
  return true;
}

function RichTextField(props: {
  label: string;
  value: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
  minHeightClass?: string;
}) {
  const { label, value, onChange, placeholder, minHeightClass } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("'Plus Jakarta Sans', system-ui");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    el.innerHTML = value || "";
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    onChange(sanitizeRichTextClient(el.innerHTML || ""));
  };

  const apply = (fn: (root: HTMLElement) => boolean) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const ok = fn(el);
    if (ok) commit();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => apply((root) => wrapSelectionWithTag(root, "strong"))}
          className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-extrabold hover:bg-white/5"
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => apply((root) => wrapSelectionWithTag(root, "em"))}
          className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-extrabold hover:bg-white/5"
          title="Italica"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => apply((root) => wrapSelectionWithTag(root, "u"))}
          className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-extrabold hover:bg-white/5"
          title="Subrayado"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => apply((root) => wrapSelectionWithTag(root, "span", "fp-accent"))}
          className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 text-xs font-extrabold hover:bg-emerald-500/20"
          title="Accent (degradado)"
        >
          Accent
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/10">
          <span className="text-xs font-extrabold text-zinc-400">Color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              apply((root) => applyInlineStyleToSelection(root, { color: e.target.value }));
            }}
            className="w-8 h-6 bg-transparent border-none p-0"
            aria-label="Color"
          />
        </div>
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            apply((root) => applyInlineStyleToSelection(root, { "font-size": e.target.value }));
          }}
          className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-extrabold outline-none"
          aria-label="Tamano"
        >
          {["12px", "14px", "16px", "18px", "22px", "28px", "34px", "42px"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            apply((root) => applyInlineStyleToSelection(root, { "font-family": e.target.value }));
          }}
          className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-extrabold outline-none"
          aria-label="Fuente"
        >
          <option value="'Plus Jakarta Sans', system-ui">Jakarta</option>
          <option value="Poppins, system-ui">Poppins</option>
          <option value="Montserrat, system-ui">Montserrat</option>
          <option value="'Playfair Display', serif">Playfair</option>
        </select>
        <button
          type="button"
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            const txt = el.textContent || "";
            el.innerHTML = txt.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
            commit();
          }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-extrabold hover:bg-white/10"
          title="Quitar formato"
        >
          Reset
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={commit}
        onBlur={commit}
        data-placeholder={placeholder || ""}
        className={`w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40 ${minHeightClass || "min-h-[70px]"}`}
        style={{ whiteSpace: "pre-wrap" }}
      />
      {placeholder ? (
        <p className="text-xs text-zinc-500">
          Tip: Selecciona palabras dentro del texto para cambiar color, tamano o fuente.
        </p>
      ) : null}
    </div>
  );
}

type ProductDraft = {
  id?: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  active: boolean;
  badge: string;
  sku: string;
};

const DEFAULT_CONFIG: StoreConfig = {
  storeName: "Tienda Deluxe",
  tagline: "Ecommerce profesional con carrito y checkout",
  currency: "PEN",
  themeId: "aurora",
  primaryCta: "Comprar ahora",
  customRgb: {
    accent: { r: 6, g: 182, b: 212 },
    accent2: { r: 34, g: 197, b: 94 },
  },
  content: {
    kicker: "Ecommerce Deluxe",
    kickerHtml: "Ecommerce Deluxe",
    heroTitle: "Tu tienda lista para",
    heroAccent: "vender hoy",
    heroHeadlineHtml:
      'Tu tienda lista para <span class="fp-accent">vender hoy</span>.',
    heroSubtitle:
      "Productos, carrito y checkout dentro de una experiencia rapida y premium. Disenada para convertir en movil y escritorio.",
    heroSubtitleHtml:
      "Productos, carrito y checkout dentro de una experiencia rapida y premium. Disenada para convertir en movil y escritorio.",
    heroPrimaryButton: "Explorar productos",
    heroSecondaryButton: "Ver carrito",
    productsTitle: "Productos destacados",
    productsSubtitle: "Todo lo que agregues aqui aparecera debajo del hero.",
    productsTitleHtml: "Productos destacados",
    productsSubtitleHtml:
      "Todo lo que agregues aqui aparecera debajo del hero.",
    tipText:
      "Tip: Puedes publicar tu tienda y recibir pedidos desde cualquier dispositivo.",
    tipTextHtml:
      "Tip: Puedes publicar tu tienda y recibir pedidos desde cualquier dispositivo.",
    cartLabel: "Carrito",
    checkoutTitle: "Checkout",
    checkoutButton: "Finalizar compra",
    continueButton: "Seguir comprando",
    footerLeft: "Publicado con Fast Page",
    footerLeftHtml: "Publicado con Fast Page",
  },
  features: [
    { title: "Carrito inteligente", subtitle: "Persistente y rapido" },
    { title: "Checkout integrado", subtitle: "Flujo profesional", color: "var(--accent2)" },
    { title: "Diseno premium", subtitle: "5 temas deluxe", color: "#a78bfa" },
  ],
};

const DEFAULT_PRODUCTS: StoreProduct[] = [
  {
    id: "p1",
    name: "Producto Estrella",
    priceCents: 4990,
    description: "Un producto premium con excelente margen y alta conversion.",
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop",
    active: true,
    badge: "Nuevo",
    sku: "STAR-01",
  },
  {
    id: "p2",
    name: "Pack Oferta",
    priceCents: 8990,
    description: "Bundle recomendado para aumentar el ticket promedio.",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop",
    active: true,
    badge: "Oferta",
    sku: "BUNDLE-01",
  },
];

export default function StoreBuilderPage() {
  const { user, loading: authLoading } = useAuth(true);
  const router = useRouter();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [products, setProducts] = useState<StoreProduct[]>(DEFAULT_PRODUCTS);

  const [loadingProject, setLoadingProject] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activePanel, setActivePanel] = useState<
    "products" | "design" | "content" | "settings"
  >("products");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const [showPublished, setShowPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    active: true,
    badge: "",
    sku: "",
  });

  const hydratedRef = useRef(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      const mobile = media.matches;
      setIsMobileViewport(mobile);
      if (mobile) setViewMode("mobile");
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("fastpage_store_project_id");
    if (saved) setProjectId(saved);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) return;
    if (!projectId) return;

    setLoadingProject(true);
    setError(null);
    (async () => {
      try {
        const snap = await getDoc(firestoreDoc(db, "cloned_sites", projectId));
        if (!snap.exists()) return;
        const data = snap.data() as any;
        if (data?.userId && data.userId !== user.uid) {
          throw new Error("No tienes permisos para abrir este proyecto.");
        }
        if (data?.storeConfig) setConfig(data.storeConfig as StoreConfig);
        if (Array.isArray(data?.storeProducts)) {
          setProducts(data.storeProducts as StoreProduct[]);
        }
        setIsDirty(false);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar el proyecto.");
      } finally {
        setLoadingProject(false);
      }
    })();
  }, [authLoading, user?.uid, projectId]);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    setIsDirty(true);
  }, [config, products]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => void saveProject(false), 15000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (viewMode !== "mobile") return;
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    const t = setTimeout(() => {
      try {
        iframe.contentWindow?.scrollTo(0, 0);
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(t);
  }, [viewMode, projectId]);

  const storefrontHtml = useMemo(() => {
    const id = projectId || "draft";
    return generateStorefrontHtml({
      storeId: id,
      config,
      products,
      firebaseConfig: FIREBASE_PUBLIC_CONFIG,
    });
  }, [projectId, config, products]);

  const updateContent = (patch: Partial<StoreConfig["content"]>) => {
    setConfig((c) => ({
      ...c,
      content: {
        ...(c.content || {}),
        ...patch,
      },
    }));
  };

  const updateFeature = (idx: number, patch: Partial<StoreFeature>) => {
    setConfig((c) => {
      const features = safeFeatures(c.features);
      while (features.length < 3) {
        features.push({ title: "", subtitle: "" });
      }
      features[idx] = { ...features[idx], ...patch };
      return { ...c, features };
    });
  };

  const addFeature = () => {
    setConfig((c) => {
      const features = safeFeatures(c.features);
      if (features.length >= 6) return c;
      features.push({ title: "Nuevo beneficio", subtitle: "Descripcion" });
      return { ...c, features };
    });
  };

  const removeFeature = (idx: number) => {
    setConfig((c) => {
      const features = safeFeatures(c.features);
      features.splice(idx, 1);
      return { ...c, features };
    });
  };

  const openNewProduct = () => {
    setEditingProductId(null);
    setProductDraft({
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      active: true,
      badge: "",
      sku: "",
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (p: StoreProduct) => {
    setEditingProductId(p.id);
    setProductDraft({
      id: p.id,
      name: p.name,
      price: String((p.priceCents / 100).toFixed(2)),
      description: p.description,
      imageUrl: p.imageUrl,
      active: p.active,
      badge: p.badge || "",
      sku: p.sku || "",
    });
    setProductModalOpen(true);
  };

  const upsertProduct = () => {
    const name = productDraft.name.trim();
    if (!name) {
      setError("El producto necesita un nombre.");
      return;
    }
    const priceNum = Number(productDraft.price.replace(",", "."));
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Precio invalido. Usa un numero como 29.90");
      return;
    }
    const priceCents = clampInt(Math.round(priceNum * 100), 0, 999999999);
    const imageUrl = productDraft.imageUrl.trim();
    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      setError("La imagen debe ser una URL valida (http/https).");
      return;
    }

    const id = editingProductId || newId("p");
    const next: StoreProduct = {
      id,
      name,
      priceCents,
      description: productDraft.description.trim(),
      imageUrl,
      active: Boolean(productDraft.active),
      badge: productDraft.badge.trim() || undefined,
      sku: productDraft.sku.trim() || undefined,
    };

    setProducts((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [next, ...prev];
    });

    setProductModalOpen(false);
    setEditingProductId(null);
  };

  const deleteProduct = (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getRgbValue = (
    kind: "accent" | "accent2",
    channel: "r" | "g" | "b",
  ) => {
    const fallback =
      kind === "accent" ? hexToRgb(theme.accent) : hexToRgb(theme.accent2);
    const stored = config.customRgb?.[kind];
    return (stored?.[channel] ?? fallback[channel] ?? 0) as number;
  };

  const updateRgb = (
    kind: "accent" | "accent2",
    channel: "r" | "g" | "b",
    value: string,
  ) => {
    const num = clampRgbValue(Number(value));
    setConfig((c) => {
      const current = c.customRgb?.[kind] || hexToRgb(kind === "accent" ? theme.accent : theme.accent2);
      return {
        ...c,
        customRgb: {
          ...(c.customRgb || {}),
          [kind]: { ...current, [channel]: num },
        },
      };
    });
  };

  const saveProject = async (publishNow: boolean) => {
    if (saving || publishing) return;
    if (publishNow) setPublishing(true);
    else setSaving(true);
    setError(null);
    try {
      if (authLoading) throw new Error("Validando sesion...");
      if (!user?.uid) throw new Error("Debes iniciar sesion.");

      const id = projectId || newId();
      const now = Date.now();
      const htmlToStore = publishNow
        ? injectMetricsTracking(storefrontHtml, id)
        : storefrontHtml;

      const payload: Record<string, any> = {
        id,
        userId: user.uid,
        source: "store-builder",
        type: "ecommerce",
        templateName: config.storeName || "Tienda Online",
        url: "store://deluxe",
        storeConfig: config,
        storeProducts: products,
        html: htmlToStore,
        updatedAt: now,
        status: publishNow ? "published" : "draft",
        published: publishNow,
      };
      if (!projectId) payload.createdAt = now;
      if (publishNow) payload.publishedAt = now;

      await setDoc(firestoreDoc(db, "cloned_sites", id), payload, { merge: true });

      if (!projectId) {
        setProjectId(id);
        localStorage.setItem("fastpage_store_project_id", id);
      }

      setIsDirty(false);
      if (publishNow) {
        setPublishedUrl(`/preview/${id}`);
        setShowPublished(true);
      } else {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);
      }
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const theme =
    STORE_THEMES.find((x) => x.id === config.themeId) || STORE_THEMES[0];
  const featuresEditable = (() => {
    const current = safeFeatures(config.features);
    if (current.length) return current;
    return [
      { title: "", subtitle: "" },
      { title: "", subtitle: "" },
      { title: "", subtitle: "" },
    ];
  })();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <header className="border-b border-white/10 bg-zinc-900/80 backdrop-blur-md z-50 px-3 py-2 md:h-16 md:px-4 md:py-0">
        <div className="h-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                    return;
                  }
                  router.push("/hub");
                }}
                className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all active:scale-95"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-zinc-300 truncate max-w-[200px]">
                  Tienda: {projectId || "nuevo"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {isMobileViewport && (
              <button
                onClick={() => setMobilePanelOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
              >
                Panel
              </button>
            )}

            {!isMobileViewport && (
              <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode("desktop")}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    viewMode === "desktop"
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:text-white"
                  }`}
                  title="Modo PC"
                >
                  <Monitor className="w-4 h-4" />
                  PC
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    viewMode === "mobile"
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:text-white"
                  }`}
                  title="Modo movil"
                >
                  <Smartphone className="w-4 h-4" />
                  Movil
                </button>
              </div>
            )}

            <button
              onClick={() => saveProject(false)}
              disabled={saving || loadingProject}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar</span>
            </button>
            <button
              onClick={() => saveProject(true)}
              disabled={publishing || loadingProject}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              <span>Publicar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex relative overflow-hidden bg-zinc-900">
        <div className="hidden lg:block w-96 border-r border-white/10 bg-zinc-950/80 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="flex p-1 bg-zinc-900/60 border border-white/10 rounded-2xl mb-5">
            {[
              { id: "products", label: "Productos", icon: <ShoppingCart className="w-4 h-4" /> },
              { id: "design", label: "Diseno", icon: <Palette className="w-4 h-4" /> },
              { id: "content", label: "Contenido", icon: <FileText className="w-4 h-4" /> },
              { id: "settings", label: "Ajustes", icon: <DollarSign className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  activePanel === tab.id ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activePanel === "products" && (
            <div className="space-y-3">
              <button
                onClick={openNewProduct}
                className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                Agregar producto
              </button>
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => openEditProduct(p)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <b className="text-white truncate">{p.name}</b>
                      <div className="mt-1 text-xs text-zinc-400 line-clamp-2">{p.description}</div>
                      <div className="mt-2 text-sm font-extrabold text-emerald-300">
                        {formatMoney(p.priceCents, config.currency)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(p.id);
                      }}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePanel === "design" && (
            <div className="space-y-3">
              {STORE_THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setConfig((c) => ({ ...c, themeId: th.id as StoreThemeId }))}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    config.themeId === th.id ? "bg-emerald-500/10 border-emerald-500/25" : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-white truncate">{th.name}</div>
                    <div className="text-xs text-zinc-500">Radio {th.radius}px</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-white/10" style={{ background: th.accent }} />
                    <span className="w-5 h-5 rounded-full border border-white/10" style={{ background: th.accent2 }} />
                  </div>
                </button>
              ))}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">Tema actual</div>
                <div className="mt-2 font-extrabold text-white">{theme.name}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  Personalizar colores (RGB)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-xs text-zinc-400 font-bold">Accent</div>
                  <div className="text-xs text-zinc-400 font-bold">R / G / B</div>
                  <div className="text-xs text-zinc-400 font-bold text-right">Preview</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-sm font-bold text-white">Primario</div>
                  <div className="flex items-center gap-2">
                    {(["r", "g", "b"] as const).map((ch) => (
                      <input
                        key={`accent-${ch}`}
                        type="number"
                        min={0}
                        max={255}
                        value={getRgbValue("accent", ch)}
                        onChange={(e) => updateRgb("accent", ch, e.target.value)}
                        className="w-16 px-2 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold text-xs outline-none focus:border-emerald-500/40"
                      />
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <span
                      className="w-8 h-8 rounded-full border border-white/10"
                      style={{
                        background: `rgb(${getRgbValue("accent", "r")}, ${getRgbValue("accent", "g")}, ${getRgbValue("accent", "b")})`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-sm font-bold text-white">Secundario</div>
                  <div className="flex items-center gap-2">
                    {(["r", "g", "b"] as const).map((ch) => (
                      <input
                        key={`accent2-${ch}`}
                        type="number"
                        min={0}
                        max={255}
                        value={getRgbValue("accent2", ch)}
                        onChange={(e) => updateRgb("accent2", ch, e.target.value)}
                        className="w-16 px-2 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold text-xs outline-none focus:border-emerald-500/40"
                      />
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <span
                      className="w-8 h-8 rounded-full border border-white/10"
                      style={{
                        background: `rgb(${getRgbValue("accent2", "r")}, ${getRgbValue("accent2", "g")}, ${getRgbValue("accent2", "b")})`,
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, customRgb: undefined }))}
                  className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
                >
                  Usar colores del tema
                </button>
              </div>
            </div>
          )}

          {activePanel === "content" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <RichTextField
                  label="Hero: Kicker"
                  value={config.content?.kickerHtml || config.content?.kicker || ""}
                  onChange={(html) =>
                    updateContent({
                      kickerHtml: html,
                      kicker: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Ecommerce Deluxe"
                  minHeightClass="min-h-[56px]"
                />

                <RichTextField
                  label="Hero: Titular (por palabra)"
                  value={config.content?.heroHeadlineHtml || ""}
                  onChange={(html) =>
                    updateContent({ heroHeadlineHtml: html })
                  }
                  placeholder='Tu tienda lista para <span class="fp-accent">vender hoy</span>.'
                  minHeightClass="min-h-[88px]"
                />

                <RichTextField
                  label="Hero: Subtitulo (por palabra)"
                  value={config.content?.heroSubtitleHtml || config.content?.heroSubtitle || ""}
                  onChange={(html) =>
                    updateContent({
                      heroSubtitleHtml: html,
                      heroSubtitle: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Productos, carrito y checkout..."
                  minHeightClass="min-h-[120px]"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton principal
                    </label>
                    <input
                      value={config.content?.heroPrimaryButton || ""}
                      onChange={(e) =>
                        updateContent({ heroPrimaryButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton secundario
                    </label>
                    <input
                      value={config.content?.heroSecondaryButton || ""}
                      onChange={(e) =>
                        updateContent({ heroSecondaryButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <RichTextField
                  label="Seccion productos: Titulo (por palabra)"
                  value={config.content?.productsTitleHtml || config.content?.productsTitle || ""}
                  onChange={(html) =>
                    updateContent({
                      productsTitleHtml: html,
                      productsTitle: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Productos destacados"
                  minHeightClass="min-h-[60px]"
                />

                <RichTextField
                  label="Seccion productos: Subtitulo (por palabra)"
                  value={config.content?.productsSubtitleHtml || config.content?.productsSubtitle || ""}
                  onChange={(html) =>
                    updateContent({
                      productsSubtitleHtml: html,
                      productsSubtitle: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Todo lo que agregues aqui aparecera debajo del hero."
                  minHeightClass="min-h-[70px]"
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  Beneficios
                </div>
                {featuresEditable.map((feat, idx) => (
                  <div
                    key={`feat-${idx}`}
                    className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <b className="text-xs text-white">Item {idx + 1}</b>
                      <button
                        onClick={() => removeFeature(idx)}
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                    <input
                      value={feat.title}
                      onChange={(e) =>
                        updateFeature(idx, { title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                      placeholder="Titulo"
                    />
                    <input
                      value={feat.subtitle}
                      onChange={(e) =>
                        updateFeature(idx, { subtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                      placeholder="Subtitulo"
                    />
                    <input
                      value={feat.color || ""}
                      onChange={(e) =>
                        updateFeature(idx, { color: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                      placeholder="Color (ej: #a78bfa)"
                    />
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Agregar beneficio
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  Etiquetas
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Carrito
                    </label>
                    <input
                      value={config.content?.cartLabel || ""}
                      onChange={(e) => updateContent({ cartLabel: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Checkout titulo
                    </label>
                    <input
                      value={config.content?.checkoutTitle || ""}
                      onChange={(e) =>
                        updateContent({ checkoutTitle: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton checkout
                    </label>
                    <input
                      value={config.content?.checkoutButton || ""}
                      onChange={(e) =>
                        updateContent({ checkoutButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton seguir
                    </label>
                    <input
                      value={config.content?.continueButton || ""}
                      onChange={(e) =>
                        updateContent({ continueButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
                <RichTextField
                  label="Tip (por palabra)"
                  value={config.content?.tipTextHtml || config.content?.tipText || ""}
                  onChange={(html) =>
                    updateContent({
                      tipTextHtml: html,
                      tipText: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Tip: ..."
                  minHeightClass="min-h-[64px]"
                />
                <RichTextField
                  label="Footer izquierda (por palabra)"
                  value={config.content?.footerLeftHtml || config.content?.footerLeft || ""}
                  onChange={(html) =>
                    updateContent({
                      footerLeftHtml: html,
                      footerLeft: html.replace(/<[^>]*>/g, ""),
                    })
                  }
                  placeholder="Publicado con Fast Page"
                  minHeightClass="min-h-[56px]"
                />
              </div>
            </div>
          )}

          {activePanel === "settings" && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">Nombre</label>
                <input
                  value={config.storeName}
                  onChange={(e) => setConfig((c) => ({ ...c, storeName: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                />
                <label className="mt-4 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">Tagline</label>
                <input
                  value={config.tagline}
                  onChange={(e) => setConfig((c) => ({ ...c, tagline: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Moneda
                    </label>
                    <select
                      value={config.currency}
                      onChange={(e) => setConfig((c) => ({ ...c, currency: e.target.value as any }))}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    >
                      <option value="PEN">PEN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      CTA
                    </label>
                    <input
                      value={config.primaryCta || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, primaryCta: e.target.value }))}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                      placeholder="Comprar ahora"
                    />
                  </div>
                </div>
                <label className="mt-4 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  WhatsApp (opcional)
                </label>
                <input
                  value={config.supportWhatsapp || ""}
                  onChange={(e) => setConfig((c) => ({ ...c, supportWhatsapp: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                  placeholder="51999999999"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Si lo llenas, el boton principal abrira WhatsApp con tu carrito.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-zinc-900/50">
          <div
            className={`bg-white shadow-2xl transition-all duration-500 ease-in-out relative ${
              viewMode === "mobile" ? "w-[375px] h-[667px] rounded-[40px] border-[12px] border-zinc-800" : "w-full h-full rounded-lg"
            }`}
          >
            {loadingProject ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 rounded-[inherit]">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
            ) : (
              <iframe
                ref={previewIframeRef}
                title="Storefront Preview"
                className="w-full h-full border-none rounded-[inherit]"
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                srcDoc={storefrontHtml}
              />
            )}
          </div>
        </div>
      </div>

      {mobilePanelOpen && (
        <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-md p-4 flex items-end lg:hidden">
          <div className="w-full bg-zinc-900 border border-white/10 rounded-[28px] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black tracking-[0.18em] uppercase text-zinc-500">
                  Tienda Online
                </p>
                <b className="text-white">{config.storeName || "Tienda"}</b>
              </div>
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 border-b border-white/10">
              <div className="flex p-1 bg-zinc-950/40 border border-white/10 rounded-2xl">
                {[
                  { id: "products", label: "Productos" },
                  { id: "design", label: "Tema" },
                  { id: "content", label: "Contenido" },
                  { id: "settings", label: "Ajustes" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id as any)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      activePanel === tab.id
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 overflow-y-auto no-scrollbar">
              {activePanel === "products" && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setMobilePanelOpen(false);
                      openNewProduct();
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar producto
                  </button>
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setMobilePanelOpen(false);
                        openEditProduct(p);
                      }}
                      className="w-full text-left rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <b className="text-white truncate">{p.name}</b>
                          <div className="mt-1 text-xs text-zinc-400 line-clamp-2">
                            {p.description}
                          </div>
                          <div className="mt-2 text-sm font-extrabold text-emerald-300">
                            {formatMoney(p.priceCents, config.currency)}
                          </div>
                        </div>
                        <span className="text-zinc-500 text-xs font-black">Editar</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activePanel === "design" && (
                <div className="space-y-2">
                  {STORE_THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() =>
                        setConfig((c) => ({ ...c, themeId: th.id as StoreThemeId }))
                      }
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        config.themeId === th.id
                          ? "bg-emerald-500/10 border-emerald-500/25"
                          : "bg-black/20 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-white truncate">
                          {th.name}
                        </div>
                        <div className="text-xs text-zinc-500">Radio {th.radius}px</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ background: th.accent }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ background: th.accent2 }}
                        />
                      </div>
                    </button>
                  ))}
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      RGB personalizado
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-sm font-bold text-white">Primario</div>
                      <div className="flex items-center gap-2">
                        {(["r", "g", "b"] as const).map((ch) => (
                          <input
                            key={`m-accent-${ch}`}
                            type="number"
                            min={0}
                            max={255}
                            value={getRgbValue("accent", ch)}
                            onChange={(e) => updateRgb("accent", ch, e.target.value)}
                            className="w-14 px-2 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold text-xs outline-none focus:border-emerald-500/40"
                          />
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <span
                          className="w-7 h-7 rounded-full border border-white/10"
                          style={{
                            background: `rgb(${getRgbValue("accent", "r")}, ${getRgbValue("accent", "g")}, ${getRgbValue("accent", "b")})`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-sm font-bold text-white">Secundario</div>
                      <div className="flex items-center gap-2">
                        {(["r", "g", "b"] as const).map((ch) => (
                          <input
                            key={`m-accent2-${ch}`}
                            type="number"
                            min={0}
                            max={255}
                            value={getRgbValue("accent2", ch)}
                            onChange={(e) => updateRgb("accent2", ch, e.target.value)}
                            className="w-14 px-2 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold text-xs outline-none focus:border-emerald-500/40"
                          />
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <span
                          className="w-7 h-7 rounded-full border border-white/10"
                          style={{
                            background: `rgb(${getRgbValue("accent2", "r")}, ${getRgbValue("accent2", "g")}, ${getRgbValue("accent2", "b")})`,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setConfig((c) => ({ ...c, customRgb: undefined }))}
                      className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
                    >
                      Usar colores del tema
                    </button>
                  </div>
                </div>
              )}

              {activePanel === "content" && (
                <div className="space-y-3">
                  <div className="space-y-3">
                    <RichTextField
                      label="Hero: Kicker"
                      value={config.content?.kickerHtml || config.content?.kicker || ""}
                      onChange={(html) =>
                        updateContent({
                          kickerHtml: html,
                          kicker: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Ecommerce Deluxe"
                      minHeightClass="min-h-[56px]"
                    />

                    <RichTextField
                      label="Hero: Titular (por palabra)"
                      value={config.content?.heroHeadlineHtml || ""}
                      onChange={(html) => updateContent({ heroHeadlineHtml: html })}
                      placeholder='Tu tienda lista para <span class="fp-accent">vender hoy</span>.'
                      minHeightClass="min-h-[92px]"
                    />

                    <RichTextField
                      label="Hero: Subtitulo (por palabra)"
                      value={config.content?.heroSubtitleHtml || config.content?.heroSubtitle || ""}
                      onChange={(html) =>
                        updateContent({
                          heroSubtitleHtml: html,
                          heroSubtitle: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Productos, carrito y checkout..."
                      minHeightClass="min-h-[120px]"
                    />

                    <label className="mt-3 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton principal
                    </label>
                    <input
                      value={config.content?.heroPrimaryButton || ""}
                      onChange={(e) =>
                        updateContent({ heroPrimaryButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <label className="mt-3 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton secundario
                    </label>
                    <input
                      value={config.content?.heroSecondaryButton || ""}
                      onChange={(e) =>
                        updateContent({ heroSecondaryButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-3">
                    <RichTextField
                      label="Productos: Titulo (por palabra)"
                      value={config.content?.productsTitleHtml || config.content?.productsTitle || ""}
                      onChange={(html) =>
                        updateContent({
                          productsTitleHtml: html,
                          productsTitle: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Productos destacados"
                      minHeightClass="min-h-[60px]"
                    />
                    <RichTextField
                      label="Productos: Subtitulo (por palabra)"
                      value={config.content?.productsSubtitleHtml || config.content?.productsSubtitle || ""}
                      onChange={(html) =>
                        updateContent({
                          productsSubtitleHtml: html,
                          productsSubtitle: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Todo lo que agregues aqui aparecera debajo del hero."
                      minHeightClass="min-h-[70px]"
                    />
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Beneficios
                    </div>
                    {featuresEditable.map((feat, idx) => (
                      <div
                        key={`mfeat-${idx}`}
                        className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-xs text-white">Item {idx + 1}</b>
                          <button
                            onClick={() => removeFeature(idx)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Eliminar
                          </button>
                        </div>
                        <input
                          value={feat.title}
                          onChange={(e) =>
                            updateFeature(idx, { title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                          placeholder="Titulo"
                        />
                        <input
                          value={feat.subtitle}
                          onChange={(e) =>
                            updateFeature(idx, { subtitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                          placeholder="Subtitulo"
                        />
                        <input
                          value={feat.color || ""}
                          onChange={(e) =>
                            updateFeature(idx, { color: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                          placeholder="Color (ej: #a78bfa)"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                    >
                      Agregar beneficio
                    </button>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Carrito
                    </label>
                    <input
                      value={config.content?.cartLabel || ""}
                      onChange={(e) => updateContent({ cartLabel: e.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <label className="mt-3 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Checkout titulo
                    </label>
                    <input
                      value={config.content?.checkoutTitle || ""}
                      onChange={(e) =>
                        updateContent({ checkoutTitle: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <label className="mt-3 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton checkout
                    </label>
                    <input
                      value={config.content?.checkoutButton || ""}
                      onChange={(e) =>
                        updateContent({ checkoutButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <label className="mt-3 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Boton seguir
                    </label>
                    <input
                      value={config.content?.continueButton || ""}
                      onChange={(e) =>
                        updateContent({ continueButton: e.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <RichTextField
                      label="Tip (por palabra)"
                      value={config.content?.tipTextHtml || config.content?.tipText || ""}
                      onChange={(html) =>
                        updateContent({
                          tipTextHtml: html,
                          tipText: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Tip: ..."
                      minHeightClass="min-h-[64px]"
                    />
                    <RichTextField
                      label="Footer izquierda (por palabra)"
                      value={config.content?.footerLeftHtml || config.content?.footerLeft || ""}
                      onChange={(html) =>
                        updateContent({
                          footerLeftHtml: html,
                          footerLeft: html.replace(/<[^>]*>/g, ""),
                        })
                      }
                      placeholder="Publicado con Fast Page"
                      minHeightClass="min-h-[56px]"
                    />
                  </div>
                </div>
              )}

              {activePanel === "settings" && (
                <div className="space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Nombre
                    </label>
                    <input
                      value={config.storeName}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, storeName: e.target.value }))
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />
                    <label className="mt-4 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      Tagline
                    </label>
                    <input
                      value={config.tagline}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, tagline: e.target.value }))
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                          Moneda
                        </label>
                        <select
                          value={config.currency}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              currency: e.target.value as any,
                            }))
                          }
                          className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                        >
                          <option value="PEN">PEN</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                          CTA
                        </label>
                        <input
                          value={config.primaryCta || ""}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              primaryCta: e.target.value,
                            }))
                          }
                          className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                          placeholder="Comprar ahora"
                        />
                      </div>
                    </div>

                    <label className="mt-4 block text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                      WhatsApp (opcional)
                    </label>
                    <input
                      value={config.supportWhatsapp || ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          supportWhatsapp: e.target.value,
                        }))
                      }
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                      placeholder="51999999999"
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      Si lo llenas, el boton principal abrira WhatsApp con tu carrito.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {productModalOpen && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[28px] overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.18em] uppercase text-zinc-500">
                  Productos
                </p>
                <h3 className="text-lg font-extrabold text-white">
                  {editingProductId ? "Editar producto" : "Nuevo producto"}
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                    Nombre
                  </label>
                  <input
                    value={productDraft.name}
                    onChange={(e) => setProductDraft((d) => ({ ...d, name: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    placeholder="Producto"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                    Precio
                  </label>
                  <input
                    value={productDraft.price}
                    onChange={(e) => setProductDraft((d) => ({ ...d, price: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    placeholder="29.90"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  Descripcion
                </label>
                <textarea
                  value={productDraft.description}
                  onChange={(e) => setProductDraft((d) => ({ ...d, description: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40 min-h-[90px]"
                  placeholder="Beneficio, detalle, garantia..."
                />
              </div>

              <div>
                <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                  Imagen (URL)
                </label>
                <input
                  value={productDraft.imageUrl}
                  onChange={(e) => setProductDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                    Badge
                  </label>
                  <input
                    value={productDraft.badge}
                    onChange={(e) => setProductDraft((d) => ({ ...d, badge: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    placeholder="Nuevo / Oferta"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold tracking-[0.18em] uppercase text-zinc-500">
                    SKU
                  </label>
                  <input
                    value={productDraft.sku}
                    onChange={(e) => setProductDraft((d) => ({ ...d, sku: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold outline-none focus:border-emerald-500/40"
                    placeholder="SKU-001"
                  />
                </div>
                <div className="flex items-end">
                  <label className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white font-bold">
                    <input
                      type="checkbox"
                      checked={productDraft.active}
                      onChange={(e) => setProductDraft((d) => ({ ...d, active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Activo
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={upsertProduct}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  Guardar producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl z-[300]">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:bg-white/10 rounded-lg p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {savedToast && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl z-[300]">
          <CheckCircle className="w-5 h-5" />
          <span>Cambios guardados</span>
        </div>
      )}

      <PublishSuccessModal
        open={Boolean(showPublished && publishedUrl)}
        url={publishedUrl || "/preview"}
        onBackToPanel={() => {
          setShowPublished(false);
          router.push("/cloner/web");
        }}
        onContinueEditing={() => setShowPublished(false)}
      />
    </div>
  );
}

