"use client";

export default function QuantityStepper({
  qty,
  onChange,
  size = "md",
}: {
  qty: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}) {
  const btnSize = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="inline-flex items-center gap-2.5 bg-muted-bg rounded-lg px-2 py-1">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        className={`font-extrabold text-ink-soft w-6 h-6 flex items-center justify-center ${btnSize}`}
        aria-label="Kurangkan"
      >
        −
      </button>
      <span className="font-bold text-ink text-sm min-w-[14px] text-center tab-nums">{qty}</span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        className={`font-extrabold text-ink-soft w-6 h-6 flex items-center justify-center ${btnSize}`}
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  );
}
