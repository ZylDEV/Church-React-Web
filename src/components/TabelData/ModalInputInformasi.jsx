import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";

export default function ModalInputInformasi({ onClose, onSubmit, initialData }) {
  const [kegiatan, setKegiatan] = useState("");
  const [jam, setJam] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tempat, setTempat] = useState("");
  const [pembahasan, setPembahasan] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing) {
      setKegiatan(initialData.kegiatan || "");
      setJam(initialData.jam || "");
      setTanggal(initialData.tanggal || "");
      setTempat(initialData.tempat || "");
      setPembahasan(initialData.pembahasan || "");
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});

    const newErrors = {};
    if (!kegiatan.trim()) newErrors.kegiatan = "Kegiatan wajib diisi.";
    if (!jam.trim()) newErrors.jam = "Jam wajib diisi.";
    if (!tanggal.trim()) newErrors.tanggal = "Tanggal wajib diisi.";
    if (!tempat.trim()) newErrors.tempat = "Tempat wajib diisi.";
    if (!pembahasan.trim()) newErrors.pembahasan = "Pembahasan wajib diisi.";

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        kegiatan: kegiatan.trim(),
        jam: jam.trim(),
        tanggal: tanggal.trim(),
        tempat: tempat.trim(),
        pembahasan: pembahasan.trim(),
      });
      
      // Reset form on success
      setKegiatan("");
      setJam("");
      setTanggal("");
      setTempat("");
      setPembahasan("");
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      setError({ form: "Gagal menyimpan data. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} aria-labelledby="modal-title" className="space-y-6">
        <h2
          id="modal-title"
          className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 text-gray-900"
          tabIndex={0}
        >
          {isEditing ? "Edit Informasi" : "Tambah Informasi"}
        </h2>

        {error.form && (
          <p className="text-red-500 text-sm">{error.form}</p>
        )}

        {/* Input Kegiatan */}
        <div>
          <label htmlFor="kegiatan" className="sr-only">Kegiatan</label>
          <input
            id="kegiatan"
            type="text"
            placeholder="Kegiatan"
            className={`w-full border rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              ${error.kegiatan ? "border-red-500" : "border-gray-300"}`}
            value={kegiatan}
            onChange={(e) => setKegiatan(e.target.value)}
            autoFocus
            required
            aria-label="Kegiatan"
          />
          {error.kegiatan && (
            <p className="text-red-500 text-sm mt-1">{error.kegiatan}</p>
          )}
        </div>

        {/* Input Tempat */}
        <div>
          <label htmlFor="tempat" className="sr-only">Tempat</label>
          <input
            id="tempat"
            type="text"
            placeholder="Tempat"
            className={`w-full border rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              ${error.tempat ? "border-red-500" : "border-gray-300"}`}
            value={tempat}
            onChange={(e) => setTempat(e.target.value)}
            required
            aria-label="Tempat"
          />
          {error.tempat && (
            <p className="text-red-500 text-sm mt-1">{error.tempat}</p>
          )}
        </div>
        
        {/* Input Pembahasan */}
        <div>
          <label htmlFor="pembahasan" className="sr-only">Pembahasan</label>
          <textarea
            id="pembahasan"
            placeholder="Pembahasan"
            className={`w-full border rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              ${error.pembahasan ? "border-red-500" : "border-gray-300"}`}
            value={pembahasan}
            onChange={(e) => setPembahasan(e.target.value)}
            required
            rows="3"
            aria-label="Pembahasan"
          />
          {error.pembahasan && (
            <p className="text-red-500 text-sm mt-1">{error.pembahasan}</p>
          )}
        </div>

        {/* Input Jam */}
        <div>
          <label htmlFor="jam" className="sr-only">Jam</label>
          <input
            id="jam"
            type="time"
            placeholder="Jam"
            className={`w-full border rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              ${error.jam ? "border-red-500" : "border-gray-300"}`}
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            required
            aria-label="Jam"
          />
          {error.jam && (
            <p className="text-red-500 text-sm mt-1">{error.jam}</p>
          )}
        </div>

        {/* Input Tanggal */}
        <div>
          <label htmlFor="tanggal" className="sr-only">Tanggal</label>
          <input
            id="tanggal"
            type="date"
            placeholder="Tanggal"
            className={`w-full border rounded-md px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              ${error.tanggal ? "border-red-500" : "border-gray-300"}`}
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            aria-label="Tanggal"
          />
          {error.tanggal && (
            <p className="text-red-500 text-sm mt-1">{error.tanggal}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-md transition
              focus:outline-none focus:ring-2 focus:ring-gray-400"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition
              focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading}
          >
            {loading ? (isEditing ? "Memperbarui..." : "Menyimpan...") : (isEditing ? "Perbarui" : "Simpan")}
          </button>
        </div>
      </form>
    </Modal>
  );
}