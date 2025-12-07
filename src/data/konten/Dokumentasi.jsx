import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  Info,
  Search,
  CalendarDays,
  GalleryVertical,
  FileText,
  Book,
  Banknote,
  Clock,
  Heart,
  Users,
} from "lucide-react";

// Varian animasi untuk container utama (list dokumentasi)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Varian animasi untuk setiap kartu dokumentasi
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 25,
    },
  },
};

// Varian animasi untuk backdrop modal (latar belakang gelap)
const modalBackdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

// Varian animasi untuk gambar di dalam modal
const modalImageVariants = {
  hidden: { scale: 0.8, opacity: 0, rotate: -5 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    rotate: -5,
    transition: { duration: 0.3 },
  },
};

export default function Dokumentasi() {
  const [data, setData] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allImages = useMemo(() => data.flatMap(({ fotoUrls }) => fotoUrls), [data]);

  useEffect(() => {
    const dokumentasiRef = ref(db, "dokumentasi");
    const unsubscribe = onValue(
      dokumentasiRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const arr = Object.entries(val).map(([key, item]) => ({
            id: key,
            ...item,
            fotoUrls: Array.isArray(item.fotoUrls) ? item.fotoUrls : [],
          }));
          arr.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
          setData(arr);
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

    if (selectedMonth) {
      filtered = filtered.filter((doc) => doc.tanggal?.startsWith(selectedMonth));
    }

    if (lowerCaseSearchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.judul?.toLowerCase().includes(lowerCaseSearchTerm) ||
          doc.keterangan?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  }, [data, searchTerm, selectedMonth]);

  const analysisData = useMemo(() => {
    const totalDocs = data.length;
    const totalPhotos = data.reduce((acc, doc) => acc + (doc.fotoUrls?.length || 0), 0);
    const currentResultsCount = filteredData.length;

    return {
      totalDocs,
      totalPhotos,
      currentResultsCount,
    };
  }, [data, filteredData]);

  const openModalByUrl = (url) => {
    const index = allImages.indexOf(url);
    if (index !== -1) setPreviewIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = useCallback(() => {
    setPreviewIndex(null);
    document.body.style.overflow = "unset";
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (previewIndex === null) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowRight") {
        setPreviewIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === "ArrowLeft") {
        setPreviewIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    },
    [previewIndex, allImages.length, closeModal]
  );

  useEffect(() => {
    if (previewIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, previewIndex]);

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  const quickAccessLinks = [
    { name: "Dokumentasi", icon: <Book size={20} />, href: "/dokumentasi" },
    {
      name: "Laporan Keuangan",
      icon: <Banknote size={20} />,
      href: "/informasi-keuangan",
    },
    { name: "Jadwal Ibadah", icon: <Clock size={20} />, href: "/jadwal-ibadah" },
    { name: "Renungan Mingguan", icon: <Heart size={20} />, href: "/renungan-mingguan" },
    { name: "Ruang Informasi", icon: <Info size={20} />, href: "/ruang-informasi" },
    { name: "Sidang Jemaat", icon: <Users size={20} />, href: "/sidang-jemaat" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Mobile/Desktop Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section */}
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
                  <Camera size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Dokumentasi
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                    {analysisData.currentResultsCount} hasil ditemukan
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
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
                    link.href === "/dokumentasi"
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
        {/* Enhanced Search & Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-6 mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Search */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Cari Dokumentasi
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

                {/* Month Filter */}
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

              {/* Active Filters Display */}
              {(searchTerm || selectedMonth) && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Filter aktif:
                  </span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="hover:bg-indigo-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedMonth && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedMonth}
                      <button
                        onClick={() => setSelectedMonth("")}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Card */}
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
                📊 Total Dokumentasi Kegiatan
              </p>
              <p className="text-3xl lg:text-5xl font-bold mb-2">
                {analysisData.totalDocs}
              </p>
              <p className="text-indigo-100 text-sm lg:text-base">
                terdiri dari {analysisData.totalPhotos} foto
              </p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GalleryVertical className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </motion.div>

        {/* Content Area */}
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
                    Memuat Dokumentasi
                  </p>
                  <p className="text-gray-600">Sedang mengambil data terbaru...</p>
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
                <GalleryVertical className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                Belum Ada Dokumentasi
              </p>
              <p className="text-gray-600 text-lg">
                Dokumentasi kegiatan akan muncul di sini setelah diunggah.
              </p>
            </motion.div>
          )}

          {!loading && filteredData.length === 0 && data.length > 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
          )}

          {!loading && filteredData.length > 0 && (
            <motion.div
              key="content"
              layout
              className="space-y-8 lg:space-y-12"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {filteredData.map(({ id, judul, tanggal, keterangan, fotoUrls }) => (
                <motion.div
                  key={id}
                  layout
                  variants={cardVariants}
                  className="group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                  tabIndex={0}
                  role="group"
                  aria-label={`Dokumentasi kegiatan ${judul}`}
                >
                  {/* Header dengan Judul dan Tanggal */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {judul || "Tanpa Judul"}
                      </h3>
                    </div>
                    <div
                      className="text-xs font-semibold px-4 py-1 rounded-full select-none cursor-default bg-gray-100 text-gray-600 w-fit"
                      style={{ letterSpacing: "0.04em" }}
                    >
                      {tanggal || "-"}
                    </div>
                  </div>

                  {/* Keterangan dengan Ikon */}
                  <div className="flex items-start gap-2 mb-4">
                    <Info size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {keterangan || "Tidak ada keterangan."}
                    </p>
                  </div>

                  {fotoUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                      {fotoUrls.slice(0, 4).map((url, index) => (
                        <motion.div
                          key={url}
                          className="group relative cursor-pointer rounded-xl overflow-hidden shadow-sm"
                          onClick={() => openModalByUrl(url)}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Preview foto ${index + 1} dari dokumentasi ${judul}`}
                        >
                          <motion.img
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-40 object-cover rounded-xl"
                            loading="lazy"
                            draggable={false}
                          />
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-xl"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            aria-hidden="true"
                          >
                            <ZoomIn size={24} className="text-white" />
                          </motion.div>
                        </motion.div>
                      ))}
                      {/* Tampilkan sisa foto jika lebih dari 4 */}
                      {fotoUrls.length > 4 && (
                        <motion.div
                          className="relative cursor-pointer rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-100 text-gray-600 text-center font-bold hover:bg-gray-200 transition-colors"
                          onClick={() => openModalByUrl(fotoUrls[4])}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          +{fotoUrls.length - 4} Foto Lainnya
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="italic text-gray-400 select-none">
                      Tidak ada foto untuk dokumentasi ini.
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Preview */}
        <AnimatePresence>
          {previewIndex !== null && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-modal="true"
              role="dialog"
              tabIndex={-1}
            >
              <motion.div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  src={allImages[previewIndex]}
                  alt={`Preview foto ${previewIndex + 1}`}
                  className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white"
                  variants={modalImageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  draggable={false}
                />
                <motion.button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-gray-900 bg-opacity-50 rounded-full p-2 text-white shadow-lg hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  aria-label="Tutup preview"
                >
                  <X size={24} />
                </motion.button>

                {allImages.length > 1 && (
                  <>
                    <motion.button
                      onClick={() =>
                        setPreviewIndex(
                          (prev) => (prev + 1) % allImages.length
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-50 rounded-full p-2 text-white shadow-lg hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden md:block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      aria-label="Foto berikutnya"
                    >
                      <ArrowRight size={24} />
                    </motion.button>

                    <motion.button
                      onClick={() =>
                        setPreviewIndex(
                          (prev) => (prev - 1 + allImages.length) % allImages.length
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-50 rounded-full p-2 text-white shadow-lg hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden md:block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      aria-label="Foto sebelumnya"
                    >
                      <ArrowLeft size={24} />
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}