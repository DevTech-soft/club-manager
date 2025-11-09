// src/components/ui/Dialog.tsx
import React, { useEffect } from "react";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";
import Button from "./Button"; // ajusta la ruta si tu Button está en otro lugar

type Variant = "info" | "success" | "error";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  showCloseIcon?: boolean;

  // confirm / actions
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  showCancel?: boolean;
  

  // visual
  widthClass?: string; // eg "max-w-xl"
  trapFocus?: boolean; // si quieres activar/desactivar focus trapping mínimo
}

const icons: Record<Variant, React.ReactNode> = {
  info: <Info className="w-6 h-6 text-blue-400" />,
  success: <CheckCircle className="w-6 h-6 text-green-400" />,
  error: <AlertTriangle className="w-6 h-6 text-red-400" />,
};

export default function ModalDialog({
  isOpen,
  onClose,
  title,
  children,
  variant = "info",
  showCloseIcon = true,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  showCancel = true,
  widthClass = "max-w-2xl",
  trapFocus = true,
}: DialogProps) {
  // close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // simple focus trap (keeps focus inside while open)
  useEffect(() => {
    if (!isOpen || !trapFocus) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = document.querySelector<HTMLButtonElement>("[data-dialog-first]");

    first?.focus();
    return () => previous?.focus?.();
  }, [isOpen, trapFocus]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog panel */}
      <div
        className={`relative z-10 mx-4 ${widthClass} w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200`}
        role="document"
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-5 border-b border-gray-800">
          <div className="flex-shrink-0">{icons[variant]}</div>

          <div className="min-w-0 flex-1">
            {title ? (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            ) : null}
            {/* optional subtitle area: slot for light description */}
          </div>

          {showCloseIcon && (
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-3 inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 text-sm text-text-secondary leading-relaxed">
          {children}
        </div>

        {/* Footer / actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gradient-to-t from-transparent to-transparent">
          {showCancel && (
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-4 py-2"
              data-dialog-first
            >
              {cancelText}
            </Button>
          )}

          {onConfirm ? (
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  await onConfirm();
                } finally {
                  // keep dialog open if you want - usually close after confirm
                  onClose();
                }
              }}
              className="px-4 py-2"
            >
              {confirmText}
            </Button>
          ) : (
            <Button variant="primary" onClick={onClose} className="px-4 py-2">
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
