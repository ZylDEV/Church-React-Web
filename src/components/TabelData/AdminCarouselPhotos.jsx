import React, { useState, useEffect } from "react";
import { ref, onValue, push, remove, update } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, Camera, X, Loader2 } from "lucide-react";

const UPLOADCARE_PUBLIC_KEY = "897faa7889894ee119ec";

function PhotoModal({ isOpen, onClose, onSave, photoData, isEdit }) {
  const [judul, setJudul] = useState(photoData?.judul || "");
  const [imageUrl, setImageUrl] = useState(photoData?.url || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setJudul(photoData?.judul || "");
      setImageUrl(photoData?.url || "");
      setIsUploading(false);
    }
  }, [isOpen, photoData]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("UPLOADCARE_STORE", "1");
      formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
      formData.append("file", file);

      const response = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Gagal mengunggah file: ${response.statusText}`);
      }

      const data = await response.json();
      const cdnUrl = `https://ucarecdn.com/${data.file}/`;
      setImageUrl(cdnUrl);
      
      alert("Foto berhasil diunggah!");
    } catch (error) {
      console.error("Kesalahan unggah:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
      setImageUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!judul || !imageUrl) {
      alert("Judul dan foto harus diisi.");
      return;
    }
    onSave({ id: photoData?.id, judul, url: imageUrl });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-indigo-800">
                {isEdit ? "Edit Foto" : "Tambah Foto Baru"}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unggah Foto</label>
                <div className="flex items-center gap-4">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer w-24 h-24 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={40} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer text-center hover:bg-gray-300 transition-colors">
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin mr-2" /> Mengunggah...
                        </div>
                      ) : "Pilih Foto"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul Foto</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Masukkan judul foto"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isUploading || !judul || !imageUrl}
                className={`w-full text-white py-2 rounded-lg transition-colors ${
                  (isUploading || !judul || !imageUrl) ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Simpan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---

export default function AdminCarouselPhotos() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const imagesRef = ref(db, "carouselImages");
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const imagesArray = Object.entries(val).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setImages(imagesArray);
      } else {
        setImages([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPhoto = () => {
    if (images.length >= 5) {
      alert("Maksimal 5 foto telah tercapai. Hapus satu foto untuk menambah yang baru.");
      return;
    }
    setCurrentPhoto(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditPhoto = (photo) => {
    setCurrentPhoto(photo);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSavePhoto = async ({ id, judul, url }) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await update(ref(db, `carouselImages/${id}`), {
          judul,
          url,
        });
      } else {
        await push(ref(db, "carouselImages"), {
          judul,
          url,
        });
      }
      alert("Foto berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan foto:", error);
      alert("Gagal menyimpan foto: " + error.message);
    }
    setLoading(false);
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm(`Yakin ingin menghapus foto "${photo.judul}"?`)) return;

    setLoading(true);
    try {
      await remove(ref(db, `carouselImages/${photo.id}`));
      alert("Foto berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus foto:", error);
      alert("Gagal menghapus foto: " + error.message);
    }
    setLoading(false);
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-900">
            Kelola Foto
          </h2>
          <button
            onClick={handleAddPhoto}
            disabled={images.length >= 5 || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              images.length >= 5
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Plus size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Kelola foto yang ditampilkan di carousel halaman utama. Maksimal 5 foto. Saat ini: {images.length}/5
        </p>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat foto...</div>
        ) : images.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {images.map((photo) => (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  layout
                  className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <img
                    src={photo.url}
                    alt={photo.judul}
                    className="w-full h-40 object-cover object-center"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {photo.judul}
                    </h3>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditPhoto(photo)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} /> Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-10 text-gray-500 italic">
            Belum ada foto yang ditambahkan.
          </div>
        )}
      </div>
      
      <PhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePhoto}
        photoData={currentPhoto}
        isEdit={isEditMode}
      />
    </div>
  );
}