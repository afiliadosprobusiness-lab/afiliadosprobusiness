"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { TemplateGenerator } from "@/lib/templateGenerator";
import {
  Utensils,
  Cpu,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Pizza,
  ChefHat,
  Fish,
  Flame,
  Coffee,
  Smartphone,
  Globe,
  Rocket,
  Building,
  Scale,
  Stethoscope,
  Code2,
  Heart,
  Dumbbell,
  Scissors,
  Flower2,
  GraduationCap,
  BookOpen,
  Languages,
  ShoppingBag,
  Laptop,
  Dog,
  Sofa,
  Wrench,
  Zap,
  Hammer,
  Car,
  Camera,
  Music,
  PartyPopper,
  User,
  Sparkles,
  School,
  Monitor,
  Loader2,
} from "lucide-react";

export default function ClonerPage() {
  const { user, loading } = useAuth(true);
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const models = [
    {
      id: "restaurant",
      title: t("cloner.restaurant.title"),
      description: t("cloner.restaurant.desc"),
      icon: <Utensils className="w-12 h-12 text-orange-500" />,
      gradient: "from-orange-500/10 to-red-500/10",
      border: "hover:border-orange-500",
      textGradient: "group-hover:text-orange-400",
      emoji: "🍔",
      animation: "hover:scale-105",
      features: ["Menu Digital", "Reservas", "QR Code"],
    },
    {
      id: "tech",
      title: t("cloner.tech.title"),
      description: t("cloner.tech.desc"),
      icon: <Cpu className="w-12 h-12 text-cyan-400" />,
      gradient: "from-cyan-500/10 to-blue-500/10",
      border: "hover:border-cyan-400",
      textGradient: "group-hover:text-cyan-300",
      emoji: "🚀",
      animation: "hover:-translate-y-2",
      features: ["SaaS Landing", "Dark Mode", "Animations"],
    },
    {
      id: "office",
      title: t("cloner.office.title"),
      description: t("cloner.office.desc"),
      icon: <Briefcase className="w-12 h-12 text-slate-300" />,
      gradient: "from-slate-500/10 to-gray-500/10",
      border: "hover:border-slate-300",
      textGradient: "group-hover:text-white",
      emoji: "💼",
      animation: "hover:shadow-xl",
      features: ["Corporate", "Trust", "Services"],
    },
    {
      id: "beauty",
      title: t("cloner.beauty.title"),
      description: t("cloner.beauty.desc"),
      icon: <Heart className="w-12 h-12 text-pink-400" />,
      gradient: "from-pink-500/10 to-rose-500/10",
      border: "hover:border-pink-400",
      textGradient: "group-hover:text-pink-300",
      emoji: "💅",
      animation: "hover:scale-105",
      features: ["Booking", "Gallery", "Relax"],
    },
    {
      id: "education",
      title: t("cloner.education.title"),
      description: t("cloner.education.desc"),
      icon: <GraduationCap className="w-12 h-12 text-blue-400" />,
      gradient: "from-blue-500/10 to-indigo-500/10",
      border: "hover:border-blue-400",
      textGradient: "group-hover:text-blue-300",
      emoji: "🎓",
      animation: "hover:-translate-y-2",
      features: ["LMS", "Courses", "Certificates"],
    },
    {
      id: "ecommerce",
      title: t("cloner.ecommerce.title"),
      description: t("cloner.ecommerce.desc"),
      icon: <ShoppingBag className="w-12 h-12 text-emerald-400" />,
      gradient: "from-emerald-500/10 to-green-500/10",
      border: "hover:border-emerald-400",
      textGradient: "group-hover:text-emerald-300",
      emoji: "🛍️",
      animation: "hover:shadow-xl",
      features: ["Cart", "Payments", "Catalog"],
    },
    {
      id: "services",
      title: t("cloner.services.title"),
      description: t("cloner.services.desc"),
      icon: <Wrench className="w-12 h-12 text-amber-500" />,
      gradient: "from-amber-500/10 to-yellow-500/10",
      border: "hover:border-amber-500",
      textGradient: "group-hover:text-amber-400",
      emoji: "🛠️",
      animation: "hover:scale-105",
      features: ["Contact", "Portfolio", "Quotes"],
    },
    {
      id: "creative",
      title: t("cloner.creative.title"),
      description: t("cloner.creative.desc"),
      icon: <Sparkles className="w-12 h-12 text-purple-400" />,
      gradient: "from-purple-500/10 to-violet-500/10",
      border: "hover:border-purple-400",
      textGradient: "group-hover:text-purple-300",
      emoji: "🎨",
      animation: "hover:-translate-y-2",
      features: ["Gallery", "Audio", "Visuals"],
    },
  ];

  const subcategories: Record<string, any[]> = {
    restaurant: [
      {
        id: "pizzeria",
        title: t("cloner.restaurant.pizzeria"),
        icon: <Pizza className="w-8 h-8 text-orange-500" />,
        emoji: "🍕",
      },
      {
        id: "criolla",
        title: t("cloner.restaurant.criolla"),
        icon: <ChefHat className="w-8 h-8 text-amber-600" />,
        emoji: "🥘",
      },
      {
        id: "china",
        title: t("cloner.restaurant.china"),
        icon: <Utensils className="w-8 h-8 text-red-600" />,
        emoji: "🥡",
      },
      {
        id: "anticuchos",
        title: t("cloner.restaurant.anticuchos"),
        icon: <Flame className="w-8 h-8 text-red-500" />,
        emoji: "🍢",
      },
      {
        id: "sushi",
        title: t("cloner.restaurant.sushi"),
        icon: <Fish className="w-8 h-8 text-pink-400" />,
        emoji: "🍣",
      },
      {
        id: "cafe",
        title: t("cloner.restaurant.cafe"),
        icon: <Coffee className="w-8 h-8 text-amber-800" />,
        emoji: "☕",
      },
    ],
    tech: [
      {
        id: "saas",
        title: t("cloner.tech.saas"),
        icon: <Code2 className="w-8 h-8 text-indigo-400" />,
        emoji: "💻",
      },
      {
        id: "app",
        title: t("cloner.tech.app"),
        icon: <Smartphone className="w-8 h-8 text-cyan-400" />,
        emoji: "📱",
      },
      {
        id: "agency",
        title: t("cloner.tech.agency"),
        icon: <Globe className="w-8 h-8 text-purple-400" />,
        emoji: "🌐",
      },
      {
        id: "startup",
        title: t("cloner.tech.startup"),
        icon: <Rocket className="w-8 h-8 text-emerald-400" />,
        emoji: "🦄",
      },
    ],
    office: [
      {
        id: "realestate",
        title: t("cloner.office.realestate"),
        icon: <Building className="w-8 h-8 text-blue-400" />,
        emoji: "🏢",
      },
      {
        id: "law",
        title: t("cloner.office.law"),
        icon: <Scale className="w-8 h-8 text-amber-200" />,
        emoji: "⚖️",
      },
      {
        id: "consulting",
        title: t("cloner.office.consulting"),
        icon: <Briefcase className="w-8 h-8 text-slate-400" />,
        emoji: "📊",
      },
      {
        id: "medical",
        title: t("cloner.office.medical"),
        icon: <Stethoscope className="w-8 h-8 text-red-400" />,
        emoji: "🩺",
      },
    ],
    beauty: [
      {
        id: "spa",
        title: t("cloner.beauty.spa"),
        icon: <Flower2 className="w-8 h-8 text-pink-400" />,
        emoji: "🌸",
      },
      {
        id: "gym",
        title: t("cloner.beauty.gym"),
        icon: <Dumbbell className="w-8 h-8 text-slate-400" />,
        emoji: "💪",
      },
      {
        id: "yoga",
        title: t("cloner.beauty.yoga"),
        icon: <Heart className="w-8 h-8 text-rose-400" />,
        emoji: "🧘",
      },
      {
        id: "barber",
        title: t("cloner.beauty.barber"),
        icon: <Scissors className="w-8 h-8 text-amber-600" />,
        emoji: "💈",
      },
    ],
    education: [
      {
        id: "course",
        title: t("cloner.education.course"),
        icon: <Monitor className="w-8 h-8 text-blue-500" />,
        emoji: "💻",
      },
      {
        id: "school",
        title: t("cloner.education.school"),
        icon: <School className="w-8 h-8 text-indigo-500" />,
        emoji: "🏫",
      },
      {
        id: "tutor",
        title: t("cloner.education.tutor"),
        icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
        emoji: "📚",
      },
      {
        id: "language",
        title: t("cloner.education.language"),
        icon: <Languages className="w-8 h-8 text-rose-500" />,
        emoji: "🗣️",
      },
    ],
    ecommerce: [
      {
        id: "fashion",
        title: t("cloner.ecommerce.fashion"),
        icon: <ShoppingBag className="w-8 h-8 text-pink-500" />,
        emoji: "👗",
      },
      {
        id: "tech",
        title: t("cloner.ecommerce.tech"),
        icon: <Laptop className="w-8 h-8 text-slate-400" />,
        emoji: "⌨️",
      },
      {
        id: "pets",
        title: t("cloner.ecommerce.pets"),
        icon: <Dog className="w-8 h-8 text-amber-500" />,
        emoji: "🐾",
      },
      {
        id: "home",
        title: t("cloner.ecommerce.home"),
        icon: <Sofa className="w-8 h-8 text-emerald-600" />,
        emoji: "🛋️",
      },
    ],
    services: [
      {
        id: "plumber",
        title: t("cloner.services.plumber"),
        icon: <Wrench className="w-8 h-8 text-blue-500" />,
        emoji: "🔧",
      },
      {
        id: "electrician",
        title: t("cloner.services.electrician"),
        icon: <Zap className="w-8 h-8 text-yellow-500" />,
        emoji: "⚡",
      },
      {
        id: "cleaning",
        title: t("cloner.services.cleaning"),
        icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
        emoji: "🧹",
      },
      {
        id: "mechanic",
        title: t("cloner.services.mechanic"),
        icon: <Car className="w-8 h-8 text-red-500" />,
        emoji: "🚗",
      },
    ],
    creative: [
      {
        id: "photography",
        title: t("cloner.creative.photography"),
        icon: <Camera className="w-8 h-8 text-slate-800 dark:text-slate-200" />,
        emoji: "📸",
      },
      {
        id: "music",
        title: t("cloner.creative.music"),
        icon: <Music className="w-8 h-8 text-purple-500" />,
        emoji: "🎵",
      },
      {
        id: "wedding",
        title: t("cloner.creative.wedding"),
        icon: <PartyPopper className="w-8 h-8 text-pink-500" />,
        emoji: "💍",
      },
      {
        id: "portfolio",
        title: t("cloner.creative.portfolio"),
        icon: <User className="w-8 h-8 text-blue-400" />,
        emoji: "👤",
      },
    ],
  };

  const handleSelect = (id: string) => {
    setSelectedModel(id);
  };

  const handleBack = () => {
    setSelectedModel(null);
    setTemplateError(null);
  };

  const handleCreateTemplate = async (sub: { id: string; title: string }) => {
    if (loading) return;
    if (!user?.uid) {
      setTemplateError("Debes iniciar sesion para crear una plantilla editable.");
      return;
    }
    if (!selectedModel) {
      setTemplateError("Selecciona primero un modelo de negocio.");
      return;
    }

    const createKey = `${selectedModel}:${sub.id}`;
    setCreatingTemplate(createKey);
    setTemplateError(null);
    try {
      const siteId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);

      const html = TemplateGenerator.generate({
        category: selectedModel,
        specialty: sub.id,
        businessName: sub.title,
      });

      await setDoc(doc(db, "cloned_sites", siteId), {
        id: siteId,
        html,
        userId: user.uid,
        category: selectedModel,
        specialty: sub.id,
        templateName: sub.title,
        source: "template-model",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        published: false,
        status: "draft",
      });

      router.push(`/editor/${siteId}`);
    } catch (error: any) {
      console.error("Error creating template project:", error);
      setTemplateError("No se pudo crear la plantilla. Verifica permisos de Firestore e intenta otra vez.");
    } finally {
      setCreatingTemplate(null);
    }
  };

  const currentSubcategories = selectedModel
    ? subcategories[selectedModel]
    : [];
  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.02),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              {t("cloner.title")} <span className="text-gold-glow">Deluxe</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              {selectedModel ? (
                <span className="flex items-center justify-center gap-2">
                  {currentModel?.title}
                </span>
              ) : (
                t("cloner.subtitle")
              )}
            </p>
          </div>

          {!selectedModel ? (
            // Main Models Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {models.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`
                    group relative p-6 rounded-[2rem] border border-white/5 
                    bg-zinc-900/50 backdrop-blur-sm cursor-pointer 
                    transition-all duration-500 ease-out
                    ${model.border} ${model.animation}
                  `}
                >
                  {/* Inner Gradient */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10 flex flex-col h-full items-center text-center">
                    {/* Floating Emoji */}
                    <div className="absolute -top-10 text-5xl animate-bounce-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                      {model.emoji}
                    </div>

                    {/* Icon Container */}
                    <div className="mb-4 p-5 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      {model.icon}
                    </div>

                    <h3
                      className={`text-xl font-bold mb-3 transition-colors duration-300 ${model.textGradient}`}
                    >
                      {model.title}
                    </h3>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed line-clamp-2">
                      {model.description}
                    </p>

                    {/* Features List - Limit to 2 for compact view */}
                    <div className="mt-auto w-full space-y-2 mb-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      {model.features.slice(0, 2).map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-gold-500" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-2.5 rounded-full border border-white/10 bg-white/5 group-hover:bg-gold-500 group-hover:text-black group-hover:border-gold-500 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2">
                      {t("cloner.select")}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Subcategories Grid
            <div className="animate-fade-in-up">
              <button
                onClick={handleBack}
                className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-gold-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("cloner.back")}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSubcategories.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleCreateTemplate(sub)}
                    className="
                      group relative p-6 rounded-[1.5rem] border border-white/5 
                      bg-zinc-900/30 backdrop-blur-sm cursor-pointer 
                      hover:bg-zinc-800/50 hover:border-gold-500/30
                      transition-all duration-300 hover:scale-[1.02]
                    "
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-gold-500/10 transition-colors">
                        {sub.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-gold-500 transition-colors">
                          {sub.title}
                        </h3>
                        <div className="text-sm text-zinc-500 group-hover:text-zinc-400">
                          Template v1.0
                        </div>
                      </div>
                      <div className="ml-auto text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300">
                        {sub.emoji}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-5 w-full py-2.5 rounded-full border border-white/10 bg-white/5 group-hover:bg-gold-500 group-hover:text-black group-hover:border-gold-500 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateTemplate(sub);
                      }}
                      disabled={creatingTemplate === `${selectedModel}:${sub.id}`}
                    >
                      {creatingTemplate === `${selectedModel}:${sub.id}` ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando plantilla...
                        </>
                      ) : (
                        <>
                          Crear y Editar
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {templateError && (
                <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300 px-4 py-3 text-sm font-semibold">
                  {templateError}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
