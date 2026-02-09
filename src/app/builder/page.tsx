"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type BlockType = "hero" | "features" | "cta" | "pricing";

export default function BuilderPage() {
  const [blocks, setBlocks] = useState<BlockType[]>([]);

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, type]);
  };

  const clearBlocks = () => {
    setBlocks([]);
  };

  const exportHtml = () => {
    const previewElement = document.getElementById("builder-preview");
    if (!previewElement) return;

    const htmlContent = previewElement.innerHTML;

    const fullHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Landing Exportada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            bg: '#0b0f14',
            'bg-alt': '#0e141b',
            text: '#e6edf3',
            muted: '#b6c2cf',
            primary: '#6ee7ff',
            'primary-2': '#7c67ff',
            accent: '#3cf0a8',
            danger: '#ff6b6b',
            card: '#121824',
            border: '#1f2a37',
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #0b0f14; color: #e6edf3; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: 1px solid #1f2a37;
      background: linear-gradient(to bottom, #151c29, #101723);
      color: #e6edf3;
      transition: all 0.2s;
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(110, 231, 255, 0.1); }
    .btn-primary {
      border-color: rgba(110, 231, 255, 0.35);
      background: linear-gradient(to bottom, rgba(124, 103, 255, 0.25), rgba(124, 103, 255, 0.1));
    }
    .card {
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #1f2a37;
      background: linear-gradient(to bottom, rgba(18, 24, 36, 0.6), rgba(18, 24, 36, 0.35));
    }
  </style>
</head>
<body class="font-sans antialiased">
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-exportada.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main className="section container">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Constructor de landing</h2>

          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-bg-alt rounded-lg border border-border">
            <button
              onClick={() => addBlock("hero")}
              className="btn btn-primary"
            >
              Agregar Hero
            </button>
            <button onClick={() => addBlock("features")} className="btn">
              Agregar Features
            </button>
            <button onClick={() => addBlock("pricing")} className="btn">
              Agregar Pricing
            </button>
            <button onClick={() => addBlock("cta")} className="btn">
              Agregar CTA
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={clearBlocks}
                className="btn text-danger border-danger/20 hover:bg-danger/10"
              >
                Limpiar
              </button>
              <button
                onClick={exportHtml}
                className="btn border-accent/20 text-accent hover:bg-accent/10"
              >
                Exportar HTML
              </button>
            </div>
          </div>

          <div
            id="builder-preview"
            className="space-y-8 min-h-[300px] border border-dashed border-border rounded-lg p-4"
          >
            {blocks.length === 0 && (
              <div className="text-center text-muted py-12">
                Selecciona bloques arriba para comenzar a construir
              </div>
            )}
            {blocks.map((type, index) => (
              <BlockRenderer key={index} type={type} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BlockRenderer({ type }: { type: BlockType }) {
  switch (type) {
    case "hero":
      return (
        <section className="py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-2">
              Título impactante
            </h1>
            <p className="text-xl text-muted mb-8">
              Mensaje claro para captar atención con valor directo y conciso.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#" className="btn btn-primary text-lg px-8 py-3">
                Empieza ahora
              </a>
              <a href="#" className="btn text-lg px-8 py-3">
                Saber más
              </a>
            </div>
          </div>
        </section>
      );
    case "features":
      return (
        <section className="py-12 px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">Rápido</h3>
              <p className="text-muted">
                Carga inmediata y alto rendimiento optimizado.
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-2/20 flex items-center justify-center text-primary-2 font-bold text-xl mb-4">
                🛠️
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible</h3>
              <p className="text-muted">
                Bloques reutilizables y edición simple.
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-bold mb-2">Seguro</h3>
              <p className="text-muted">
                Buenas prácticas listas para producción.
              </p>
            </div>
          </div>
        </section>
      );
    case "cta":
      return (
        <section className="py-12 px-4">
          <div className="card max-w-4xl mx-auto text-center p-12 bg-gradient-to-b from-card to-bg-alt">
            <h2 className="text-3xl font-bold mb-4">
              Listo para lanzar tu proyecto?
            </h2>
            <p className="text-muted mb-8">
              Publica tu landing page en cuestión de minutos.
            </p>
            <a href="#" className="btn btn-primary px-8 py-3 text-lg">
              Crear cuenta gratis
            </a>
          </div>
        </section>
      );
    case "pricing":
      return (
        <section className="py-12 px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card p-6 flex flex-col">
              <h3 className="text-lg font-bold text-muted">Starter</h3>
              <div className="text-3xl font-bold my-4">Gratis</div>
              <ul className="space-y-2 mb-6 text-muted flex-1">
                <li>• 1 Proyecto</li>
                <li>• Analytics básico</li>
              </ul>
              <a href="#" className="btn w-full">
                Elegir
              </a>
            </div>
            <div className="card p-6 flex flex-col border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-bg text-xs font-bold px-2 py-1">
                POPULAR
              </div>
              <h3 className="text-lg font-bold text-primary">Pro</h3>
              <div className="text-3xl font-bold my-4">
                $9<span className="text-sm font-normal text-muted">/mes</span>
              </div>
              <ul className="space-y-2 mb-6 text-muted flex-1">
                <li>• 5 Proyectos</li>
                <li>• Exportación HTML</li>
                <li>• Soporte prioritario</li>
              </ul>
              <a href="#" className="btn btn-primary w-full">
                Elegir
              </a>
            </div>
            <div className="card p-6 flex flex-col">
              <h3 className="text-lg font-bold text-primary-2">Business</h3>
              <div className="text-3xl font-bold my-4">
                $29<span className="text-sm font-normal text-muted">/mes</span>
              </div>
              <ul className="space-y-2 mb-6 text-muted flex-1">
                <li>• Ilimitado</li>
                <li>• API Access</li>
                <li>• Whitelabel</li>
              </ul>
              <a href="#" className="btn w-full">
                Elegir
              </a>
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}
