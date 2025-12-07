import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";

export default function ModalInputKeuangan({ initialData, onClose, onSubmit }) {
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // isi form kalau edit
  useEffect(() => {
    if (initialData) {
      setJudul(initialData.judul || "");
      setTanggal(initialData.tanggal || "");
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Mohon pilih file PDF.");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul || !tanggal || (!file && !initialData?.pdfUrl)) {
      setErrorMsg("Harap isi semua field dan upload file PDF.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      let pdfUrl = initialData?.pdfUrl || null;

      // kalau ada file baru → upload ke Supabase
      if (file) {
        const { supabase } = await import("../../config/supabaseClient");
        const filePath = `keuangan/${Date.now()}_${file.name}`;

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

        pdfUrl = publicData.publicUrl;
      }

      // kirim balik ke parent
      await onSubmit({ judul, tanggal, pdfUrl });
      onClose();
    } catch (err) {
      console.error("Gagal simpan data:", err);
      setErrorMsg("Gagal menyimpan data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-900">
        {initialData ? "Edit Keuangan" : "Tambah Keuangan"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Judul */}
        <div>
          <label className="block font-medium text-gray-700">Judul</label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required
          />
        </div>

        {/* Input Tanggal */}
        <div>
          <label className="block font-medium text-gray-700">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required
          />
        </div>

        {/* Input File */}
        <div>
          <label className="block font-medium text-gray-700">File PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required={!initialData}
          />

          {/* Preview PDF lama kalau edit */}
          {initialData?.pdfUrl && !file && (
            <div className="mt-2 text-sm">
              <p className="text-gray-500">
                File lama masih digunakan. Upload baru jika ingin mengganti.
              </p>
              <a
                href={initialData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Lihat PDF Lama
              </a>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
