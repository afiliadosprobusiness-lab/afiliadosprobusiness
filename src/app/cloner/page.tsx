"use client";

import { useState, useRef, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ClonerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clonedHtml, setClonedHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setClonedHtml("");

    try {
      const safeUrl = url.startsWith("http") ? url : `https://${url}`;
      // Using r.jina.ai as a proxy/reader as per original implementation
      const readerUrl = `https://r.jina.ai/${safeUrl}`;

      const res = await fetch(readerUrl);
      if (!res.ok) throw new Error("No se pudo clonar la página");

      const html = await res.text();
      setClonedHtml(html);

      // Update iframe
      if (iframeRef.current) {
        const doc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    } catch (err) {
      setError(
        "Error al clonar la página. Verifica la URL e intenta de nuevo.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!clonedHtml) return;

    const blob = new Blob([clonedHtml], { type: "text/html" });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = "clon.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlBlob);
  };

  // Re-render iframe when clonedHtml changes (if using state only wasn't enough)
  useEffect(() => {
    if (clonedHtml && iframeRef.current) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(clonedHtml);
        doc.close();
      }
    }
  }, [clonedHtml]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main className="section container">
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Clonar una página</h2>

          <form onSubmit={handleClone} className="grid gap-4 mb-6">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                required
                className="flex-1 bg-bg-alt border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Clonando..." : "Clonar"}
              </button>
            </div>
            {error && <div className="text-danger text-sm">{error}</div>}
          </form>

          <div className="border border-border rounded-lg overflow-hidden bg-white min-h-[400px] relative">
            {!clonedHtml && !loading && (
              <div className="absolute inset-0 flex items-center justify-center text-muted bg-bg-alt">
                Vista previa del clon
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-primary bg-bg-alt/50 z-10">
                Cargando...
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-[600px] bg-white"
              title="Clone Preview"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDownload}
              className="btn"
              disabled={!clonedHtml}
            >
              Descargar HTML
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
