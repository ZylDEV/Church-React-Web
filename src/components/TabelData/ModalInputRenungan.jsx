import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database"; // <-- Impor update
import { db } from "../../config/firebaseConfig";
import Modal from "../common/Modal";

export default function ModalInputRenungan({ onClose, onSuccess, editingData }) { // <-- Tambahkan prop editingData
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [pelayanan, setPelayanan] = useState("");
  const [pembacaan, setPembacaan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ganti dengan kunci publik Uploadcare Anda
  const UPLOADCARE_PUBLIC_KEY = "897faa7889894ee119ec";

  useEffect(() => {
    // Jika ada data untuk diedit, isi state dengan data tersebut
    if (editingData) {
      setJudul(editingData.judul || "");
      setIsi(editingData.isi || "");
      setPelayanan(editingData.pelayanan || "");
      setPembacaan(editingData.pembacaan || "");
      setTanggal(editingData.tanggal || "");
      // setSelectedFile tidak diisi karena kita mungkin ingin mengunggah gambar baru atau mempertahankan yang lama
    } else {
      // Reset form jika tidak ada data untuk diedit
      setJudul("");
      setIsi("");
      setPelayanan("");
      setPembacaan("");
      setTanggal("");
      setSelectedFile(null);
    }
  }, [editingData]);

  const uploadFileToUploadcare = async (file) => {
    const formData = new FormData();
    formData.append("UPLOADCARE_STORE", "1");
    formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
    formData.append("file", file);

    const res = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.file) {
      const errorDetail = data.detail || "Upload gagal";
      throw new Error(errorDetail);
    }
    return `https://ucarecdn.com/${data.file}/`;
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files && e.target.files.length > 0 ? e.target.files : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul.trim() || !isi.trim() || !pelayanan.trim() || !pembacaan.trim() || !tanggal) {
      alert("Mohon isi semua kolom yang wajib diisi!");
      return;
    }

    setLoading(true);
    let finalImageUrl = editingData?.gambarUrl || null; // Pertahankan gambar lama jika tidak ada yang baru diunggah

    try {
      if (selectedFile && selectedFile instanceof FileList && selectedFile.length > 0) {
        finalImageUrl = await uploadFileToUploadcare(selectedFile?.[0]);
      }

      const renunganData = {
        judul: judul.trim(),
        isi,
        pelayanan,
        pembacaan,
        tanggal,
        gambarUrl: finalImageUrl,
        updatedAt: Date.now(),
      };

      if (editingData?.id) {
        // Jika ada ID, berarti ini operasi edit
        const renunganRef = ref(db, `renungan/${editingData.id}`);
        await update(renunganRef, renunganData);
        console.log("Renungan berhasil diperbarui.");
      } else {
        // Jika tidak ada ID, berarti ini operasi tambah baru
        const renunganRef = ref(db, "renungan");
        await push(renunganRef, { ...renunganData, createdAt: Date.now() });
        console.log("Renungan berhasil ditambahkan.");
      }

      // Reset form
      setJudul("");
      setIsi("");
      setPelayanan("");
      setPembacaan("");
      setTanggal("");
      setSelectedFile(null);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan/memperbarui renungan:", error);
      alert(`Gagal menyimpan data. Detail: ${error.message}. Silakan coba lagi.`);
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4" tabIndex={0}>
          {editingData?.id ? "Edit Renungan" : "Tambah Renungan"}
        </h2>

        <input
          type="text"
          placeholder="Judul Renungan"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          autoFocus
          required
          disabled={loading}
        />

        <input
          type="date"
          placeholder="Tanggal"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Nama Pelayan"
          value={pelayanan}
          onChange={(e) => setPelayanan(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Ayat Bacaan"
          value={pembacaan}
          onChange={(e) => setPembacaan(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          disabled={loading}
        />

        <textarea
          placeholder="Isi Renungan"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          required
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onChange={handleFileChange}
          disabled={loading}
        />
        <p className="text-sm text-gray-500">Pilih satu gambar (opsional)</p>

        {selectedFile && selectedFile instanceof FileList && selectedFile.length > 0 && !loading && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 font-semibold">File terpilih: <span className="font-normal">{selectedFile?.[0]?.name}</span></p>
          </div>
        )}
        {editingData?.gambarUrl && !selectedFile && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 font-semibold">Gambar saat ini:</p>
            <img src={editingData.gambarUrl} alt="Gambar Renungan Saat Ini" className="mt-2 max-h-32 rounded-md" />
          </div>
        )}

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
            {loading ? "Menyimpan..." : editingData?.id ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}