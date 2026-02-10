"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Zap, LogOut } from "lucide-react";

export default function Nav() {
  const { user: session, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = useMemo(() => {
    if (!session) {
      return [];
    }

    return [
      { name: t("nav.hub"), href: "/hub", emoji: "" },
      { name: t("nav.builder"), href: "/builder", emoji: "" },
      { name: t("nav.templates"), href: "/cloner", emoji: "" },
      { name: t("nav.cloner"), href: "/cloner/web", emoji: "" },
      { name: t("nav.metrics"), href: "/metrics", emoji: "" },
      { name: t("nav.settings"), href: "/settings", emoji: "" },
    ];
  }, [session, t]);

  if (pathname === "/auth" || pathname.startsWith("/editor")) return null;

  return (
    <>
      {/* Desktop Navigation Layout */}
      <div className="hidden md:block">
        {/* Logo - Top Left */}
        <div className="fixed top-8 left-8 z-50">
          {session ? (
            <div className="flex items-center gap-2 cursor-default" aria-label="Fast Page Home">
              <Zap className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
              <span className="text-lg font-black tracking-tighter text-gold-gradient drop-shadow-sm">FAST PAGE</span>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 group transition-all" aria-label="Fast Page Home">
              <Zap className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)] group-hover:scale-110 transition-transform duration-300" />
              <span className="text-lg font-black tracking-tighter text-gold-gradient drop-shadow-sm group-hover:brightness-110 transition-all">FAST PAGE</span>
            </Link>
          )}
        </div>

        {/* Center Minimalist Nav */}
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-transparent">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link-glow text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${
                pathname === link.href
                  ? "text-amber-400 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth - Top Right */}
        <div className="fixed top-8 right-8 z-50 flex items-center gap-6">
          {!session ? (
            <>
              <Link
                href="/auth?tab=login"
                className="nav-link-glow flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-white transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t("nav.login")}
              </Link>
              <Link
                href="/auth?tab=register"
                className="nav-link-glow flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-white transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t("nav.create_account")}
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400 font-medium">{session.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all duration-300 border border-red-500/20 group"
                title={t("nav.logout")}
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("nav.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Layout */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 bg-bg/80 backdrop-blur-md border-b border-border">
          {session ? (
            <div className="flex items-center gap-2 font-bold text-lg cursor-default" aria-label="Fast Page Home">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>Fast Page</span>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg" aria-label="Fast Page Home">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>Fast Page</span>
            </Link>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/70 hover:text-white transition-colors active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-2 text-white/70 hover:text-white transition-colors active:scale-95"
              aria-label="Go forward"
            >
              <ChevronRight size={24} />
            </button>
            <button
              className="p-2 text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
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
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay - Portaled to body to avoid clipping */}
        {isOpen &&
          createPortal(
            <div className="fixed inset-0 z-[100] bg-bg flex flex-col pt-24 px-6 animate-in fade-in slide-in-from-top-4 duration-200 overflow-y-auto">
              <button
                className="absolute top-4 right-4 p-2 text-white"
                onClick={() => setIsOpen(false)}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-2xl font-medium py-4 border-b border-white/5 text-white hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4">
                {!session ? (
                  <>
                    <Link
                      href="/auth?tab=login"
                      className="btn btn-secondary w-full py-4 text-lg rounded-full text-center hover:scale-105 transition-transform"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/auth?tab=register"
                      className="btn btn-primary w-full py-4 text-lg rounded-full text-center hover:scale-105 transition-transform"
                    >
                      {t("nav.create_account")}
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/20 transition-all active:scale-95"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider">{t("nav.logout")}</span>
                  </button>
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </>
  );
}
