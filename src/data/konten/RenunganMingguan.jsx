import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookText,
  CalendarDays,
  ScrollText,
  ChevronDown,
  ChevronUp,
  X,
  Gem,
  Search,
  ArrowLeft,
  Banknote,
  Heart,
  Info,
  GalleryVertical,
  Users,
  Clock,
} from "lucide-react";

// Komponen untuk menampilkan daftar renungan
const RenunganListSection = ({ renunganItems }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleImageClick = (url) => {
    setPreviewImageUrl(url);
    setIsImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl(null);
  };

  if (renunganItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center"
      >
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-3">
          Tidak Ada Hasil
        </p>
        <p className="text-gray-600 text-lg">
          Coba sesuaikan kriteria pencarian atau filter Anda.
        </p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
      >
        {renunganItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div
              className="flex items-start gap-4 flex-1 cursor-pointer"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:from-purple-200 group-hover:via-indigo-200 group-hover:to-blue-200 transition-colors shadow-sm">
                <BookText className="w-7 h-7 lg:w-8 lg:h-8 text-indigo-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors leading-tight">
                  {item.judul || "Judul tidak tersedia"}
                </h4>
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {item.tanggal || "Tanggal tidak diketahui"}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-500 hover:text-indigo-600 transition-colors self-start lg:self-center">
                {expandedId === item.id ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 border-t pt-4 border-gray-200"
                >
                  <div className="flex flex-col gap-2 text-gray-700">
                    {item.pembacaan && (
                      <div className="flex items-center gap-2">
                        <ScrollText size={18} className="text-gray-600" />
                        <span className="text-sm">
                          <span className="font-semibold">Ayat Firman:</span>{" "}
                          {item.pembacaan}
                        </span>
                      </div>
                    )}
                    {item.isi && (
                      <div className="flex items-start gap-2">
                        <Gem
                          size={18}
                          className="text-gray-600 flex-shrink-0 mt-1"
                        />
                        <span className="text-sm leading-relaxed text-justify">
                          <span className="font-semibold">Isi Renungan:</span>{" "}
                          {item.isi}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Image is moved here, below the text content */}
                  {item.gambarUrl && (
                    <img
                      src={item.gambarUrl}
                      alt={item.judul}
                      className="w-full aspect-video h-auto object-cover rounded-xl mt-4 shadow-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(item.gambarUrl);
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
      <AnimatePresence>
        {isImagePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleCloseImagePreview}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-full"
            >
              <img
                src={previewImageUrl}
                alt="Preview Renungan"
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
              <button
                onClick={handleCloseImagePreview}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                aria-label="Tutup preview gambar"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function RenunganMingguan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const renunganRef = ref(db, "renungan");
    const unsubscribe = onValue(
      renunganRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const renunganArray = Object.entries(val)
            .map(([id, item]) => ({
              id,
              ...item,
            }))
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
          setData(renunganArray);
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = data;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    if (lowerCaseSearchTerm) {
      filtered = filtered.filter((doc) =>
        doc.judul?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(
        (doc) => doc.tanggal?.slice(0, 7) === selectedMonth
      );
    }

    return filtered;
  }, [data, selectedMonth, searchTerm]);

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  const totalRenungan = filteredData.length;

  const quickAccessLinks = [
    { name: "Dokumentasi", icon: <GalleryVertical size={20} />, href: "/dokumentasi" },
    { name: "Laporan Keuangan", icon: <Banknote size={20} />, href: "/informasi-keuangan" },
    { name: "Jadwal Ibadah", icon: <Clock size={20} />, href: "/jadwal-ibadah" },
    { name: "Renungan Mingguan", icon: <Heart size={20} />, href: "/renungan-mingguan" },
    { name: "Ruang Informasi", icon: <Info size={20} />, href: "/ruang-informasi" },
    { name: "Sidang Jemaat", icon: <Users size={20} />, href: "/sidang-jemaat" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline font-medium">Kembali</span>
              </motion.button>

              <div className="h-6 w-px bg-gray-300 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookText size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Renungan Mingguan
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                    {totalRenungan} renungan ditemukan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  showFilters
                    ? "bg-indigo-100 text-indigo-700 shadow-inner"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                {showFilters ? <X size={20} /> : <Search size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Akses Cepat */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-16 lg:top-20 z-40 shadow-sm overflow-x-auto">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-nowrap items-center gap-2 py-2">
            {quickAccessLinks.map((link) => (
              <li key={link.name}>
                <motion.a
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 whitespace-nowrap ${
                    link.href === "/renungan-mingguan"
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-6 mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Cari Renungan
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Masukkan kata kunci..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white/90 transition-all duration-200 placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📅 Filter Bulan
                  </label>
                  <div className="relative group">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white/90 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-6 lg:p-8 mb-8 shadow-xl text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-100 font-medium mb-2 text-sm lg:text-base">
                📊 Total Renungan Tersedia
              </p>
              <p className="text-3xl lg:text-5xl font-bold mb-2">
                {totalRenungan}
              </p>
              <p className="text-indigo-100 text-sm lg:text-base">
                dari {data.length} total renungan
              </p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BookText className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center"
            >
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    Memuat Renungan
                  </p>
                  <p className="text-gray-600">
                    Sedang mengambil data terbaru...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50/80 backdrop-blur-xl rounded-3xl shadow-xl border border-red-200/50 p-12 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-xl font-bold text-red-900 mb-2">
                Terjadi Kesalahan
              </p>
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {!loading && data.length === 0 && (
            <motion.div
              key="no-data"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                Belum Ada Renungan
              </p>
              <p className="text-gray-600 text-lg">
                Renungan mingguan akan muncul di sini setelah diunggah.
              </p>
            </motion.div>
          )}

          {!loading && data.length > 0 && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <RenunganListSection renunganItems={filteredData} />
            </motion.div>
          )}
        </AnimatePresence>

        {filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
              <p className="text-gray-700 text-sm lg:text-base">
                💡 <span className="font-semibold">Tips:</span> Klik pada kartu
                renungan untuk melihat detail lebih lanjut, termasuk isi dan
                gambar.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}