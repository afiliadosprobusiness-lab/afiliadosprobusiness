"use client";

import { Eye, Rocket, ShieldCheck } from "lucide-react";

type PublishSuccessModalProps = {
  open: boolean;
  url: string;
  issues?: string[];
  onBackToPanel: () => void;
  onContinueEditing?: () => void;
};

export default function PublishSuccessModal({
  open,
  url,
  issues = [],
  onBackToPanel,
  onContinueEditing,
}: PublishSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md z-[200] animate-in fade-in duration-300 p-4">
      <div className="bg-zinc-900 border border-white/10 p-7 sm:p-8 rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
          <Rocket className="w-10 h-10 text-cyan-400" />
        </div>

        <h3 className="text-3xl font-bold text-center mb-2">¡Lanzamiento Exitoso!</h3>
        <p className="text-zinc-400 text-center mb-7">
          Tu landing page ha sido optimizada y publicada.
        </p>

        {issues.length > 0 && (
          <div className="mb-7 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              Sugerencias de Optimización:
            </div>
            <ul className="space-y-1">
              {issues.map((issue, i) => (
                <li
                  key={i}
                  className="text-xs text-amber-400/80 flex items-start gap-2"
                >
                  <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Eye className="w-5 h-5" />
            Ver Sitio en Vivo
          </a>

          <button
            onClick={onBackToPanel}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
          >
            Volver al Panel
          </button>

          {onContinueEditing && (
            <button
              onClick={onContinueEditing}
              className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-all"
            >
              Seguir Editando
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

