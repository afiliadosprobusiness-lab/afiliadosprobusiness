export interface TemplateOptions {
  category: string;
  specialty: string;
  businessName?: string;
}

type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  panel: string;
  text: string;
  muted: string;
};

type TemplateSeed = {
  category: string;
  specialty: string;
  categoryLabel: string;
  specialtyLabel: string;
  voice: string;
  image: string;
  theme: keyof typeof themeByKey;
};

const PHONE_PLACEHOLDER = "51999999999";

const themeByKey = {
  red: {
    primary: "#e53935",
    secondary: "#8e0000",
    accent: "#ffcc00",
    surface: "#09080b",
    panel: "#151018",
    text: "#f8f7ff",
    muted: "#c2b6c7",
  },
  warm: {
    primary: "#d97706",
    secondary: "#92400e",
    accent: "#fbbf24",
    surface: "#0c0b0f",
    panel: "#17131a",
    text: "#fffaf3",
    muted: "#d7c6ad",
  },
  cyan: {
    primary: "#06b6d4",
    secondary: "#1d4ed8",
    accent: "#22d3ee",
    surface: "#05070b",
    panel: "#0f1623",
    text: "#f3f9ff",
    muted: "#b7c8dc",
  },
  violet: {
    primary: "#8b5cf6",
    secondary: "#4c1d95",
    accent: "#a78bfa",
    surface: "#07060d",
    panel: "#151127",
    text: "#f6f3ff",
    muted: "#c6bce2",
  },
  green: {
    primary: "#22c55e",
    secondary: "#166534",
    accent: "#4ade80",
    surface: "#05080a",
    panel: "#101a17",
    text: "#f4fff7",
    muted: "#b9d7c5",
  },
  office: {
    primary: "#0f172a",
    secondary: "#334155",
    accent: "#eab308",
    surface: "#070809",
    panel: "#13161c",
    text: "#f8fafc",
    muted: "#c8d0da",
  },
  beauty: {
    primary: "#ec4899",
    secondary: "#be185d",
    accent: "#f9a8d4",
    surface: "#0b080b",
    panel: "#1b1220",
    text: "#fff6fd",
    muted: "#e0bfd8",
  },
  blue: {
    primary: "#2563eb",
    secondary: "#1e3a8a",
    accent: "#38bdf8",
    surface: "#05070b",
    panel: "#111a2a",
    text: "#f4f8ff",
    muted: "#bfcde1",
  },
} satisfies Record<string, Theme>;

const seeds: TemplateSeed[] = [
  { category: "restaurant", specialty: "pizzeria", categoryLabel: "Restaurante", specialtyLabel: "Pizzeria", voice: "delivery rapido y ticket promedio alto", image: "https://source.unsplash.com/1200x800/?pizza,restaurant", theme: "red" },
  { category: "restaurant", specialty: "criolla", categoryLabel: "Restaurante", specialtyLabel: "Comida criolla", voice: "sabor tradicional con reservas por turno", image: "https://source.unsplash.com/1200x800/?peruvian-food", theme: "warm" },
  { category: "restaurant", specialty: "china", categoryLabel: "Restaurante", specialtyLabel: "Comida china", voice: "combos familiares y takeout diario", image: "https://source.unsplash.com/1200x800/?chinese-food,restaurant", theme: "red" },
  { category: "restaurant", specialty: "anticuchos", categoryLabel: "Restaurante", specialtyLabel: "Anticucheria", voice: "ventas nocturnas y pedidos directos", image: "https://source.unsplash.com/1200x800/?grill,skewers", theme: "red" },
  { category: "restaurant", specialty: "sushi", categoryLabel: "Restaurante", specialtyLabel: "Sushi / japonesa", voice: "experiencia premium con reservas", image: "https://source.unsplash.com/1200x800/?sushi,restaurant", theme: "beauty" },
  { category: "restaurant", specialty: "cafe", categoryLabel: "Restaurante", specialtyLabel: "Cafeteria", voice: "clientes recurrentes y brunch", image: "https://source.unsplash.com/1200x800/?coffee-shop,cafe", theme: "warm" },

  { category: "tech", specialty: "saas", categoryLabel: "Tecnologia", specialtyLabel: "SaaS / software", voice: "pipeline B2B y demos calificadas", image: "https://source.unsplash.com/1200x800/?saas,dashboard", theme: "cyan" },
  { category: "tech", specialty: "app", categoryLabel: "Tecnologia", specialtyLabel: "App mobile", voice: "descargas e onboarding rapido", image: "https://source.unsplash.com/1200x800/?mobile-app,smartphone", theme: "blue" },
  { category: "tech", specialty: "agency", categoryLabel: "Tecnologia", specialtyLabel: "Agencia digital", voice: "servicios de performance y branding", image: "https://source.unsplash.com/1200x800/?digital-agency,team", theme: "violet" },
  { category: "tech", specialty: "startup", categoryLabel: "Tecnologia", specialtyLabel: "Startup", voice: "validacion de mercado y traccion", image: "https://source.unsplash.com/1200x800/?startup,technology", theme: "green" },

  { category: "office", specialty: "realestate", categoryLabel: "Oficina / corporativo", specialtyLabel: "Inmobiliaria", voice: "leads de compra y alquiler", image: "https://source.unsplash.com/1200x800/?real-estate,building", theme: "blue" },
  { category: "office", specialty: "law", categoryLabel: "Oficina / corporativo", specialtyLabel: "Abogados", voice: "consultas legales de alto valor", image: "https://source.unsplash.com/1200x800/?law,office", theme: "office" },
  { category: "office", specialty: "consulting", categoryLabel: "Oficina / corporativo", specialtyLabel: "Consultoria", voice: "reuniones de diagnostico y cierre", image: "https://source.unsplash.com/1200x800/?consulting,business", theme: "cyan" },
  { category: "office", specialty: "medical", categoryLabel: "Oficina / corporativo", specialtyLabel: "Clinica / medica", voice: "agenda de pacientes y confianza", image: "https://source.unsplash.com/1200x800/?medical,clinic", theme: "green" },

  { category: "beauty", specialty: "spa", categoryLabel: "Salud y belleza", specialtyLabel: "Spa / estetica", voice: "reservas de experiencias wellness", image: "https://source.unsplash.com/1200x800/?spa,wellness", theme: "beauty" },
  { category: "beauty", specialty: "gym", categoryLabel: "Salud y belleza", specialtyLabel: "Gimnasio / crossfit", voice: "captacion de membresias activas", image: "https://source.unsplash.com/1200x800/?gym,fitness", theme: "green" },
  { category: "beauty", specialty: "yoga", categoryLabel: "Salud y belleza", specialtyLabel: "Yoga / pilates", voice: "clases y comunidad de bienestar", image: "https://source.unsplash.com/1200x800/?yoga,pilates", theme: "violet" },
  { category: "beauty", specialty: "barber", categoryLabel: "Salud y belleza", specialtyLabel: "Barberia / salon", voice: "agenda de citas y fidelizacion", image: "https://source.unsplash.com/1200x800/?barber,salon", theme: "warm" },

  { category: "education", specialty: "course", categoryLabel: "Educacion", specialtyLabel: "Curso online", voice: "inscripciones digitales y conversion", image: "https://source.unsplash.com/1200x800/?online-course,learning", theme: "blue" },
  { category: "education", specialty: "school", categoryLabel: "Educacion", specialtyLabel: "Colegio / nido", voice: "captacion de matriculas y visitas", image: "https://source.unsplash.com/1200x800/?school,classroom", theme: "blue" },
  { category: "education", specialty: "tutor", categoryLabel: "Educacion", specialtyLabel: "Profesor particular", voice: "clases personalizadas por agenda", image: "https://source.unsplash.com/1200x800/?tutor,student", theme: "green" },
  { category: "education", specialty: "language", categoryLabel: "Educacion", specialtyLabel: "Idiomas", voice: "prueba de nivel y matricula", image: "https://source.unsplash.com/1200x800/?language-learning", theme: "violet" },

  { category: "ecommerce", specialty: "fashion", categoryLabel: "E-commerce", specialtyLabel: "Moda / ropa", voice: "catalogo de temporada y venta directa", image: "https://source.unsplash.com/1200x800/?fashion,store", theme: "beauty" },
  { category: "ecommerce", specialty: "tech", categoryLabel: "E-commerce", specialtyLabel: "Tecnologia", voice: "gadgets con confianza y soporte", image: "https://source.unsplash.com/1200x800/?gadgets,technology-store", theme: "cyan" },
  { category: "ecommerce", specialty: "pets", categoryLabel: "E-commerce", specialtyLabel: "Mascotas", voice: "recompra con promociones pet", image: "https://source.unsplash.com/1200x800/?pet-store,dog", theme: "green" },
  { category: "ecommerce", specialty: "home", categoryLabel: "E-commerce", specialtyLabel: "Hogar y deco", voice: "colecciones por ambiente y bundles", image: "https://source.unsplash.com/1200x800/?home-decor,interior", theme: "cyan" },

  { category: "services", specialty: "plumber", categoryLabel: "Oficios / servicios", specialtyLabel: "Gasfitero / plomero", voice: "respuesta urgente 24/7", image: "https://source.unsplash.com/1200x800/?plumber,repair", theme: "blue" },
  { category: "services", specialty: "electrician", categoryLabel: "Oficios / servicios", specialtyLabel: "Electricista", voice: "instalaciones seguras y garantia", image: "https://source.unsplash.com/1200x800/?electrician,repair", theme: "warm" },
  { category: "services", specialty: "cleaning", categoryLabel: "Oficios / servicios", specialtyLabel: "Limpieza", voice: "planes recurrentes para hogar y empresa", image: "https://source.unsplash.com/1200x800/?cleaning,service", theme: "cyan" },
  { category: "services", specialty: "mechanic", categoryLabel: "Oficios / servicios", specialtyLabel: "Mecanico", voice: "diagnostico y mantenimiento automotriz", image: "https://source.unsplash.com/1200x800/?mechanic,car", theme: "red" },

  { category: "creative", specialty: "photography", categoryLabel: "Creativo / eventos", specialtyLabel: "Fotografia", voice: "reservas de sesiones premium", image: "https://source.unsplash.com/1200x800/?photography,studio", theme: "violet" },
  { category: "creative", specialty: "music", categoryLabel: "Creativo / eventos", specialtyLabel: "Musica / DJ", voice: "bookings para eventos y shows", image: "https://source.unsplash.com/1200x800/?dj,music-event", theme: "violet" },
  { category: "creative", specialty: "wedding", categoryLabel: "Creativo / eventos", specialtyLabel: "Wedding planner", voice: "experiencias de boda personalizadas", image: "https://source.unsplash.com/1200x800/?wedding,planner", theme: "beauty" },
  { category: "creative", specialty: "portfolio", categoryLabel: "Creativo / eventos", specialtyLabel: "Portafolio personal", voice: "marca personal y proyectos destacados", image: "https://source.unsplash.com/1200x800/?portfolio,designer", theme: "blue" },
];

const seedMap = new Map<string, TemplateSeed>(seeds.map((s) => [`${s.category}:${s.specialty}`, s]));

const aliases = new Map<string, string>([
  ["restaurant:comida-criolla", "restaurant:criolla"],
  ["restaurant:comida-china", "restaurant:china"],
  ["restaurant:cafeteria", "restaurant:cafe"],
  ["restaurant:comida-rapida", "restaurant:pizzeria"],
  ["restaurant:comida-saludable", "restaurant:cafe"],
]);

function esc(v: string): string {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSeed(category: string, specialty: string): TemplateSeed {
  const key = `${category.trim().toLowerCase()}:${specialty.trim().toLowerCase()}`;
  const alias = aliases.get(key);
  const found = seedMap.get(alias || key);
  if (found) return found;
  return {
    category,
    specialty,
    categoryLabel: "Negocio",
    specialtyLabel: specialty || "Especialidad",
    voice: "captacion comercial y conversion",
    image: "https://source.unsplash.com/1200x800/?business,landing-page",
    theme: "cyan",
  };
}

function offers(label: string): string[] {
  return [`${label} Base`, `${label} Premium`, `${label} Full Conversion`];
}

function highlights(label: string): string[] {
  return [
    `Modelo especializado para ${label.toLowerCase()}`,
    "Bloques orientados a ventas y confianza",
    "Edicion total y publicacion inmediata",
  ];
}

function galleryUrls(label: string): string[] {
  const q = encodeURIComponent(label);
  return [
    `https://source.unsplash.com/640x420/?${q},business`,
    `https://source.unsplash.com/640x420/?${q},service`,
    `https://source.unsplash.com/640x420/?${q},professional`,
  ];
}

function buildHtml(seed: TemplateSeed, businessName: string): string {
  const safeBusiness = esc(businessName);
  const theme = themeByKey[seed.theme];
  const waText = encodeURIComponent(`Hola, quiero informacion de ${seed.specialtyLabel}.`);
  const waHref = `https://wa.me/${PHONE_PLACEHOLDER}?text=${waText}`;
  const offerItems = offers(seed.specialtyLabel)
    .map(
      (name, index) => `
      <article class="offer-card">
        <span class="offer-index">0${index + 1}</span>
        <h3>${esc(name)}</h3>
        <p>Oferta optimizada para ${esc(seed.voice)}.</p>
      </article>`
    )
    .join("");
  const highlightItems = highlights(seed.specialtyLabel)
    .map((item) => `<li><span class="dot"></span><span>${esc(item)}</span></li>`)
    .join("");
  const galleryItems = galleryUrls(seed.specialtyLabel)
    .map((url, index) => `<figure class="gallery-item"><img src="${url}" alt="${esc(seed.specialtyLabel)} visual ${index + 1}" loading="lazy" /></figure>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeBusiness} | ${esc(seed.specialtyLabel)}</title>
  <style>
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --surface: ${theme.surface};
      --panel: ${theme.panel};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --line: color-mix(in srgb, var(--accent) 28%, transparent);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Inter, Arial, sans-serif;
      background: radial-gradient(85vw 60vh at 0% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 65%), radial-gradient(65vw 45vh at 100% 100%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 62%), var(--surface);
      color: var(--text);
      line-height: 1.5;
    }
    .shell { width: min(1160px, 92vw); margin: 0 auto; padding: 24px 0 88px; }
    .nav { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 10px 0 22px; }
    .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: clamp(20px, 2vw, 28px); }
    .brand-mark { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(140deg, var(--primary), var(--accent)); }
    .nav-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 42px; padding: 0 18px; border-radius: 999px;
      border: 1px solid var(--line); font-weight: 700; font-size: 14px;
      background: transparent; color: var(--text); text-decoration: none;
      transition: transform .2s ease;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { border-color: transparent; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
    .hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; margin-top: 8px; }
    .panel { border: 1px solid var(--line); border-radius: 24px; background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 7%, transparent), transparent 40%), var(--panel); }
    .hero-main { padding: 30px; }
    .badge {
      display: inline-flex; border: 1px solid var(--line); border-radius: 999px;
      background: color-mix(in srgb, var(--primary) 18%, transparent);
      color: var(--accent); padding: 7px 12px; font-size: 12px; font-weight: 800;
      text-transform: uppercase; margin-bottom: 14px;
    }
    h1 { margin: 0 0 10px; font-size: clamp(34px, 4.2vw, 56px); line-height: 1.05; }
    .sub { margin: 0 0 22px; color: var(--muted); font-size: clamp(15px, 1.3vw, 19px); max-width: 60ch; }
    .bullets { list-style: none; padding: 0; margin: 0 0 24px; display: grid; gap: 8px; color: var(--muted); }
    .bullets li { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; }
    .dot { width: 8px; height: 8px; border-radius: 999px; background: linear-gradient(180deg, var(--accent), var(--primary)); }
    .hero-cta { display: flex; gap: 10px; flex-wrap: wrap; }
    .hero-side { padding: 18px; display: grid; gap: 12px; align-content: start; }
    .hero-img { border-radius: 18px; overflow: hidden; border: 1px solid var(--line); min-height: 320px; }
    .hero-img img { width: 100%; height: 100%; min-height: 320px; object-fit: cover; display: block; }
    .hero-side .meta { border: 1px solid var(--line); border-radius: 16px; padding: 14px; color: var(--muted); font-size: 14px; }
    .section { margin-top: 16px; padding: 22px; }
    .section h2 { margin: 0 0 8px; font-size: clamp(26px, 2.5vw, 36px); }
    .section p.lead { margin: 0 0 18px; color: var(--muted); max-width: 72ch; }
    .offers, .gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .offer-card { border: 1px solid var(--line); border-radius: 16px; padding: 14px; background: color-mix(in srgb, var(--surface) 40%, transparent); }
    .offer-index { display: inline-flex; width: 28px; height: 28px; border-radius: 999px; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: white; background: linear-gradient(140deg, var(--secondary), var(--primary)); margin-bottom: 8px; }
    .offer-card h3 { margin: 0 0 6px; font-size: 18px; }
    .offer-card p { margin: 0; color: var(--muted); font-size: 14px; }
    .gallery-item { margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); min-height: 160px; }
    .gallery-item img { display: block; width: 100%; height: 100%; min-height: 160px; object-fit: cover; }
    .faq-item { border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--surface) 30%, transparent); padding: 0 14px; margin-bottom: 10px; }
    .faq-item summary { list-style: none; cursor: pointer; font-weight: 700; padding: 14px 0; }
    .faq-item p { margin: 0 0 14px; color: var(--muted); }
    .cta-band {
      margin-top: 16px; padding: 24px; border-radius: 24px; text-align: center;
      border: 1px solid transparent;
      background: linear-gradient(var(--panel), var(--panel)) padding-box, linear-gradient(130deg, var(--primary), var(--accent), var(--secondary)) border-box;
    }
    .cta-band h2 { margin: 0 0 8px; font-size: clamp(28px, 3.2vw, 42px); }
    .cta-band p { margin: 0 0 16px; color: var(--muted); }
    footer { margin-top: 18px; color: var(--muted); text-align: center; font-size: 13px; padding: 20px 6px 0; }
    .wa-widget {
      position: fixed; right: 18px; bottom: 18px; width: 58px; height: 58px;
      border-radius: 999px; border: 1px solid color-mix(in srgb, #25d366 40%, transparent);
      background: linear-gradient(140deg, #1faa4a, #25d366); color: #08220f;
      display: inline-flex; align-items: center; justify-content: center; font-size: 28px;
      box-shadow: 0 14px 24px rgba(0,0,0,.35); z-index: 50; text-decoration: none;
    }
    @media (max-width: 980px) { .hero { grid-template-columns: 1fr; } .offers, .gallery { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 680px) { .shell { width: 94vw; padding-top: 14px; } .hero-main { padding: 20px; } .section { padding: 16px; } .offers, .gallery { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="shell">
    <nav class="nav">
      <div class="brand"><span class="brand-mark"></span><span>${safeBusiness}</span></div>
      <div class="nav-actions">
        <a class="btn" href="#faq">Preguntas</a>
        <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener noreferrer">Contactar ahora</a>
      </div>
    </nav>

    <section class="hero">
      <article class="panel hero-main">
        <span class="badge">${esc(seed.categoryLabel)} - ${esc(seed.specialtyLabel)}</span>
        <h1>Landing para ${esc(seed.specialtyLabel)} con ${esc(seed.voice)}</h1>
        <p class="sub">Modelo profesional listo para editar y publicar. Incluye estructura de ventas, FAQ y widget de WhatsApp.</p>
        <ul class="bullets">${highlightItems}</ul>
        <div class="hero-cta">
          <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener noreferrer">Pedir informacion</a>
          <a class="btn" href="#ofertas">Ver oferta</a>
        </div>
      </article>
      <aside class="panel hero-side">
        <div class="hero-img"><img src="${seed.image}" alt="${esc(seed.specialtyLabel)} ${safeBusiness}" loading="eager" /></div>
        <div class="meta"><strong>${esc(seed.categoryLabel)} - ${esc(seed.specialtyLabel)}</strong><br />Optimizada para conversion y atencion al cliente.</div>
      </aside>
    </section>

    <section id="ofertas" class="panel section">
      <h2>Oferta comercial</h2>
      <p class="lead">Bloques de venta para captar leads y cerrar clientes en menos pasos.</p>
      <div class="offers">${offerItems}</div>
    </section>

    <section class="panel section">
      <h2>Galeria profesional</h2>
      <p class="lead">Imagenes de referencia para tu categoria. Puedes cambiar todas en el editor.</p>
      <div class="gallery">${galleryItems}</div>
    </section>

    <section id="faq" class="panel section">
      <h2>Preguntas frecuentes</h2>
      <p class="lead">Respuestas listas para reducir friccion en la decision de compra.</p>
      <details class="faq-item"><summary>Como funciona esta landing para mi negocio?</summary><p>Esta plantilla esta optimizada para ${esc(seed.specialtyLabel.toLowerCase())} con estructura de conversion y contacto directo por WhatsApp.</p></details>
      <details class="faq-item"><summary>Puedo editar textos, colores e imagenes?</summary><p>Si. Puedes editar toda la pagina desde el editor visual y guardar cambios en segundos.</p></details>
      <details class="faq-item"><summary>Sirve para captar clientes desde redes?</summary><p>Si. Esta diseñada para trafico de redes, anuncios y visitas organicas con llamados de accion claros.</p></details>
    </section>

    <section class="cta-band">
      <h2>Activa tu canal de ventas hoy</h2>
      <p>Plantilla editable para escalar tu categoria con contacto directo por WhatsApp.</p>
      <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener noreferrer">Hablar por WhatsApp</a>
    </section>

    <footer>
      <div>${safeBusiness} | Categoria: ${esc(seed.categoryLabel)} | Especialidad: ${esc(seed.specialtyLabel)}</div>
      <div>Plantilla editable generada con FastPage.</div>
    </footer>
  </main>

  <a class="wa-widget" href="${waHref}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">W</a>
</body>
</html>`;
}

export class TemplateGenerator {
  public static generate(options: TemplateOptions): string {
    const category = (options.category || "").trim().toLowerCase();
    const specialty = (options.specialty || "").trim().toLowerCase();
    const seed = getSeed(category, specialty);
    const businessName = options.businessName?.trim() || `${seed.specialtyLabel} Pro`;
    return buildHtml(seed, businessName);
  }
}

