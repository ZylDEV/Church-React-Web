// InformasiDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/homepage/Navbar";
import informasiDetailData from "../data/informasiDetailData"; // Impor data baru

export default function InformasiDetail() {
  const { slug } = useParams();
  const info = informasiDetailData[slug]; // Gunakan data baru

  if (!info) {
    return (
      <>
        <Navbar />
        <main className="px-4 max-w-3xl mx-auto min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h2 className="text-3xl font-extrabold text-center text-red-700 mb-3">
            Informasi tidak ditemukan
          </h2>
          <p className="text-center text-gray-600 text-base max-w-md leading-relaxed">
            Maaf, halaman yang kamu cari tidak tersedia.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="px-6 max-w-3xl mx-auto min-h-screen bg-gray-50 rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight leading-snug">
          {info.title}
        </h1>
        <article
          className="text-gray-700 text-base leading-relaxed max-w-full"
          style={{
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.6,
            letterSpacing: "0.01em",
          }}
        >
          {typeof info.content === "string" ? (
            info.content.split("\n").map((line, idx) => (
              <p key={idx} className="mb-4 last:mb-0">
                {line}
              </p>
            ))
          ) : (
            info.content
          )}
        </article>
      </main>
    </>
  );
}