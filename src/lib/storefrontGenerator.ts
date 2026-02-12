export type StoreThemeId = "aurora" | "onyx" | "ruby" | "mint" | "mono";

export type StoreTheme = {
  id: StoreThemeId;
  name: string;
  accent: string; // hex
  accent2: string; // hex
  surface: string; // hex
  surface2: string; // hex
  text: string; // hex
  muted: string; // hex
  radius: number; // px
  font: string; // CSS font-family
};

export type StoreProduct = {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  imageUrl: string;
  active: boolean;
  badge?: string;
  sku?: string;
};

export type StoreFeature = {
  title: string;
  subtitle: string;
  color?: string; // CSS color
};

export type StoreRgb = {
  r: number;
  g: number;
  b: number;
};

export type StoreConfig = {
  storeName: string;
  tagline: string;
  currency: "PEN" | "USD" | "EUR";
  themeId: StoreThemeId;
  supportWhatsapp?: string; // E.164 or local
  primaryCta?: string;
  customRgb?: {
    accent?: StoreRgb;
    accent2?: StoreRgb;
  };

  // Content (editable)
  content?: {
    kicker?: string;
    heroTitle?: string;
    heroAccent?: string;
    heroSubtitle?: string;
    heroPrimaryButton?: string;
    heroSecondaryButton?: string;
    productsTitle?: string;
    productsSubtitle?: string;
    tipText?: string;
    cartLabel?: string;
    checkoutTitle?: string;
    checkoutButton?: string;
    continueButton?: string;
    footerLeft?: string;
  };

  features?: StoreFeature[];
};

export const STORE_THEMES: StoreTheme[] = [
  {
    id: "aurora",
    name: "Aurora Cyan",
    accent: "#06b6d4",
    accent2: "#22c55e",
    surface: "#0b1220",
    surface2: "#0f172a",
    text: "#e5e7eb",
    muted: "#94a3b8",
    radius: 18,
    font: "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  {
    id: "onyx",
    name: "Onyx Gold",
    accent: "#fbbf24",
    accent2: "#f97316",
    surface: "#0a0a0c",
    surface2: "#111113",
    text: "#f4f4f5",
    muted: "#a1a1aa",
    radius: 20,
    font: "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  {
    id: "ruby",
    name: "Ruby Red",
    accent: "#ef4444",
    accent2: "#fb7185",
    surface: "#0b0a0a",
    surface2: "#141012",
    text: "#fafafa",
    muted: "#a1a1aa",
    radius: 18,
    font: "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  {
    id: "mint",
    name: "Mint Fresh",
    accent: "#10b981",
    accent2: "#06b6d4",
    surface: "#07130f",
    surface2: "#0a1b15",
    text: "#ecfeff",
    muted: "#99f6e4",
    radius: 22,
    font: "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  {
    id: "mono",
    name: "Mono Minimal",
    accent: "#e5e7eb",
    accent2: "#a3a3a3",
    surface: "#0b0b0f",
    surface2: "#111827",
    text: "#e5e7eb",
    muted: "#9ca3af",
    radius: 16,
    font: "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
];

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function clampRgb(n: number) {
  return Math.max(0, Math.min(255, Math.trunc(n)));
}

function rgbToCss(rgb?: StoreRgb) {
  if (!rgb) return "";
  const r = clampRgb(rgb.r);
  const g = clampRgb(rgb.g);
  const b = clampRgb(rgb.b);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateStorefrontHtml(args: {
  storeId: string;
  config: StoreConfig;
  products: StoreProduct[];
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}) {
  const theme =
    STORE_THEMES.find((t) => t.id === args.config.themeId) || STORE_THEMES[0];

  const customAccent = rgbToCss(args.config.customRgb?.accent);
  const customAccent2 = rgbToCss(args.config.customRgb?.accent2);
  const accent = customAccent || theme.accent;
  const accent2 = customAccent2 || theme.accent2;

  const safeName = escapeHtml(args.config.storeName || "Mi Tienda");
  const safeTagline = escapeHtml(args.config.tagline || "Tienda online deluxe");

  const currency = args.config.currency || "PEN";
  const supportWhatsapp = (args.config.supportWhatsapp || "").trim();
  const primaryCta = escapeHtml(args.config.primaryCta || "Comprar ahora");

  const content = args.config.content || {};
  const kicker = escapeHtml(content.kicker || "Ecommerce Deluxe");
  const heroTitle = escapeHtml(content.heroTitle || "Tu tienda lista para");
  const heroAccent = escapeHtml(content.heroAccent || "vender hoy");
  const heroSubtitle = escapeHtml(
    content.heroSubtitle ||
      "Productos, carrito y checkout dentro de una experiencia rapida y premium. Disenada para convertir en movil y escritorio.",
  );
  const heroPrimaryButton = escapeHtml(content.heroPrimaryButton || "Explorar productos");
  const heroSecondaryButton = escapeHtml(content.heroSecondaryButton || "Ver carrito");
  const productsTitle = escapeHtml(content.productsTitle || "Productos destacados");
  const productsSubtitle = escapeHtml(
    content.productsSubtitle || "Todo lo que agregues aqui aparecera debajo del hero."
  );
  const tipText = escapeHtml(
    content.tipText ||
      "Tip: Puedes publicar tu tienda y recibir pedidos desde cualquier dispositivo.",
  );
  const cartLabel = escapeHtml(content.cartLabel || "Carrito");
  const checkoutTitle = escapeHtml(content.checkoutTitle || "Checkout");
  const checkoutButton = escapeHtml(content.checkoutButton || "Finalizar compra");
  const continueButton = escapeHtml(content.continueButton || "Seguir comprando");
  const footerLeft = escapeHtml(content.footerLeft || "Publicado con Fast Page");

  const features: StoreFeature[] =
    Array.isArray(args.config.features) && args.config.features.length
      ? args.config.features
      : [
          { title: "Carrito inteligente", subtitle: "Persistente y rapido" },
          { title: "Checkout integrado", subtitle: "Flujo profesional", color: "var(--accent2)" },
          { title: "Diseno premium", subtitle: "5 temas deluxe", color: "#a78bfa" },
        ];

  const products = (args.products || [])
    .filter((p) => p && p.active)
    .map((p) => ({
      id: String(p.id || ""),
      name: String(p.name || ""),
      priceCents: clamp(Number(p.priceCents || 0), 0, 999999999),
      description: String(p.description || ""),
      imageUrl: String(p.imageUrl || ""),
      badge: p.badge ? String(p.badge) : "",
      sku: p.sku ? String(p.sku) : "",
    }));

  const storefrontData = {
    storeId: args.storeId,
    currency,
    supportWhatsapp,
    primaryCta,
    products,
    content: {
      cartLabel,
      checkoutTitle,
      checkoutButton,
      continueButton,
      heroPrimaryButton,
      heroSecondaryButton,
      productsTitle,
      productsSubtitle,
    },
    theme: {
      accent,
      accent2,
      surface: theme.surface,
      surface2: theme.surface2,
      text: theme.text,
      muted: theme.muted,
      radius: theme.radius,
      font: theme.font,
    },
  };

  const firebaseConfig = args.firebaseConfig;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeName} | Fast Page</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      :root{--accent:${accent};--accent2:${accent2};--bg:${theme.surface};--surface:${theme.surface2};--text:${theme.text};--muted:${theme.muted};--r:${theme.radius}px;--shadow:0 20px 70px rgba(0,0,0,.55)}
      *{box-sizing:border-box}
      html,body{height:100%}
      body{margin:0;font-family:${theme.font};background:radial-gradient(1200px 700px at 25% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%),radial-gradient(900px 600px at 95% 20%, color-mix(in srgb, var(--accent2) 12%, transparent), transparent 70%),linear-gradient(180deg, var(--bg), #050507);color:var(--text)}
      a{color:inherit}
      .wrap{max-width:1100px;margin:0 auto;padding:28px 18px 90px}
      .topbar{position:sticky;top:0;z-index:30;backdrop-filter:blur(10px);background:color-mix(in srgb, var(--bg) 70%, transparent);border-bottom:1px solid rgba(255,255,255,.08)}
      .topbar-inner{max-width:1100px;margin:0 auto;padding:14px 18px;display:flex;align-items:center;gap:12px}
      .brand{display:flex;align-items:center;gap:10px;min-width:0}
      .logo{width:38px;height:38px;border-radius:14px;background:linear-gradient(180deg, var(--accent), var(--accent2));box-shadow:0 14px 40px rgba(0,0,0,.35)}
      .brand h1{font-size:14px;letter-spacing:.12em;text-transform:uppercase;margin:0;font-weight:900}
      .brand p{margin:0;margin-top:2px;color:var(--muted);font-size:12px}
      .grow{flex:1}
      .pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);padding:10px 12px;border-radius:999px;font-weight:800;font-size:12px;letter-spacing:.04em;transition:transform .15s ease, background .2s ease;user-select:none}
      .pill:active{transform:scale(.98)}
      .pill.primary{color:#061018;border-color:color-mix(in srgb, var(--accent) 55%, rgba(255,255,255,.15));background:linear-gradient(90deg, var(--accent), var(--accent2));box-shadow:0 18px 45px color-mix(in srgb, var(--accent) 22%, transparent)}
      .pill.ghost:hover{background:rgba(255,255,255,.07)}
      .hero{margin-top:20px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));border-radius:calc(var(--r) + 10px);box-shadow:var(--shadow);overflow:hidden;position:relative}
      .hero::before{content:"";position:absolute;inset:-2px;background:radial-gradient(500px 240px at 30% 0%, rgba(255,255,255,.08), transparent 70%);pointer-events:none}
      .hero-inner{padding:26px 18px 18px;display:grid;grid-template-columns:1.3fr .9fr;gap:18px;align-items:center}
      .tag{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.15);padding:8px 12px;border-radius:999px;font-weight:900;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:color-mix(in srgb, var(--accent) 70%, white)}
      .hero h2{margin:14px 0 10px;font-size:42px;line-height:1.05;letter-spacing:-.02em}
      .hero h2 span{background:linear-gradient(90deg,var(--accent),var(--accent2),#fff);-webkit-background-clip:text;background-clip:text;color:transparent}
      .hero p{margin:0;color:var(--muted);font-size:15px;line-height:1.55;max-width:52ch}
      .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
      .hero-card{border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);border-radius:calc(var(--r) + 8px);padding:16px}
      .stat{display:flex;gap:10px;align-items:center;margin-bottom:10px}
      .dot{width:10px;height:10px;border-radius:999px;background:var(--accent);box-shadow:0 0 0 6px color-mix(in srgb, var(--accent) 18%, transparent)}
      .stat b{font-size:13px}
      .stat small{display:block;color:var(--muted);margin-top:2px;font-weight:700}
      .grid{margin-top:18px;display:grid;grid-template-columns:repeat(3, 1fr);gap:14px}
      .section-title{margin-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
      .section-title h3{margin:0;font-size:22px;letter-spacing:-.01em}
      .section-title p{margin:6px 0 0;color:var(--muted);font-size:13px}
      .prod{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);border-radius:calc(var(--r) + 8px);overflow:hidden;box-shadow:0 18px 55px rgba(0,0,0,.35);display:flex;flex-direction:column;min-height:340px}
      .prod .img{aspect-ratio:4/3;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;position:relative}
      .prod img{width:100%;height:100%;object-fit:cover;display:block}
      .badge{position:absolute;left:12px;top:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35);padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
      .prod .body{padding:14px 14px 16px;display:flex;flex-direction:column;gap:10px;flex:1}
      .prod h3{margin:0;font-size:16px;letter-spacing:-.01em}
      .prod p{margin:0;color:var(--muted);font-size:13px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto}
      .price{font-size:16px;font-weight:900}
      .btn{cursor:pointer;border:none;border-radius:999px;padding:10px 12px;background:rgba(255,255,255,.06);color:var(--text);font-weight:900;font-size:12px;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,.10);transition:transform .15s ease, background .2s ease;display:inline-flex;align-items:center;gap:8px}
      .btn:hover{background:rgba(255,255,255,.09)}
      .btn:active{transform:scale(.99)}
      .btn.primary{color:#061018;background:linear-gradient(90deg, var(--accent), var(--accent2));border-color:color-mix(in srgb, var(--accent) 55%, rgba(255,255,255,.15))}
      .footer{margin-top:20px;color:var(--muted);font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .drawer{position:fixed;inset:0;display:none;z-index:100}
      .drawer.open{display:block}
      .backdrop{position:absolute;inset:0;background:rgba(0,0,0,.65)}
      .panel{position:absolute;right:0;top:0;height:100%;width:min(440px, 92vw);background:linear-gradient(180deg, rgba(17,24,39,.98), rgba(2,6,23,.98));border-left:1px solid rgba(255,255,255,.10);box-shadow:var(--shadow);padding:18px;display:flex;flex-direction:column}
      .panel h4{margin:6px 0 10px;font-size:16px;letter-spacing:.14em;text-transform:uppercase}
      .cart-items{flex:1;overflow:auto;padding-right:6px}
      .item{display:grid;grid-template-columns:64px 1fr auto;gap:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);border-radius:calc(var(--r) + 6px);padding:10px;margin-bottom:10px}
      .thumb{width:64px;height:64px;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.05)}
      .thumb img{width:100%;height:100%;object-fit:cover}
      .meta b{display:block;font-size:13px}
      .meta small{display:block;color:var(--muted);margin-top:4px}
      .qty{display:flex;align-items:center;gap:8px}
      .qty button{width:30px;height:30px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--text);cursor:pointer;font-weight:900}
      .qty span{min-width:18px;text-align:center;font-weight:900}
      .totals{border-top:1px solid rgba(255,255,255,.10);padding-top:12px;margin-top:12px}
      .totals-row{display:flex;align-items:center;justify-content:space-between;font-weight:900}
      .muted{color:var(--muted);font-weight:700}
      .checkout{margin-top:12px;display:grid;gap:10px}
      .modal{position:fixed;inset:0;display:none;z-index:120;align-items:center;justify-content:center;padding:18px}
      .modal.open{display:flex}
      .modal-card{width:min(520px, 96vw);border:1px solid rgba(255,255,255,.12);background:linear-gradient(180deg, rgba(15,23,42,.98), rgba(2,6,23,.98));border-radius:calc(var(--r) + 10px);box-shadow:var(--shadow);overflow:hidden}
      .modal-head{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.10);display:flex;align-items:center;justify-content:space-between}
      .modal-head b{letter-spacing:.16em;text-transform:uppercase;font-size:12px}
      .x{width:38px;height:38px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--text);cursor:pointer;font-weight:900}
      .modal-body{padding:18px;display:grid;gap:10px}
      .field{display:grid;gap:6px}
      .field label{font-size:12px;color:var(--muted);font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .field input,.field textarea{width:100%;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);padding:12px 12px;color:var(--text);outline:none;font-weight:700}
      .field textarea{min-height:88px;resize:vertical}
      .notice{font-size:12px;color:var(--muted);line-height:1.4}
      .success{display:none;border:1px solid color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,.12));background:color-mix(in srgb, var(--accent) 12%, rgba(255,255,255,.03));padding:14px;border-radius:18px;color:var(--text)}
      .success.show{display:block}
      .mobile-glow{display:none}
      @media (max-width:920px){.hero-inner{grid-template-columns:1fr}.hero h2{font-size:34px}.grid{grid-template-columns:repeat(2, 1fr)}}
      @media (max-width:560px){
        .grid{grid-template-columns:1fr}
        .topbar-inner{padding:12px 14px}
        .mobile-glow{display:block;position:fixed;left:-10%;right:-10%;bottom:-40px;height:220px;pointer-events:none;z-index:0;filter:blur(0px);background:radial-gradient(60% 80% at 50% 0%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 70%),radial-gradient(55% 70% at 70% 0%, color-mix(in srgb, var(--accent2) 40%, transparent), transparent 70%)}
      }
    </style>
  </head>
  <body>
    <div class="mobile-glow" aria-hidden="true"></div>
    <div class="topbar">
      <div class="topbar-inner">
        <div class="brand"><div class="logo" aria-hidden="true"></div><div class="min"><h1>${safeName}</h1><p>${safeTagline}</p></div></div>
        <div class="grow"></div>
        <button class="pill ghost" id="btnCart" type="button" aria-label="Abrir carrito">?? <span>${cartLabel}</span> <span id="cartCount">(0)</span></button>
        ${supportWhatsapp ? `<a class="pill primary" id="btnWhats" href="#" rel="noopener noreferrer">${primaryCta}</a>` : `<button class="pill primary" id="btnShop" type="button">${primaryCta}</button>`}
      </div>
    </div>

    <div class="wrap">
      <section class="hero"><div class="hero-inner"><div><span class="tag">${kicker}</span><h2>${heroTitle} <span>${heroAccent}</span>.</h2><p>${heroSubtitle}</p><div class="hero-actions"><button class="btn primary" id="btnHeroShop" type="button">${heroPrimaryButton}</button><button class="btn" id="btnHeroCart" type="button">${heroSecondaryButton}</button></div></div><div class="hero-card">${features
        .slice(0, 6)
        .map((f, i) => {
          const title = escapeHtml(String(f?.title || ""));
          const subtitle = escapeHtml(String(f?.subtitle || ""));
          const dotColor = f?.color ? String(f.color) : i === 0 ? "var(--accent)" : i === 1 ? "var(--accent2)" : "#a78bfa";
          const dotStyle = dotColor ? ` style="background:${escapeHtml(dotColor)}"` : "";
          return `<div class="stat"><span class="dot"${dotStyle}></span><div><b>${title || "Beneficio"}</b><small>${subtitle || "Descripcion"}</small></div></div>`;
        })
        .join("")}<p class="notice">${tipText}</p></div></div></section>
      <section>
        <div class="section-title">
          <div>
            <h3>${productsTitle}</h3>
            <p>${productsSubtitle}</p>
          </div>
        </div>
        <div class="grid" id="productsGrid" aria-live="polite"></div>
      </section>
      <div class="footer"><span>${footerLeft}</span><span class="muted">? ${new Date().getFullYear()} ${safeName}</span></div>
    </div>

    <div class="drawer" id="cartDrawer" aria-hidden="true"><div class="backdrop" id="drawerBackdrop"></div><aside class="panel" role="dialog" aria-modal="true" aria-label="${cartLabel}"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><h4>${cartLabel}</h4><button class="x" id="btnCloseCart" type="button" aria-label="Cerrar">?</button></div><div class="cart-items" id="cartItems"></div><div class="totals"><div class="totals-row"><span class="muted">Total</span><span id="cartTotal">0</span></div><div class="checkout"><button class="btn primary" id="btnCheckout" type="button">${checkoutButton}</button><button class="btn" id="btnContinue" type="button">${continueButton}</button></div></div></aside></div>

    <div class="modal" id="checkoutModal" aria-hidden="true"><div class="backdrop" id="modalBackdrop"></div><div class="modal-card" role="dialog" aria-modal="true" aria-label="Checkout"><div class="modal-head"><b>${checkoutTitle}</b><button class="x" id="btnCloseCheckout" type="button" aria-label="Cerrar">?</button></div><div class="modal-body"><div class="success" id="orderSuccess"><b>Pedido recibido</b><div style="margin-top:6px;color:var(--muted);font-weight:800;font-size:12px">Gracias. Te contactaremos para coordinar el pago y entrega.</div></div><div class="field"><label>Nombre</label><input id="cName" placeholder="Tu nombre" autocomplete="name"></div><div class="field"><label>Correo</label><input id="cEmail" placeholder="correo@ejemplo.com" autocomplete="email"></div><div class="field"><label>Telefono</label><input id="cPhone" placeholder="+51..." autocomplete="tel"></div><div class="field"><label>Direccion</label><textarea id="cAddress" placeholder="Distrito, direccion, referencias"></textarea></div><p class="notice" id="syncNotice">Intentaremos sincronizar tu pedido con Firebase.</p><button class="btn primary" id="btnPlaceOrder" type="button">Confirmar pedido</button></div></div></div>

    <script type="application/json" id="fpStoreData">${escapeHtml(JSON.stringify(storefrontData))}</script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    <script>
      (function(){
        const dataEl = document.getElementById('fpStoreData');
        const data = JSON.parse(dataEl.textContent || '{}');
        const storeId = String(data.storeId || '');
        const currency = String(data.currency || 'PEN');
        const products = Array.isArray(data.products) ? data.products : [];
        const money = (cents) => { const v = (Number(cents||0) / 100); try { return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(v); } catch { return (v.toFixed(2) + ' ' + currency); } };
        const cartKey = 'fp_cart_' + storeId;
        const loadCart = () => { try { return JSON.parse(localStorage.getItem(cartKey) || '[]'); } catch { return []; } };
        const saveCart = (items) => localStorage.setItem(cartKey, JSON.stringify(items));
        const getCount = (items) => items.reduce((a, it) => a + (it.qty||0), 0);
        const getTotal = (items) => items.reduce((a, it) => a + (it.qty||0) * (it.priceCents||0), 0);
        let cart = loadCart();
        const elGrid = document.getElementById('productsGrid');
        const elCartCount = document.getElementById('cartCount');
        const elDrawer = document.getElementById('cartDrawer');
        const elItems = document.getElementById('cartItems');
        const elTotal = document.getElementById('cartTotal');
        const elCheckout = document.getElementById('checkoutModal');
        const elSuccess = document.getElementById('orderSuccess');
        const elSyncNotice = document.getElementById('syncNotice');
        const openDrawer = () => { elDrawer.classList.add('open'); elDrawer.setAttribute('aria-hidden','false'); renderCart(); };
        const closeDrawer = () => { elDrawer.classList.remove('open'); elDrawer.setAttribute('aria-hidden','true'); };
        const openCheckout = () => { elCheckout.classList.add('open'); elCheckout.setAttribute('aria-hidden','false'); };
        const closeCheckout = () => { elCheckout.classList.remove('open'); elCheckout.setAttribute('aria-hidden','true'); };
        const upCount = () => { elCartCount.textContent = '(' + getCount(cart) + ')'; };
        const addToCart = (p) => { const idx = cart.findIndex(x => x.id === p.id); if (idx >= 0) cart[idx].qty += 1; else cart.push({ id: p.id, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl, qty: 1 }); saveCart(cart); upCount(); };
        const renderProducts = () => { if (!elGrid) return; if (!products.length) { elGrid.innerHTML = '<div class="hero-card" style="grid-column:1/-1"><b>No hay productos activos</b><p class="notice">Vuelve al editor y agrega productos para empezar.</p></div>'; return; }
          elGrid.innerHTML = products.map(p => { const badge = p.badge ? '<span class="badge">' + String(p.badge).replace(/</g,'&lt;') + '</span>' : ''; const img = p.imageUrl ? '<img src="' + String(p.imageUrl).replace(/"/g,'') + '" alt="" loading="lazy">' : '<div class="muted" style="font-weight:900">SIN IMAGEN</div>';
            return '<article class="prod"><div class="img">' + badge + img + '</div><div class="body"><h3>' + String(p.name).replace(/</g,'&lt;') + '</h3><p>' + String(p.description||'').replace(/</g,'&lt;') + '</p><div class="row"><span class="price">' + money(p.priceCents) + '</span><button class="btn primary" data-add="' + String(p.id).replace(/"/g,'') + '">Agregar</button></div></div></article>'; }).join('');
          elGrid.querySelectorAll('[data-add]').forEach(btn => { btn.addEventListener('click', () => { const id = btn.getAttribute('data-add'); const p = products.find(x => x.id === id); if (p) addToCart(p); }); });
        };
        const renderCart = () => { cart = loadCart(); upCount(); if (!cart.length) { elItems.innerHTML = '<div class="hero-card"><b>Tu carrito esta vacio</b><p class="notice">Agrega productos para continuar.</p></div>'; elTotal.textContent = money(0); return; }
          elItems.innerHTML = cart.map(it => { const img = it.imageUrl ? '<img src="' + String(it.imageUrl).replace(/"/g,'') + '" alt="">' : '';
            return '<div class="item"><div class="thumb">' + img + '</div><div class="meta"><b>' + String(it.name).replace(/</g,'&lt;') + '</b><small>' + money(it.priceCents) + '</small><div class="qty" data-id="' + String(it.id).replace(/"/g,'') + '"><button data-dec type="button">-</button><span>' + (it.qty||0) + '</span><button data-inc type="button">+</button></div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px"><b style="font-size:13px">' + money((it.qty||0) * (it.priceCents||0)) + '</b><button class="btn" style="padding:8px 10px" data-rm="' + String(it.id).replace(/"/g,'') + '" type="button">Quitar</button></div></div>'; }).join('');
          elItems.querySelectorAll('[data-rm]').forEach(btn => { btn.addEventListener('click', () => { const id = btn.getAttribute('data-rm'); cart = cart.filter(x => x.id !== id); saveCart(cart); renderCart(); }); });
          elItems.querySelectorAll('.qty').forEach(row => { const id = row.getAttribute('data-id'); row.querySelector('[data-dec]').addEventListener('click', () => { const idx = cart.findIndex(x => x.id === id); if (idx < 0) return; cart[idx].qty = Math.max(1, (cart[idx].qty||1) - 1); saveCart(cart); renderCart(); });
            row.querySelector('[data-inc]').addEventListener('click', () => { const idx = cart.findIndex(x => x.id === id); if (idx < 0) return; cart[idx].qty = (cart[idx].qty||1) + 1; saveCart(cart); renderCart(); }); });
          elTotal.textContent = money(getTotal(cart));
        };
        const btnWhats = document.getElementById('btnWhats');
        if (btnWhats && data.supportWhatsapp) { const msg = encodeURIComponent('Hola, estoy interesado en comprar. Mi carrito tiene ' + getCount(cart) + ' productos.'); btnWhats.setAttribute('href', 'https://wa.me/' + String(data.supportWhatsapp).replace(/\\D/g,'') + '?text=' + msg); btnWhats.setAttribute('target','_blank'); }
        document.getElementById('btnCart').addEventListener('click', openDrawer);
        document.getElementById('btnHeroCart').addEventListener('click', openDrawer);
        document.getElementById('btnCloseCart').addEventListener('click', closeDrawer);
        document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);
        document.getElementById('btnContinue').addEventListener('click', closeDrawer);
        document.getElementById('btnHeroShop').addEventListener('click', () => { closeDrawer(); document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth', block:'start' }); });
        document.getElementById('btnShop')?.addEventListener('click', () => { document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth', block:'start' }); });
        document.getElementById('btnCheckout').addEventListener('click', () => { renderCart(); if (!cart.length) return; elSuccess.classList.remove('show'); openCheckout(); });
        document.getElementById('btnCloseCheckout').addEventListener('click', closeCheckout);
        document.getElementById('modalBackdrop').addEventListener('click', closeCheckout);
        const firebaseCfg = ${JSON.stringify(firebaseConfig)};
        let firestore = null;
        try { firebase.initializeApp(firebaseCfg); firestore = firebase.firestore(); } catch (e) {}
        const placeOrder = async () => {
          cart = loadCart();
          if (!cart.length) return;
          const name = (document.getElementById('cName').value || '').trim();
          const email = (document.getElementById('cEmail').value || '').trim();
          const phone = (document.getElementById('cPhone').value || '').trim();
          const address = (document.getElementById('cAddress').value || '').trim();
          if (!name || !phone) { alert('Completa tu nombre y telefono.'); return; }
          const order = { storeId, createdAt: Date.now(), status: 'new', currency, totals: { items: getCount(cart), totalCents: getTotal(cart) }, customer: { name, email, phone, address }, items: cart.map(it => ({ id: it.id, name: it.name, priceCents: it.priceCents, qty: it.qty, imageUrl: it.imageUrl || '' })), source: 'storefront' };
          let synced = false;
          if (firestore) { try { await firestore.collection('store_orders').add(order); synced = true; } catch (e) { synced = false; } }
          try { const key = 'fp_orders_' + storeId; const prev = JSON.parse(localStorage.getItem(key) || '[]'); prev.unshift(order); localStorage.setItem(key, JSON.stringify(prev.slice(0, 50))); } catch {}
          elSyncNotice.textContent = synced ? 'Pedido sincronizado con Firebase.' : 'No se pudo sincronizar con Firebase. Tu pedido se guardo localmente.';
          elSuccess.classList.add('show');
          cart = []; saveCart(cart); renderCart(); upCount();
        };
        document.getElementById('btnPlaceOrder').addEventListener('click', placeOrder);
        renderProducts(); upCount();
      })();
    </script>
  </body>
</html>`;
};
