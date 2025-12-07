// src/routes/ProtectedRoute.jsx
import { Navigate, useNavigate } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";

export default function ProtectedRoute() {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole"); // Hapus peran pengguna saat logout
    navigate("/", { replace: true });
  };

  return userRole ? (
    // Teruskan prop onLogout ke AdminDashboard
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <Navigate to="/" replace />
  );
}