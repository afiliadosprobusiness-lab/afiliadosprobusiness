"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function HubPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    const session = localStorage.getItem("fastPageUser");
    if (!session) {
      router.push("/auth");
      return;
    }
    try {
      setUser(JSON.parse(session));
    } catch (e) {
      router.push("/auth");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("fastPageUser");
    router.push("/auth");
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main className="section container">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">Tu panel</h2>
            <div className="text-muted mb-4">
              Hola,{" "}
              <span className="text-primary font-semibold">
                {user.name || user.email}
              </span>
              . Accede al constructor, clona páginas y administra tu cuenta.
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => router.push("/builder")}
                className="btn btn-primary"
              >
                Abrir Creador
              </button>
              <button onClick={() => router.push("/cloner")} className="btn">
                Abrir Clonador
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-2">Atajos</h3>
            <div className="grid gap-2">
              <button
                onClick={() => router.push("/")}
                className="btn justify-start"
              >
                Ver landing principal
              </button>
              <button
                onClick={handleLogout}
                className="btn justify-start text-danger border-danger/20 hover:bg-danger/10"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
