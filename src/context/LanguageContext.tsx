"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.builder": { es: "Constructor", en: "Builder" },
  "nav.templates": { es: "Plantillas", en: "Templates" },
  "nav.cloner": { es: "Clonador", en: "Cloner" },
  "nav.hub": { es: "Hub", en: "Hub" },
  "nav.login": { es: "Iniciar Sesión", en: "Login" },
  "nav.create_account": { es: "Crear Cuenta", en: "Create Account" },
  "nav.start_now": { es: "Comenzar Ahora", en: "Start Now" },
  "nav.features": { es: "Características", en: "Features" },
  "nav.pricing": { es: "Precios", en: "Pricing" },
  "nav.testimonials": { es: "Testimonios", en: "Testimonials" },
  "nav.logout": { es: "Cerrar Sesión", en: "Logout" },

  // Hero
  "hero.tag": { es: "Edición Deluxe v2.0", en: "Deluxe Edition v2.0" },
  "hero.title_start": { es: "Crea y Clona", en: "Create & Clone" },
  "hero.title_highlight": { es: "Landing Pages", en: "Landing Pages" },
  "hero.subtitle_start": {
    es: "Deja de perder tiempo.",
    en: "Stop wasting time.",
  },
  "hero.subtitle_highlight": {
    es: "Crea páginas que venden",
    en: "Create pages that sell",
  },
  "hero.subtitle_end_1": {
    es: "o clona el éxito de tu competencia en segundos.",
    en: "or clone your competition's success in seconds.",
  },
  "hero.subtitle_end_highlight": {
    es: "Sin código, resultados profesionales al instante.",
    en: "No code, professional results instantly.",
  },
  "hero.cta_create": { es: "Crear Landing", en: "Create Landing" },
  "hero.cta_clone": { es: "Clonar Página", en: "Clone Page" },
  "hero.payments": { es: "Métodos de Pago", en: "Payment Methods" },
  "testimonials.title": {
    es: "Lo que dicen nuestros usuarios",
    en: "What our users say",
  },
  "testimonials.subtitle": {
    es: "Únete a cientos de creadores que ya están construyendo el futuro de la web.",
    en: "Join hundreds of creators who are already building the future of the web.",
  },
  "testimonials.pedro.role": { es: "COPYWRITER", en: "COPYWRITER" },
  "testimonials.pedro.text": {
    es: "La mejor inversión para mi agencia. Puedo validar copys en diseños reales al instante.",
    en: "The best investment for my agency. I can validate copy in real designs instantly.",
  },
  "testimonials.ana.role": {
    es: "DIRECTORA DE MARKETING",
    en: "MARKETING DIRECTOR",
  },
  "testimonials.ana.text": {
    es: "La velocidad de carga y la facilidad de uso son incomparables. Aumentó mi conversión un 40%.",
    en: "Load speed and ease of use are incomparable. Increased my conversion by 40%.",
  },
  "testimonials.carlos.role": { es: "FREELANCER", en: "FREELANCER" },
  "testimonials.carlos.text": {
    es: "Pude clonar la landing de mi competencia y mejorarla en minutos. ¡Increíble herramienta!",
    en: "I was able to clone my competitor's landing page and improve it in minutes. Amazing tool!",
  },
  "testimonials.sofia.role": { es: "DISEÑADORA UX", en: "UX DESIGNER" },
  "testimonials.sofia.text": {
    es: "La flexibilidad del editor me permite crear experiencias únicas sin tocar código.",
    en: "The editor's flexibility allows me to create unique experiences without touching code.",
  },
  "testimonials.diego.role": { es: "EMPRENDEDOR", en: "ENTREPRENEUR" },
  "testimonials.diego.text": {
    es: "Lancé mi MVP en un fin de semana gracias a Fast Page. Los inversores quedaron impresionados.",
    en: "I launched my MVP in a weekend thanks to Fast Page. Investors were impressed.",
  },
  "testimonials.laura.role": { es: "BLOGGER", en: "BLOGGER" },
  "testimonials.laura.text": {
    es: "Mis lectores adoran el nuevo diseño de mi blog. Fue tan fácil como elegir una plantilla.",
    en: "My readers love my blog's new design. It was as easy as choosing a template.",
  },
  "testimonials.javier.role": { es: "CONSULTOR SEO", en: "SEO CONSULTANT" },
  "testimonials.javier.text": {
    es: "El código generado es limpio y rápido, lo que ha mejorado enormemente mi ranking en Google.",
    en: "The generated code is clean and fast, which has greatly improved my Google ranking.",
  },
  "testimonials.elena.role": { es: "PROJECT MANAGER", en: "PROJECT MANAGER" },
  "testimonials.elena.text": {
    es: "Gestionar múltiples proyectos nunca fue tan sencillo. Fast Page es mi herramienta diaria.",
    en: "Managing multiple projects has never been easier. Fast Page is my daily tool.",
  },
  "testimonials.miguel.role": { es: "DESARROLLADOR", en: "DEVELOPER" },
  "testimonials.miguel.text": {
    es: "Aunque sé programar, esto me ahorra horas de trabajo repetitivo. ¡Simplemente genial!",
    en: "Even though I know how to code, this saves me hours of repetitive work. Simply great!",
  },
  "testimonials.carmen.role": { es: "AGENCIA DIGITAL", en: "DIGITAL AGENCY" },
  "testimonials.carmen.text": {
    es: "Hemos escalado nuestra producción de landings x10 sin contratar más personal.",
    en: "We have scaled our landing page production x10 without hiring more staff.",
  },

  // Cloner Business Models
  "cloner.title": {
    es: "Selecciona tu Modelo de Negocio",
    en: "Select Your Business Model",
  },
  "cloner.subtitle": {
    es: "Elige una plantilla base optimizada para tu industria.",
    en: "Choose a base template optimized for your industry.",
  },
  "cloner.restaurant.title": { es: "Restaurante", en: "Restaurant" },
  "cloner.restaurant.desc": {
    es: "Menús digitales, reservas y pedidos online. Diseño apetitoso.",
    en: "Digital menus, reservations, and online orders. Appetizing design.",
  },
  "cloner.tech.title": { es: "Tecnología", en: "Technology" },
  "cloner.tech.desc": {
    es: "SaaS, Apps y Startups. Moderno, limpio y futurista.",
    en: "SaaS, Apps, and Startups. Modern, clean, and futuristic.",
  },
  "cloner.office.title": {
    es: "Oficina / Corporativo",
    en: "Office / Corporate",
  },
  "cloner.office.desc": {
    es: "Consultoría, legal y servicios. Profesional y confiable.",
    en: "Consulting, legal, and services. Professional and reliable.",
  },
  "cloner.select": { es: "Seleccionar Modelo", en: "Select Model" },
  "cloner.back": { es: "Volver a Modelos", en: "Back to Models" },

  // Cloner Subcategories
  "cloner.restaurant.pizzeria": { es: "Pizzería", en: "Pizzeria" },
  "cloner.restaurant.criolla": { es: "Comida Criolla", en: "Creole Food" },
  "cloner.restaurant.china": { es: "Comida China", en: "Chinese Food" },
  "cloner.restaurant.anticuchos": { es: "Anticuchos", en: "Anticuchos" },
  "cloner.restaurant.sushi": { es: "Sushi / Japonesa", en: "Sushi / Japanese" },
  "cloner.restaurant.cafe": { es: "Cafetería", en: "Coffee Shop" },

  "cloner.tech.saas": { es: "SaaS / Software", en: "SaaS / Software" },
  "cloner.tech.app": { es: "App Mobile", en: "Mobile App" },
  "cloner.tech.agency": { es: "Agencia Digital", en: "Digital Agency" },
  "cloner.tech.startup": { es: "Startup", en: "Startup" },

  "cloner.office.realestate": { es: "Inmobiliaria", en: "Real Estate" },
  "cloner.office.law": { es: "Abogados", en: "Law Firm" },
  "cloner.office.consulting": { es: "Consultoría", en: "Consulting" },
  "cloner.office.medical": { es: "Clínica / Médica", en: "Clinic / Medical" },

  // New Models
  "cloner.beauty.title": { es: "Salud y Belleza", en: "Health & Beauty" },
  "cloner.beauty.desc": { es: "Spas, gimnasios y bienestar. Relajante y vital.", en: "Spas, gyms, and wellness. Relaxing and vital." },
  "cloner.education.title": { es: "Educación", en: "Education" },
  "cloner.education.desc": { es: "Cursos, academias y tutores. Educativo y claro.", en: "Courses, academies, and tutors. Educational and clear." },
  "cloner.ecommerce.title": { es: "E-commerce", en: "E-commerce" },
  "cloner.ecommerce.desc": { es: "Tiendas online y catálogos. Ventas directas.", en: "Online stores and catalogs. Direct sales." },
  "cloner.services.title": { es: "Oficios / Servicios", en: "Trades / Services" },
  "cloner.services.desc": { es: "Técnicos, hogar y reparaciones. Práctico.", en: "Technicians, home, and repairs. Practical." },
  "cloner.creative.title": { es: "Creativo / Eventos", en: "Creative / Events" },
  "cloner.creative.desc": { es: "Portafolios, música y bodas. Artístico.", en: "Portfolios, music, and weddings. Artistic." },

  // New Subcategories
  "cloner.beauty.spa": { es: "Spa / Estética", en: "Spa / Aesthetics" },
  "cloner.beauty.gym": { es: "Gimnasio / Crossfit", en: "Gym / Crossfit" },
  "cloner.beauty.yoga": { es: "Yoga / Pilates", en: "Yoga / Pilates" },
  "cloner.beauty.barber": { es: "Barbería / Salón", en: "Barber / Salon" },
  
  "cloner.education.course": { es: "Curso Online", en: "Online Course" },
  "cloner.education.school": { es: "Colegio / Nido", en: "School / Kindergarten" },
  "cloner.education.tutor": { es: "Profesor Particular", en: "Private Tutor" },
  "cloner.education.language": { es: "Idiomas", en: "Languages" },

  "cloner.ecommerce.fashion": { es: "Moda / Ropa", en: "Fashion / Clothing" },
  "cloner.ecommerce.tech": { es: "Tecnología", en: "Technology" },
  "cloner.ecommerce.pets": { es: "Mascotas", en: "Pets" },
  "cloner.ecommerce.home": { es: "Hogar y Deco", en: "Home & Decor" },

  "cloner.services.plumber": { es: "Gasfitero / Plomero", en: "Plumber" },
  "cloner.services.electrician": { es: "Electricista", en: "Electrician" },
  "cloner.services.cleaning": { es: "Limpieza", en: "Cleaning" },
  "cloner.services.mechanic": { es: "Mecánico", en: "Mechanic" },

  "cloner.creative.photography": { es: "Fotografía", en: "Photography" },
  "cloner.creative.music": { es: "Música / DJ", en: "Music / DJ" },
  "cloner.creative.wedding": { es: "Wedding Planner", en: "Wedding Planner" },
  "cloner.creative.portfolio": { es: "Portafolio Personal", en: "Personal Portfolio" },

  // Hub
  "hub.welcome": { es: "Bienvenido de nuevo,", en: "Welcome back," },
  "hub.subtitle": {
    es: "Tu centro de control creativo.",
    en: "Your creative command center.",
  },
  "hub.builder.title": { es: "Constructor", en: "Builder" },
  "hub.builder.desc": {
    es: "Crea landing pages desde cero con nuestro editor visual arrastrar y soltar.",
    en: "Create landing pages from scratch with our drag and drop visual editor.",
  },
  "hub.builder.action": { es: "Abrir Constructor", en: "Open Builder" },
  "hub.cloner.title": { es: "Plantillas Web", en: "Web Templates" },
  "hub.cloner.desc": {
    es: "Personaliza tu pagina web",
    en: "Customize your web page",
  },
  "hub.cloner.action": { es: "Abrir Plantillas", en: "Open Templates" },
  "hub.webcloner.title": { es: "Clonador Web", en: "Web Cloner" },
  "hub.webcloner.desc": {
    es: "Replica cualquier sitio web en segundos y hazlo tuyo.",
    en: "Replicate any website in seconds and make it yours.",
  },
  "hub.webcloner.action": { es: "Abrir Clonador", en: "Open Cloner" },
  "hub.metrics.title": { es: "Métricas Pro", en: "Pro Metrics" },
  "hub.metrics.desc": {
    es: "Analíticas avanzadas y mapas de calor para optimizar conversiones.",
    en: "Advanced analytics and heatmaps to optimize conversions.",
  },
  "hub.metrics.action": { es: "Ver Analíticas", en: "View Analytics" },
  "hub.config.title": { es: "Configuración", en: "Configuration" },
  "hub.config.desc": {
    es: "Administra tu cuenta, plan y preferencias globales.",
    en: "Manage your account, plan and global preferences.",
  },
  "hub.config.action": { es: "Ir a Ajustes", en: "Go to Settings" },
  "hub.logout": { es: "Cerrar Sesión", en: "Log Out" },

  // FAQ
  "faq.title": { es: "Preguntas Frecuentes", en: "Frequently Asked Questions" },
  "faq.subtitle": {
    es: "Resolvemos tus dudas antes de empezar.",
    en: "We answer your questions before you start.",
  },
  "faq.q1": {
    es: "¿Es necesario saber programar?",
    en: "Do I need to know how to code?",
  },
  "faq.a1": {
    es: "No, nuestra plataforma es completamente No-Code con una interfaz de arrastrar y soltar.",
    en: "No, our platform is completely No-Code with a drag-and-drop interface.",
  },
  "faq.q2": { es: "¿Puedo exportar el código?", en: "Can I export the code?" },
  "faq.a2": {
    es: "Sí, puedes exportar tus creaciones a HTML/CSS/JS limpio o componentes React.",
    en: "Yes, you can export your creations to clean HTML/CSS/JS or React components.",
  },
  "faq.q3": { es: "¿Funciona en móviles?", en: "Does it work on mobile?" },
  "faq.a3": {
    es: "Absolutamente. Toda la plataforma y las páginas generadas siguen la filosofía Mobile First.",
    en: "Absolutely. The entire platform and generated pages follow the Mobile First philosophy.",
  },
  "faq.q4": { es: "¿Hay límite de páginas?", en: "Is there a page limit?" },
  "faq.a4": {
    es: "Depende de tu plan. El plan gratuito incluye 3 proyectos, y los planes Pro son ilimitados.",
    en: "It depends on your plan. The free plan includes 3 projects, and Pro plans are unlimited.",
  },
  "faq.q5": {
    es: "¿Qué tecnologías usa?",
    en: "What technologies does it use?",
  },
  "faq.a5": {
    es: "El builder genera código moderno optimizado usando Next.js 14, Tailwind CSS y React.",
    en: "The builder generates optimized modern code using Next.js 14, Tailwind CSS, and React.",
  },

  // General
  loading: { es: "Cargando...", en: "Loading..." },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  // Avoid hydration mismatch by rendering children directly but language might toggle on client
  // or just use "es" default for initial server render matching
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
