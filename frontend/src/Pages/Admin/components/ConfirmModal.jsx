import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#121212] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                {title}
              </h2>
              <p className="text-sm text-gray-500 font-bold mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-white transition-colors"
            aria-label="Close confirmation modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-rose-500/30 bg-rose-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
