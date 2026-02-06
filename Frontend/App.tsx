import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard';
import SoilAnalysis from './components/SoilAnalysis';
import WeatherForecast from './components/WeatherForecast';
import CropRecommendation from './components/CropRecommendation';
import MarketInsights from './components/MarketInsights';
import DiseaseDetection from './components/DiseaseDetection';

function AppContent() {
  const { currentUser, farmerProfile, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug logs for auth state
  console.log('Auth state:', {
    hasCurrentUser: !!currentUser,
    hasFarmerProfile: !!farmerProfile,
    loading
  });


  // Show auth pages if not authenticated
  if (!currentUser || !farmerProfile) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Main app routes for authenticated users
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<UserDashboard />} />
      <Route path="/soil-analysis" element={<SoilAnalysis />} />
      <Route path="/weather" element={<WeatherForecast />} />
      <Route path="/recommendations" element={<CropRecommendation />} />
      <Route path="/market-insights" element={<MarketInsights />} />
      <Route path="/disease-detection" element={<DiseaseDetection />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;