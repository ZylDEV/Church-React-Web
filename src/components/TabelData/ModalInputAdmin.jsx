import React, { useState, useRef, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import Modal from "../common/Modal";

export default function ModalInputAdmin({ onClose, itemToEdit }) {
  const [adminPassword, setAdminPassword] = useState("");
  const [keuanganPassword, setKeuanganPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const modalRef = useRef(null);
  const modalTitleId = "modal-passwords-title";

  const isEditing = !!itemToEdit;

  useEffect(() => {
    modalRef.current?.focus();

    if (itemToEdit) {
      if (itemToEdit.type === "adminAccess") {
        setAdminPassword(itemToEdit.password || "");
        setKeuanganPassword("");
      } else if (itemToEdit.type === "keuanganAccess") {
        setKeuanganPassword(itemToEdit.password || "");
        setAdminPassword("");
      }
    } else {
      // reset semua saat tambah baru
      setAdminPassword("");
      setKeuanganPassword("");
    }
  }, [itemToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminPassword && !keuanganPassword) {
      setErrorMsg("Setidaknya salah satu password harus diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (isEditing) {
        // update password
        const updates = {};
        if (itemToEdit.type === "adminAccess" && adminPassword) {
          updates[`adminAccess/${itemToEdit.id}`] = {
            password: adminPassword,
            createdAt: itemToEdit.createdAt || Date.now(),
          };
        } else if (itemToEdit.type === "keuanganAccess" && keuanganPassword) {
          updates[`keuanganAccess/${itemToEdit.id}`] = {
            password: keuanganPassword,
            createdAt: itemToEdit.createdAt || Date.now(),
          };
        }
        await update(ref(db), updates);
        alert("Password berhasil diperbarui.");
      } else {
        // tambah baru
        if (adminPassword) {
          await push(ref(db, "adminAccess"), {
            password: adminPassword,
            createdAt: Date.now(),
          });
        }
        if (keuanganPassword) {
          await push(ref(db, "keuanganAccess"), {
            password: keuanganPassword,
            createdAt: Date.now(),
          });
        }
        alert("Password berhasil disimpan.");
      }
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan password:", error);
      setErrorMsg("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} ariaLabelledbyId={modalTitleId}>
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <h2
          id={modalTitleId}
          className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-300 text-gray-900"
          tabIndex={0}
          ref={modalRef}
        >
          {isEditing ? "Edit Password" : "Input Password Admin & Keuangan"}
        </h2>

        {/* Input Admin */}
        {(!isEditing || itemToEdit.type === "adminAccess") && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Password Admin
            </label>
            <input
              type="text"
              placeholder="Masukkan password admin"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        )}

        {/* Input Keuangan */}
        {(!isEditing || itemToEdit.type === "keuanganAccess") && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Password Keuangan
            </label>
            <input
              type="text"
              placeholder="Masukkan password akun keuangan"
              value={keuanganPassword}
              onChange={(e) => setKeuanganPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
        )}

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md ${
              loading ? "cursor-default bg-blue-300 hover:bg-blue-300" : ""
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
