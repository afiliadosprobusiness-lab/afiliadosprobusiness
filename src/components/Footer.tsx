"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const FOOTER_LINKS = [
  { labelKey: "nav.hub", href: "/hub" },
  { labelKey: "nav.builder", href: "/builder" },
  { labelKey: "nav.templates", href: "/templates" },
  { labelKey: "nav.cloner", href: "/cloner/web" },
  { labelKey: "nav.store", href: "/store" },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-white/10 bg-black/70 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-2">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gold-gradient">
                Fast Page
              </p>
              <p className="text-xs text-zinc-400">
                {t("footer.description")}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-amber-300"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-zinc-500 md:text-left">
          {t("footer.rights").replace("{year}", String(year))}
        </div>
      </div>
    </footer>
  );
}
