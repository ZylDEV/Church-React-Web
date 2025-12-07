import React, { useState, useMemo, useRef, useEffect } from "react";
import { Download, Printer, Plus, Trash2, Info, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import ModalInputInformasi from "./ModalInputInformasi";

import { db } from "../../config/firebaseConfig";
import { ref, onValue, remove, push, update } from "firebase/database";
import { AnimatePresence, motion } from "framer-motion";

export default function TabelInformasi() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // State untuk data yang diedit
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

  // Load data dari Firebase Realtime Database
    useEffect(() => {
    const informasiRef = ref(db, "informasi");
    const unsubscribe = onValue(
      informasiRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const listData = Object.entries(val).map(([id, info]) => ({
            id,
            ...info,
          }));

          // Urutkan data berdasarkan createdAt (paling baru di atas)
          listData.sort((a, b) => {
            return (b.createdAt || 0) - (a.createdAt || 0);
          });

          setData(listData);
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gagal memuat data informasi:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // Filter data berdasarkan bulan & tahun (yyyy-MM)
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informasi");
    XLSX.writeFile(workbook, `informasi-${selectedMonth || "semua"}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;

    const tableClone = tableRef.current.cloneNode(true);
    const actionsHeader = tableClone.querySelector("thead tr th:last-child");
    if (actionsHeader) actionsHeader.remove();
    tableClone.querySelectorAll("tbody tr").forEach((tr) => {
      const actionCell = tr.querySelector("td:last-child");
      if (actionCell) actionCell.remove();
    });

    const printContents = `
      <style>
        body { font-family: sans-serif; margin: 20px; }
        h3 { color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: bold; }
      </style>
      <h3>Data Informasi (${selectedMonth || "Semua Bulan"})</h3>
      ${tableClone.outerHTML}
    `;

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(printContents);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDeleteData = (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      const itemRef = ref(db, `informasi/${id}`);
      remove(itemRef)
        .then(() => console.log("Data berhasil dihapus"))
        .catch((error) => console.error("Gagal menghapus data:", error));
    }
  };

  const handleAddData = async (newData) => {
    try {
      const informasiRef = ref(db, "informasi");
      await push(informasiRef, {
        ...newData,
        createdAt: Date.now(),
      });
      console.log("Data berhasil ditambahkan!");
      setIsModalOpen(false); // Tutup modal setelah berhasil
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      alert("Gagal menambahkan data. Coba lagi.");
    }
  };

  // Fungsi baru untuk mengedit data
  const handleEditData = async (updatedData) => {
    if (!editingItem) return;

    try {
      const itemRef = ref(db, `informasi/${editingItem.id}`);
      await update(itemRef, {
        ...updatedData,
      });
      console.log("Data berhasil diperbarui!");
      setIsModalOpen(false);
      setEditingItem(null); // Reset state editing item
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Gagal memperbarui data. Coba lagi.");
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null); // Pastikan state editingItem direset
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-6xl mx-auto my-12 font-sans">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-6">
        <Info size={40} className="text-indigo-600" />
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Tabel Data Informasi
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Kelola pengumuman dan informasi penting.
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
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Tambah Data Informasi"
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
            className="min-w-full text-sm text-left text-gray-500"
            ref={tableRef}
          >
            <thead className="bg-gray-200 text-gray-700 uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3 border-b border-gray-300">Kegiatan</th>
                <th className="px-4 py-3 border-b border-gray-300">Tempat</th>
                <th className="px-4 py-3 border-b border-gray-300">Pembahasan</th>
                <th className="px-4 py-3 border-b border-gray-300">Jam</th>
                <th className="px-4 py-3 border-b border-gray-300">Tanggal</th>
                <th className="px-4 py-3 border-b border-gray-300 text-center no-print">Aksi</th>
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
                  filteredData.map((info) => (
                    <motion.tr
                      key={info.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-gray-100"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{info.kegiatan}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{info.tempat}</td>
                      <td className="px-4 py-3 whitespace-normal max-w-xs">{info.pembahasan}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{info.jam}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{info.tanggal}</td>
                      <td className="px-4 py-3 text-center no-print flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(info)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                          title="Edit Data"
                          type="button"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteData(info.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Hapus Data"
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
                      Tidak ada data informasi untuk periode ini.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ModalInputInformasi
          onClose={closeModal}
          onSubmit={editingItem ? handleEditData : handleAddData}
          initialData={editingItem}
        />
      )}
    </div>
  );
}