// src/components/common/Modal.jsx
import React, { useEffect } from "react";

export default function Modal({ children, onClose, ariaLabelledbyId }) {
  useEffect(() => {
    // Tutup modal dengan ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledbyId}
      tabIndex={-1}
      style={{ margin: 0, padding: 0 }}
    >
      <div
        className="
          relative
          bg-white
          rounded-2xl
          shadow-xl
          max-w-xl
          w-full
          max-h-[85vh]
          overflow-y-auto
          p-8
          ring-1 ring-gray-200
          transform
          transition
          duration-300
          ease-in-out
          scale-100
          "
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        {/* Tombol close */}
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Konten modal */}
        {children}
      </div>
    </div>
  );
}
