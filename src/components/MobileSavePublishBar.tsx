"use client";

import { ArrowLeft, Rocket, Save } from "lucide-react";
import type { ReactNode } from "react";

type MobileSavePublishBarProps = {
  title: string;
  statusText?: string;
  statusDot?: "none" | "green" | "amber";
  onBack?: () => void;
  onSave: () => void;
  onPublish: () => void;
  saving?: boolean;
  publishing?: boolean;
  disableSave?: boolean;
  disablePublish?: boolean;
  saveLabel?: string;
  publishLabel?: string;
  saveIcon?: ReactNode;
  publishIcon?: ReactNode;
};

function dotClass(dot: MobileSavePublishBarProps["statusDot"]) {
  if (dot === "green") return "bg-emerald-400";
  if (dot === "amber") return "bg-amber-500 animate-pulse";
  return "";
}

export default function MobileSavePublishBar({
  title,
  statusText,
  statusDot = "none",
  onBack,
  onSave,
  onPublish,
  saving = false,
  publishing = false,
  disableSave = false,
  disablePublish = false,
  saveLabel = "Guardar",
  publishLabel = "Publicar",
  saveIcon,
  publishIcon,
}: MobileSavePublishBarProps) {
  return (
    <div className="md:hidden fixed top-16 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md">
      <div className="px-3 py-2 h-14 flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl text-zinc-300 transition-all active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0 flex items-center gap-2">
          <span className="text-sm font-bold text-white truncate max-w-[140px]">
            {title}
          </span>
          {statusText && (
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] text-zinc-400 font-semibold">
              {statusDot !== "none" && (
                <span className={`w-2 h-2 rounded-full ${dotClass(statusDot)}`} />
              )}
              {statusText}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving || disableSave}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-extrabold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              (saveIcon ?? <Save className="w-4 h-4" />)
            )}
            {saveLabel}
          </button>
          <button
            onClick={onPublish}
            disabled={publishing || disablePublish}
            className="px-3 py-2 rounded-xl bg-cyan-500 text-black text-xs font-extrabold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              (publishIcon ?? <Rocket className="w-4 h-4" />)
            )}
            {publishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
