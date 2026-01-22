"use client";

import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose} // click on backdrop closes modal
    >
      <div
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200 relative"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
