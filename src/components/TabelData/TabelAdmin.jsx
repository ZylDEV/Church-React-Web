import React, { useState } from "react";
import { Plus } from "lucide-react";
import ModalInputAdmin from "./ModalInputAdmin";

export default function TabelAdminKeuangan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Tambah password baru
  const handleAddPassword = () => {
    setEditingItem(null); // reset → tambah baru
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-lg mx-auto my-12 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Plus size={36} className="text-indigo-600" />
        <div>
          <h2 className="text-2xl font-extrabold text-indigo-900 tracking-tight">
            Kelola Password
          </h2>
          <p className="text-md text-gray-600 mt-1">
            Tambah password akses Admin & Keuangan.
          </p>
        </div>
      </div>

      {/* Tombol tambah password */}
      <div className="flex justify-center">
        <button
          onClick={handleAddPassword}
          className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="button"
        >
          <Plus className="w-5 h-5" />
          Tambah Password
        </button>
      </div>

      {/* Modal untuk tambah/edit password */}
      {isModalOpen && (
        <ModalInputAdmin onClose={closeModal} itemToEdit={editingItem} />
      )}
    </div>
  );
}
