"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowUp } from "lucide-react";

export default function FloatingControls() {
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 md:gap-3 z-50">
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="p-1.5 md:p-2 bg-zinc-900 border border-zinc-800 rounded-full shadow-xl hover:scale-110 transition-all group animate-fade-in"
          aria-label={t("floating.scrollTop")}
        >
          <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
        </button>
      )}

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="px-2 py-1 md:px-3 md:py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
        aria-label={t("floating.toggleLanguage")}
      >
        <span className="text-[10px] md:text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">
          {language === "es" ? "EN" : "ES"}
        </span>
      </button>
    </div>
  );
}
