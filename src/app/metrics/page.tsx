"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function MetricsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMetric, setActiveMetric] = useState("all");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async (isAuto = false) => {
    if (!user?.uid) return;
    
    if (!isAuto) setRefreshing(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/metrics?userId=${user.uid}`);
      if (!res.ok) throw new Error("Error al obtener métricas");
      const result = await res.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Fetch metrics error:", err);
      setError("No se pudieron cargar los datos dinámicos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  // Initial load
  useEffect(() => {
    if (!authLoading && user?.uid) {
      fetchMetrics();
    }
  }, [authLoading, user?.uid, fetchMetrics]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-bold animate-pulse">Sincronizando datos PRO...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Visitas Totales", 
      value: data?.summary?.totalVisits || "0", 
      icon: <Users className="w-5 h-5 text-blue-400" />, 
      trend: data?.summary?.trends?.visits?.label || "+0.0%",
      trendPositive: data?.summary?.trends?.visits?.positive ?? true,
      color: "blue"
    },
    { 
      label: "Conversion Media", 
      value: data?.summary?.avgConversion || "0%", 
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, 
      trend: data?.summary?.trends?.conversion?.label || "+0.0%",
      trendPositive: data?.summary?.trends?.conversion?.positive ?? true,
      color: "emerald"
    },
    { 
      label: "Tiempo en Pagina", 
      value: data?.summary?.avgLoadTime || "0s", 
      icon: <Clock className="w-5 h-5 text-purple-400" />, 
      trend: data?.summary?.trends?.loadTime?.label || "+0.0s",
      trendPositive: data?.summary?.trends?.loadTime?.positive ?? true,
      color: "purple"
    },
    { 
      label: "Clicks Totales", 
      value: data?.summary?.totalClicks || "0", 
      icon: <MousePointer2 className="w-5 h-5 text-amber-400" />, 
      trend: data?.summary?.trends?.clicks?.label || "+0.0%",
      trendPositive: data?.summary?.trends?.clicks?.positive ?? true,
      color: "amber"
    },
  ];

  const filteredProjects = data?.details?.filter((p: any) => {
    if (activeMetric === "all") return true;
    if (activeMetric === "clones") return p.type === "Clonador";
    if (activeMetric === "projects") return p.type === "Constructor" || p.type === "Plantilla";
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative">
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                Métricas PRO
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-zinc-500">Datos reales de tus proyectos y clones.</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900/80 rounded-full border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {refreshing ? 'Actualizando...' : `Sincronizado: ${lastUpdated.toLocaleTimeString()}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => fetchMetrics()}
                disabled={refreshing}
                className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                {["all", "clones", "projects"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveMetric(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeMetric === tab ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-500 hover:text-white"}`}
                  >
                    {tab === "all" ? "Todo" : tab === "clones" ? "Clones" : "Proyectos"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-fade-in">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl backdrop-blur-sm group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trendPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-zinc-500 text-sm font-medium">{stat.label}</h3>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Charts & Project List */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Main Chart */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Tráfico Semanal</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-xs text-zinc-500 font-bold uppercase">Visitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs text-zinc-500 font-bold uppercase">Conversiones</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.chartData || []}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitas" 
                        stroke="#a855f7" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorVisits)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="conversiones" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={0} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Project Table */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Rendimiento por Proyecto</h3>
                  <span className="text-xs font-bold text-zinc-500 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {filteredProjects.length} Proyectos
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                        <th className="pb-4">Proyecto</th>
                        <th className="pb-4">Tipo</th>
                        <th className="pb-4">Visitas</th>
                        <th className="pb-4">Conv.</th>
                        <th className="pb-4">Rebote</th>
                        <th className="pb-4">Estado</th>
                        <th className="pb-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProjects.length > 0 ? filteredProjects.map((project: any) => (
                        <tr key={project.id} className="group hover:bg-white/[0.02] transition-all">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${project.type === 'Clonador' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                              <span className="text-white font-bold group-hover:text-purple-400 transition-colors truncate max-w-[150px]">
                                {project.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${project.type === 'Clonador' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {project.type}
                            </span>
                          </td>
                          <td className="py-4 text-white font-medium">{project.visits.toLocaleString()}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              {project.conversion}
                              <TrendingUp className="w-3 h-3" />
                            </div>
                          </td>
                          <td className="py-4 text-zinc-400 text-sm">{project.bounceRate}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase ${project.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="p-2 hover:bg-purple-500/20 rounded-lg text-zinc-500 hover:text-purple-400 transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-zinc-500 font-medium">
                            No se encontraron proyectos para este filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar: Insights & Performance */}
            <div className="space-y-8">
              
              {/* Performance Scores */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6">Rendimiento Técnico</h3>
                <div className="space-y-6">
                  {[
                    { label: "Carga LCP", value: 92, color: "emerald", icon: <Zap className="w-4 h-4" /> },
                    { label: "SEO Score", value: 85, color: "blue", icon: <Search className="w-4 h-4" /> },
                    { label: "Accesibilidad", value: 98, color: "purple", icon: <Globe className="w-4 h-4" /> }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`text-${item.color}-400`}>{item.icon}</div>
                          <span className="text-sm text-zinc-400 font-medium">{item.label}</span>
                        </div>
                        <span className="text-white font-black text-sm">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${item.color}-500 transition-all duration-1000`} 
                          style={{ width: `${item.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-600/5 border border-purple-500/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                  Insights PRO
                </h3>
                <div className="space-y-4">
                  {[
                    { title: "Optimiza Imágenes", desc: "Tus páginas clonadas podrían cargar un 20% más rápido.", icon: <Zap className="w-5 h-5 text-amber-400" /> },
                    { title: "Mejora el SEO", desc: "Agrega etiquetas meta para aumentar el tráfico orgánico.", icon: <Search className="w-5 h-5 text-blue-400" /> },
                    { title: "Smart CTA", desc: "Botones naranjas convierten 15% mejor en tus plantillas.", icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> }
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex-shrink-0 group-hover:scale-110 transition-transform">{tip.icon}</div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{tip.title}</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95">
                  Descargar Reporte PDF
                </button>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
