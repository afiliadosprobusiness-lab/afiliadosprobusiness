"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { t } = useLanguage();
  const { user: session, loading } = useAuth();
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/hub");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  if (session) return null;

  const testimonials = [
    {
      name: "Pedro S.",
      role: t("testimonials.pedro.role"),
      text: t("testimonials.pedro.text"),
      image: "https://i.pravatar.cc/150?img=11",
      stars: 5,
    },
    {
      name: "Ana M.",
      role: t("testimonials.ana.role"),
      text: t("testimonials.ana.text"),
      image: "https://i.pravatar.cc/150?img=5",
      stars: 5,
    },
    {
      name: "Carlos R.",
      role: t("testimonials.carlos.role"),
      text: t("testimonials.carlos.text"),
      image: "https://i.pravatar.cc/150?img=3",
      stars: 4,
    },
    {
      name: "Sofia L.",
      role: t("testimonials.sofia.role"),
      text: t("testimonials.sofia.text"),
      image: "https://i.pravatar.cc/150?img=9",
      stars: 5,
    },
    {
      name: "Diego V.",
      role: t("testimonials.diego.role"),
      text: t("testimonials.diego.text"),
      image: "https://i.pravatar.cc/150?img=13",
      stars: 5,
    },
    {
      name: "Laura G.",
      role: t("testimonials.laura.role"),
      text: t("testimonials.laura.text"),
      image: "https://i.pravatar.cc/150?img=20",
      stars: 5,
    },
    {
      name: "Javier M.",
      role: t("testimonials.javier.role"),
      text: t("testimonials.javier.text"),
      image: "https://i.pravatar.cc/150?img=60",
      stars: 4,
    },
    {
      name: "Elena R.",
      role: t("testimonials.elena.role"),
      text: t("testimonials.elena.text"),
      image: "https://i.pravatar.cc/150?img=42",
      stars: 5,
    },
    {
      name: "Miguel T.",
      role: t("testimonials.miguel.role"),
      text: t("testimonials.miguel.text"),
      image: "https://i.pravatar.cc/150?img=68",
      stars: 5,
    },
    {
      name: "Carmen P.",
      role: t("testimonials.carmen.role"),
      text: t("testimonials.carmen.text"),
      image: "https://i.pravatar.cc/150?img=45",
      stars: 5,
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const faqs = [
    {
      q: t("faq.q1"),
      a: t("faq.a1"),
    },
    {
      q: t("faq.q2"),
      a: t("faq.a2"),
    },
    {
      q: t("faq.q3"),
      a: t("faq.a3"),
    },
    {
      q: t("faq.q4"),
      a: t("faq.a4"),
    },
    {
      q: t("faq.q5"),
      a: t("faq.a5"),
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
        <svg
          className="absolute top-[-5%] left-[5%] w-64 h-[500px] opacity-0 animate-flash-1 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
          viewBox="0 0 100 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 0 L40 100 L70 140 L30 250 L60 290 L20 400"
            stroke="#FFD700"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Lightning Bolts - Set 2 (Top Right) */}
        <svg
          className="absolute top-[-10%] right-[10%] w-80 h-[600px] opacity-0 animate-flash-2 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
          viewBox="0 0 100 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 0 L70 80 L30 120 L80 260 L40 300 L70 400"
            stroke="#FFD700"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Lightning Bolts - Set 3 (Mid Left) */}
        <svg
          className="absolute top-[30%] left-[-5%] w-96 h-[400px] opacity-0 animate-flash-3 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
          viewBox="0 0 200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 0 L80 100 L140 140 L60 250 L120 290 L40 400"
            stroke="#FFD700"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Lightning Bolts - Set 4 (Bottom Right) */}
        <svg
          className="absolute bottom-[10%] right-[-5%] w-72 h-[500px] opacity-0 animate-flash-1 delay-700 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
          viewBox="0 0 100 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 0 L60 80 L20 120 L70 260 L30 300 L60 400"
            stroke="#FFD700"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center px-4 overflow-hidden pt-6 pb-20 z-10">
        <div className="flex-1 flex flex-col items-center justify-center md:justify-start md:pt-24 w-full z-10">
          <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center gap-6 md:gap-8">
            {/* Top Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-medium text-zinc-800 dark:text-white animate-fade-in border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)] mb-4 md:mb-0">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_#FFD700]" />
              <span className="text-gold-glow tracking-widest uppercase text-[10px]">
                {t("hero.tag")}
              </span>
            </div>

            {/* Main Title */}
            <h1
              className="text-[42px] sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-slide-up px-4 leading-[1.1] w-full"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-gold-gradient drop-shadow-lg block sm:inline-block">{t("hero.title_start")}</span> 
              <span className="hidden sm:inline"> </span>
              <br className="sm:hidden" />
              <span className="text-gold-gradient drop-shadow-lg block sm:inline-block mt-2 sm:mt-0">
                {t("hero.title_highlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base md:text-xl text-white font-medium max-w-3xl animate-slide-up px-6 md:px-4 leading-relaxed tracking-wide text-center mt-2"
              style={{ animationDelay: "0.2s" }}
            >
              {t("hero.subtitle_start")}{" "}
              <span className="text-gold-glow font-bold text-tornasolado">
                {t("hero.subtitle_highlight")}
              </span>{" "}
              <span className="block my-2"></span>
              {t("hero.subtitle_end_1")}{" "}
              <span className="text-gold-glow font-bold text-tornasolado">
                {t("hero.subtitle_end_highlight")}
              </span>
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 md:mt-10 animate-slide-up w-full max-w-[320px] sm:max-w-none px-4 sm:px-0 mx-auto"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/auth"
                className="btn btn-deluxe w-full sm:w-auto px-10 py-5 text-lg group hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🔥</span>
                {t("hero.cta_create")}
                <span>🔥</span>
              </Link>

              <Link
                href="/auth"
                className="btn btn-deluxe-outline w-full sm:w-auto px-10 py-5 text-lg"
              >
                {t("hero.cta_clone")}
              </Link>
            </div>
          </div>
        </div>

        {/* Tech Stack Strip (moved from footer to hero bottom) */}
        <div
          className="w-full z-10 animate-fade-in mt-32 md:mt-0 pb-10"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-center text-sm mb-6 uppercase tracking-widest font-bold text-gold-gradient">
            {t("hero.payments")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-all duration-500 px-4 group/payments">
            <span className="text-lg sm:text-xl font-bold text-white/40 hover:text-orange-500 active:text-orange-500 hover:scale-110 transition-all duration-300 cursor-default">BCP</span>
            <span className="text-lg sm:text-xl font-bold text-white/40 hover:text-blue-600 active:text-blue-600 hover:scale-110 transition-all duration-300 cursor-default">BBVA</span>
            <span className="text-lg sm:text-xl font-bold text-white/40 hover:text-red-600 active:text-red-600 hover:scale-110 transition-all duration-300 cursor-default">Scotiabank</span>
            <span className="text-lg sm:text-xl font-bold text-white/40 hover:text-purple-500 active:text-purple-500 hover:scale-110 transition-all duration-300 cursor-default">Yape</span>
            <span className="text-lg sm:text-xl font-bold text-white/40 hover:text-cyan-400 active:text-cyan-400 hover:scale-110 transition-all duration-300 cursor-default">Plin</span>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-16 md:py-24 relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/5 overflow-hidden">
        <div className="w-full">
          <div className="text-center mb-10 md:mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("testimonials.title").split(' ').map((word, i) => 
                i === 2 || i === 3 ? <span key={i} className="text-gold-gradient"> {word} </span> : word + ' '
              )}
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto leading-relaxed mt-4">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="relative w-full overflow-hidden mask-linear-fade">
            {/* Desktop Marquee */}
            <div className="hidden md:flex animate-scroll hover:[animation-play-state:paused] gap-6 w-max pl-6">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  className="glass w-[350px] p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300 flex flex-col gap-4 flex-shrink-0"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight">
                        {t.name}
                      </h3>
                      <p className="text-xs text-yellow-400 uppercase tracking-widest font-bold mt-1">
                        {t.role}
                      </p>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-white text-sm leading-loose mb-8 font-medium italic opacity-90">
                    &quot;{t.text}&quot;
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < t.stars ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`w-4 h-4 ${
                          i < t.stars
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden flex flex-col items-center gap-6">
              <div className="glass w-full max-w-[350px] p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300 flex flex-col gap-4 animate-fade-in">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
                    <img
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight">
                      {testimonials[currentTestimonial].name}
                    </h3>
                    <p className="text-xs text-yellow-400 uppercase tracking-widest font-bold mt-1">
                      {testimonials[currentTestimonial].role}
                    </p>
                  </div>
                </div>

                {/* Text */}
                <p className="text-white text-sm leading-loose mb-8 font-medium italic opacity-90 min-h-[80px]">
                  &quot;{testimonials[currentTestimonial].text}&quot;
                </p>

                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={
                        i < testimonials[currentTestimonial].stars
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-4 h-4 ${
                        i < testimonials[currentTestimonial].stars
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                  aria-label="Previous testimonial"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <div className="text-sm font-medium text-zinc-500">
                  {currentTestimonial + 1} / {testimonials.length}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95"
                  aria-label="Next testimonial"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground">
              {t("faq.title").split(' ').map((word, i) => 
                i === 1 ? <span key={i} className="text-gold-gradient"> {word} </span> : word + ' '
              )}
            </h2>
            <p className="text-zinc-600 dark:!text-white text-lg font-medium">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass rounded-xl overflow-hidden group border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none transition-all duration-300 hover:border-yellow-500/30"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="text-lg font-bold text-foreground text-gold-iridescent">
                      {faq.q}
                    </span>
                    <span className="transform group-open:rotate-180 transition-transform duration-300 text-zinc-500 dark:text-yellow-400 group-hover:text-yellow-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-white border-t border-white/5 pt-6 font-medium leading-loose tracking-wide opacity-90">
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
