import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { getFarmingTip } from '../services/geminiService';
import { getCurrentWeather } from '../services/weatherService';
import { Dropdown, Typography, Skeleton, Badge } from 'antd';
import Footer from '../components/Footer';
import FloatingChatBot from '../components/FloatingChatBot';
import {
  Sprout,
  Cloud,
  TrendingUp,
  TestTube,
  Globe,
  ChevronDown,
  Leaf,
  Sun,
  User,
  Droplets,
  Wind,
  ArrowRight,
  CheckCircle,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
  const { farmerProfile } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>(currentLanguage?.code || 'en');

  const [farmingTip, setFarmingTip] = useState({
    content: '',
    loading: true,
    error: null as string | null
  });

  const [plantImageUrl, setPlantImageUrl] = useState('/plant-placeholder.png');
  const [hasImageError, setHasImageError] = useState(false);

  const [weatherData, setWeatherData] = useState({
    temp: 0,
    humidity: 0,
    windSpeed: 0,
    condition: '',
    icon: '',
    loading: true,
    error: null as string | null
  });


  // Fetch weather data when component mounts
  useEffect(() => {
    const fetchWeatherAndTip = async () => {
      if (!farmerProfile?.farmLocation) return;

      try {
        if (!farmerProfile.farmLocation.coordinates) {
          throw new Error('Farm location coordinates not available');
        }
        const weatherData = await getCurrentWeather(
          farmerProfile.farmLocation.coordinates!.latitude ?? 0,
          farmerProfile.farmLocation.coordinates!.longitude ?? 0
        );
        setWeatherData({
          temp: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          condition: weatherData.weather[0]?.main || 'Clear',
          icon: `https://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}@2x.png`,
          loading: false,
          error: null
        });

        const month = new Date().getMonth();
        const season = month >= 2 && month <= 4 ? 'spring' :
          month >= 5 && month <= 7 ? 'summer' :
            month >= 8 && month <= 10 ? 'autumn' : 'winter';

        const locationName = farmerProfile.farmLocation.district || 'your region';
        const tip = await getFarmingTip(locationName, season);
        setFarmingTip({
          content: tip,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error:', error);
        setWeatherData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load weather data'
        }));

        setFarmingTip(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load farming tip'
        }));
      }
    };

    fetchWeatherAndTip();
  }, [farmerProfile?.farmLocation]);

  // Removed unused farmingTips

  const quickActions = [
    {
      title: 'Soil Analysis',
      description: 'Test your soil health and get recommendations',
      icon: TestTube,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      path: '/soil-analysis'
    },
    {
      title: 'Weather',
      description: 'Get local weather forecasts and alerts',
      icon: Cloud,
      color: 'from-blue-500 to-sky-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      path: '/weather'
    },
    {
      title: 'Recommendations',
      description: 'Personalized crop suggestions for your farm',
      icon: Sprout,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      path: '/recommendations'
    },
    {
      title: 'Market Insights',
      description: 'Current prices and market trends',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
      path: '/market-insights'
    },
    {
      title: 'Plant Health',
      description: 'Identify plant diseases from images',
      icon: Activity,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-500/10',
      iconColor: 'text-rose-600',
      path: '/disease-detection'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-emerald-200/50 shadow-lg animate-float">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-0.5">CropWise</h1>
              <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Smart Agriculture</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <Dropdown
              menu={{
                items: languages.map(lang => ({
                  key: lang.code,
                  label: lang.nativeName,
                  onClick: () => {
                    setLanguage(lang);
                    setCurrentLanguageCode(lang.code);
                    i18n.changeLanguage(lang.code);
                  }
                }))
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm hover:bg-white px-3 py-2 rounded-xl border border-slate-200 transition-all duration-200 hover:shadow-sm">
                <Globe className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {languages.find(lang => lang.code === currentLanguageCode)?.nativeName}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </Dropdown>

            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className="group flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200 active:scale-95"
            >
              <div className="bg-emerald-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">{farmerProfile?.displayName?.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Modern Hero Section */}
        <section className="relative mb-20">
          <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse-soft">
              <Activity className="h-3.5 w-3.5" />
              <span>Personalized Farm Intelligence</span>
            </div>
            <Typography.Title
              level={1}
              className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] !mb-0"
            >
              Welcome back, <br />
              <span className="gradient-text">{farmerProfile?.displayName}!</span>
            </Typography.Title>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Empowering your agricultural journey with real-time data, expert AI insights,
              and precise recommendations for your <span className="text-emerald-600 font-bold italic underline decoration-emerald-200 decoration-4 underline-offset-4">Success.</span>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-emerald-200/20 blur-[100px] rounded-full -z-10"></div>
        </section>

        {/* Dynamic Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8">

          {/* Main Actions - Large Cards */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="group relative h-64 cursor-pointer overflow-hidden rounded-[2rem] bg-white border border-slate-200 transition-all duration-500 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-1"
                onClick={() => navigate(action.path)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/50"></div>
                <div className="relative h-full p-8 flex flex-col justify-between">
                  <div>
                    <div className={`${action.bgColor} ${action.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                      {action.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[200px]">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-900 font-black text-sm group-hover:translate-x-1 transition-transform">
                    <span>Explore Tools</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                {/* Accent line */}
                <div className={`absolute bottom-0 left-0 h-1.5 w-0 bg-gradient-to-r ${action.color} transition-all duration-500 group-hover:w-full`}></div>
              </div>
            ))}
          </div>

          {/* Side Panels */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Weather Widget Premium */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-200 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sun className="h-32 w-32 -mr-12 -mt-12 text-amber-500 animate-spin-slow" />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Weather Hub</h2>
                  <Badge status="processing" text="Live" className="font-bold text-[10px] uppercase text-emerald-600" />
                </div>

                {weatherData.loading ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
                ) : weatherData.error ? (
                  <div className="text-center py-4 text-rose-500 font-bold text-sm bg-rose-50 rounded-2xl italic">
                    {weatherData.error}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center">
                        <img src={weatherData.icon} alt={weatherData.condition} className="h-20 w-20 -ml-4" />
                        <div>
                          <p className="text-5xl font-black text-slate-900 leading-none">{weatherData.temp}°</p>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{weatherData.condition}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-hover hover:border-blue-100">
                        <Droplets className="h-4 w-4 text-blue-500 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase">Humidity</p>
                        <p className="text-lg font-black text-slate-900">{weatherData.humidity}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-hover hover:border-emerald-100">
                        <Wind className="h-4 w-4 text-emerald-500 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase">Wind</p>
                        <p className="text-lg font-black text-slate-900">{Math.round(weatherData.windSpeed * 3.6)}<span className="text-xs font-bold ml-0.5">km/h</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Farming Tip Widget */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -mr-16 -mt-16"></div>

              <div className="relative">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Sprout className="h-4 w-4 text-slate-900" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight tracking-tight">AI Insights</h2>
                </div>

                {farmingTip.loading ? (
                  <Skeleton active paragraph={{ rows: 3 }} />
                ) : (
                  <div className="space-y-6">
                    <p className="text-slate-300 font-medium leading-relaxed italic">
                      " {farmingTip.content} "
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex items-center -space-x-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">AI</div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        Optimized for {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plant Health Check Feature Breakdown */}
        <section className="mt-20 glass-card rounded-[3rem] p-1 pr-1 border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-12 space-y-8">
              <div className="space-y-2">
                <span className="text-rose-600 font-black uppercase tracking-widest text-xs">Diagnostic Suite</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Instant Crop <br />Health Analysis</h2>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Protect your harvest from unexpected threats. Our advanced computer vision algorithms analyze leaf patterns to detect diseases before they spread.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: CheckCircle, text: '98% Detection Accuracy', color: 'text-emerald-600' },
                  { icon: CheckCircle, text: 'Instant Treatment Protocols', color: 'text-emerald-600' },
                  { icon: CheckCircle, text: 'Growth Pattern Archetypes', color: 'text-emerald-600' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-100 transition-hover hover:border-emerald-100 shadow-sm shadow-slate-100">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="text-slate-700 font-bold tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/disease-detection')}
                className="group premium-button w-full bg-slate-900 text-white py-5 rounded-2xl text-lg font-black tracking-tight"
              >
                Scan Now
                <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative bg-slate-100 m-4 rounded-[2.5rem] overflow-hidden flex items-center justify-center p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-emerald-500/10"></div>
              <div className="relative z-10 text-center animate-float luxury-shadow">
                <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-slate-200">
                  <img
                    className="h-64 w-64 object-cover rounded-2xl"
                    src={plantImageUrl}
                    alt="Plant disease detection"
                    onError={() => {
                      if (!hasImageError) {
                        setHasImageError(true);
                        setPlantImageUrl('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA1OTY2OSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Ik0xMSAyLjgzMmEgMSAxIDAgMDEgMSAwIDkuOTk2IDkuOTk2IDAgMDEgMy4yOTIgNy43MiA0IDQgMCAwMS0xLjcwOCA2LjYxNmEgMSAxIDAgMDEtMS4xNjggMCA0IDQgMCAwMS0xLjcwOC02LjYxNiA5Ljk5NiA5Ljk5NiAwMDEzLjI5Mi03LjcyIDYgNiAwIDAwLTYuNTg0IDB6Ii8+Cjwvc3ZnPg==');
                      }
                    }}
                  />
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Analysis Status</span>
                      <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Farming Alert */}
        <div className="mt-12 bg-rose-50/50 rounded-3xl p-8 border border-rose-100 group transition-hover hover:bg-rose-50">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-rose-100 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-black text-rose-900 tracking-tight">Weather Alert</h3>
                <Badge count="High Priority" style={{ backgroundColor: '#fff1f2', color: '#e11d48', fontWeight: 900, fontSize: '8px', border: '1px solid #fecaca' }} />
              </div>
              <p className="text-sm text-rose-700/80 font-medium leading-relaxed max-w-xl">Heavy rainfall expected in your area tomorrow. Consider covering sensitive crops and adjusting irrigation schedules to prevent soil erosion.</p>
              <button className="mt-4 text-rose-600 hover:text-rose-800 text-xs font-black uppercase tracking-widest flex items-center group/btn">
                Action Required <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingChatBot />
    </div>
  );
};

export default HomePage;
