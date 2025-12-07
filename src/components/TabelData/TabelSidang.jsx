import React, { useState, useEffect, useMemo, useRef } from "react";
import { Download, Printer, Plus, Trash2, Pencil, Gavel } from "lucide-react";
import * as XLSX from "xlsx";
import ModalInputSidang from "./ModalInputSidang";
import { db } from "../../config/firebaseConfig";
import { ref, onValue, remove, update, push } from "firebase/database";
import { AnimatePresence, motion } from "framer-motion";

export default function TabelSidang() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null); // <-- state untuk edit
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

    useEffect(() => {
    const sidangRef = ref(db, "sidang");
    const unsubscribe = onValue(
      sidangRef,
      (snapshot) => {
        const value = snapshot.val();
        if (value) {
          const newData = Object.entries(value).map(([key, val]) => ({
            key,
            ...val,
          }));

          // langsung balik urutannya
          setData(newData.reverse());
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gagal memuat data sidang:", err);
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
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(({ judul, tanggal, pdfUrl }) => ({
        Judul: judul,
        Tanggal: tanggal,
        URL: pdfUrl,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sidang");
    XLSX.writeFile(workbook, `sidang-${selectedMonth || "semua"}.xlsx`);
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
      </style>
    `;
    const tableHtml = tableRef.current.outerHTML;

    printWindow.document.write(`
      <html>
        <head><title>Cetak Sidang</title>${style}</head>
        <body>
          <h3>Data Sidang (${selectedMonth || "Semua Bulan"})</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDelete = (key) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    const itemRef = ref(db, `sidang/${key}`);
    remove(itemRef)
      .then(() => console.log("Data sidang berhasil dihapus."))
      .catch((err) => alert("Gagal menghapus: " + err.message));
  };

  const handleSave = (formData) => {
    if (editingData) {
      // mode edit
      const itemRef = ref(db, `sidang/${editingData.key}`);
      update(itemRef, formData)
        .then(() => console.log("Data sidang diperbarui."))
        .catch((err) => alert("Gagal update: " + err.message));
    } else {
      // mode tambah
      const sidangRef = ref(db, "sidang");
      push(sidangRef, formData)
        .then(() => console.log("Data sidang ditambahkan."))
        .catch((err) => alert("Gagal tambah: " + err.message));
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-6xl mx-auto my-12 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Gavel size={40} className="text-indigo-600" />
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Tabel Data Sidang
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Arsip dokumen sidang dan musyawarah gereja.
          </p>
        </div>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      {/* Kontrol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingData(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Unduh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-gray-50 rounded-lg shadow-inner overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table ref={tableRef} className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-200 text-gray-700 uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3">Judul Sidang</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <motion.tr
                      key={item.key}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-gray-100"
                    >
                      <td className="px-4 py-3">{item.judul}</td>
                      <td className="px-4 py-3">{item.tanggal}</td>
                      <td className="px-4 py-3">
                        {item.pdfUrl ? (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline"
                          >
                            Lihat File
                          </a>
                        ) : (
                          <span className="text-gray-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center no-print flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditingData(item);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.key)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={4} className="text-center py-4 text-gray-400">
                      Tidak ada data sidang untuk periode ini.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ModalInputSidang
          onClose={() => {
            setIsModalOpen(false);
            setEditingData(null);
          }}
          onSubmit={handleSave}
          initialData={editingData}
        />
      )}
    </div>
  );
}
