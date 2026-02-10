"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Layout,
  Copy,
  BarChart2,
  Settings,
  ArrowRight,
  LogOut,
  LayoutGrid,
} from "lucide-react";

export default function HubPage() {
  const { user, loading, logout } = useAuth(true);
  const router = useRouter();
  const { t } = useLanguage();
  const userName = user?.name || "Creador";

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const panels = [
    {
      title: t("hub.builder.title"),
      description: t("hub.builder.desc"),
      icon: <Layout className="w-8 h-8 text-gold-500" />,
      action: t("hub.builder.action"),
      href: "/builder",
      gradient: "from-zinc-900 to-zinc-900",
      border: "hover:border-gold-500/50",
    },
    {
      title: t("hub.cloner.title"),
      description: t("hub.cloner.desc"),
      icon: <LayoutGrid className="w-8 h-8 text-cyan-400" />,
      action: t("hub.cloner.action"),
      href: "/cloner",
      gradient: "from-zinc-900 to-zinc-900",
      border: "hover:border-cyan-500/50",
    },
    {
      title: t("hub.webcloner.title"),
      description: t("hub.webcloner.desc"),
      icon: <Copy className="w-8 h-8 text-cyan-400" />,
      action: t("hub.webcloner.action"),
      href: "/cloner/web",
      gradient: "from-zinc-900 to-zinc-900",
      border: "hover:border-cyan-500/50",
    },
    {
      title: t("hub.metrics.title"),
      description: t("hub.metrics.desc"),
      icon: <BarChart2 className="w-8 h-8 text-purple-400" />,
      action: t("hub.metrics.action"),
      href: "/metrics",
      gradient: "from-zinc-900 to-zinc-900",
      border: "hover:border-purple-500/50",
    },
    {
      title: t("hub.config.title"),
      description: t("hub.config.desc"),
      icon: <Settings className="w-8 h-8 text-amber-400" />,
      action: t("hub.config.action"),
      href: "/settings",
      gradient: "from-zinc-900 to-zinc-900",
      border: "hover:border-amber-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pt-20 md:pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.03),transparent_70%)]" />
          <div className="absolute top-1/4 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-purple-900/5 rounded-full blur-[80px] md:blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-yellow-600/5 rounded-full blur-[60px] md:blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center md:text-left animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {t("hub.welcome")}{" "}
              <span className="text-gold-glow block md:inline">{userName}</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg">
              {t("hub.subtitle")}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {panels.map((panel, index) => (
              <div
                key={index}
                onClick={() => router.push(panel.href)}
                className={`group relative p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 bg-gradient-to-br ${panel.gradient} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${panel.border} overflow-hidden`}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="mb-6">
                    <div className="mb-4 p-3 bg-white/5 rounded-2xl w-fit backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
                      {panel.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-gold-gradient transition-colors">
                      {panel.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {panel.description}
                    </p>
                  </div>

                  <div className="flex items-center text-sm font-semibold tracking-wide uppercase text-zinc-500 group-hover:text-white transition-colors gap-2">
                    {panel.action}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="mt-12 flex justify-center md:justify-start">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span>{t("hub.logout")}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
