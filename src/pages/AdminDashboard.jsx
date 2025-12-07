import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Impor semua komponen tabel
import AnalisisData from "../components/TabelData/AnalisisData";
import AdminCarouselPhotos from "../components/TabelData/AdminCarouselPhotos";
import AdminStrukturOrganisasi from "../components/TabelData/AdminStrukturOrganisasi";
import TabelInformasi from "../components/TabelData/TabelInformasi";
import TabelJadwal from "../components/TabelData/TabelJadwal";
import TabelSidang from "../components/TabelData/TabelSidang";
import TabelKeuangan from "../components/TabelData/TabelKeuangan";
import TabelRenungan from "../components/TabelData/TabelRenungan";
import TabelDokumentasi from "../components/TabelData/TabelDokumentasi";
import TabelAdmin from "../components/TabelData/TabelAdmin";

const allTabs = [
  { id: "analisis", label: "Dashboard", component: <AnalisisData />, roles: ["admin"] },
  { id: "AdminCarouselPhotos", label: "Profil", component: <AdminCarouselPhotos />, roles: ["admin"] },
  { id: "AdminStrukturOrganisasi", label: "Struktur Organisasi", component: <AdminStrukturOrganisasi />, roles: ["admin"] },
  { id: "Admin", label: "Akun", component: <TabelAdmin/>, roles: ["admin"] },
  { id: "informasi", label: "Informasi", component: <TabelInformasi />, roles: ["admin"] },
  { id: "jadwal", label: "Jadwal", component: <TabelJadwal />, roles: ["admin"] },
  { id: "sidang", label: "Sidang", component: <TabelSidang />, roles: ["admin"] },
  { id: "keuangan", label: "Keuangan", component: <TabelKeuangan />, roles: ["bendahara"] },
  { id: "renungan", label: "Renungan", component: <TabelRenungan />, roles: ["admin"] },
  { id: "dokumentasi", label: "Dokumentasi Kegiatan", component: <TabelDokumentasi />, roles: ["admin"] },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!userRole) {
      navigate("/"); // arahkan ke halaman login/dashboard awal
    }
  }, [userRole, navigate]);

  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || null);
  const activeComponent = visibleTabs.find(tab => tab.id === activeTab)?.component;

  const handleLogout = () => {
    localStorage.removeItem("userRole"); // hapus session
    navigate("/"); // redirect ke halaman login/dashboard awal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Dashboard {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola seluruh data jemaat, kegiatan, dan laporan dengan efisien.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow transition duration-200"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="border-b-2 border-gray-200 sticky top-0 bg-white z-20">
          <ul className="flex overflow-x-auto text-sm sm:text-base -mb-0.5">
            {visibleTabs.map((tab) => (
              <li
                key={tab.id}
                className={`relative px-4 py-2 font-medium cursor-pointer transition-colors duration-300
                  ${activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab Content */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeComponent}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
