import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../config/firebaseConfig";
import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  FileText,
  DollarSign,
  Camera,
  BookOpen,
} from "lucide-react";

const getIcon = (key) => {
  switch (key) {
    case "dokumentasi":
      return <Camera size={20} />;
    case "informasi":
      return <Sparkles size={20} />;
    case "jadwal":
      return <CalendarDays size={20} />;
    case "keuangan":
      return <DollarSign size={20} />;
    case "sidang":
      return <FileText size={20} />;
    case "renungan":
      return <BookOpen size={20} />;
    default:
      return null;
  }
};

export default function AnalisisData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // List referensi yang akan diambil dari Firebase
    const refs = [
      "dokumentasi",
      "informasi",
      "jadwal",
      "keuangan", // Menggunakan path 'keuangan'
      "sidang",
      "renungan",
    ];

    let tempData = {};
    let loadedCount = 0;

    const unsubscribeFunctions = refs.map((path) => {
      const dbRef = ref(db, path);
      return onValue(
        dbRef,
        (snapshot) => {
          tempData[path] = snapshot.val() || {};
          loadedCount++;
          if (loadedCount === refs.length) {
            try {
              const processed = processData(tempData);
              setSummary(processed);
              setLoading(false);
            } catch (err) {
              setError(err.message);
              setLoading(false);
            }
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function processData(data) {
    const totalDataPerCategory = {
      dokumentasi: Object.keys(data.dokumentasi || {}).length,
      informasi: Object.keys(data.informasi || {}).length,
      jadwal: Object.keys(data.jadwal || {}).length,
      keuangan: Object.keys(data.keuangan || {}).length,
      sidang: Object.keys(data.sidang || {}).length,
      renungan: Object.keys(data.renungan || {}).length,
    };

    const allDatesSet = new Set();
    const activityByDate = {};
    const fotoCountPerDate = {};
    const distribusiJadwal = {};

    function addCount(obj, key, count = 1) {
      if (!obj[key]) obj[key] = 0;
      obj[key] += count;
    }

    // Memproses data dari setiap kategori
    for (const id in data.dokumentasi) {
      const doc = data.dokumentasi[id];
      if (!doc.tanggal) continue;
      allDatesSet.add(doc.tanggal);
      if (!activityByDate[doc.tanggal]) activityByDate[doc.tanggal] = {};
      addCount(activityByDate[doc.tanggal], "dokumentasi");
      const fotoCount = Array.isArray(doc.fotoUrls) ? doc.fotoUrls.length : 0;
      addCount(fotoCountPerDate, doc.tanggal, fotoCount);
    }
    
    for (const id in data.informasi) {
      const info = data.informasi[id];
      if (!info.tanggal) continue;
      allDatesSet.add(info.tanggal);
      if (!activityByDate[info.tanggal]) activityByDate[info.tanggal] = {};
      addCount(activityByDate[info.tanggal], "informasi");
    }

    for (const id in data.jadwal) {
      const jadwal = data.jadwal[id];
      if (!jadwal.tanggal) continue;
      allDatesSet.add(jadwal.tanggal);
      if (!activityByDate[jadwal.tanggal]) activityByDate[jadwal.tanggal] = {};
      addCount(activityByDate[jadwal.tanggal], "jadwal");
      if (jadwal.jadwal) addCount(distribusiJadwal, jadwal.jadwal);
    }

    // Memproses data keuangan
    const keuanganByMonth = {};
    for (const id in data.keuangan) {
        const k = data.keuangan[id];
        if (!k.tanggal) continue;
        allDatesSet.add(k.tanggal);
        if (!activityByDate[k.tanggal]) activityByDate[k.tanggal] = {};
        addCount(activityByDate[k.tanggal], "keuangan");
        
        // Memproses untuk grafik bulanan
        const month = k.tanggal.substring(0, 7); // Format 'YYYY-MM'
        addCount(keuanganByMonth, month);
    }

    for (const id in data.sidang) {
      const s = data.sidang[id];
      if (!s.tanggal) continue;
      allDatesSet.add(s.tanggal);
      if (!activityByDate[s.tanggal]) activityByDate[s.tanggal] = {};
      addCount(activityByDate[s.tanggal], "sidang");
    }

    if (data.renungan) {
      for (const id in data.renungan) {
        const r = data.renungan[id];
        if (!r.tanggal) continue;
        allDatesSet.add(r.tanggal);
        if (!activityByDate[r.tanggal]) activityByDate[r.tanggal] = {};
        addCount(activityByDate[r.tanggal], "renungan");
      }
    }

    // Mengubah data ke format yang bisa dibaca oleh Recharts
    const allDates = Array.from(allDatesSet).sort();
    const activityChartData = allDates.map((tanggal) => {
      const dataPerTanggal = activityByDate[tanggal] || {};
      return {
        tanggal,
        dokumentasi: dataPerTanggal.dokumentasi || 0,
        informasi: dataPerTanggal.informasi || 0,
        jadwal: dataPerTanggal.jadwal || 0,
        keuangan: dataPerTanggal.keuangan || 0,
        sidang: dataPerTanggal.sidang || 0,
        renungan: dataPerTanggal.renungan || 0,
      };
    });

    const fotoChartData = allDates.map((tanggal) => ({
      tanggal,
      foto: fotoCountPerDate[tanggal] || 0,
    }));
    
    const distribusiJadwalArr = Object.entries(distribusiJadwal).map(
      ([name, jumlah]) => ({ name, jumlah })
    );

    const keuanganChartData = Object.entries(keuanganByMonth).map(([bulan, jumlah]) => ({
      bulan,
      jumlah,
    }));

    return {
      totalDataPerCategory,
      activityChartData,
      fotoChartData,
      distribusiJadwalArr,
      keuanganChartData,
    };
  }

  // Tampilan saat loading
  if (loading)
    return (
      <div className="text-center py-10 text-indigo-700 font-semibold animate-pulse">
        Memuat data analisis...
      </div>
    );

  // Tampilan saat error
  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Terjadi kesalahan: {error}
      </div>
    );

  // Tampilan utama setelah data berhasil dimuat
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 bg-gray-50 rounded-2xl shadow-xl my-12">
      <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight mb-2">
        📊 Analisis Data Gereja
      </h2>
      <p className="text-md text-gray-600 mb-8">
        Visualisasi dan ringkasan aktivitas konten dari database.
      </p>

      {/* Ringkasan Total Data */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-indigo-800">
          Ringkasan Konten
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(summary.totalDataPerCategory).map(([key, val]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 shadow-md flex items-center justify-between border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                  {getIcon(key)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {key}
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {val}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}