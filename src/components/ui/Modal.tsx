"use client";

import { ReactNode } from "react";

export default function Modal({
  children,
  onClose,
  width = 480,
}: {
  children: ReactNode;
  onClose?: () => void;
  width?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-h-[90vh] flex flex-col"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
