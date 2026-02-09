import Link from "next/link";

export default function HomePage() {
  const testimonials = [
    {
      name: "Carlos R.",
      role: "Marketer",
      text: "Increíble herramienta para clonar mis funnels. Ahorro horas de trabajo cada semana.",
    },
    {
      name: "Ana M.",
      role: "Diseñadora",
      text: "El builder es super intuitivo y rápido. Puedo crear prototipos en minutos.",
    },
    {
      name: "Jorge L.",
      role: "Dev Freelance",
      text: "Mobile first de verdad, mis conversiones subieron un 30% desde que uso Fast Page.",
    },
    {
      name: "Sofia P.",
      role: "CEO Startup",
      text: "El diseño oscuro es hermoso y profesional. Justo lo que buscaba para mi marca.",
    },
    {
      name: "Miguel A.",
      role: "Agencia",
      text: "Ahorro horas de trabajo clonando estructuras base para clientes nuevos.",
    },
    {
      name: "Laura D.",
      role: "Emprendedora",
      text: "Soporte rápido y actualizaciones constantes. Se nota que escuchan a la comunidad.",
    },
    {
      name: "Pedro S.",
      role: "Copywriter",
      text: "La mejor inversión para mi agencia. Puedo validar copys en diseños reales al instante.",
    },
    {
      name: "Elena G.",
      role: "Tech Lead",
      text: "Exportar el código es una funcionalidad clave. Me permite integrar con mi backend fácilmente.",
    },
    {
      name: "Roberto C.",
      role: "No-Code Expert",
      text: "Muy fácil de usar, incluso sin saber código. Los resultados son pixel-perfect.",
    },
    {
      name: "Lucia F.",
      role: "Product Manager",
      text: "Los componentes pre-diseñados son top. Calidad de estudio de diseño en segundos.",
    },
  ];

  const faqs = [
    {
      q: "¿Es necesario saber programar?",
      a: "No, nuestra plataforma es completamente No-Code con una interfaz de arrastrar y soltar.",
    },
    {
      q: "¿Puedo exportar el código?",
      a: "Sí, puedes exportar tus creaciones a HTML/CSS/JS limpio o componentes React.",
    },
    {
      q: "¿Funciona en móviles?",
      a: "Absolutamente. Toda la plataforma y las páginas generadas siguen la filosofía Mobile First.",
    },
    {
      q: "¿Hay límite de páginas?",
      a: "Depende de tu plan. El plan gratuito incluye 3 proyectos, y los planes Pro son ilimitados.",
    },
    {
      q: "¿Qué tecnologías usa?",
      a: "El builder genera código moderno optimizado usando Next.js 14, Tailwind CSS y React.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* --- GLOBAL BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.08),transparent_70%)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-600/10 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
        
        {/* Thunder Flash Overlay */}
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay opacity-0 animate-thunder-flash" />

        {/* Lightning Bolts - Set 1 (Top Left) */}
        <svg className="absolute top-[-5%] left-[5%] w-64 h-[500px] opacity-0 animate-flash-1 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" viewBox="0 0 100 400" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 0 L40 100 L70 140 L30 250 L60 290 L20 400" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        
        {/* Lightning Bolts - Set 2 (Top Right) */}
        <svg className="absolute top-[-10%] right-[10%] w-80 h-[600px] opacity-0 animate-flash-2 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" viewBox="0 0 100 400" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M60 0 L70 80 L30 120 L80 260 L40 300 L70 400" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Lightning Bolts - Set 3 (Mid Left) */}
        <svg className="absolute top-[30%] left-[-5%] w-96 h-[400px] opacity-0 animate-flash-3 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M100 0 L80 100 L140 140 L60 250 L120 290 L40 400" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Lightning Bolts - Set 4 (Bottom Right) */}
        <svg className="absolute bottom-[10%] right-[-5%] w-72 h-[500px] opacity-0 animate-flash-1 delay-700 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" viewBox="0 0 100 400" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 0 L60 80 L20 120 L70 260 L30 300 L60 400" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-between px-4 overflow-hidden pt-20 pb-10 z-10">

        <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
          <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center gap-8">
            {/* Top Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-medium text-white/80 animate-fade-in border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_#FFD700]" />
              <span className="text-gold-glow tracking-widest uppercase text-[10px]">
                Edición Deluxe v2.0
              </span>
            </div>

            {/* Main Title */}
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Crea y Clona <br />
              <span className="text-gold-gradient drop-shadow-lg">
                Landing Pages
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-muted max-w-2xl animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Deja de perder tiempo.{" "}
              <span className="text-gold-glow font-medium">
                Crea páginas que venden
              </span>{" "}
              o clona el éxito de tu competencia en segundos. Sin código,
              resultados profesionales al instante.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center gap-6 mt-6 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/auth"
                className="btn btn-deluxe px-10 py-4 text-lg group hover:scale-105 transition-all duration-300"
              >
                Crear Landing ↗
              </Link>

              <Link
                href="/auth"
                className="btn btn-deluxe-outline px-10 py-4 text-lg"
              >
                Clonar Página
              </Link>
            </div>
          </div>
        </div>

        {/* Tech Stack Strip (moved from footer to hero bottom) */}
        <div
          className="w-full z-10 animate-fade-in mt-12 md:mt-0"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-center text-sm mb-6 uppercase tracking-widest font-bold text-gold-gradient">
            Métodos de Pago
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold text-orange-500">BCP</span>
            <span className="text-xl font-bold text-blue-600">BBVA</span>
            <span className="text-xl font-bold text-red-600">Scotiabank</span>
            <span className="text-xl font-bold text-purple-500">Yape</span>
            <span className="text-xl font-bold text-cyan-400">Plin</span>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/5 overflow-hidden">
        <div className="w-full">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Únete a cientos de creadores que ya están construyendo el futuro
              de la web.
            </p>
          </div>

          <div className="relative w-full flex overflow-hidden mask-linear-fade">
            <div className="flex animate-scroll hover:[animation-play-state:paused] gap-6 w-max pl-6">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  className="glass w-[350px] p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300 flex flex-col gap-4 flex-shrink-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-sm font-bold border border-white/10">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t.name}</h3>
                      <p className="text-xs text-muted uppercase tracking-wider">
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="flex gap-1 text-yellow-400 text-xs mt-auto">
                    {"★★★★★"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-muted text-lg">
              Resolvemos tus dudas antes de empezar.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden group">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="text-lg font-medium text-white group-hover:text-primary transition-colors">
                      {faq.q}
                    </span>
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted border-t border-white/5 pt-4">
                    <p>{faq.a}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
