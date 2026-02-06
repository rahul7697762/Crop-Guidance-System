// API Service for handling external API calls
// This works with your Vite proxy configuration

interface CropRecommendationRequest {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }
  
  interface CropRecommendationResponse {
    prediction: string;
    confidence: number;
    recommendations: Array<{
      name: string;
      confidence: number;
      season: string;
      requirements: string;
    }>;
  }
  
  interface WeatherData {
    current: {
      temp: number;
      humidity: number;
      pressure: number;
      weather: Array<{
        main: string;
        description: string;
        icon: string;
      }>;
    };
    forecast: Array<{
      date: string;
      temp: { min: number; max: number };
      weather: string;
      humidity: number;
      rainfall: number;
    }>;
  }
  
  interface MarketPrice {
    crop: string;
    price: number;
    market: string;
    date: string;
    change: number;
    unit: string;
  }
  
  class ApiService {
    private baseURL = '';
  
    // Crop Recommendation API calls
    async getCropRecommendation(data: CropRecommendationRequest): Promise<CropRecommendationResponse> {
      try {
        const response = await fetch('/api/crop-recommendation/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Crop recommendation API error:', error);
        throw new Error('Failed to get crop recommendations');
      }
    }
  
    // Weather API calls
    async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
      try {
        const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
        
        if (!API_KEY) {
          throw new Error('Weather API key not configured');
        }
  
        // Current weather
        const currentResponse = await fetch(
          `/api/weather/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
  
        // 5-day forecast
        const forecastResponse = await fetch(
          `/api/weather/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
  
        if (!currentResponse.ok || !forecastResponse.ok) {
          throw new Error('Weather API request failed');
        }
  
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
  
        return {
          current: {
            temp: currentData.main.temp,
            humidity: currentData.main.humidity,
            pressure: currentData.main.pressure,
            weather: currentData.weather,
          },
          forecast: forecastData.list.slice(0, 5).map((item: any) => ({
            date: item.dt_txt,
            temp: {
              min: item.main.temp_min,
              max: item.main.temp_max,
            },
            weather: item.weather[0].description,
            humidity: item.main.humidity,
            rainfall: item.rain?.['3h'] || 0,
          })),
        };
      } catch (error) {
        console.error('Weather API error:', error);
        throw new Error('Failed to fetch weather data');
      }
    }
  
    // Market Data API calls
    async getMarketPrices(crop?: string, market?: string): Promise<MarketPrice[]> {
      try {
        const params = new URLSearchParams();
        if (crop) params.append('crop', crop);
        if (market) params.append('market', market);
  
        const response = await fetch(`/api/market/prices?${params.toString()}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Market API error:', error);
        throw new Error('Failed to fetch market prices');
      }
    }
  
    // Soil Analysis API
    async analyzeSoil(soilData: any): Promise<any> {
      try {
        const response = await fetch('/api/soil/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(soilData),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Soil analysis API error:', error);
        throw new Error('Failed to analyze soil data');
      }
    }
  
    // Generic API call method
    async apiCall<T>(
      endpoint: string, 
      options: RequestInit = {}
    ): Promise<T> {
      const defaultOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...options.headers,
        },
      };
  
      const response = await fetch(endpoint, {
        ...defaultOptions,
        ...options,
      });
  
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
  
      return await response.json();
    }
  }
  
  // Export singleton instance
  export const apiService = new ApiService();
  
  // Export types for use in components
  export type {
    CropRecommendationRequest,
    CropRecommendationResponse,
    WeatherData,
    MarketPrice,
  };
  
  // Utility function to handle API errors
  export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };
  
  // Check if running in development mode
  export const isDevelopment = import.meta.env.DEV;
  
  // API endpoints configuration
  export const API_ENDPOINTS = {
    CROP_RECOMMENDATION: '/api/crop-recommendation',
    WEATHER: '/api/weather', 
    MARKET: '/api/market',
    SOIL: '/api/soil',
  } as const;