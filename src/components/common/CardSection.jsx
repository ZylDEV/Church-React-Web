import React from "react";

export default function CardSection({ title, table }) {
  return (
    <section
      className="
        relative
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-md hover:shadow-lg
        transition-all duration-300 ease-in-out
        p-6 sm:p-8
        overflow-hidden
      "
      aria-label={`${title} section`}
    >
      {/* Border Highlight Kiri */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Konten Tabel */}
      <div className="overflow-x-auto">{table}</div>
    </section>
  );
}
