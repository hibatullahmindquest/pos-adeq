"use client";

export default function NumberPad({
  onKey,
}: {
  onKey: (key: string) => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          className="text-center py-3 bg-muted-bg rounded-xl text-[15px] font-bold text-ink hover:bg-border active:scale-95 transition"
        >
          {k === "del" ? "⌫" : k}
        </button>
      ))}
    </div>
  );
}
