import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import UserDashboard from "../pages/UserDashboard";

import SoilAnalysis from "../components/SoilAnalysis";
import WeatherForecast from "../components/WeatherForecast";
import CropRecommendation from "../components/CropRecommendation";
import MarketInsights from "../components/MarketInsights";
import DiseaseDetection from "../components/DiseaseDetection";
import Footer from "../components/Footer";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Feature Pages */}
        <Route path="/soil-analysis" element={<SoilAnalysis />} />
        <Route path="/weather" element={<WeatherForecast />} />
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/market-insights" element={<MarketInsights />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />

        {/* Default Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>

      {/* Common Footer */}
      <Footer />
    </Router>
  );
};

export default AppRoutes;
