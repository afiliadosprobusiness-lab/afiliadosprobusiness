"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  User, 
  CreditCard, 
  Shield, 
  Camera, 
  Smartphone, 
  Mail, 
  CheckCircle,
  Save,
  Lock,
  Globe,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  AlignLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";

// --- Local Components (Constructor Maestro Pattern) ---

const SettingSection = ({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="pb-6 border-b border-white/5">
      <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
      <p className="text-zinc-500 font-medium">{desc}</p>
    </div>
    {children}
  </div>
);

const SettingInput = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false, helper }: any) => (
  <div className="space-y-3">
    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-amber-500" />} {label}
    </label>
    <div className="relative group">
      <input 
        type={type}
        disabled={disabled}
        className={`w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 outline-none transition-all font-medium ${disabled ? "opacity-50 cursor-not-allowed bg-zinc-900/20" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {disabled && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verificado</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
      )}
    </div>
    {helper && <p className="text-[10px] text-zinc-600 font-bold ml-2">{helper}</p>}
  </div>
);

  const SettingToggle = ({ label, icon: Icon, active, onToggle, desc }: any) => (
  <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all group">
    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0 w-full sm:w-auto">
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-6 ${active ? "bg-amber-500/10" : "bg-zinc-800"}`}>
        {Icon && <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${active ? "text-amber-500" : "text-zinc-500"}`} />}
      </div>
      <div className="flex-grow">
        <h3 className="text-white text-base sm:text-lg font-black uppercase tracking-tight">{label}</h3>
        <p className="text-zinc-500 text-xs sm:text-sm font-medium">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-14 h-8 sm:w-16 sm:h-9 rounded-full transition-all duration-500 relative shrink-0 ${active ? "bg-amber-500" : "bg-zinc-700"}`}
    >
      <div className={`absolute top-1 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full transition-all duration-500 shadow-xl ${active ? "left-7 sm:left-8" : "left-1"}`} />
    </button>
  </div>
);

// --- Main Page Component ---

export default function SettingsPage() {
  const { user: authUser, loading: authLoading, logout } = useAuth(true);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    avatar: "",
    company: "",
    website: "",
    bio: "",
    address: "",
    plan: "Free",
    twoFactorEmail: false,
    twoFactorPhone: false,
    language: "es",
    notifications: true
  });

  // Sync initial auth data immediately to avoid empty fields
  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        displayName: prev.displayName || authUser.name || "",
        email: prev.email || authUser.email || "",
        avatar: prev.avatar || authUser.photoURL || "",
      }));
      
      // If we have basic auth info, we can already show the page
      if (loading) {
        setLoading(false);
      }
    }
  }, [authUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading || !authUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", authUser.uid!));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData(prev => ({
            ...prev,
            displayName: data.name || data.displayName || prev.displayName || "",
            email: data.email || prev.email || "",
            phone: data.phone || prev.phone || "",
            avatar: data.avatar || prev.avatar || "",
            company: data.company || "",
            website: data.website || "",
            bio: data.bio || "",
            address: data.address || "",
            plan: data.plan || "Free",
            twoFactorEmail: data.twoFactorEmail || false,
            twoFactorPhone: data.twoFactorPhone || false,
            language: data.language || language || "es",
            notifications: data.notifications ?? true
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authLoading, authUser, language]);

  const validateForm = () => {
    if (formData.website && !formData.website.startsWith("http")) {
      setMessage({ type: "error", text: t("settings.validation.website") });
      return false;
    }
    if (formData.displayName.length < 3) {
      setMessage({ type: "error", text: t("settings.validation.name") });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!authUser || !auth.currentUser) return;
    if (!validateForm()) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
        photoURL: formData.avatar
      });

      await setDoc(doc(db, "users", authUser.uid!), {
        ...formData,
        name: formData.displayName,
        updatedAt: Date.now()
      }, { merge: true });

      // Update global language if changed
      if (formData.language !== language) {
        setLanguage(formData.language as any);
      }

      setMessage({ type: "success", text: t("settings.success") });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: t("settings.error") });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const tabs = useMemo(() => [
    { id: "profile", label: t("settings.tabs.profile"), icon: <User className="w-5 h-5" />, desc: t("settings.tabs.profile.desc") },
    { id: "account", label: t("settings.tabs.account"), icon: <Smartphone className="w-5 h-5" />, desc: t("settings.tabs.account.desc") },
    { id: "plan", label: t("settings.tabs.plan"), icon: <CreditCard className="w-5 h-5" />, desc: t("settings.tabs.plan.desc") },
    { id: "security", label: t("settings.tabs.security"), icon: <Shield className="w-5 h-5" />, desc: t("settings.tabs.security.desc") },
  ], [t]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-white font-bold text-xl tracking-wider uppercase">{t("settings.loading")}</p>
          <p className="text-zinc-500 text-sm animate-pulse">{t("settings.syncing")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Nav />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 uppercase flex items-center gap-4">
              {t("settings.title")}
              {loading && <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />}
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl font-medium">
              {t("settings.subtitle")}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-wider text-xs">{t("settings.logout")}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <nav className="hidden lg:flex flex-col gap-2 p-2 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex flex-col gap-1 px-6 py-5 rounded-[2rem] transition-all duration-500 ${
                      activeTab === tab.id 
                      ? "bg-amber-500 text-black shadow-[0_20px_40px_rgba(251,191,36,0.15)]" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {tab.icon}
                      <span className="font-black uppercase tracking-wider text-sm">{tab.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold ml-8 transition-opacity ${activeTab === tab.id ? "text-black/60" : "text-zinc-600 opacity-0 group-hover:opacity-100"}`}>
                      {tab.desc}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Mobile Navigation */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-full flex items-center justify-between p-6 bg-zinc-900/80 border border-white/10 rounded-3xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg shadow-amber-500/20">
                      {tabs.find(t => t.id === activeTab)?.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Sección Actual</p>
                      <p className="text-lg font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</p>
                    </div>
                  </div>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {mobileMenuOpen && (
                  <div className="grid grid-cols-1 gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${
                          activeTab === tab.id 
                          ? "bg-amber-500 border-amber-500 text-black font-bold" 
                          : "bg-zinc-900/50 border-white/5 text-zinc-400"
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${activeTab === tab.id ? "bg-black/10" : "bg-white/5"}`}>
                          {tab.icon}
                        </div>
                        <span className="font-bold uppercase tracking-wider text-xs">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="hidden lg:block p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-20 h-20 text-amber-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-1">Privacidad Total</p>
                  <p className="text-zinc-500 text-xs leading-relaxed">Tus datos están cifrados con estándares AES-256.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow">
            <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-6 sm:p-10 backdrop-blur-3xl relative overflow-hidden min-h-[600px]">
              
              {/* Feedback Message */}
              {message.text && (
                <div className={`absolute top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider animate-in slide-in-from-right-10 duration-500 ${
                  message.type === "success" 
                  ? "bg-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)]" 
                  : "bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
                }`}>
                  {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <SettingSection title={t("settings.profile.title")} desc={t("settings.profile.desc")}>
                  <div className="flex flex-col sm:flex-row items-center gap-10 pb-10 border-b border-white/5">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-[3rem] bg-zinc-800 border-2 border-white/10 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-20 h-20 text-zinc-600" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-4 bg-amber-500 text-black rounded-[1.5rem] shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300">
                        <Camera className="w-6 h-6" />
                        <input 
                          type="text" 
                          className="hidden" 
                          onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left flex-grow space-y-4">
                      <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                        <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{t("settings.profile.visual")}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white">{t("settings.tabs.profile")}</h2>
                      <div className="relative max-w-md group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="URL de tu foto de perfil"
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-zinc-300 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all"
                          value={formData.avatar}
                          onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingInput label={t("settings.profile.name")} icon={User} value={formData.displayName} onChange={(v: string) => setFormData({...formData, displayName: v})} placeholder="Escribe tu nombre" />
                    <SettingInput label={t("settings.profile.company")} icon={Briefcase} value={formData.company} onChange={(v: string) => setFormData({...formData, company: v})} placeholder="Nombre de tu marca" />
                    <SettingInput label={t("settings.profile.website")} icon={LinkIcon} value={formData.website} onChange={(v: string) => setFormData({...formData, website: v})} placeholder="https://tuportafolio.com" type="url" />
                    <SettingInput label={t("settings.profile.location")} icon={MapPin} value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} placeholder="Ciudad, País" />
                    
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-amber-500" /> {t("settings.profile.bio")}
                      </label>
                      <textarea 
                        rows={4}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-[2rem] px-6 py-5 text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 outline-none transition-all resize-none font-medium leading-relaxed"
                        placeholder="Resume tu experiencia..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                    </div>
                  </div>
                </SettingSection>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <SettingSection title={t("settings.account.title")} desc={t("settings.account.desc")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingInput label={t("settings.account.email")} icon={Mail} value={formData.email} disabled helper="El correo no puede ser cambiado por seguridad." />
                    <SettingInput label={t("settings.account.phone")} icon={Smartphone} value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="+51 999 999 999" type="tel" />
                    
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">{t("settings.account.language")}</label>
                      <div className="relative group">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                        <select 
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-14 pr-10 py-5 text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 outline-none transition-all appearance-none font-bold cursor-pointer"
                          value={formData.language}
                          onChange={(e) => setFormData({...formData, language: e.target.value})}
                        >
                          <option value="es" className="bg-zinc-900">Español (Latinoamérica)</option>
                          <option value="en" className="bg-zinc-900">English (Global)</option>
                          <option value="pt" className="bg-zinc-900">Português (Brasil)</option>
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-hover:text-white transition-colors rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">{t("settings.account.notifications")}</label>
                      <SettingToggle 
                        label="Alertas por Email"
                        icon={Bell}
                        active={formData.notifications}
                        onToggle={() => setFormData({...formData, notifications: !formData.notifications})}
                        desc="Recibe actualizaciones sobre tu cuenta."
                      />
                    </div>
                  </div>
                </SettingSection>
              )}

              {/* Plan Tab */}
              {activeTab === "plan" && (
                <SettingSection title={t("settings.plan.title")} desc="Potencia tus proyectos con herramientas de nivel empresarial.">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
                    <div className="px-5 py-2 bg-amber-500 text-black rounded-2xl shadow-[0_10px_20px_rgba(251,191,36,0.2)]">
                      <span className="text-xs font-black uppercase tracking-widest">{t("settings.plan.current")}: {formData.plan}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: "Free", price: "0", desc: "Para experimentadores", features: ["3 Proyectos", "Dominio Fastpage", "Soporte Básico"] },
                      { id: "Pro", price: "29", desc: "Más popular", features: ["Proyectos Ilimitados", "Dominio Personal", "Métricas Pro", "Soporte 24/7"] },
                      { id: "Business", price: "79", desc: "Para agencias", features: ["Todo en Pro", "Marca Blanca", "Multi-usuario", "API Acceso"] }
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setFormData({...formData, plan: plan.id})}
                        className={`relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left group overflow-hidden ${
                          formData.plan === plan.id 
                          ? "bg-amber-500 border-amber-500 text-black shadow-[0_30px_60px_rgba(251,191,36,0.15)] scale-105 z-10" 
                          : "bg-zinc-900/50 border-white/5 text-white hover:border-white/20 hover:bg-zinc-900"
                        }`}
                      >
                        {formData.plan === plan.id && (
                          <div className="absolute -top-4 -right-4 bg-black text-white p-6 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        )}
                        <h3 className={`text-2xl font-black mb-1 uppercase tracking-tighter ${formData.plan === plan.id ? "text-black" : "text-white"}`}>
                          {plan.id}
                        </h3>
                        <p className={`text-xs font-bold mb-8 uppercase tracking-widest ${formData.plan === plan.id ? "text-black/60" : "text-zinc-500"}`}>
                          {plan.desc}
                        </p>
                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-black">${plan.price}</span>
                          <span className={`text-xs font-bold uppercase ${formData.plan === plan.id ? "text-black/60" : "text-zinc-500"}`}>/ mes</span>
                        </div>
                        <div className="space-y-3 mt-auto">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${formData.plan === plan.id ? "text-black" : "text-amber-500"}`} />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 p-8 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-6">
                      <CreditCard className="w-10 h-10 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      <div>
                        <p className="text-white text-xl font-black">VISA •••• 4242</p>
                        <p className="text-zinc-600 text-xs font-bold">Vence el 12/26</p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                      {t("settings.plan.manage")}
                    </button>
                  </div>
                </SettingSection>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <SettingSection title={t("settings.security.title")} desc="Controla quién accede a tu cuenta y refuerza tus barreras de protección.">
                  <div className="space-y-4">
                    <SettingToggle 
                      label={t("settings.security.2fa_email")} 
                      icon={Mail} 
                      active={formData.twoFactorEmail} 
                      onToggle={() => setFormData({...formData, twoFactorEmail: !formData.twoFactorEmail})}
                      desc="Recibe un código único cada vez que inicies sesión."
                    />
                    <SettingToggle 
                      label={t("settings.security.2fa_sms")} 
                      icon={Smartphone} 
                      active={formData.twoFactorPhone} 
                      onToggle={() => setFormData({...formData, twoFactorPhone: !formData.twoFactorPhone})}
                      desc="Seguridad reforzada a través de tu dispositivo móvil."
                    />

                    <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button className="flex items-center justify-between p-6 bg-zinc-900/80 border border-white/5 rounded-3xl hover:bg-zinc-800 transition-all group">
                        <div className="flex items-center gap-4">
                          <Lock className="w-6 h-6 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                          <span className="font-black uppercase tracking-widest text-xs">{t("settings.security.change_pass")}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                            alert("Función de eliminación en desarrollo.");
                          }
                        }}
                        className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-3xl hover:bg-red-500/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <Trash2 className="w-6 h-6 text-red-500" />
                          <span className="font-black uppercase tracking-widest text-xs text-red-500/80">{t("settings.security.delete_account")}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-900 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </SettingSection>
              )}

              {/* Action Footer */}
              <div className="mt-16 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="text-center sm:text-left">
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-1">Sincronización</p>
                  <p className="text-zinc-400 text-sm font-medium italic">Estado: En línea</p>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-4 bg-amber-500 text-black px-16 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(251,191,36,0.25)]"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                  <span className="text-lg">{saving ? t("settings.saving") : t("settings.save")}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
