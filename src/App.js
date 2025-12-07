// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import InformasiDetail from "./pages/InformasiDetail";

// These are pages, so they belong here in App.js for routing
import RuangInformasi from "./data/konten/RuangInformasi";
import JadwalIbadah from "./data/konten/JadwalIbadah";
import SidangJemaat from "./data/konten/SidangJemaat";
import InformasiKeuangan from "./data/konten/InformasiKeuangan";
import RenunganMingguan from "./data/konten/RenunganMingguan";
import Dokumentasi from "./data/konten/Dokumentasi";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main route for the homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Routes for user content pages */}
        <Route path="/ruang-informasi" element={<RuangInformasi />} />
        <Route path="/jadwal-ibadah" element={<JadwalIbadah />} />
        <Route path="/sidang-jemaat" element={<SidangJemaat />} />
        <Route path="/informasi-keuangan" element={<InformasiKeuangan />} />
        <Route path="/renungan-mingguan" element={<RenunganMingguan />} />
        <Route path="/dokumentasi" element={<Dokumentasi />} />

        {/* Protected admin route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dynamic route for detailed information */}
        <Route path="/informasi/:slug" element={<InformasiDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;