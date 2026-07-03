"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Padam",
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel} width={380}>
      <div className="p-6">
        {title && <div className="text-base font-extrabold text-ink mb-2">{title}</div>}
        <div className="text-sm text-ink-soft mb-5 leading-relaxed">{message}</div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" className="!min-h-0 !py-2.5" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="destructive" className="!min-h-0 !py-2.5" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
