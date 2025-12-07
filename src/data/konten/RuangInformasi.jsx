import React, { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import {
  Clock,
  CalendarDays,
  BellRing,
  MapPin,
  MessageCircle,
  ChevronDown,
  Search,
  ArrowLeft,
  X,
  Banknote,
  Heart,
  Info,
  GalleryVertical,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Komponen untuk menampilkan daftar informasi
const InformasiListSection = ({ informasiItems, toggleExpand, expandedItem }) => {
  if (informasiItems.length === 0) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {informasiItems.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative"
          onClick={() => toggleExpand(item.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors leading-tight">
                {item.kegiatan || "Judul tidak diketahui"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {formatDate(item.tanggal)}
                </span>
              </div>
            </div>
            <motion.div
              initial={false}
              animate={{ rotate: expandedItem === item.id ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-4 p-2 rounded-xl bg-gray-100 group-hover:bg-indigo-100 transition-colors"
            >
              <ChevronDown
                size={20}
                className="text-gray-600 group-hover:text-indigo-600"
              />
            </motion.div>
          </div>
          <AnimatePresence>
            {expandedItem === item.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tempat</p>
                      <p className="text-gray-600">
                        {item.tempat || "Tempat tidak diketahui"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Waktu</p>
                      <p className="text-gray-600">
                        {item.jam || "Jam tidak diketahui"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Pembahasan</p>
                      <p className="text-gray-600 leading-relaxed">
                        {item.pembahasan || "Pembahasan tidak diketahui"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function RuangInformasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const informasiRef = ref(db, "informasi");
    const unsubscribe = onValue(
      informasiRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const arr = Object.entries(val).map(([id, item]) => ({
            id,
            ...item,
          }));
          arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
      filtered = filtered.filter((item) =>
        item.tanggal?.startsWith(selectedMonth)
      );
    }

    if (lowerCaseSearchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.kegiatan?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.pembahasan?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  }, [data, searchTerm, selectedMonth]);

  const totalInformasi = filteredData.length;

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleBack = () => {
    window.location.href = "/dashboard";
  };


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
                  <BellRing size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Ruang Informasi
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                    {totalInformasi} informasi ditemukan
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
                <Search size={20} />
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
                    link.href === "/ruang-informasi"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Cari Informasi
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
                📊 Total Informasi Tersedia
              </p>
              <p className="text-3xl lg:text-5xl font-bold mb-2">
                {totalInformasi}
              </p>
              <p className="text-indigo-100 text-sm lg:text-base">
                dari {data.length} total informasi
              </p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BellRing className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
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
                    Memuat Informasi
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
                <BellRing className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                Belum Ada Informasi
              </p>
              <p className="text-gray-600 text-lg">
                Informasi jemaat akan muncul di sini setelah diunggah.
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
              <InformasiListSection
                informasiItems={filteredData}
                toggleExpand={toggleExpand}
                expandedItem={expandedItem}
              />
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
                informasi untuk melihat detail lengkap. Jangan lupa selalu cek
                halaman ini agar tidak ketinggalan informasi penting!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}