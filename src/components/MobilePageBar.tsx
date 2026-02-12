"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type MobilePageBarProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export default function MobilePageBar({ title, onBack, right }: MobilePageBarProps) {
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

        <span className="text-sm font-extrabold text-white truncate">{title}</span>

        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}

