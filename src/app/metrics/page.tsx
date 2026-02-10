"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Globe, 
  Zap, 
  Clock, 
  ArrowUpRight,
  Layout,
  Copy,
  LayoutGrid,
  Search,
  ExternalLink,
  Lightbulb,
  CheckCircle2
} from "lucide-react";

export default function MetricsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // Datos simulados para las métricas (esto vendría de una API real de analíticas)
  const stats = [
    { label: "Visitas Totales", value: "12,840", icon: <Users className="w-5 h-5 text-blue-400" />, trend: "+12.5%" },
    { label: "Conversión Media", value: "3.2%", icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, trend: "+0.8%" },
    { label: "Tiempo en Página", value: "2m 45s", icon: <Clock className="w-5 h-5 text-purple-400" />, trend: "-2s" },
    { label: "Clicks Totales", value: "4,210", icon: <MousePointer2 className="w-5 h-5 text-amber-400" />, trend: "+18.2%" },
  ];

  const projects = [
    { id: 1, name: "Landing Venta iPhone", type: "Constructor", visits: 2450, conversion: "4.1%", status: "Pro", color: "text-amber-400" },
    { id: 2, name: "Clon Apple Store", type: "Clonador", visits: 1820, conversion: "2.8%", status: "Live", color: "text-cyan-400" },
    { id: 3, name: "Plantilla E-commerce", type: "Plantilla", visits: 980, conversion: "3.5%", status: "Live", color: "text-emerald-400" },
  ];

  const tips = [
    { title: "Optimiza el tiempo de carga", desc: "Tus páginas clonadas podrían cargar un 20% más rápido si optimizas las imágenes.", icon: <Zap className="w-5 h-5 text-amber-400" /> },
    { title: "Mejora el SEO", desc: "Agrega etiquetas meta a tus proyectos del constructor para aumentar el tráfico orgánico.", icon: <Search className="w-5 h-5 text-blue-400" /> },
    { title: "Call to Action", desc: "Hemos detectado que los botones de color naranja convierten un 15% mejor en tus plantillas.", icon: <Lightbulb className="w-5 h-5 text-emerald-400" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                Métricas PRO
              </h1>
              <p className="text-zinc-500 mt-2">Analiza el rendimiento real de tus proyectos y clones.</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveMetric("all")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMetric === "all" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-500 hover:text-white"}`}
              >
                Todo
              </button>
              <button 
                onClick={() => setActiveMetric("clones")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMetric === "clones" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-500 hover:text-white"}`}
              >
                Clones
              </button>
              <button 
                onClick={() => setActiveMetric("projects")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMetric === "projects" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-500 hover:text-white"}`}
              >
                Proyectos
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl backdrop-blur-sm group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-zinc-500 text-sm font-medium">{stat.label}</h3>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Project List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">Rendimiento por Proyecto</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="pb-4 font-black">Proyecto</th>
                        <th className="pb-4 font-black">Tipo</th>
                        <th className="pb-4 font-black">Visitas</th>
                        <th className="pb-4 font-black">Conv.</th>
                        <th className="pb-4 font-black">Estado</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {projects.map((project) => (
                        <tr key={project.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${project.color}`} />
                              <span className="text-white font-bold group-hover:text-purple-400 transition-colors">{project.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-zinc-400 text-sm">{project.type}</td>
                          <td className="py-4 text-white font-medium">{project.visits.toLocaleString()}</td>
                          <td className="py-4 text-white font-medium">{project.conversion}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-white/5 text-zinc-400 text-[10px] font-bold rounded-lg border border-white/10 uppercase">
                              {project.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time Graph Placeholder */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-purple-500 animate-pulse" />
                </div>
                <h4 className="text-white font-bold mb-1">Mapa de Calor y Tráfico en Vivo</h4>
                <p className="text-zinc-500 text-sm max-w-xs">Visualiza de dónde vienen tus usuarios y dónde hacen clic en tiempo real.</p>
              </div>
            </div>

            {/* Sidebar: Insights & Suggestions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-600/5 border border-purple-500/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                  Insights PRO
                </h3>
                <div className="space-y-4">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex-shrink-0">{tip.icon}</div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{tip.title}</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 bg-white text-black font-black text-xs uppercase tracking-wider py-4 rounded-2xl hover:bg-zinc-200 transition-all">
                  Generar Reporte Completo
                </button>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Servicios Utilizados</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layout className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-zinc-400">Constructor</span>
                    </div>
                    <span className="text-white font-bold text-sm">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: "85%" }} />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-zinc-400">Clonador Web</span>
                    </div>
                    <span className="text-white font-bold text-sm">42%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: "42%" }} />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-zinc-400">Plantillas</span>
                    </div>
                    <span className="text-white font-bold text-sm">68%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
