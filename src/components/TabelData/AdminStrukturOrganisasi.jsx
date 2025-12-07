import React, { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig";
import { onValue, ref, set } from "firebase/database";
import { Save, Loader2, Camera, User, Users, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UPLOADCARE_PUBLIC_KEY = "897faa7889894ee119ec"; // ganti dengan punyamu

const strukturRef = ref(db, "struktur");

const strukturList = [
  { id: "1", name: "Ketua", icon: <Briefcase size={20} /> },
  { id: "2", name: "Wakil Ketua", icon: <Briefcase size={20} /> },
  { id: "3", name: "Sekretaris", icon: <User size={20} /> },
  { id: "4", name: "Wakil Sekretaris", icon: <User size={20} /> },
  { id: "5", name: "Bendahara", icon: <Users size={20} /> },
];

export default function AdminStrukturOrganisasi() {
  const [struktur, setStruktur] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onValue(strukturRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStruktur(data);
    });
    return () => unsub();
  }, []);

  const handleSave = (id, newData) => {
    const updates = { ...struktur, [id]: newData };
    setLoading(true);
    set(strukturRef, updates)
      .then(() => {
        alert("Perubahan berhasil disimpan!");
      })
      .catch((error) => {
        console.error("Gagal menyimpan data:", error);
        alert("Gagal menyimpan data.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-12 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-4xl font-extrabold text-center mb-10 tracking-tight text-indigo-900 drop-shadow-sm">
        Kelola Struktur Organisasi
      </h2>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Ubah foto dan nama anggota untuk 5 posisi.
      </p>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {strukturList.map((item) => (
          <CardSlot
            key={item.id}
            id={item.id}
            name={item.name}
            icon={item.icon}
            data={struktur[item.id]}
            onSave={handleSave}
            loading={loading}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function CardSlot({ id, name, data, onSave, loading, icon }) {
  const [person, setPerson] = useState(data?.person || "");
  const [src, setSrc] = useState(data?.src || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPerson(data?.person || "");
    setSrc(data?.src || "");
  }, [data]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("UPLOADCARE_STORE", "1");
      formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
      formData.append("file", file);

      const res = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah foto.");
      const result = await res.json();
      setSrc(`https://ucarecdn.com/${result.file}/`);
    } catch (err) {
      alert("Upload gagal!");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!person || !src) return alert("Nama dan foto wajib diisi!");
    onSave(id, { name, person, src });
  };
  
  const hasChanges = person !== (data?.person || "") || src !== (data?.src || "");

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="text-indigo-600">{icon}</div>
        <h4 className="font-semibold text-2xl text-indigo-800">{name}</h4>
      </div>
      
      <div className="w-36 h-36 mx-auto relative rounded-full overflow-hidden border-4 border-indigo-200 shadow-inner mb-4">
        <AnimatePresence mode="wait">
          {src ? (
            <motion.img
              key={src}
              src={getProcessedImageUrl(src)}
              alt="Foto Profil"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              key="placeholder"
              className="w-full h-full flex items-center justify-center bg-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Camera className="w-20 h-20 text-gray-400 p-2" />
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={handleUpload}
          accept="image/*"
          disabled={uploading || loading}
        />
        <div
          className={`absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full z-20 cursor-pointer transition-transform duration-200 ${
            uploading ? "animate-pulse" : "hover:scale-110"
          }`}
        >
          <Camera size={18} />
        </div>
      </div>
      <input
        type="text"
        value={person}
        onChange={(e) => setPerson(e.target.value)}
        placeholder="Nama Lengkap"
        className="w-full border-b-2 border-indigo-300 focus:border-indigo-600 outline-none transition-colors duration-200 py-2 text-lg text-center font-medium text-gray-700"
        disabled={uploading || loading}
      />
      <button
        onClick={handleSave}
        disabled={uploading || loading || !hasChanges}
        className={`w-full mt-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
          uploading || loading || !hasChanges
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
        }`}
      >
        <AnimatePresence mode="wait">
          {uploading || loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="animate-spin w-5 h-5" />
              Menyimpan...
            </motion.div>
          ) : (
            <motion.div
              key="save"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Simpan
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

function getProcessedImageUrl(url) {
  if (!url || !url.includes("ucarecdn")) return url;
  
  const uuid = url.split('/').filter(Boolean).pop();
  return `https://ucarecdn.com/${uuid}/-/resize/400x400/-/crop/1:1/center/`;
}