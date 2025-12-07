// Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  ChevronDown,
  Menu as MenuIcon,
  X,
  Church,
  Calendar,
  BookText,
  FileBarChart, // Corrected from FilePie
  MessageSquare,
  GalleryHorizontal,
  Info,
  Users,
  Building,
  Share2,
} from "lucide-react";
import LoginModal from "./LoginModal";
import logo from "./logo.png";

// Menu utama dengan ikon
const navLinks = [
  { to: "/ruang-informasi", label: "Ruang Informasi", icon: <Info size={18} /> },
  { to: "/jadwal-ibadah", label: "Jadwal Ibadah", icon: <Calendar size={18} /> },
  { to: "/sidang-jemaat", label: "Sidang Jemaat", icon: <Users size={18} /> },
  {
    to: "/informasi-keuangan",
    label: "Informasi Keuangan",
    icon: <FileBarChart size={18} />, // Using the new icon
  },
  {
    to: "/renungan-mingguan",
    label: "Renungan Mingguan",
    icon: <BookText size={18} />,
  },
  {
    to: "/dokumentasi",
    label: "Dokumentasi",
    icon: <GalleryHorizontal size={18} />,
  },
];

// Quick Links homepage dengan ikon
const quickLinks = [
  { id: "IntroSection", label: "Tentang Gereja", icon: <Church size={18} /> },
  {
    id: "FotoRayonSection",
    label: "Struktur Organisasi",
    icon: <Building size={18} />,
  },
  {
    id: "InfoCardsSection",
    label: "Informasi Penting",
    icon: <MessageSquare size={18} />,
  },
  { id: "SosmedSection", label: "Sosial Media", icon: <Share2 size={18} /> },
];

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [dropdownHomeOpen, setDropdownHomeOpen] = useState(false);
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickClick = (id) => {
    setDropdownHomeOpen(false);
    setMobileMenuOpen(false);
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = () => {
    setDropdownMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const dropdownVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-blue-900 text-white shadow-xl h-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo + Judul */}
          <Link
            to="/"
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              src={logo}
              alt="GEREJA"
              className="h-10 w-10 object-contain drop-shadow-sm"
            />
            <span className="text-xl sm:text-2xl font-bold tracking-wide whitespace-nowrap drop-shadow-sm">
              GEREJA
            </span>
          </Link>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Links */}
            <div className="relative">
              <motion.button
                onClick={() => {
                  setDropdownHomeOpen(!dropdownHomeOpen);
                  setDropdownMenuOpen(false);
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Tautan Cepat
                <motion.div animate={{ rotate: dropdownHomeOpen ? 180 : 0 }}>
                  <ChevronDown size={20} />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {dropdownHomeOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                    className="absolute right-0 mt-2 w-60 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
                  >
                    {quickLinks.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleQuickClick(item.id)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu Utama */}
            <div className="relative">
              <motion.button
                onClick={() => {
                  setDropdownMenuOpen(!dropdownMenuOpen);
                  setDropdownHomeOpen(false);
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Menu
                <motion.div animate={{ rotate: dropdownMenuOpen ? 180 : 0 }}>
                  <ChevronDown size={20} />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {dropdownMenuOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                    className="absolute right-0 mt-2 w-60 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
                  >
                    {navLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleNavClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tombol Admin */}
            <motion.button
              onClick={() => setShowLogin(true)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Tombol masuk halaman admin"
              title="Halaman Admin"
            >
              <KeyRound size={20} />
            </motion.button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={dropdownVariants}
              className="md:hidden fixed top-16 bg-blue-800/90 backdrop-blur-sm text-white w-full shadow-lg border-t border-blue-700"
            >
              <div className="flex flex-col px-4 py-4 gap-2">
                <h3 className="font-semibold text-blue-300 mb-1 px-2">
                  Tautan Cepat
                </h3>
                {quickLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQuickClick(item.id)}
                    className="flex items-center gap-2 text-left px-2 py-2 hover:bg-blue-700 rounded transition-colors"
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                <hr className="my-2 border-blue-700" />
                <h3 className="font-semibold text-blue-300 mb-1 px-2">
                  Menu Utama
                </h3>
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className="flex items-center gap-2 text-left px-2 py-2 hover:bg-blue-700 rounded transition-colors"
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                <div className="mt-4">
                  <motion.button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center justify-center w-full gap-2 px-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all"
                  >
                    <KeyRound size={20} /> Masuk Admin
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Modal login */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}