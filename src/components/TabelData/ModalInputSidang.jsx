import React, { useState, useEffect } from "react";
import { ref as dbRef, push, update } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { supabase } from "../../config/supabaseClient";
import Modal from "../common/Modal";

export default function ModalInputSidang({ onClose, initialData }) {
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const modalTitleId = "modal-sidang-title";

  const isEditing = !!initialData;

  // isi state kalau mode edit
  useEffect(() => {
    if (isEditing && initialData) {
      setJudul(initialData.judul || "");
      setTanggal(initialData.tanggal || "");
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !tanggal || (!file && !isEditing)) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setUploadResult(null);

    try {
      let fileUrl = initialData?.pdfUrl || "";

      // Kalau ada file baru → upload
      if (file) {
        const filePath = `sidang/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("pdf-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicData, error: urlError } = supabase.storage
          .from("pdf-files")
          .getPublicUrl(filePath);

        if (urlError) throw urlError;

        fileUrl = publicData.publicUrl;
      }

      if (isEditing) {
        // UPDATE data
        const itemRef = dbRef(db, `sidang/${initialData.key}`);
        await update(itemRef, {
          judul,
          tanggal,
          pdfUrl: fileUrl,
        });
      } else {
        // INSERT data baru
        await push(dbRef(db, "sidang"), {
          judul,
          tanggal,
          pdfUrl: fileUrl,
        });
      }

      setUploadResult({
        success: true,
        message: isEditing ? "Berhasil diperbarui!" : "Upload berhasil!",
        url: fileUrl,
      });

      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMsg("Gagal menyimpan data. Coba lagi.");
      setUploadResult({ success: false, message: "Proses gagal." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} ariaLabelledbyId={modalTitleId}>
      <h2
        id={modalTitleId}
        className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-300 text-gray-900"
        tabIndex={0}
      >
        {isEditing ? "Edit Sidang" : "Tambah Sidang"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Judul Sidang"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          autoFocus
        />

        <input
          type="date"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {isEditing && initialData?.pdfUrl && (
          <p className="text-sm text-gray-600">
            File saat ini:{" "}
            <a
              href={initialData.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-600"
            >
              Lihat file
            </a>
          </p>
        )}

        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

        {uploadResult && (
          <p
            className={`text-sm ${
              uploadResult.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {uploadResult.message}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`text-white font-semibold px-6 py-2 rounded-md shadow-md transition focus:outline-none focus:ring-2 ${
              loading
                ? "bg-blue-300 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {loading
              ? "Menyimpan..."
              : isEditing
              ? "Perbarui"
              : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
