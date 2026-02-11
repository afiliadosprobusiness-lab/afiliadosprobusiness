"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "es" | "en" | "pt";

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
  "nav.home": { es: "Inicio", en: "Home", pt: "Início" },
  "nav.builder": { es: "Constructor", en: "Builder", pt: "Construtor" },
  "nav.templates": { es: "Plantillas", en: "Templates", pt: "Modelos" },
  "nav.cloner": { es: "Clonador", en: "Cloner", pt: "Clonador" },
  "nav.metrics": { es: "Métricas Pro", en: "Pro Metrics", pt: "Métricas Pro" },
  "nav.hub": { es: "Hub", en: "Hub", pt: "Hub" },
  "nav.settings": { es: "Configuración", en: "Settings", pt: "Configurações" },
  "nav.login": { es: "Iniciar Sesión", en: "Login", pt: "Entrar" },
  "nav.create_account": { es: "Crear Cuenta", en: "Create Account", pt: "Criar Conta" },
  "nav.start_now": { es: "Comenzar Ahora", en: "Start Now", pt: "Começar Agora" },
  "nav.features": { es: "Características", en: "Features", pt: "Recursos" },
  "nav.pricing": { es: "Precios", en: "Pricing", pt: "Preços" },
  "nav.testimonials": { es: "Testimonios", en: "Testimonials", pt: "Depoimentos" },
  "nav.logout": { es: "Cerrar Sesión", en: "Logout", pt: "Sair" },

  // Settings
  "settings.title": { es: "CONFIGURACIÓN", en: "SETTINGS", pt: "CONFIGURAÇÕES" },
  "settings.subtitle": { es: "Personaliza tu experiencia, gestiona tu suscripción y asegura tu cuenta.", en: "Personalize your experience, manage your subscription and secure your account.", pt: "Personalize sua experiência, gerencie sua assinatura e proteja sua conta." },
  "settings.logout": { es: "Cerrar Sesión", en: "Log Out", pt: "Sair" },
  "settings.save": { es: "Confirmar Cambios", en: "Confirm Changes", pt: "Confirmar Alterações" },
  "settings.saving": { es: "Procesando...", en: "Processing...", pt: "Processando..." },
  "settings.success": { es: "¡Configuración guardada correctamente!", en: "Settings saved successfully!", pt: "Configurações salvas com sucesso!" },
  "settings.error": { es: "Error al guardar los cambios", en: "Error saving changes", pt: "Erro ao salvar as alterações" },
  "settings.validation.website": { es: "El sitio web debe comenzar con http:// o https://", en: "Website must start with http:// or https://", pt: "O site deve começar com http:// ou https://" },
  "settings.validation.name": { es: "El nombre es demasiado corto", en: "Name is too short", pt: "O nome é muito curto" },
  "settings.loading": { es: "PREPARANDO AJUSTES", en: "PREPARING SETTINGS", pt: "PREPARANDO AJUSTES" },
  "settings.syncing": { es: "Sincronizando con la nube...", en: "Syncing with the cloud...", pt: "Sincronizando com a nuvem..." },
  
  "settings.tabs.profile": { es: "Perfil Público", en: "Public Profile", pt: "Perfil Público" },
  "settings.tabs.profile.desc": { es: "Tu identidad en la plataforma", en: "Your identity on the platform", pt: "Sua identidade na plataforma" },
  "settings.tabs.account": { es: "Cuenta", en: "Account", pt: "Conta" },
  "settings.tabs.account.desc": { es: "Información de contacto y acceso", en: "Contact and access info", pt: "Informações de contato e acesso" },
  "settings.tabs.plan": { es: "Suscripción", en: "Subscription", pt: "Assinatura" },
  "settings.tabs.plan.desc": { es: "Gestiona tu plan y facturación", en: "Manage plan and billing", pt: "Gerenciar plano e faturamento" },
  "settings.tabs.security": { es: "Seguridad", en: "Security", pt: "Segurança" },
  "settings.tabs.security.desc": { es: "Protege tu cuenta y datos", en: "Protect your account and data", pt: "Proteja sua conta e dados" },

  "settings.profile.visual": { es: "Identidad Visual", en: "Visual Identity", pt: "Identidade Visual" },
  "settings.profile.title": { es: "Tu Perfil Público", en: "Your Public Profile", pt: "Seu Perfil Público" },
  "settings.profile.desc": { es: "Esta información aparecerá en tus sitios publicados.", en: "This info will appear on your published sites.", pt: "Estas informações aparecerão em seus sites publicados." },
  "settings.profile.name": { es: "Nombre Completo", en: "Full Name", pt: "Nome Completo" },
  "settings.profile.company": { es: "Empresa o Negocio", en: "Company or Business", pt: "Empresa ou Negócio" },
  "settings.profile.website": { es: "Sitio Web Personal", en: "Personal Website", pt: "Site Pessoal" },
  "settings.profile.location": { es: "Ubicación / Dirección", en: "Location / Address", pt: "Localização / Endereço" },
  "settings.profile.bio": { es: "Biografía Profesional", en: "Professional Bio", pt: "Biografia Profissional" },

  "settings.account.title": { es: "Configuración de Acceso", en: "Access Settings", pt: "Configurações de Acesso" },
  "settings.account.desc": { es: "Gestiona cómo te contactamos y preferencias.", en: "Manage how we contact you and preferences.", pt: "Gerencie como entramos em contato e preferências." },
  "settings.account.email": { es: "Correo Electrónico", en: "Email Address", pt: "E-mail" },
  "settings.account.phone": { es: "Número de Contacto", en: "Contact Number", pt: "Número de Contato" },
  "settings.account.language": { es: "Idioma de Preferencia", en: "Preferred Language", pt: "Idioma de Preferência" },
  "settings.account.notifications": { es: "Notificaciones", en: "Notifications", pt: "Notificações" },

  "settings.plan.title": { es: "Membresía", en: "Membership", pt: "Assinatura" },
  "settings.plan.current": { es: "Plan Actual", en: "Current Plan", pt: "Plano Atual" },
  "settings.plan.manage": { es: "Gestionar Pago", en: "Manage Payment", pt: "Gerenciar Pagamento" },

  "settings.security.title": { es: "Ciberseguridad", en: "Cybersecurity", pt: "Cibersegurança" },
  "settings.security.2fa_email": { es: "Verificación por Email", en: "Email Verification", pt: "Verificação por E-mail" },
  "settings.security.2fa_sms": { es: "Autenticación SMS", en: "SMS Authentication", pt: "Autenticação por SMS" },
  "settings.security.change_pass": { es: "Cambiar Contraseña", en: "Change Password", pt: "Alterar Senha" },
  "settings.security.delete_account": { es: "Eliminar Cuenta", en: "Delete Account", pt: "Excluir Conta" },

  // Hero
  "hero.tag": { es: "Edición Deluxe v2.0", en: "Deluxe Edition v2.0", pt: "Edição Deluxe v2.0" },
  "hero.title_start": { es: "Crea y Clona", en: "Create & Clone", pt: "Crie e Clone" },
  "hero.title_highlight": { es: "Landing Pages", en: "Landing Pages", pt: "Landing Pages" },
  "hero.subtitle_start": {
    es: "Deja de perder tiempo.",
    en: "Stop wasting time.",
    pt: "Pare de perder tempo.",
  },
  "hero.subtitle_highlight": {
    es: "Crea páginas que venden",
    en: "Create pages that sell",
    pt: "Crie páginas que vendem",
  },
  "hero.subtitle_end_1": {
    es: "o clona el éxito de tu competencia en segundos.",
    en: "or clone your competition's success in seconds.",
    pt: "ou clone o sucesso da sua concorrência em segundos.",
  },
  "hero.subtitle_end_highlight": {
    es: "Sin código, resultados profesionales al instante.",
    en: "No code, professional results instantly.",
    pt: "Sem código, resultados profissionais instantaneamente.",
  },
  "hero.cta_create": { es: "Crear Landing", en: "Create Landing", pt: "Criar Landing" },
  "hero.cta_clone": { es: "Clonar Página", en: "Clone Page", pt: "Clonar Página" },
  "hero.payments": { es: "Métodos de Pago", en: "Payment Methods", pt: "Métodos de Pagamento" },
  "testimonials.title": {
    es: "Lo que dicen nuestros usuarios",
    en: "What our users say",
    pt: "O que nossos usuários dizem",
  },
  "testimonials.subtitle": {
    es: "Únete a cientos de creadores que ya están construyendo el futuro de la web.",
    en: "Join hundreds of creators who are already building the future of the web.",
    pt: "Junte-se a centenas de criadores que já estão construindo o futuro da web.",
  },
  "testimonials.pedro.role": { es: "COPYWRITER", en: "COPYWRITER", pt: "COPYWRITER" },
  "testimonials.pedro.text": {
    es: "La mejor inversión para mi agencia. Puedo validar copys en diseños reales al instante.",
    en: "The best investment for my agency. I can validate copy in real designs instantly.",
    pt: "O melhor investimento para minha agência. Posso validar copys en designs reais instantaneamente.",
  },
  "testimonials.ana.role": {
    es: "DIRECTORA DE MARKETING",
    en: "MARKETING DIRECTOR",
    pt: "DIRETORA DE MARKETING",
  },
  "testimonials.ana.text": {
    es: "La velocidad de carga y la facilidad de uso son incomparables. Aumentó mi conversión un 40%.",
    en: "Load speed and ease of use are incomparable. Increased my conversion by 40%.",
    pt: "A velocidade de carregamento e a facilidade de uso são incomparáveis. Aumentou minha conversão em 40%.",
  },
  "testimonials.carlos.role": { es: "FREELANCER", en: "FREELANCER", pt: "FREELANCER" },
  "testimonials.carlos.text": {
    es: "Pude clonar la landing de mi competencia y mejorarla en minutos. ¡Increíble herramienta!",
    en: "I was able to clone my competitor's landing page and improve it in minutes. Amazing tool!",
    pt: "Consegui clonar a landing da minha concorrência e melhorá-la em minutos. Ferramenta incrível!",
  },
  "testimonials.sofia.role": { es: "DISEÑADORA UX", en: "UX DESIGNER", pt: "DESIGNER UX" },
  "testimonials.sofia.text": {
    es: "La flexibilidad del editor me permite crear experiencias únicas sin tocar código.",
    en: "The editor's flexibility allows me to create unique experiences without touching code.",
    pt: "A flexibilidade do editor me permite criar experiências únicas sem tocar em código.",
  },
  "testimonials.diego.role": { es: "EMPRENDEDOR", en: "ENTREPRENEUR", pt: "EMPREENDEDOR" },
  "testimonials.diego.text": {
    es: "Lancé mi MVP en un fin de semana gracias a Fast Page. Los inversores quedaron impresionados.",
    en: "I launched my MVP in a weekend thanks to Fast Page. Investors were impressed.",
    pt: "Lancei meu MVP em um fim de semana graças à Fast Page. Os investidores ficaram impressionados.",
  },
  "testimonials.laura.role": { es: "BLOGGER", en: "BLOGGER", pt: "BLOGGER" },
  "testimonials.laura.text": {
    es: "Mis lectores adoran el nuevo diseño de mi blog. Fue tan fácil como elegir una plantilla.",
    en: "My readers love my blog's new design. It was as easy as choosing a template.",
    pt: "Meus leitores adoram o novo design do meu blog. Foi tão fácil quanto escolher um modelo.",
  },
  "testimonials.javier.role": { es: "CONSULTOR SEO", en: "SEO CONSULTANT", pt: "CONSULTOR SEO" },
  "testimonials.javier.text": {
    es: "El código generado es limpio y rápido, lo que ha mejorado enormemente mi ranking en Google.",
    en: "The generated code is clean and fast, which has greatly improved my Google ranking.",
    pt: "O código gerado é limpo e rápido, o que melhorou enormemente meu ranking no Google.",
  },
  "testimonials.elena.role": { es: "PROJECT MANAGER", en: "PROJECT MANAGER", pt: "GERENTE DE PROJETO" },
  "testimonials.elena.text": {
    es: "Gestionar múltiples proyectos nunca fue tan sencillo. Fast Page es mi herramienta diaria.",
    en: "Managing multiple projects has never been easier. Fast Page is my daily tool.",
    pt: "Gerenciar múltiplos projetos nunca foi tão simples. Fast Page é minha ferramenta diária.",
  },
  "testimonials.miguel.role": { es: "DESARROLLADOR", en: "DEVELOPER", pt: "DESENVOLVEDOR" },
  "testimonials.miguel.text": {
    es: "Aunque sé programar, esto me ahorra horas de trabajo repetitivo. ¡Simplemente genial!",
    en: "Even though I know how to code, this saves me hours of repetitive work. Simply great!",
    pt: "Embora eu saiba programar, isso me poupa horas de trabalho repetitivo. Simplesmente genial!",
  },
  "testimonials.carmen.role": { es: "AGENCIA DIGITAL", en: "DIGITAL AGENCY", pt: "AGÊNCIA DIGITAL" },
  "testimonials.carmen.text": {
    es: "Hemos escalado nuestra producción de landings x10 sin contratar más personal.",
    en: "We have scaled our landing page production x10 without hiring more staff.",
    pt: "Escalamos nossa produção de landings em 10x sem contratar mais pessoal.",
  },

  // Cloner Business Models
  "cloner.title": {
    es: "Selecciona tu Modelo de Negocio",
    en: "Select Your Business Model",
    pt: "Selecione seu Modelo de Negócio",
  },
  "cloner.subtitle": {
    es: "Elige una plantilla base optimizada para tu industria.",
    en: "Choose a base template optimized for your industry.",
    pt: "Escolha um modelo base otimizado para sua indústria.",
  },
  "cloner.restaurant.title": { es: "Restaurante", en: "Restaurant", pt: "Restaurante" },
  "cloner.restaurant.desc": {
    es: "Menús digitales, reservas y pedidos online. Diseño apetitoso.",
    en: "Digital menus, reservations, and online orders. Appetizing design.",
    pt: "Menus digitais, reservas e pedidos online. Design apetitoso.",
  },
  "cloner.tech.title": { es: "Tecnología", en: "Technology", pt: "Tecnologia" },
  "cloner.tech.desc": {
    es: "SaaS, Apps y Startups. Moderno, limpio y futurista.",
    en: "SaaS, Apps, and Startups. Modern, clean, and futuristic.",
    pt: "SaaS, Apps e Startups. Moderno, limpo e futurista.",
  },
  "cloner.office.title": {
    es: "Oficina / Corporativo",
    en: "Office / Corporate",
    pt: "Escritório / Corporativo",
  },
  "cloner.office.desc": {
    es: "Consultoría, legal y servicios. Profesional y confiable.",
    en: "Consulting, legal, and services. Professional and reliable.",
    pt: "Consultoria, jurídico e serviços. Profissional e confiável.",
  },
  "cloner.select": { es: "Seleccionar Modelo", en: "Select Model", pt: "Selecionar Modelo" },
  "cloner.back": { es: "Volver a Modelos", en: "Back to Models", pt: "Voltar para Modelos" },

  // Cloner Subcategories
  "cloner.restaurant.pizzeria": { es: "Pizzería", en: "Pizzeria", pt: "Pizzaria" },
  "cloner.restaurant.criolla": { es: "Comida Criolla", en: "Creole Food", pt: "Comida Crioula" },
  "cloner.restaurant.china": { es: "Comida China", en: "Chinese Food", pt: "Comida Chinesa" },
  "cloner.restaurant.anticuchos": { es: "Anticuchos", en: "Anticuchos", pt: "Anticuchos" },
  "cloner.restaurant.sushi": { es: "Sushi / Japonesa", en: "Sushi / Japanese", pt: "Sushi / Japonesa" },
  "cloner.restaurant.cafe": { es: "Cafetería", en: "Coffee Shop", pt: "Cafeteria" },

  "cloner.tech.saas": { es: "SaaS / Software", en: "SaaS / Software", pt: "SaaS / Software" },
  "cloner.tech.app": { es: "App Mobile", en: "Mobile App", pt: "App Mobile" },
  "cloner.tech.agency": { es: "Agencia Digital", en: "Digital Agency", pt: "Agência Digital" },
  "cloner.tech.startup": { es: "Startup", en: "Startup", pt: "Startup" },

  "cloner.office.realestate": { es: "Inmobiliaria", en: "Real Estate", pt: "Imobiliária" },
  "cloner.office.law": { es: "Abogados", en: "Law Firm", pt: "Advogados" },
  "cloner.office.consulting": { es: "Consultoría", en: "Consulting", pt: "Consultoria" },
  "cloner.office.medical": { es: "Clínica / Médica", en: "Clinic / Medical", pt: "Clínica / Médica" },

  // New Models
  "cloner.beauty.title": { es: "Salud y Belleza", en: "Health & Beauty", pt: "Saúde e Beleza" },
  "cloner.beauty.desc": { es: "Spas, gimnasios y bienestar. Relajante y vital.", en: "Spas, gyms, and wellness. Relaxing and vital.", pt: "Spas, academias e bem-estar. Relaxante e vital." },
  "cloner.education.title": { es: "Educación", en: "Education", pt: "Educação" },
  "cloner.education.desc": { es: "Cursos, academias y tutores. Educativo y claro.", en: "Courses, academies, and tutors. Educational and clear.", pt: "Cursos, academias e tutores. Educativo e claro." },
  "cloner.ecommerce.title": { es: "E-commerce", en: "E-commerce", pt: "E-commerce" },
  "cloner.ecommerce.desc": { es: "Tiendas online y catálogos. Ventas directas.", en: "Online stores and catalogs. Direct sales.", pt: "Lojas online e catálogos. Vendas diretas." },
  "cloner.services.title": { es: "Oficios / Servicios", en: "Trades / Services", pt: "Ofícios / Serviços" },
  "cloner.services.desc": { es: "Técnicos, hogar y reparaciones. Práctico.", en: "Technicians, home, and repairs. Practical.", pt: "Técnicos, casa e reparos. Prático." },
  "cloner.creative.title": { es: "Creativo / Eventos", en: "Creative / Events", pt: "Criativo / Eventos" },
  "cloner.creative.desc": { es: "Portafolios, música y bodas. Artístico.", en: "Portfolios, music, and weddings. Artistic.", pt: "Portfólios, música e casamentos. Artístico." },

  // New Subcategories
  "cloner.beauty.spa": { es: "Spa / Estética", en: "Spa / Aesthetics", pt: "Spa / Estética" },
  "cloner.beauty.gym": { es: "Gimnasio / Crossfit", en: "Gym / Crossfit", pt: "Academia / Crossfit" },
  "cloner.beauty.yoga": { es: "Yoga / Pilates", en: "Yoga / Pilates", pt: "Yoga / Pilates" },
  "cloner.beauty.barber": { es: "Barbería / Salón", en: "Barber / Salon", pt: "Barbearia / Salão" },
  
  "cloner.education.course": { es: "Curso Online", en: "Online Course", pt: "Curso Online" },
  "cloner.education.school": { es: "Colegio / Nido", en: "School / Kindergarten", pt: "Escola / Jardim de Infância" },
  "cloner.education.tutor": { es: "Profesor Particular", en: "Private Tutor", pt: "Professor Particular" },
  "cloner.education.language": { es: "Idiomas", en: "Languages", pt: "Idiomas" },

  "cloner.ecommerce.fashion": { es: "Moda / Ropa", en: "Fashion / Clothing", pt: "Moda / Roupa" },
  "cloner.ecommerce.tech": { es: "Tecnología", en: "Technology", pt: "Tecnologia" },
  "cloner.ecommerce.pets": { es: "Mascotas", en: "Pets", pt: "Pets" },
  "cloner.ecommerce.home": { es: "Hogar y Deco", en: "Home & Decor", pt: "Casa e Decoração" },

  "cloner.services.plumber": { es: "Gasfitero / Plomero", en: "Plumber", pt: "Encanador" },
  "cloner.services.electrician": { es: "Electricista", en: "Electrician", pt: "Eletricista" },
  "cloner.services.cleaning": { es: "Limpieza", en: "Cleaning", pt: "Limpeza" },
  "cloner.services.mechanic": { es: "Mecánico", en: "Mechanic", pt: "Mecânico" },

  "cloner.creative.photography": { es: "Fotografía", en: "Photography", pt: "Fotografia" },
  "cloner.creative.music": { es: "Música / DJ", en: "Music / DJ", pt: "Música / DJ" },
  "cloner.creative.wedding": { es: "Wedding Planner", en: "Wedding Planner", pt: "Wedding Planner" },
  "cloner.creative.portfolio": { es: "Portafolio Personal", en: "Personal Portfolio", pt: "Portfólio Pessoal" },

  // Hub
  "hub.welcome": { es: "Bienvenido de nuevo,", en: "Welcome back,", pt: "Bem-vindo de volta," },
  "hub.subtitle": {
    es: "Tu centro de control creativo.",
    en: "Your creative command center.",
    pt: "Seu centro de controle criativo.",
  },
  "hub.builder.title": { es: "Constructor", en: "Builder", pt: "Construtor" },
  "hub.builder.desc": {
    es: "Crea landing pages desde cero con nuestro editor visual arrastrar y soltar.",
    en: "Create landing pages from scratch with our drag and drop visual editor.",
    pt: "Crie landing pages do zero com nosso editor visual de arrastar e soltar.",
  },
  "hub.builder.action": { es: "Abrir Constructor", en: "Open Builder", pt: "Abrir Construtor" },
  "hub.cloner.title": { es: "Plantillas Web", en: "Web Templates", pt: "Modelos Web" },
  "hub.cloner.desc": {
    es: "Personaliza tu pagina web",
    en: "Customize your web page",
    pt: "Personalize sua página web",
  },
  "hub.cloner.action": { es: "Abrir Plantillas", en: "Open Templates", pt: "Abrir Modelos" },
  "hub.webcloner.title": { es: "Clonador Web", en: "Web Cloner", pt: "Clonador Web" },
  "hub.webcloner.desc": {
    es: "Replica cualquier sitio web en segundos y hazlo tuyo.",
    en: "Replicate any website in seconds and make it yours.",
    pt: "Replique qualquer site em segundos e torne-o seu.",
  },
  "hub.webcloner.action": { es: "Abrir Clonador", en: "Open Cloner", pt: "Abrir Clonador" },
  "hub.metrics.title": { es: "Métricas Pro", en: "Pro Metrics", pt: "Métricas Pro" },
  "hub.metrics.desc": {
    es: "Analíticas avanzadas y mapas de calor para optimizar conversiones.",
    en: "Advanced analytics and heatmaps to optimize conversions.",
    pt: "Análises avançadas e mapas de calor para otimizar conversões.",
  },
  "hub.metrics.action": { es: "Ver Analíticas", en: "View Analytics", pt: "Ver Análises" },
  "hub.config.title": { es: "Configuración", en: "Configuration", pt: "Configurações" },
  "hub.config.desc": {
    es: "Administra tu cuenta, plan y preferencias globales.",
    en: "Manage your account, plan and global preferences.",
    pt: "Gerencie sua conta, plano e preferências globais.",
  },
  "hub.config.action": { es: "Ir a Ajustes", en: "Go to Settings", pt: "Ir para Ajustes" },
  "hub.logout": { es: "Cerrar Sesión", en: "Log Out", pt: "Sair" },

  // FAQ
  "faq.title": { es: "Preguntas Frecuentes", en: "Frequently Asked Questions", pt: "Perguntas Frequentes" },
  "faq.subtitle": {
    es: "Resolvemos tus dudas antes de empezar.",
    en: "We answer your questions before you start.",
    pt: "Resolvemos suas dúvidas antes de começar.",
  },
  "faq.q1": {
    es: "¿Es necesario saber programar?",
    en: "Do I need to know how to code?",
    pt: "É necessário saber programar?",
  },
  "faq.a1": {
    es: "No, nuestra plataforma es completamente No-Code con una interfaz de arrastrar y soltar.",
    en: "No, our platform is completely No-Code with a drag-and-drop interface.",
    pt: "Não, nossa plataforma é completamente No-Code com uma interface de arrastar e soltar.",
  },
  "faq.q2": { es: "¿Puedo exportar el código?", en: "Can I export the code?", pt: "Posso exportar o código?" },
  "faq.a2": {
    es: "Sí, puedes exportar tus creaciones a HTML/CSS/JS limpio o componentes React.",
    en: "Yes, you can export your creations to clean HTML/CSS/JS or React components.",
    pt: "Sim, você pode exportar suas criações para HTML/CSS/JS limpo ou componentes React.",
  },
  "faq.q3": { es: "¿Funciona en móviles?", en: "Does it work on mobile?", pt: "Funciona em celulares?" },
  "faq.a3": {
    es: "Absolutamente. Toda la plataforma y las páginas generadas siguen la filosofía Mobile First.",
    en: "Absolutely. The entire platform and generated pages follow the Mobile First philosophy.",
    pt: "Absolutamente. Toda a plataforma e as páginas geradas seguem a filosofia Mobile First.",
  },
  "faq.q4": { es: "¿Hay límite de páginas?", en: "Is there a page limit?", pt: "Existe limite de páginas?" },
  "faq.a4": {
    es: "Depende de tu plan. El plan gratuito incluye 3 proyectos, y los planes Pro son ilimitados.",
    en: "It depends on your plan. The free plan includes 3 projects, and Pro plans are unlimited.",
    pt: "Depende do seu plano. O plano gratuito inclui 3 projetos, e os planos Pro são ilimitados.",
  },
  "faq.q5": {
    es: "¿Qué tecnologías usa?",
    en: "What technologies does it use?",
    pt: "Quais tecnologias utiliza?",
  },
  "faq.a5": {
    es: "El builder genera código moderno optimizado usando Next.js 14, Tailwind CSS y React.",
    en: "The builder generates optimized modern code using Next.js 14, Tailwind CSS, and React.",
    pt: "O builder gera código moderno otimizado usando Next.js 14, Tailwind CSS e React.",
  },

  // General
  // Landing Extended
  "landing.schema.description": {
    es: "Crea, clona y publica landing pages profesionales en minutos con editor visual.",
    en: "Create, clone, and publish professional landing pages in minutes with a visual editor.",
    pt: "Crie, clone e publique landing pages profissionais em minutos com editor visual.",
  },
  "landing.proof.eyebrow": {
    es: "Prueba y rendimiento",
    en: "Proof and performance",
    pt: "Prova e performance",
  },
  "landing.proof.title": {
    es: "Disenada para convertir visitas en clientes",
    en: "Built to turn visitors into customers",
    pt: "Projetada para converter visitas em clientes",
  },
  "landing.proof.subtitle": {
    es: "Constructor visual, clonado inteligente y publicacion inmediata. Todo en un flujo corto para lanzar mas rapido y vender mejor.",
    en: "Visual builder, smart cloning, and instant publishing. Everything in a short flow to launch faster and sell better.",
    pt: "Construtor visual, clonagem inteligente e publicacao imediata. Tudo em um fluxo curto para lancar mais rapido e vender melhor.",
  },
  "landing.proof.stat1": { es: "paginas publicadas", en: "published pages", pt: "paginas publicadas" },
  "landing.proof.stat2": { es: "proyectos activos", en: "active projects", pt: "projetos ativos" },
  "landing.proof.stat3": { es: "satisfaccion promedio", en: "average satisfaction", pt: "satisfacao media" },
  "landing.proof.stat4": { es: "tiempo para publicar", en: "time to publish", pt: "tempo para publicar" },
  "landing.proof.card1.title": {
    es: "Sin codigo y editable 100%",
    en: "No-code and 100% editable",
    pt: "Sem codigo e 100% editavel",
  },
  "landing.proof.card1.desc": {
    es: "Cambia textos, imagenes, colores y estructura visual sin depender de desarrollo.",
    en: "Change text, images, colors, and visual structure without relying on development.",
    pt: "Altere textos, imagens, cores e estrutura visual sem depender de desenvolvimento.",
  },
  "landing.proof.card2.title": {
    es: "Publicacion y guardado real",
    en: "Real publish and save",
    pt: "Publicacao e salvamento reais",
  },
  "landing.proof.card2.desc": {
    es: "Guarda versiones, publica y vuelve a tu cuenta con historial persistente.",
    en: "Save versions, publish, and return to your account with persistent history.",
    pt: "Salve versoes, publique e volte para sua conta com historico persistente.",
  },
  "landing.product.eyebrow": {
    es: "Vista rapida del producto",
    en: "Quick product view",
    pt: "Visao rapida do produto",
  },
  "landing.product.title": {
    es: "Elige el mejor camino para cada campana",
    en: "Choose the best path for each campaign",
    pt: "Escolha o melhor caminho para cada campanha",
  },
  "landing.product.templates.title": {
    es: "Plantillas (rapido)",
    en: "Templates (fast)",
    pt: "Modelos (rapido)",
  },
  "landing.product.templates.desc": {
    es: "Empieza desde modelos por nicho y edita todo visualmente.",
    en: "Start from niche templates and edit everything visually.",
    pt: "Comece com modelos por nicho e edite tudo visualmente.",
  },
  "landing.product.templates.b1": { es: "Listo en minutos", en: "Ready in minutes", pt: "Pronto em minutos" },
  "landing.product.templates.b2": { es: "Ideal para lanzamientos rapidos", en: "Ideal for fast launches", pt: "Ideal para lancamentos rapidos" },
  "landing.product.templates.b3": { es: "Diseno base profesional", en: "Professional base design", pt: "Design base profissional" },
  "landing.product.templates.cta": { es: "Ver Plantillas", en: "See Templates", pt: "Ver Modelos" },
  "landing.product.cloner.title": {
    es: "Clonador Web (control total)",
    en: "Web Cloner (full control)",
    pt: "Clonador Web (controle total)",
  },
  "landing.product.cloner.desc": {
    es: "Replica, adapta y optimiza una pagina existente para tu oferta.",
    en: "Replicate, adapt, and optimize an existing page for your offer.",
    pt: "Replique, adapte e otimize uma pagina existente para sua oferta.",
  },
  "landing.product.cloner.b1": { es: "Ideal para benchmarking", en: "Ideal for benchmarking", pt: "Ideal para benchmarking" },
  "landing.product.cloner.b2": { es: "Edicion completa de contenido", en: "Complete content editing", pt: "Edicao completa de conteudo" },
  "landing.product.cloner.b3": { es: "Publicacion con seguimiento", en: "Publishing with tracking", pt: "Publicacao com acompanhamento" },
  "landing.product.cloner.cta": { es: "Ir al Clonador", en: "Go to Cloner", pt: "Ir para o Clonador" },
  "landing.useCases.title": {
    es: "Casos de uso listos para vender",
    en: "Use cases ready to sell",
    pt: "Casos de uso prontos para vender",
  },
  "landing.useCases.subtitle": {
    es: "Disenos pensados por tipo de negocio para acelerar resultados sin perder calidad visual.",
    en: "Designs tailored by business type to accelerate results without losing visual quality.",
    pt: "Designs pensados por tipo de negocio para acelerar resultados sem perder qualidade visual.",
  },
  "landing.useCases.cta": { es: "Ver plantilla ideal", en: "See ideal template", pt: "Ver modelo ideal" },
  "landing.useCases.restaurant.title": { es: "Restaurantes", en: "Restaurants", pt: "Restaurantes" },
  "landing.useCases.restaurant.tag": { es: "alto ticket", en: "high ticket", pt: "alto ticket" },
  "landing.useCases.restaurant.desc": {
    es: "Menus, reservas y pedidos en una sola pagina.",
    en: "Menus, bookings, and orders on one page.",
    pt: "Menus, reservas e pedidos em uma unica pagina.",
  },
  "landing.useCases.services.title": { es: "Servicios", en: "Services", pt: "Servicos" },
  "landing.useCases.services.tag": { es: "lead inmediato", en: "instant lead", pt: "lead imediato" },
  "landing.useCases.services.desc": {
    es: "Captura leads de alto valor con formularios claros.",
    en: "Capture high-value leads with clear forms.",
    pt: "Capture leads de alto valor com formularios claros.",
  },
  "landing.useCases.ecommerce.title": { es: "E-commerce", en: "E-commerce", pt: "E-commerce" },
  "landing.useCases.ecommerce.tag": { es: "conversion rapida", en: "fast conversion", pt: "conversao rapida" },
  "landing.useCases.ecommerce.desc": {
    es: "Lanza ofertas y catalogos con diseno orientado a venta.",
    en: "Launch offers and catalogs with a sales-oriented design.",
    pt: "Lance ofertas e catalogos com design orientado para vendas.",
  },
  "landing.useCases.consulting.title": { es: "Consultoria", en: "Consulting", pt: "Consultoria" },
  "landing.useCases.consulting.tag": { es: "marca premium", en: "premium brand", pt: "marca premium" },
  "landing.useCases.consulting.desc": {
    es: "Refuerza autoridad con casos y CTA de contacto directo.",
    en: "Build authority with case studies and direct-contact CTA.",
    pt: "Reforce autoridade com casos e CTA de contato direto.",
  },
  "landing.mobile.stickyCta": {
    es: "Crear ahora y publicar",
    en: "Create now and publish",
    pt: "Criar agora e publicar",
  },

  // Shared UI
  "floating.scrollTop": { es: "Subir", en: "Scroll to top", pt: "Subir" },
  "floating.toggleLanguage": { es: "Cambiar idioma", en: "Change language", pt: "Mudar idioma" },
  "footer.description": {
    es: "Plataforma profesional para crear y clonar landing pages",
    en: "Professional platform to create and clone landing pages",
    pt: "Plataforma profissional para criar e clonar landing pages",
  },
  "footer.rights": {
    es: "© {year} Fast Page. Todos los derechos reservados.",
    en: "© {year} Fast Page. All rights reserved.",
    pt: "© {year} Fast Page. Todos os direitos reservados.",
  },

  loading: { es: "Cargando...", en: "Loading...", pt: "Carregando..." },
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
