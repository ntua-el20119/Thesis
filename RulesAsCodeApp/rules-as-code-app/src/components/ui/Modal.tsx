"use client";

import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-md" (default), "max-w-lg", "max-w-2xl"
}

function Modal({ open, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose} // click on backdrop closes modal
    >
      <div
        className={`bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl p-8 w-full ${maxWidth} animate-in fade-in zoom-in duration-200 relative`}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
