"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type User = {
  email: string;
  password: string;
  name: string;
  createdAt: number;
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [users, setUsers] = useState<User[]>([]);
  const [toast, setToast] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    }
  }, [searchParams]);

  useEffect(() => {
    const u = localStorage.getItem("fp_users");
    setUsers(u ? JSON.parse(u) : []);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");
    if (!email || !password || !name) {
      showToast("Completa todos los campos");
      return;
    }
    if (users.find((u) => u.email === email)) {
      showToast("Ya existe una cuenta con ese email");
      return;
    }
    const user = { email, password, name, createdAt: Date.now() };
    const nextUsers = [...users, user];
    setUsers(nextUsers);
    localStorage.setItem("fp_users", JSON.stringify(nextUsers));
    localStorage.setItem("fp_session", JSON.stringify({ email, name }));
    router.push("/hub");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      showToast("Credenciales inválidas");
      return;
    }
    localStorage.setItem(
      "fp_session",
      JSON.stringify({ email: user.email, name: user.name }),
    );
    router.push("/hub");
  };

  const handleGoogleLogin = () => {
    // Simulación de login con Google
    const fakeGoogleUser = {
      email: "user@gmail.com",
      name: "Google User",
    };
    localStorage.setItem("fp_session", JSON.stringify(fakeGoogleUser));
    showToast("¡Sesión iniciada con Google!");
    setTimeout(() => {
      router.push("/hub");
    }, 1000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-2xl group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              C
            </div>
            <span className="text-3xl font-bold text-white tracking-tight group-hover:text-gold-glow transition-colors">
              Fast Page
            </span>
          </Link>
          <p className="text-muted mt-3">
            {tab === "login"
              ? "Bienvenido de nuevo, creador."
              : "Comienza a construir tu imperio digital."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-1 overflow-hidden border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/20 rounded-xl mb-6">
            <button
              onClick={() => setTab("login")}
              className={`py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                tab === "login"
                  ? "bg-white/10 text-white shadow-lg border border-white/5"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab("register")}
              className={`py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                tab === "register"
                  ? "bg-white/10 text-white shadow-lg border border-white/5"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="px-6 pb-8">
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="tucorreo@dominio.com"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-gray-300">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="text-xs text-yellow-500/80 hover:text-yellow-400 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? (
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
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-deluxe w-full py-3.5 rounded-xl text-black font-bold text-lg shadow-lg hover:shadow-yellow-500/20 mt-2"
                >
                  Entrar
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Nombre
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="tucorreo@dominio.com"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? (
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
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-deluxe w-full py-3.5 rounded-xl text-black font-bold text-lg shadow-lg hover:shadow-yellow-500/20 mt-2"
                >
                  Crear cuenta
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-xs text-muted uppercase tracking-widest">
                O continúa con
              </span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            {/* Social Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black hover:bg-gray-200 transition-colors py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-8">
          &copy; {new Date().getFullYear()} Fast Page. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-xl animate-fade-in z-50 flex items-center gap-2">
          <span className="text-yellow-400">⚠️</span>
          {toast}
        </div>
      )}
    </main>
  );
}
