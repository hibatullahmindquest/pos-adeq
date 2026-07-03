"use client";

import { useEffect } from "react";
import { useStore, Toast } from "@/lib/store";

const kindStyles = {
  success: "bg-status-ready-bg border-[#BFE3CE] text-status-ready-text",
  error: "bg-status-late-bg border-[#F0B3A8] text-status-late-text",
  info: "bg-status-cooking-bg border-[#F0DFA0] text-status-cooking-dark",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  return (
    <div
      className={`border rounded-xl px-4 py-3 text-sm font-semibold shadow-lg cursor-pointer ${kindStyles[toast.kind]}`}
      onClick={() => onDismiss(toast.id)}
    >
      {toast.kind === "success" ? "✓ " : toast.kind === "error" ? "✕ " : ""}
      {toast.message}
    </div>
  );
}

export default function ToastHost() {
  const { state, dispatch } = useStore();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {state.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={(id) => dispatch({ type: "DISMISS_TOAST", id })} />
      ))}
    </div>
  );
}
