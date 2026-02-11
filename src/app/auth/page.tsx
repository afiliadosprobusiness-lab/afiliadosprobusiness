"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const CANONICAL_AUTH_HOST =
  process.env.NEXT_PUBLIC_AUTH_CANONICAL_HOST || "fastpage2-0.vercel.app";

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
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "suspended") {
      showToast("Tu cuenta ha sido suspendida temporalmente.");
    } else if (errorParam === "disabled") {
      showToast("Tu cuenta ha sido desactivada por el administrador.");
    }
  }, [errorParam]);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [toast, setToast] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleError, setIsGoogleError] = useState(false);

  const isCanonicalRedirectNeeded = () => {
    if (typeof window === "undefined") return false;
    const currentHost = window.location.host;
    if (currentHost === CANONICAL_AUTH_HOST) return false;

    // Redirect known alias/preview hosts to canonical auth host for OAuth compatibility.
    return currentHost === "fastpage-eight.vercel.app" || currentHost.endsWith(".vercel.app");
  };

  const redirectToCanonicalAuthHost = () => {
    if (typeof window === "undefined") return;
    const target = new URL(window.location.href);
    target.host = CANONICAL_AUTH_HOST;
    window.location.href = target.toString();
  };

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isCanonicalRedirectNeeded()) return;
    showToast("Redirigiendo al dominio seguro de autenticación...");
    setTimeout(() => redirectToCanonicalAuthHost(), 700);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Función centralizada para sincronizar usuario con Firestore
  const syncUserToFirestore = async (user: any) => {
    if (!user || !user.uid) return;
    
    try {
      console.log("Intentando sincronizar en Firestore:", user.email);
      const userRef = doc(db, "users", user.uid);
      const is_admin = user.email === "afiliadosprobusiness@gmail.com";
      
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.name || (user.email ? user.email.split('@')[0] : "Usuario"),
        photoURL: user.photoURL || "",
        lastLogin: Date.now(),
        createdAt: user.metadata?.createdAt ? parseInt(user.metadata.createdAt) : Date.now(),
        status: "active",
        role: is_admin ? "admin" : "user",
      };

      // Aumentamos el timeout a 10 segundos
      const savePromise = setDoc(userRef, userData, { merge: true });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout sync")), 10000)
      );

      await Promise.race([savePromise, timeoutPromise]);
      console.log("Sincronización exitosa para:", user.email);
      
      // Actualizar sesión local
      localStorage.setItem("fp_session", JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.error("Error detallado de sincronización:", error);
      // Fallback local
      localStorage.setItem("fp_session", JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName || "Usuario"
      }));
      return false;
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Actualizar perfil (nombre)
      await updateProfile(user, { displayName: name });

      // 3. Sincronizar con Firestore - Esperar a que se complete para asegurar que el Admin lo vea
      await syncUserToFirestore(user);

      showToast("¡Cuenta creada exitosamente!");
      
      // Redirección basada en el rol
      const target = email === "afiliadosprobusiness@gmail.com" ? "/admin" : "/hub";
      setTimeout(() => router.push(target), 1000);
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        showToast("El email ya está registrado");
      } else if (error.code === "auth/weak-password") {
        showToast("La contraseña es muy débil (mínimo 6 caracteres)");
      } else if (error.code === "auth/configuration-not-found") {
        showToast("Error de configuración: Habilita Authentication en Firebase Console");
      } else {
        showToast("Error: " + error.message);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      showToast("Ingresa email y contraseña");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Sincronización prioritaria antes de redireccionar
      await syncUserToFirestore(user);

      if (user.email === "afiliadosprobusiness@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/hub");
      }
    } catch (error: any) {
      console.error(error);

      // Detectar si el usuario debe usar Google
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes("google.com") && !methods.includes("password")) {
          setIsGoogleError(true);
          showToast("¡Usa Google! Tu cuenta está vinculada a Google 👆 🚫");
          setTimeout(() => setIsGoogleError(false), 3000);
          return;
        }
      } catch (e) {
        // Ignorar error de fetchSignInMethods (puede fallar por políticas de privacidad)
      }

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showToast("Credenciales inválidas. Si usaste Google, usa el botón de abajo. ❌");
      } else {
        showToast("Error al iniciar sesión: " + error.message + " ⚠️");
      }
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sincronización prioritaria
        await syncUserToFirestore(user);

        // Redirección inmediata después de asegurar datos
        if (user.email === "afiliadosprobusiness@gmail.com") {
          router.push("/admin");
        } else {
          router.push("/hub");
        }
      }
    });

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Sincronización prioritaria
          await syncUserToFirestore(result.user);
          
          if (result.user.email === "afiliadosprobusiness@gmail.com") {
            router.push("/admin");
          } else {
            router.push("/hub");
          }
        }
      } catch (error: any) {
        console.error("Redirect Error:", error);
      }
    };
    checkRedirect();
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    if (isCanonicalRedirectNeeded()) {
      showToast("Redirigiendo para iniciar sesión con Google...");
      setTimeout(() => redirectToCanonicalAuthHost(), 500);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Intentamos con Popup primero
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Sincronización prioritaria (esperamos a que se guarde en Firestore)
        await syncUserToFirestore(result.user);

        // Forzar redirección inmediata
        const target = result.user.email === "afiliadosprobusiness@gmail.com" ? "/admin" : "/hub";
        window.location.href = target;
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      
      if (error.code === "auth/unauthorized-domain") {
        showToast("Dominio no autorizado para Google. Redirigiendo...");
        setTimeout(() => redirectToCanonicalAuthHost(), 700);
      } else if (error.code === 'auth/popup-blocked') {
        showToast("El navegador bloqueó la ventana emergente. Por favor, habilítala.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignorar
      } else if (error.code === 'auth/popup-closed-by-user') {
        showToast("Inicio de sesión cancelado.");
      } else if (error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log("Detectado error COOP, intentando redirección...");
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          showToast("Error de seguridad del navegador. Intenta de nuevo.");
        }
      } else {
        // Fallback general para otros errores
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          showToast("Error al iniciar sesión: " + (error.message || "Error desconocido"));
        }
      }
    }
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
            <Zap className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-3xl font-bold text-tornasolado tracking-tight transition-all">
              Fast Page
            </span>
          </Link>
          <p className="text-zinc-400 dark:text-white mt-3">
            {tab === "login" ? (
              <>
                Bienvenido de nuevo,{" "}
                <span className="text-gold-glow">creador</span>.
              </>
            ) : (
              <>
                Comienza a construir tu{" "}
                <span className="text-gold-glow">imperio digital</span>.
              </>
            )}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-1 overflow-hidden border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/20 rounded-xl mb-6">
            <button
              onClick={() => setTab("login")}
              className={`py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                tab === "login"
                  ? "bg-white/10 text-white shadow-lg border border-white/5"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab("register")}
              className={`py-3 text-sm font-medium rounded-full transition-all duration-300 ${
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white hover:text-white transition-colors"
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
                  className="btn-deluxe w-full py-3.5 rounded-full text-black font-bold text-lg shadow-lg hover:shadow-yellow-500/20 mt-2"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white hover:text-white transition-colors"
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
                  className="btn-deluxe w-full py-3.5 rounded-full text-black font-bold text-lg shadow-lg hover:shadow-yellow-500/20 mt-2"
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
              className={`w-full transition-all duration-300 py-3.5 rounded-full font-medium flex items-center justify-center gap-3 shadow-lg ${
                isGoogleError
                  ? "bg-red-600 text-white animate-shake ring-4 ring-red-500/50"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
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

        <p className="text-center text-sm text-zinc-400 dark:text-white mt-8">
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
