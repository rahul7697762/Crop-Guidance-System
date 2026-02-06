import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Moon
} from 'lucide-react';
import Footer from './Footer';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number; // in km/h
    visibility: number; // in km
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainfall: number; // in mm
    humidity: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  location: string;
}

// Helper function to map OpenWeatherMap icon codes to our icons



const getWeatherIcon = (id: number, iconCode: string): string => {
  // Check for thunderstorm
  if (id >= 200 && id < 300) return 'thunderstorm';
  // Check for drizzle
  if (id >= 300 && id < 400) return 'rainy';
  // Check for rain
  if (id >= 500 && id < 600) return 'rainy';
  // Check for snow
  if (id >= 600 && id < 700) return 'snow';
  // Check for atmosphere (mist, fog, etc.)
  if (id >= 700 && id < 800) return 'fog';
  // Check for clear sky
  if (id === 800) return iconCode.includes('n') ? 'moon' : 'sunny';
  // Check for clouds
  if (id > 800) return 'cloudy';
  
  return 'sunny';
};

const WeatherIcon: React.FC<{ condition: string; size?: number }> = ({ condition, size = 24 }) => {
  const iconProps = { size, className: "text-current" };
  
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun {...iconProps} className="text-yellow-500" />;
    case 'moon':
      return <Moon {...iconProps} className="text-gray-600" />;
    case 'cloudy':
    case 'overcast':
    case 'clouds':
      return <Cloud {...iconProps} className="text-gray-400" />;
    case 'rainy':
    case 'rain':
    case 'drizzle':
      return <CloudRain {...iconProps} className="text-blue-400" />;
    case 'snow':
      return <CloudSnow {...iconProps} className="text-blue-200" />;
    case 'thunderstorm':
      return <Zap {...iconProps} className="text-yellow-400" />;
    case 'windy':
      return <Wind {...iconProps} className="text-gray-400" />;
    case 'fog':
    case 'mist':
    case 'haze':
      return <Droplets {...iconProps} className="text-gray-300" />;
    default:
      return <Sun {...iconProps} className="text-yellow-500" />;
  }
};

const WeatherForecast: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { farmerProfile } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch weather data from OpenWeatherMap API
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Farmer profile:', farmerProfile);
        
        if (!farmerProfile) {
          console.log('No user profile found');
          setError('Please sign in to see weather for your location');
          setLoading(false);
          return;
        }
        
        // Check if coordinates exist in profile
        if (!farmerProfile.farmLocation?.coordinates) {
          console.log('No coordinates found in profile');
          setError('No location data found in your profile. Please update your farm location.');
          setLoading(false);
          return;
        }
        
        // Use the coordinates from the user's profile
        const { latitude, longitude } = farmerProfile.farmLocation.coordinates;



        
        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
            isNaN(latitude) || isNaN(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180) {
          console.error('Invalid coordinates:', { latitude, longitude });
          setError('Invalid location data in your profile. Please update your farm location.');
          setLoading(false);
          return;
        }
        
        const lat = latitude;
        const lon = longitude;


        console.log('Using user location from profile:', lat, lon);
        
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('OpenWeatherMap API key is not configured');
        }
        
        // Fetch current weather and forecast
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        console.log('Fetching weather from:', currentUrl);
        console.log('Fetching forecast from:', forecastUrl);
        
        const [currentRes, forecastRes] = await Promise.all([
          fetch(currentUrl),
          fetch(forecastUrl)
        ]);

        console.log('Current response status:', currentRes.status, currentRes.statusText);
        console.log('Forecast response status:', forecastRes.status, forecastRes.statusText);

        if (!currentRes.ok) {
          const errorText = await currentRes.text();
          console.error('Current weather API error:', errorText);
          throw new Error(`Failed to fetch current weather: ${currentRes.status} ${currentRes.statusText}`);
        }
        
        if (!forecastRes.ok) {
          const errorText = await forecastRes.text();
          console.error('Forecast API error:', errorText);
          throw new Error(`Failed to fetch forecast: ${forecastRes.status} ${forecastRes.statusText}`);
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        // Process current weather
        const currentWeather = {
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          icon: getWeatherIcon(currentData.weather[0].id, currentData.weather[0].icon),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
          visibility: currentData.visibility / 1000, // Convert meters to km
          feelsLike: Math.round(currentData.main.feels_like)
        };

        // Process forecast (group by day)
        const dailyForecast = forecastData.list.reduce((acc: any[], item: any) => {
          const date = new Date(item.dt * 1000);
          const dateString = date.toISOString().split('T')[0];
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          if (!acc.find(d => d.date === dateString)) {
            acc.push({
              date: dateString,
              day: dateString === new Date().toISOString().split('T')[0] ? 'Today' : dayOfWeek,
              high: Math.round(item.main.temp_max),
              low: Math.round(item.main.temp_min),
              condition: item.weather[0].main,
              icon: getWeatherIcon(item.weather[0].id, item.weather[0].icon),
              rainfall: item.rain ? Math.round(item.rain['3h'] || 0) : 0,
              humidity: item.main.humidity
            });
          } else {
            const existing = acc.find(d => d.date === dateString);
            if (existing) {
              existing.high = Math.max(existing.high, Math.round(item.main.temp_max));
              existing.low = Math.min(existing.low, Math.round(item.main.temp_min));
            }
          }
          return acc;
        }, []).slice(0, 7); // Get next 7 days

        // Set weather data
        setWeatherData({
          current: currentWeather,
          forecast: dailyForecast,
          alerts: [], // OpenWeatherMap doesn't provide alerts in free tier
          location: `${currentData.name}, ${currentData.sys.country}`
        });
        
        setLoading(false);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeatherData();
    
    // Update every 10 minutes
    const interval = setInterval(fetchWeatherData, 600000);
    return () => clearInterval(interval);
  }, [farmerProfile]);

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Weather Data Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onBack ? onBack() : navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Weather Forecast</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{weatherData.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Weather Alerts */}
        {weatherData.alerts.length > 0 && (
          <div className="mb-6">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className={`rounded-xl p-4 border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      alert.severity === 'high' ? 'text-red-900' :
                      alert.severity === 'medium' ? 'text-amber-900' :
                      'text-blue-900'
                    }`}>
                      {alert.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'high' ? 'text-red-700' :
                      alert.severity === 'medium' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Weather</h2>
              <p className="text-sky-100 mb-4">{weatherData.current.condition}</p>
              <div className="flex items-center space-x-8">
                <div>
                  <span className="text-5xl font-bold">{weatherData.current.temp}°</span>
                  <span className="text-xl text-sky-100 ml-2">C</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-sm">Feels like {weatherData.current.feelsLike}°C</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">Humidity {weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm">Wind {weatherData.current.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <WeatherIcon condition={weatherData.current.condition} size={80} />
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  index === 0 ? 'bg-sky-50 border border-sky-200' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 text-center">
                      <p className={`font-semibold ${index === 0 ? 'text-sky-700' : 'text-gray-900'}`}>
                        {day.day}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <WeatherIcon condition={day.condition} size={32} />
                      <span className="text-sm text-gray-600 capitalize">{day.condition}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {day.rainfall > 0 && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm font-medium">{day.rainfall}mm</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">{day.humidity}%</span>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <span className="text-lg font-semibold text-gray-900">{day.high}°</span>
                      <span className="text-sm text-gray-500 ml-1">/ {day.low}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Farming Tips Based on Weather */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Weather-Based Farming Tips</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <Sun className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Sunny Days Ahead</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Perfect for harvesting and field preparation. Ensure adequate irrigation for crops.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <CloudRain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Rain Expected</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Good for seed germination. Avoid heavy machinery use and ensure proper drainage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeatherForecast;