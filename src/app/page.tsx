"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

function trackLandingEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const win = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };

  const eventPayload = { event, ...payload };
  win.dataLayer?.push(eventPayload);
  if (typeof win.gtag === "function") {
    win.gtag("event", event, payload);
  }
}

export default function HomePage() {
  const { t } = useLanguage();
  const { user: session, loading } = useAuth();
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [tracked50, setTracked50] = useState(false);
  const [tracked75, setTracked75] = useState(false);
  const [tracked100, setTracked100] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/hub");
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session || loading) return;
    trackLandingEvent("landing_view", { page: "/" });
  }, [session, loading]);

  useEffect(() => {
    if (session || loading) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const percent = Math.round((window.scrollY / maxScroll) * 100);

      if (percent >= 50 && !tracked50) {
        setTracked50(true);
        trackLandingEvent("landing_scroll_50");
      }
      if (percent >= 75 && !tracked75) {
        setTracked75(true);
        trackLandingEvent("landing_scroll_75");
      }
      if (percent >= 95 && !tracked100) {
        setTracked100(true);
        trackLandingEvent("landing_scroll_100");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tracked50, tracked75, tracked100, session, loading]);

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

  const proofStats = [
    { value: "+12,500", label: t("landing.proof.stat1") },
    { value: "+3,200", label: t("landing.proof.stat2") },
    { value: "4.9/5", label: t("landing.proof.stat3") },
    { value: "< 10 min", label: t("landing.proof.stat4") },
  ];

  const useCases = [
    {
      key: "restaurant",
      emoji: "\u{1F355}",
      accent: "from-red-500/35 to-orange-500/30",
      border: "hover:border-red-400/60",
      title: t("landing.useCases.restaurant.title"),
      tag: t("landing.useCases.restaurant.tag"),
      desc: t("landing.useCases.restaurant.desc"),
    },
    {
      key: "services",
      emoji: "\u{1F6E0}\uFE0F",
      accent: "from-cyan-500/30 to-blue-500/25",
      border: "hover:border-cyan-400/60",
      title: t("landing.useCases.services.title"),
      tag: t("landing.useCases.services.tag"),
      desc: t("landing.useCases.services.desc"),
    },
    {
      key: "ecommerce",
      emoji: "\u{1F6CD}\uFE0F",
      accent: "from-fuchsia-500/30 to-purple-500/25",
      border: "hover:border-fuchsia-400/60",
      title: t("landing.useCases.ecommerce.title"),
      tag: t("landing.useCases.ecommerce.tag"),
      desc: t("landing.useCases.ecommerce.desc"),
    },
    {
      key: "consulting",
      emoji: "\u{1F4C8}",
      accent: "from-amber-500/35 to-yellow-500/25",
      border: "hover:border-amber-400/60",
      title: t("landing.useCases.consulting.title"),
      tag: t("landing.useCases.consulting.tag"),
      desc: t("landing.useCases.consulting.desc"),
    },
  ];

  const handleCtaClick = (location: string, type: "primary" | "secondary") => {
    trackLandingEvent("landing_cta_click", { location, type });
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const softwareStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Fast Page",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      t("landing.schema.description"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareStructuredData) }}
      />

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
      <section className="relative min-h-[calc(100svh-4rem)] md:min-h-screen flex flex-col items-center px-4 overflow-hidden pt-20 md:pt-6 pb-12 md:pb-20 z-10">
        <div className="w-full z-10 flex flex-col items-center md:flex-1 md:justify-start md:pt-24">
          <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center gap-5 md:gap-8">
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 md:mt-10 animate-slide-up w-full max-w-[320px] sm:max-w-none px-4 sm:px-0 mx-auto"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/auth"
                onClick={() => handleCtaClick("hero", "primary")}
                className="btn btn-deluxe w-full sm:w-auto px-10 py-5 text-lg group hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🔥</span>
                {t("hero.cta_create")}
                <span>🔥</span>
              </Link>

              <Link
                href="/auth"
                onClick={() => handleCtaClick("hero", "secondary")}
                className="btn btn-deluxe-outline w-full sm:w-auto px-10 py-5 text-lg"
              >
                {t("hero.cta_clone")}
              </Link>
            </div>
          </div>
        </div>

        {/* Tech Stack Strip (moved from footer to hero bottom) */}
        <div
          className="w-full z-10 animate-fade-in mt-10 sm:mt-14 md:mt-auto pb-4 md:pb-10"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-center text-sm mb-6 uppercase tracking-widest font-bold text-gold-gradient">
            {t("hero.payments")}
          </p>
          <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:items-center sm:gap-8 md:gap-16 opacity-80 hover:opacity-100 transition-all duration-500 px-4 group/payments">
            <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm sm:text-xl font-bold text-white/60 hover:text-orange-500 active:text-orange-500 hover:scale-105 transition-all duration-300 cursor-default">BCP</span>
            <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm sm:text-xl font-bold text-white/60 hover:text-blue-600 active:text-blue-600 hover:scale-105 transition-all duration-300 cursor-default">BBVA</span>
            <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm sm:text-xl font-bold text-white/60 hover:text-red-600 active:text-red-600 hover:scale-105 transition-all duration-300 cursor-default">Scotiabank</span>
            <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm sm:text-xl font-bold text-white/60 hover:text-purple-500 active:text-purple-500 hover:scale-105 transition-all duration-300 cursor-default">Yape</span>
            <span className="col-span-2 sm:col-auto inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm sm:text-xl font-bold text-white/60 hover:text-cyan-400 active:text-cyan-400 hover:scale-105 transition-all duration-300 cursor-default">Plin</span>
          </div>
        </div>
      </section>

      {/* --- PROOF & VALUE SECTION --- */}
      <section className="relative z-10 px-4 pb-8 md:pb-14">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-black/40 p-5 md:p-8 backdrop-blur-md">
          <div className="mb-6 flex flex-col gap-3 text-center md:mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              {t("landing.proof.eyebrow")}
            </p>
            <h2 className="text-2xl font-extrabold text-white md:text-4xl">
              {t("landing.proof.title")}
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-zinc-300 md:text-base">
              {t("landing.proof.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {proofStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
              >
                <p className="text-lg font-black text-gold-gradient md:text-2xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-zinc-400 md:text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:mt-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-bold text-emerald-300">{t("landing.proof.card1.title")}</p>
              <p className="mt-1 text-xs text-zinc-300">
                {t("landing.proof.card1.desc")}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-sm font-bold text-cyan-300">{t("landing.proof.card2.title")}</p>
              <p className="mt-1 text-xs text-zinc-300">
                {t("landing.proof.card2.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRODUCT DEMO SECTION --- */}
      <section className="relative z-10 px-4 pb-8 md:pb-14">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8 backdrop-blur-md">
          <div className="mb-6 text-center md:mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              {t("landing.product.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white md:text-4xl">
              {t("landing.product.title")}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
              <p className="text-lg font-black text-white">{t("landing.product.templates.title")}</p>
              <p className="mt-2 text-sm text-zinc-300">
                {t("landing.product.templates.desc")}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>{t("landing.product.templates.b1")}</li>
                <li>{t("landing.product.templates.b2")}</li>
                <li>{t("landing.product.templates.b3")}</li>
              </ul>
              <Link
                href="/templates"
                onClick={() => handleCtaClick("compare_templates", "primary")}
                className="mt-5 inline-flex rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-400/20"
              >
                {t("landing.product.templates.cta")}
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
              <p className="text-lg font-black text-white">{t("landing.product.cloner.title")}</p>
              <p className="mt-2 text-sm text-zinc-300">
                {t("landing.product.cloner.desc")}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>{t("landing.product.cloner.b1")}</li>
                <li>{t("landing.product.cloner.b2")}</li>
                <li>{t("landing.product.cloner.b3")}</li>
              </ul>
              <Link
                href="/cloner/web"
                onClick={() => handleCtaClick("compare_cloner", "secondary")}
                className="mt-5 inline-flex rounded-xl border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-400/20"
              >
                {t("landing.product.cloner.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- USE CASES SECTION --- */}
      <section className="relative z-10 px-4 pb-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative mb-6 text-center md:mb-8">
            <div className="pointer-events-none absolute inset-x-0 -top-3 flex items-center justify-center gap-4 opacity-85">
              {["\u{1F525}", "\u2728", "\u{1F680}", "\u{1F48E}"].map((emoji, idx) => (
                <span
                  key={emoji}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg shadow-[0_8px_20px_rgba(0,0,0,0.35)] animate-bounce"
                  style={{
                    animationDelay: `${idx * 0.25}s`,
                    animationDuration: "3s",
                  }}
                  aria-hidden="true"
                >
                  {emoji}
                </span>
              ))}
            </div>
            <h2 className="text-2xl font-extrabold text-white md:text-4xl">
              {t("landing.useCases.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
              {t("landing.useCases.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div
                key={item.key}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition-all duration-300 hover:-translate-y-1 ${item.border}`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-2xl shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-110">
                        <span className="animate-pulse" style={{ animationDuration: "2.5s" }}>
                          {item.emoji}
                        </span>
                      </div>
                      <p className="text-lg font-black text-white">{item.title}</p>
                    </div>
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-200">
                      {item.tag}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-200">{item.desc}</p>

                  <Link
                    href="/templates"
                    onClick={() => handleCtaClick(`use_case_${item.key}`, "secondary")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition-colors hover:text-amber-200"
                  >
                    {t("landing.useCases.cta")}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">{"\u2192"}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
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

          <div className="relative w-full max-w-7xl mx-auto px-4">
            {/* Desktop View with 3 Testimonials and Arrows */}
            <div className="hidden md:flex items-center justify-center gap-8 relative py-4">
              {/* Left Arrow */}
              <button
                onClick={prevTestimonial}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group shadow-xl"
                aria-label="Previous testimonials"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="flex gap-6 justify-center items-stretch">
                {[0, 1, 2].map((offset) => {
                  const t = testimonials[(currentTestimonial + offset) % testimonials.length];
                  return (
                    <div
                      key={`${t.name}-${offset}`}
                      className="glass w-[380px] p-8 rounded-3xl hover:bg-white/5 transition-all duration-500 flex flex-col gap-4 flex-shrink-0 animate-fade-in border border-white/10 hover:border-yellow-500/30 group/card"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover/card:border-yellow-500/50 transition-colors shadow-lg">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xl tracking-tight">
                            {t.name}
                          </h3>
                          <p className="text-xs text-yellow-400 uppercase tracking-widest font-bold mt-1">
                            {t.role}
                          </p>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-white text-base leading-relaxed mb-6 font-medium italic opacity-90 min-h-[120px] flex items-center">
                        &quot;{t.text}&quot;
                      </p>

                      {/* Stars */}
                      <div className="flex gap-1 mt-auto">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={i < t.stars ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`w-5 h-5 ${
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
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextTestimonial}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group shadow-xl"
                aria-label="Next testimonials"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 p-3 backdrop-blur-md md:hidden">
        <Link
          href="/auth"
          onClick={() => handleCtaClick("mobile_sticky", "primary")}
          className="btn btn-deluxe block w-full py-3 text-center font-black"
        >
          {t("landing.mobile.stickyCta")}
        </Link>
      </div>

      <Footer />
    </div>
  );
}
