import React, { useState } from "react";
import { AuthProvider, useAuth } from "../backend/contexts/AuthContext";
import {
    LanguageProvider,
    useLanguage,
    languages,
} from "../backend/contexts/LanguageContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import LandConverter from "./components/LandConverter";
import SoilAnalysis from "./components/SoilAnalysis";
import WeatherForecast from "./components/WeatherForecast";
import CropRecommendation from "./components/CropRecommendation";
import MarketInsights from "./components/MarketInsights";
import ChatBot from "./components/ChatBot";
import Footer from "./components/Footer";

import {
    Search,
    Sprout,
    Cloud,
    TrendingUp,
    TestTube,
    Globe,
    ChevronDown,
    Leaf,
    MessageCircle,
    Camera,
    Shield,
    Sun,
    User,
    Bell,
    BookOpen,
    Clock,
    AlertTriangle,
    Droplets,
    Wind,
    ArrowRight,
    CheckCircle,
    Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function AppContent() {
    const { currentUser, farmerProfile, loading } = useAuth();
    const { currentLanguage, setLanguage } = useLanguage();
    const [currentPage, setCurrentPage] = useState<
        | "home"
        | "soil-analysis"
        | "weather"
        | "recommendations"
        | "market-insights"
        | "profile"
        | "land-converter"
    >("home");
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data for extended home page
    const recentActivities = [
        {
            id: 1,
            type: "soil_test",
            message: "Soil analysis completed for Field A",
            time: "2 hours ago",
            icon: TestTube,
            color: "text-amber-600",
        },
        {
            id: 2,
            type: "weather_alert",
            message: "Rain forecast for tomorrow",
            time: "4 hours ago",
            icon: Cloud,
            color: "text-blue-600",
        },
        {
            id: 3,
            type: "crop_recommendation",
            message: "New crop suggestions available",
            time: "1 day ago",
            icon: Sprout,
            color: "text-green-600",
        },
        {
            id: 4,
            type: "market_update",
            message: "Wheat prices increased by 5%",
            time: "2 days ago",
            icon: TrendingUp,
            color: "text-purple-600",
        },
    ];

    const weatherData = {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: "Partly Cloudy",
        forecast: [
            { day: "Today", high: 30, low: 22, condition: "Sunny" },
            { day: "Tomorrow", high: 28, low: 20, condition: "Rainy" },
            { day: "Day After", high: 32, low: 24, condition: "Cloudy" },
        ],
    };

    const farmingTips = [
        {
            id: 1,
            title: "Optimal Irrigation Timing",
            content:
                "Water your crops early morning or late evening to reduce evaporation losses.",
            category: "Irrigation",
        },
        {
            id: 2,
            title: "Soil pH Management",
            content:
                "Test soil pH regularly and maintain it between 6.0-7.0 for most crops.",
            category: "Soil Health",
        },
        {
            id: 3,
            title: "Crop Rotation Benefits",
            content:
                "Rotate crops annually to prevent soil depletion and reduce pest problems.",
            category: "Crop Management",
        },
    ];

    const quickStats = [
        {
            label: "Active Alerts",
            value: "3",
            icon: Bell,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            label: "Tasks Today",
            value: "5",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Crops Monitored",
            value: farmerProfile?.farmDetails?.currentCrops?.length || 0,
            icon: Sprout,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Days Active",
            value: Math.floor(
                (new Date().getTime() -
                    new Date(
                        farmerProfile?.createdAt || new Date()
                    ).getTime()) /
                    (1000 * 60 * 60 * 24)
            ),
            icon: Activity,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Land Converter",
            description: "Convert acres, hectares, bigha, and more",
            icon: Globe,
            color: "from-white-500 to-lime-500",
            bgColor: "bg-lime-50",
            iconColor: "text-lime-600",
        },
    ];

    const quickActions = [
        {
            title: "Soil Analysis",
            description: "Test your soil health and get recommendations",
            icon: TestTube,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            title: "Weather",
            description: "Get local weather forecasts and alerts",
            icon: Cloud,
            color: "from-blue-500 to-sky-500",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Recommendations",
            description: "Personalized crop suggestions for your farm",
            icon: Sprout,
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Market Insights",
            description: "Current prices and market trends",
            icon: TrendingUp,
            color: "from-purple-500 to-violet-500",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

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

    // Show auth forms if user is not logged in
    if (!currentUser || !farmerProfile) {
        if (authMode === "signup") {
            return <Signup onSwitchToLogin={() => setAuthMode("login")} />;
        }
        return <Login onSwitchToSignup={() => setAuthMode("signup")} />;
    }

    // Show specific pages
    if (currentPage === "soil-analysis") {
        return <SoilAnalysis onBack={() => setCurrentPage("home")} />;
    }

    if (currentPage === "weather") {
        return <WeatherForecast onBack={() => setCurrentPage("home")} />;
    }

    if (currentPage === "recommendations") {
        return <CropRecommendation onBack={() => setCurrentPage("home")} />;
    }

    if (currentPage === "market-insights") {
        return <MarketInsights onBack={() => setCurrentPage("home")} />;
    }

    if (currentPage === "profile") {
        return (
            <div>
                <div className="bg-white shadow-sm border-b border-green-100">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setCurrentPage("home")}
                            className="flex items-center space-x-2 text-green-600 hover:text-green-700 mb-2"
                        >
                            <span>← Back to Home</span>
                        </button>
                    </div>
                </div>
                <UserDashboard />
                <Footer />
            </div>
        );
    }
    if (currentPage === "land-converter") {
        return <LandConverter onBack={() => setCurrentPage("home")} />;
    }

    // Main home page
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-green-100">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-600 p-2 rounded-xl">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    CropWise
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Smart Farming Solutions
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Language Selector */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setIsLanguageDropdownOpen(
                                            !isLanguageDropdownOpen
                                        )
                                    }
                                    className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg border border-green-200 transition-colors"
                                >
                                    <Globe className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {currentLanguage.nativeName}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </button>

                                {isLanguageDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang);
                                                    setIsLanguageDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${
                                                    currentLanguage.code ===
                                                    lang.code
                                                        ? "bg-green-50 text-green-700"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {lang.nativeName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Land Converter tool */}
                            <button
                                onClick={() => setCurrentPage("land-converter")}
                                className="px-4 py-2 text-sm font-medium hover:text-green-600 bg-white rounded-lg border border-green-200 z-50"
                            >
                                Land Converter
                            </button>
                            {/* User Profile Button */}
                            <button
                                onClick={() => setCurrentPage("profile")}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {farmerProfile.displayName}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Sun className="h-8 w-8 text-yellow-500 mr-3" />
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back, {farmerProfile.displayName}!
                        </h2>
                        <Sprout className="h-8 w-8 text-green-500 ml-3" />
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Get personalized crop recommendations, soil insights,
                        and market data to make informed farming decisions
                    </p>
                    {farmerProfile.farmLocation.address && (
                        <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                            <span>
                                📍 {farmerProfile.farmLocation.district},{" "}
                                {farmerProfile.farmLocation.state}
                            </span>
                        </div>
                    )}
                </div>

                {/* Farm Stats */}
                {farmerProfile.farmDetails.totalArea > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Your Farm Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {farmerProfile.farmDetails.totalArea}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Acres
                                </div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {
                                        farmerProfile.farmDetails.currentCrops
                                            .length
                                    }
                                </div>
                                <div className="text-sm text-gray-600">
                                    Crop Varieties
                                </div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {farmerProfile.farmDetails.soilType ||
                                        "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Soil Type
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for crops, diseases, or farming tips..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-green-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all text-gray-900 text-lg"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
                            onClick={() => {
                                if (action.title === "Soil Analysis") {
                                    setCurrentPage("soil-analysis");
                                } else if (action.title === "Weather") {
                                    setCurrentPage("weather");
                                } else if (action.title === "Recommendations") {
                                    setCurrentPage("recommendations");
                                } else if (action.title === "Market Insights") {
                                    setCurrentPage("market-insights");
                                }
                            }}
                        >
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100">
                                <div className="flex items-start space-x-4">
                                    <div
                                        className={`${action.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}
                                    >
                                        <action.icon
                                            className={`h-8 w-8 ${action.iconColor}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {action.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {action.description}
                                        </p>
                                        <div
                                            className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-lg text-sm font-medium group-hover:shadow-lg transition-shadow`}
                                        >
                                            Get Started
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {quickStats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={`${stat.bgColor} p-2 rounded-lg`}
                                >
                                    <stat.icon
                                        className={`h-5 w-5 ${stat.color}`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Weather Widget */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Cloud className="h-5 w-5 text-blue-600 mr-2" />
                            Current Weather
                        </h3>
                        <button
                            onClick={() => setCurrentPage("weather")}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                        >
                            View Details <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl font-bold text-gray-900">
                                {weatherData.temperature}°C
                            </div>
                            <div>
                                <div className="text-lg text-gray-600">
                                    {weatherData.condition}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Droplets className="h-4 w-4 mr-1" />
                                        {weatherData.humidity}%
                                    </span>
                                    <span className="flex items-center">
                                        <Wind className="h-4 w-4 mr-1" />
                                        {weatherData.windSpeed} km/h
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {weatherData.forecast.map((day, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {day.day}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">
                                            {day.condition}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {day.high}°/{day.low}°
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Clock className="h-5 w-5 text-green-600 mr-2" />
                            Recent Activities
                        </h3>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            View All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className={`p-2 rounded-lg bg-gray-50`}>
                                    <activity.icon
                                        className={`h-4 w-4 ${activity.color}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Farming Tips */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                            Today's Farming Tips
                        </h3>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {farmingTips.map((tip) => (
                            <div
                                key={tip.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                        {tip.title}
                                    </h4>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        {tip.category}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {tip.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts and Notifications */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-200">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900 mb-1">
                                Weather Alert
                            </h3>
                            <p className="text-sm text-red-700 mb-2">
                                Heavy rainfall expected in your area tomorrow.
                                Consider covering sensitive crops and adjusting
                                irrigation schedules.
                            </p>
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
                                View Details{" "}
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="text-center">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sprout className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Crop Calendar
                            </h4>
                            <p className="text-sm text-gray-600">
                                Track sowing, harvesting, and seasonal
                                activities
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <TestTube className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Expert Advice
                            </h4>
                            <p className="text-sm text-gray-600">
                                Connect with agricultural specialists and
                                experts
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="text-center">
                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Yield Tracking
                            </h4>
                            <p className="text-sm text-gray-600">
                                Monitor and analyze your harvest performance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                    {/* Hero Section */}
                    <header className="container mx-auto px-4 py-16 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <Leaf className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Plant Disease Detection
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Upload leaf images and get instant AI-powered
                            disease identification with treatment
                            recommendations. Protect your plants with our
                            advanced diagnostic system.
                        </p>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Start Chat Diagnosis
                        </button>
                    </header>

                    {/* Features Section */}
                    <section className="container mx-auto px-4 py-16">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                            How It Works
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Camera className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Upload Image
                                </h3>
                                <p className="text-gray-600">
                                    Take or upload a clear photo of the affected
                                    leaf showing disease symptoms
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    AI Analysis
                                </h3>
                                <p className="text-gray-600">
                                    Our advanced AI analyzes the image to
                                    identify potential diseases and problems
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Leaf className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Get Treatment
                                </h3>
                                <p className="text-gray-600">
                                    Receive detailed treatment recommendations
                                    and prevention tips for plant health
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="container mx-auto px-4 py-16 text-center">
                        <div className="max-w-2xl mx-auto bg-green-600 text-white rounded-lg shadow-lg p-8">
                            <h3 className="text-2xl font-bold mb-4">
                                Ready to Diagnose Your Plants?
                            </h3>
                            <p className="mb-6 opacity-90">
                                Start chatting with our AI assistant in the
                                bottom right corner. Upload your leaf images and
                                get instant expert advice!
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm opacity-75">
                                <MessageCircle className="w-4 h-4" />
                                <span>Look for the chat button →</span>
                            </div>
                        </div>
                    </section>

                    {/* Chatbot Component */}
                    <ChatBot />
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
