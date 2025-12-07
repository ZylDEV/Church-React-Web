import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";

export default function LoginModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleLogin = async () => {
    if (loading) return;
    if (!password.trim()) {
      setError("Password tidak boleh kosong");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Cek adminAccess
      const adminRef = ref(db, "adminAccess");
      let isAdmin = false;
      await new Promise((resolve) => {
        onValue(adminRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
            Object.values(val).forEach((item) => {
              if (item.password === password) isAdmin = true;
            });
          }
          resolve();
        }, { onlyOnce: true });
      });

      if (isAdmin) {
        localStorage.setItem("userRole", "admin");
        setPassword("");
        onClose();
        navigate("/dashboard");
        return;
      }

      // Cek keuanganAccess
      const keuanganRef = ref(db, "keuanganAccess");
      let isBendahara = false;
      await new Promise((resolve) => {
        onValue(keuanganRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
            Object.values(val).forEach((item) => {
              if (item.password === password) isBendahara = true;
            });
          }
          resolve();
        }, { onlyOnce: true });
      });

      if (isBendahara) {
        localStorage.setItem("userRole", "bendahara");
        setPassword("");
        onClose();
        navigate("/dashboard");
        return;
      }

      setError("Password salah!");
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      tabIndex={-1}
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
        <h2 id="login-title" className="text-xl font-bold mb-4 text-center text-gray-800">
          LOGIN
        </h2>
        <input
          ref={inputRef}
          type={showPass ? "text" : "password"}
          className={`w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-400 border-red-400" : "focus:ring-blue-400 border-gray-300"
          }`}
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "password-error" : undefined}
          autoFocus
        />
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer select-none text-sm">
            <input
              type="checkbox"
              checked={showPass}
              onChange={() => setShowPass(!showPass)}
              aria-checked={showPass}
              aria-label="Tampilkan password"
              className="cursor-pointer"
            />
            <span>Tampilkan Password</span>
          </label>
          {loading && <span className="text-blue-600 font-semibold">Loading...</span>}
        </div>
        {error && (
          <p id="password-error" className="mb-4 text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded mb-2 transition font-semibold text-white ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => { setPassword(""); setError(""); onClose(); }}
          disabled={loading}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
