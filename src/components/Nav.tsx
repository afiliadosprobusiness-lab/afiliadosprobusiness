"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Session = {
  email?: string;
  name?: string;
};

export default function Nav() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved =
      localStorage.getItem("fastPageUser") ||
      localStorage.getItem("fp_session");
    setSession(saved ? JSON.parse(saved) : null);
  }, []);

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

  const navLinks = [
    { name: "Inicio", href: "/", emoji: "" },
    { name: "Creador", href: "/builder", emoji: "" },
    { name: "Clonador", href: "/cloner", emoji: "" },
    { name: "Hub", href: "/hub", emoji: "" },
  ];

  return (
    <>
      {/* Desktop Navigation Layout */}
      <div className="hidden md:block">
        {/* Logo - Top Left */}
        <div className="fixed top-8 left-8 z-50">
          <Link href="/" className="flex items-center gap-2 hover-vibrate">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg">
              C
            </div>
          </Link>
        </div>

        {/* Center Pill Nav */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-pill px-2 py-2 flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth - Top Right */}
        <div className="fixed top-8 right-8 z-50 flex items-center gap-4">
          {!session ? (
            <Link
              href="/auth?tab=register"
              className="flex items-center gap-2 text-sm font-medium hover:text-white text-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Crear Cuenta
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">{session.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("fastPageUser");
                  localStorage.removeItem("fp_session");
                  window.location.href = "/auth";
                }}
                className="text-sm text-muted hover:text-red-400"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Layout */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 bg-bg/80 backdrop-blur-md border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold">
              C
            </div>
            <span>Fast Page</span>
          </Link>

          <button className="p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
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
                    className="text-2xl font-medium py-4 border-b border-white/5 text-muted hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4">
                {!session ? (
                  <Link
                    href="/auth?tab=register"
                    className="btn btn-primary w-full py-4 text-lg"
                  >
                    Comenzar Ahora
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      localStorage.removeItem("fastPageUser");
                      localStorage.removeItem("fp_session");
                      window.location.href = "/auth";
                    }}
                    className="btn btn-secondary w-full py-4 text-lg text-red-400"
                  >
                    Cerrar Sesión
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
