import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Variants animasi
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const titleVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

// Card component
const Card = ({ name, person, src, isTopTier = false }) => (
  <motion.div
    variants={itemVariants}
    className={`
      flex flex-col items-center p-8 bg-white/70 backdrop-blur-lg rounded-3xl border border-gray-100
      shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300
      ${isTopTier ? "max-w-md w-full" : "w-full max-w-xs"}
    `}
    whileTap={{ scale: 0.98 }}
  >
    {/* Gambar dengan aspect-ratio tetap */}
    <div className={`relative ${isTopTier ? "w-48 h-48 aspect-square" : "w-40 h-40 aspect-square"}`}>
      <motion.img
        src={src}
        alt={person}
        className="absolute inset-0 w-full h-full object-cover rounded-full ring-4 ring-blue-950/70 drop-shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>

    <div className="text-center mt-6 z-10">
      <motion.h4 className={`mt-2 ${isTopTier ? "text-2xl" : "text-xl"} font-bold text-blue-950`}>
        {name}
      </motion.h4>
      <motion.p className={`mt-1 ${isTopTier ? "text-lg" : "text-base"} text-gray-700 font-medium`}>
        {person}
      </motion.p>
    </div>
  </motion.div>
);

export default function StrukturOrganisasiSection() {
  const [struktur, setStruktur] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const strukturRef = ref(db, "struktur");
    const unsubscribe = onValue(strukturRef, (snapshot) => {
      const data = snapshot.val() || {};
      const positions = [
        { id: "1", name: "Ketua" },
        { id: "2", name: "Wakil Ketua" },
        { id: "3", name: "Sekretaris" },
        { id: "4", name: "Wakil Sekretaris" },
        { id: "5", name: "Bendahara" },
      ];

      const filledData = positions.map((posisi) => {
        const item = data[posisi.id];
        return item && item.person && item.src
          ? item
          : {
              ...posisi,
              person: "Tidak ditemukan",
              src: "https://ucarecdn.com/f8f9f8f9-f8f9-f8f9-f8f9-f8f9f8f9f8f9/placeholder.png",
            };
      });

      const sortedStruktur = filledData.sort((a, b) => (a.name === "Ketua" ? -1 : b.name === "Ketua" ? 1 : 0));

      setStruktur(sortedStruktur);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Skeleton / placeholder loading fixed height
    return (
      <section className="py-24 px-6 font-sans min-h-screen flex flex-col items-center justify-center text-center text-gray-500">
        <Loader2 className="animate-spin h-16 w-16 mb-4 text-blue-950" />
        <p className="text-lg">Memuat struktur...</p>

        {/* Skeleton cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center w-full max-w-7xl">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="bg-gray-200/50 rounded-3xl w-40 h-56 md:w-44 md:h-60 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-800 py-10 px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-5xl md:text-6xl font-extrabold text-center mb-20 tracking-tight drop-shadow-md text-blue-950"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Struktur Organisasi
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center"
        >
          {struktur.length > 0 && (
            <>
              <div className="lg:col-span-3 flex justify-center w-full">
                <Card
                  name={struktur[0].name}
                  person={struktur[0].person}
                  src={struktur[0].src}
                  isTopTier={true}
                />
              </div>

              {struktur.slice(1).map((item, idx) => (
                <Card key={idx} name={item.name} person={item.person} src={item.src} />
              ))}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
