// InfoCardsSection.jsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Info, Calendar, Users, DollarSign, BookOpen, Camera } from "lucide-react";
import { motion, useInView } from "framer-motion";

// Buat komponen Link yang dianimasikan menggunakan Framer Motion
const AnimatedLink = motion(Link);

const infoList = [
  { title: "Ruang Informasi", desc: "Pengumuman penting seputar kegiatan dan komunitas.", to: "/ruang-informasi", icon: Info },
  { title: "Jadwal Ibadah", desc: "Informasi waktu ibadah mingguan & khusus.", to: "/jadwal-ibadah", icon: Calendar },
  { title: "Sidang Jemaat", desc: "Rangkuman dan hasil keputusan sidang jemaat.", to: "/sidang-jemaat", icon: Users },
  { title: "Informasi Keuangan", desc: "Laporan keuangan yang terbuka & transparan.", to: "/informasi-keuangan", icon: DollarSign },
  { title: "Renungan Mingguan", desc: "Renungan iman dan inspirasi rohani setiap minggu.", to: "/renungan-mingguan", icon: BookOpen },
  { title: "Dokumentasi", desc: "Galeri foto & video kegiatan jemaat.", to: "/dokumentasi", icon: Camera },
];

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      ease: [0.42, 0, 0.58, 1],
      duration: 1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function InfoCardsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fungsi yang akan menyimpan posisi gulir ke sessionStorage
  const handleCardClick = () => {
    sessionStorage.setItem('lastScrollPosition', 'InfoCardsSection');
  };

  return (
    <motion.section
      ref={ref}
      className="max-w-7xl mx-auto px-6 py-10"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      aria-label="Informasi Penting"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-16 text-center tracking-tight drop-shadow-md">
        Informasi Penting
      </h2>
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {infoList.map(({ title, desc, to, icon: Icon }, i) => (
          <AnimatedLink
            key={i}
            to={to}
            onClick={handleCardClick} // Tambahkan fungsi onClick di sini
            variants={cardVariants}
            className="group flex items-start gap-5 bg-white/70 backdrop-blur-md p-7 rounded-3xl border border-gray-100 shadow-xl
              transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-300/50"
            aria-label={`Buka detail ${title}`}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="flex-shrink-0 p-3 rounded-xl bg-blue-100 text-blue-600
                group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors duration-300"
            >
              <Icon size={30} strokeWidth={2} />
            </div>
            <div>
              <h3
                className="text-xl font-semibold text-blue-950 mb-1 group-hover:text-blue-800 transition-colors duration-300"
              >
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
          </AnimatedLink>
        ))}
      </div>
    </motion.section>
  );
}