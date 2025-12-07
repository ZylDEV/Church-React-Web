import React, { useState, useEffect, useMemo, useRef } from "react";
import { Download, Printer, Plus, Trash2, BookText, Pencil } from "lucide-react"; 
import * as XLSX from "xlsx";
import { db } from "../../config/firebaseConfig";
import { ref as dbRef, onValue, remove } from "firebase/database"; // <-- Impor update
import ModalRenungan from "./ModalInputRenungan";
import { AnimatePresence, motion } from "framer-motion";

export default function TabelRenungan() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <-- State untuk modal edit
  const [editingData, setEditingData] = useState(null); // <-- State untuk data yang sedang diedit
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

    useEffect(() => {
    const renunganRef = dbRef(db, "renungan");
    const unsubscribe = onValue(
      renunganRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const parsed = Object.entries(val).map(([id, item]) => ({
            id,
            ...item,
          }));
          // pilih salah satu:
          setData(parsed.reverse()); 
          // atau:
          // setData(parsed.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gagal memuat data renungan:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);



  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    return data.filter((item) => item.tanggal?.startsWith(selectedMonth));
  }, [data, selectedMonth]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus renungan ini?");
    if (confirmDelete) {
      remove(dbRef(db, `renungan/${id}`))
        .then(() => console.log("Renungan berhasil dihapus."))
        .catch((error) => console.error("Gagal menghapus renungan:", error));
    }
  };

  const handleEdit = (item) => {
    setEditingData(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingData(null);
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Judul: item.judul,
        Tanggal: item.tanggal,
        Pelayanan: item.pelayanan,
        Pembacaan: item.pembacaan,
        Isi: item.isi,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Renungan");
    XLSX.writeFile(workbook, `renungan-${selectedMonth || "semua"}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;

    const printWindow = window.open("", "", "height=600,width=800");
    const style = `
      <style>
        body { font-family: sans-serif; margin: 20px; }
        h3 { color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: bold; }
        .no-print { display: none !important; }
        img { max-width: 100px; max-height: 100px; object-fit: cover; }
      </style>
    `;
    const tableHtml = tableRef.current.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Renungan</title>
          ${style}
        </head>
        <body>
          <h3>Data Renungan (${selectedMonth || "Semua Bulan"})</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-6xl mx-auto my-12 font-sans">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-6">
        <BookText size={40} className="text-indigo-600" />
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Tabel Data Renungan
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Kelola arsip renungan harian atau mingguan.
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Tambah Renungan"
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
          <table ref={tableRef} className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-200 text-gray-700 uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3 border-b border-gray-300">Judul</th>
                <th className="px-4 py-3 border-b border-gray-300">Tanggal</th>
                <th className="px-4 py-3 border-b border-gray-300">Pelayanan</th>
                <th className="px-4 py-3 border-b border-gray-300">Pembacaan</th>
                <th className="px-4 py-3 border-b border-gray-300">Isi Renungan</th>
                <th className="px-4 py-3 border-b border-gray-300">Gambar</th>
                <th className="px-4 py-3 border-b border-gray-300 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
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
                      <td className="px-4 py-3 whitespace-nowrap">{item.judul}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.pelayanan}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.pembacaan}</td>
                      <td className="px-4 py-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="block">{item.isi}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.gambarUrl && (
                          <img
                            src={item.gambarUrl}
                            alt="Gambar Renungan"
                            className="w-16 h-16 object-cover rounded-md shadow-sm"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)} // <-- Panggil handleEdit dengan data item
                            className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                            title="Edit Renungan"
                            type="button"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Hapus Renungan"
                            type="button"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="text-center py-4 text-gray-400">
                      Tidak ada data renungan untuk periode ini.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <ModalRenungan onClose={() => setIsModalOpen(false)} />}
      {isEditModalOpen && (
        <ModalRenungan
          onClose={handleCloseEditModal}
          editingData={editingData} // <-- Kirim data yang akan diedit ke modal
        />
      )}
    </div>
  );
}