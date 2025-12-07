import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import Modal from "../common/Modal";

export default function ModalInputDokumentasi({ onClose, onSuccess, initialData }) {
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Isi state saat edit
  useEffect(() => {
    if (initialData) {
      setJudul(initialData.judul || "");
      setTanggal(initialData.tanggal || "");
      setKeterangan(initialData.keterangan || "");
      setFiles([]); // file baru bisa di-upload
    }
  }, [initialData]);

  // Upload file ke Uploadcare
  const uploadFileToUploadcare = async (file) => {
    const formData = new FormData();
    formData.append("UPLOADCARE_STORE", "1");
    formData.append("UPLOADCARE_PUB_KEY", "897faa7889894ee119ec");
    formData.append("file", file);

    const res = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.file) throw new Error("Upload gagal");
    return `https://ucarecdn.com/${data.file}/`;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !tanggal || !keterangan.trim()) {
      alert("Semua kolom wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // Upload file baru jika ada
      let uploadedUrls = [];
      if (files.length > 0) {
        uploadedUrls = await Promise.all(files.map(uploadFileToUploadcare));
      }

      if (initialData && initialData.id) {
        // UPDATE data lama
        const updateRef = ref(db, `dokumentasi/${initialData.id}`);
        await update(updateRef, {
          judul: judul.trim(),
          tanggal,
          keterangan: keterangan.trim(),
          fotoUrls: [...(initialData.fotoUrls || []), ...uploadedUrls],
        });
      } else {
        // CREATE baru
        await push(ref(db, "dokumentasi"), {
          judul: judul.trim(),
          tanggal,
          keterangan: keterangan.trim(),
          fotoUrls: uploadedUrls,
          createdAt: Date.now(),
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4" tabIndex={0}>
          {initialData ? "Edit Dokumentasi" : "Tambah Dokumentasi"}
        </h2>

        <input
          type="text"
          placeholder="Judul Dokumentasi"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          autoFocus
          required
          disabled={loading}
        />

        <input
          type="date"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          required
          disabled={loading}
        />

        <textarea
          placeholder="Keterangan Dokumentasi"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          required
          disabled={loading}
        />

        {/* Preview foto lama */}
        {initialData?.fotoUrls?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {initialData.fotoUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 border rounded-md overflow-hidden flex items-center justify-center hover:shadow-lg transition"
                title="Klik untuk lihat gambar"
              >
                <img src={url} alt={`Foto lama ${i + 1}`} className="object-cover w-full h-full" />
              </a>
            ))}
          </div>
        )}

        {/* Input file baru */}
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onChange={handleFileChange}
          disabled={loading}
        />
        <p className="text-sm text-gray-500">Pilih maksimal 5 foto (foto baru akan ditambahkan)</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-md transition
              focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition
              focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
