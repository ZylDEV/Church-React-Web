// src/pages/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/homepage/Navbar";
import LoginModal from "../components/homepage/LoginModal";
import IntroSection from "../components/homepage/IntroSection";
import FotoRayonSection from "../components/homepage/FotoRayonSection";
import InfoCardsSection from "../components/homepage/InfoCardsSection";
import SosmedSection from "../components/homepage/SosmedSection";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate("/dashboard");
  };

  return (
    <>
      <Navbar onAdminClick={() => setShowLogin(true)} />

      <main className="pt-20 min-h-screen bg-gradient-to-b from-blue-100 via-white to-gray-100 text-gray-800 px-4 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-16">
          <div id="IntroSection">
            <IntroSection />
          </div>
          <div id="FotoRayonSection">
            <FotoRayonSection />
          </div>
          <div id="InfoCardsSection">
            <InfoCardsSection />
          </div>
          <div id="SosmedSection">
            <SosmedSection />
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}