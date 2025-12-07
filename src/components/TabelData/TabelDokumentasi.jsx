import React, { useMemo, useState, useRef, useEffect } from "react";
import { Download, Printer, Plus, Trash2, Camera, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import ModalInputDokumentasi from "./ModalInputDokumentasi";
import { AnimatePresence, motion } from "framer-motion";

export default function TabelDokumentasi() {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
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
    const dokumentasiRef = ref(db, "dokumentasi");
    const unsubscribe = onValue(
      dokumentasiRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const docsArray = Object.entries(val).map(([id, item]) => ({
            id,
            ...item,
            gambar: Array.isArray(item.fotoUrls) ? item.fotoUrls : [],
          }));

          // 🔥 Urutkan: prioritas createdAt desc → fallback tanggal desc
          const sorted = docsArray.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt - a.createdAt;
            }
            if (a.tanggal && b.tanggal) {
              return new Date(b.tanggal) - new Date(a.tanggal);
            }
            return 0; // biarin kalau dua2nya ga ada
          });

          setData(sorted);
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gagal memuat data dokumentasi:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    return data.filter((doc) => doc.tanggal?.slice(0, 7) === selectedMonth);
  }, [data, selectedMonth]);

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
        .no-print { display: none; }
      </style>
    `;
    const tableHtml = tableRef.current.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Dokumentasi</title>
          ${style}
        </head>
        <body>
          <h3>Data Dokumentasi (${selectedMonth || "Semua Bulan"})</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }
    const worksheetData = filteredData.map(({ gambar, ...rest }) => ({
      ...rest,
      gambar: gambar.join(", "),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dokumentasi");
    XLSX.writeFile(workbook, `dokumentasi-${selectedMonth || "semua"}.xlsx`);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Yakin ingin menghapus item ini?");
    if (confirmed) {
      const docRef = ref(db, `dokumentasi/${id}`);
      remove(docRef)
        .then(() => console.log("Data berhasil dihapus"))
        .catch((error) => console.error("Gagal menghapus data:", error));
    }
  };

  const handleEdit = (doc) => {
    setEditData(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-6xl mx-auto my-12 font-sans">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-6">
        <Camera size={40} className="text-indigo-600" />
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Tabel Data Dokumentasi
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Kelola arsip foto dan video kegiatan gereja.
          </p>
        </div>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      {/* Bagian Kontrol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label
            htmlFor="filter-month"
            className="text-sm font-medium text-gray-700"
          >
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Unduh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition-all"
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
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 max-w-[350px]">Link Gambar</th>
                <th className="px-4 py-3 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((doc) => (
                    <motion.tr
                      key={doc.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-gray-100"
                    >
                      <td className="px-4 py-3">{doc.judul}</td>
                      <td className="px-4 py-3">{doc.tanggal}</td>
                      <td className="px-4 py-3">{doc.keterangan}</td>
                      <td className="px-4 py-3 max-w-[350px] border-b">
                        <ul className="list-disc list-inside space-y-1 max-h-24 overflow-y-auto">
                          {doc.gambar.length > 0 ? (
                            doc.gambar.map((src, i) => (
                              <li key={i}>
                                <a
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {src}
                                </a>
                              </li>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">
                              Tidak ada gambar
                            </span>
                          )}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-center no-print flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded transition-colors"
                          title="Edit Data"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Hapus Data"
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
                    <td colSpan={5} className="text-center py-4 text-gray-400">
                      Tidak ada data dokumentasi untuk periode ini.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ModalInputDokumentasi
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          initialData={editData}
        />
      )}
    </div>
  );
}
