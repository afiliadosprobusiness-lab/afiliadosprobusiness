"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title = "Confirmar eliminación",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-red-500/25 bg-zinc-900 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-500" />

        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black tracking-[0.18em] uppercase text-red-300/80">
              Accion peligrosa
            </p>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{description}</p>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95"
            aria-label="Cerrar"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Se eliminara de tu cuenta</p>
              <p className="text-xs text-zinc-400">
                Se borrara del panel y de Firebase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-extrabold hover:bg-red-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              {confirmLabel}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold hover:bg-white/10 transition-all active:scale-[0.99]"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

