import React, { useState, useEffect, useMemo, useRef } from "react";
import { Download, Printer, Plus, Trash2, CalendarClock, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import { ref, onValue, remove, push, update } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import ModalInputJadwal from "./ModalInputJadwal";
import { AnimatePresence, motion } from "framer-motion";

export default function TabelJadwal() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  // Varian animasi untuk baris tabel
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Load data jadwal dari Firebase realtime
  useEffect(() => {
  const jadwalRef = ref(db, "jadwal");
  const unsubscribe = onValue(
    jadwalRef,
    (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const jadwalArray = Object.entries(val).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // 🔥 bikin data terbaru nongol di atas
        setData(jadwalArray.reverse());
      } else {
        setData([]);
      }
      setLoading(false);
    },
    (err) => {
      console.error("Gagal memuat data jadwal:", err);
      setLoading(false);
    }
  );
  return () => unsubscribe();
}, []);


  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    return data.filter((item) => item.tanggal?.startsWith(selectedMonth));
  }, [data, selectedMonth]);

  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal");
    XLSX.writeFile(workbook, `jadwal-${selectedMonth || "semua"}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    
    // Siapkan konten cetak dengan styling yang konsisten
    const printWindow = window.open("", "", "height=600,width=800");
    const style = `
      <style>
        body { font-family: sans-serif; margin: 20px; }
        h3 { color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: bold; }
        .no-print { display: none !important; }
      </style>
    `;
    const tableHtml = tableRef.current.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Jadwal</title>
          ${style}
        </head>
        <body>
          <h3>Data Jadwal (${selectedMonth || "Semua Bulan"})</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirmed) return;
    try {
      await remove(ref(db, `jadwal/${id}`));
      console.log("Jadwal berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus jadwal:", error);
      alert("Gagal menghapus jadwal: " + error.message);
    }
  };

  const handleAddData = async (newData) => {
    try {
      const jadwalRef = ref(db, "jadwal");
      await push(jadwalRef, newData);
      console.log("Jadwal berhasil disimpan!");
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);
      alert("Gagal menyimpan jadwal: " + error.message);
    }
  };

  // Fungsi baru untuk memperbarui data di Firebase
  const handleUpdateData = async (updatedData) => {
    try {
      const itemRef = ref(db, `jadwal/${editingItem.id}`);
      await update(itemRef, updatedData);
      console.log("Jadwal berhasil diperbarui!");
      closeModal();
    } catch (error) {
      console.error("Gagal memperbarui jadwal:", error);
      alert("Gagal memperbarui jadwal: " + error.message);
    }
  };

  // Fungsi untuk membuka modal dalam mode edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null); // Reset item yang diedit
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-6xl mx-auto my-12 font-sans">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-6">
        <CalendarClock size={40} className="text-indigo-600" />
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Tabel Data Jadwal
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Kelola jadwal ibadah dan kegiatan mingguan.
          </p>
        </div>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      {/* Bagian Kontrol (Filter & Tombol Aksi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-month" className="text-sm font-medium text-gray-700">
            Filter Bulan:
          </label>
          <input
            id="filter-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            aria-label="Filter data berdasarkan bulan dan tahun"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleEdit(null)} // Saat tambah, set editingItem menjadi null
            className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Tambah Jadwal"
            type="button"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            title="Unduh sebagai Excel"
            type="button"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Unduh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Cetak Tabel"
            type="button"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Tabel data */}
      <div className="bg-gray-50 rounded-lg shadow-inner overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table
            ref={tableRef}
            className="min-w-full text-sm text-left text-gray-500"
            role="table"
            aria-label="Tabel data jadwal"
          >
            <thead className="bg-gray-200 text-gray-700 uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Jadwal</th>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Tanggal</th>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Jam</th>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Pelayanan Firman</th>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Pembacaan Alkitab</th>
                <th className="px-4 py-3 border-b border-gray-300" scope="col">Lokasi</th>
                <th className="px-4 py-3 border-b border-gray-300 text-center no-print" scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <motion.tr
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-gray-100"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{item.jadwal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.jam}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.pelayananFirman || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.pembacaanAktivitas || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.lokasi || "-"}</td>
                      <td className="px-4 py-3 text-center no-print flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                          aria-label={`Edit jadwal ${item.jadwal}`}
                          title="Edit Jadwal"
                          type="button"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          aria-label={`Hapus jadwal ${item.jadwal}`}
                          title="Hapus Jadwal"
                          type="button"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="text-center py-4 text-gray-400">
                      Tidak ada data untuk periode ini.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ModalInputJadwal
          onClose={closeModal}
          // Logika kondisional: jika ada editingItem, gunakan handleUpdateData
          // jika tidak, gunakan handleAddData
          onSubmit={editingItem ? handleUpdateData : handleAddData}
          initialData={editingItem}
        />
      )}
    </div>
  );
}