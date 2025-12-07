import React, { useState, useRef, useEffect } from "react";
import Modal from "../common/Modal";

export default function ModalInputJadwal({ onClose, onSubmit, initialData }) {
  const [jadwal, setJadwal] = useState(initialData?.jadwal || "Ibadah Mingguan");
  const [tanggal, setTanggal] = useState(initialData?.tanggal || "");
  const [jam, setJam] = useState(initialData?.jam || "");
  const [pelayananFirman, setPelayananFirman] = useState(initialData?.pelayananFirman || "");
  const [pembacaanAktivitas, setPembacaanAktivitas] = useState(initialData?.pembacaanAktivitas || "");
  const [lokasi, setLokasi] = useState(initialData?.lokasi || ""); // tambahan

  const modalTitleId = "modal-jadwal-title";
  const modalRef = useRef(null);
  const isEditing = !!initialData;

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jadwal || !tanggal || !jam || !pelayananFirman || !pembacaanAktivitas) {
      alert("Semua field wajib diisi!");
      return;
    }

    // kalau Klasis, lokasi wajib diisi juga
    if (jadwal === "Ibadah Gabungan Klasis" && !lokasi) {
      alert("Lokasi wajib diisi untuk jadwal Klasis!");
      return;
    }

    // Tentukan kategori otomatis
    const kategori = jadwal.includes("PW")
      ? "PW"
      : jadwal.includes("PKB")
      ? "PKB"
      : jadwal.includes("PAM")
      ? "PAM"
      : jadwal.includes("Klasis")
      ? "Klasis"
      : "Mingguan";

    const data = { 
      jadwal, 
      tanggal, 
      jam,
      pelayananFirman,
      pembacaanAktivitas,
      kategori,
      ...(jadwal === "Ibadah Gabungan Klasis" && { lokasi }) // hanya simpan kalau klasis
    };

    onSubmit(data);
    onClose();
  };

  return (
    <Modal onClose={onClose} ariaLabelledbyId={modalTitleId}>
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <h2
          id={modalTitleId}
          className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-300 text-gray-900"
          tabIndex={0}
          ref={modalRef}
        >
          {isEditing ? "Edit Jadwal" : "Tambah Jadwal"}
        </h2>

        <label htmlFor="jadwal" className="block text-gray-700 font-medium mb-1">
          Jenis Jadwal
        </label>
        <select
          id="jadwal"
          value={jadwal}
          onChange={(e) => setJadwal(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="Ibadah Gabungan PKB">Ibadah Gabungan PKB</option>
          <option value="Ibadah Gabungan PW">Ibadah Gabungan PW</option>
          <option value="Ibadah Gabungan PAM">Ibadah Gabungan PAM</option>
          <option value="Ibadah Gabungan Klasis">Ibadah Gabungan Klasis</option>
          <option value="Ibadah Mingguan">Ibadah Mingguan</option>
        </select>

        {jadwal === "Ibadah Gabungan Klasis" && (
          <>
            <label htmlFor="lokasi" className="block text-gray-700 font-medium mb-1">
              Lokasi
            </label>
            <input
              id="lokasi"
              type="text"
              placeholder="Masukkan lokasi ibadah klasis"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              aria-label="Input lokasi ibadah klasis"
            />
          </>
        )}

        <label htmlFor="tanggal" className="block text-gray-700 font-medium mb-1">
          Tanggal
        </label>
        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Input tanggal jadwal"
        />

        <label htmlFor="jam" className="block text-gray-700 font-medium mb-1">
          Jam
        </label>
        <input
          id="jam"
          type="time"
          value={jam}
          onChange={(e) => setJam(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Input jam jadwal"
        />

        <label htmlFor="pelayanan-firman" className="block text-gray-700 font-medium mb-1">
          Pelayanan Firman
        </label>
        <input
          id="pelayanan-firman"
          type="text"
          placeholder="Pelayan firman"
          value={pelayananFirman}
          onChange={(e) => setPelayananFirman(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Input nama pelayan firman"
        />

        <label htmlFor="pembacaan-aktivitas" className="block text-gray-700 font-medium mb-1">
          Pembacaan Alkitab
        </label>
        <input
          id="pembacaan-aktivitas"
          type="text"
          placeholder="Pembaca alkitab"
          value={pembacaanAktivitas}
          onChange={(e) => setPembacaanAktivitas(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Input nama pembaca aktivitas"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditing ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
