import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { fetchMarketData, MarketData as APIMarketData } from '../services/marketService';
import Footer from './Footer';

interface MarketInsightsProps {
  onBack?: () => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  error?: string;
}

interface FilterState {
  state: string;
  district: string;
  market: string;
  commodity: string;
  limit: number;
  offset: number;
  searchQuery: string;
  useLocation: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  state: '',
  district: '',
  market: '',
  commodity: '',
  limit: 20,
  offset: 0,
  searchQuery: '',
  useLocation: false
};

const MarketInsights: React.FC<MarketInsightsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<APIMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Available filter options
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  
  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setFilters(prev => ({
          ...prev,
          useLocation: true
        }));
        setIsLocating(false);
      },
      (error) => {
        setError(`Unable to retrieve your location: ${error.message}`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare API filters
        const apiFilters: any = {
          ...filters,
          state: filters.state || undefined,
          district: filters.district || undefined,
          market: filters.market || undefined,
          commodity: filters.commodity || undefined,
          searchQuery: filters.searchQuery || undefined,
        };
        
        // Add location filter if enabled
        if (filters.useLocation && userLocation) {
          apiFilters.location = {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radiusKm: 50 // Default 50km radius
          };
        }
        
        const data = await fetchMarketData(apiFilters);
        setMarketData(data);
        
        // Update available filter options
        updateFilterOptions(data);
        
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, userLocation]);
  
  // Update available filter options based on current data
  const updateFilterOptions = (data: APIMarketData[]) => {
    const uniqueStates = Array.from(new Set(data.map(item => item.state))).filter(Boolean).sort();
    const uniqueDistricts = Array.from(new Set(data.map(item => item.district))).filter(Boolean).sort();
    const uniqueMarkets = Array.from(new Set(data.map(item => item.market))).filter(Boolean).sort();
    const uniqueCommodities = Array.from(new Set(data.map(item => item.commodity))).filter(Boolean).sort();
    
    setStates(uniqueStates);
    setDistricts(uniqueDistricts);
    setMarkets(uniqueMarkets);
    setCommodities(uniqueCommodities);
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value,
        // Reset dependent filters when parent changes
        ...(key === 'state' && { district: '', market: '' }),
        ...(key === 'district' && { market: '' })
      };
      
      // Reset offset when filters change
      if (key !== 'offset') {
        newFilters.offset = 0;
      }
      
      return newFilters;
    });
  };
  
  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      offset: 0 // Reset to first page when searching
    }));
  };

  // Toggle location-based filtering
  const toggleLocationFilter = () => {
    if (!filters.useLocation && !userLocation) {
      getUserLocation();
    } else {
      setFilters(prev => ({
        ...prev,
        useLocation: !prev.useLocation
      }));
    }
  };

  // Refresh data
  const refreshData = () => {
    setFilters(prev => ({
      ...prev,
      offset: 0
    }));
  };

  if (loading && marketData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
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
                <h1 className="text-xl font-bold text-gray-900">Market Insights</h1>
                <p className="text-sm text-gray-600">Current prices and market trends</p>
              </div>
            </div>
            
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Location Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by market, commodity, or location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.searchQuery}
                onChange={handleSearchChange}
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={toggleLocationFilter}
              disabled={isLocating}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                filters.useLocation 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {filters.useLocation ? 'Near Me' : 'Use My Location'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700"
              >
                <Filter className="h-4 w-4" />
                <span>Filter Options</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
                  <select
                    value={filters.market}
                    onChange={(e) => handleFilterChange('market', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Markets</option>
                    {markets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                  <select
                    value={filters.commodity}
                    onChange={(e) => handleFilterChange('commodity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Commodities</option>
                    {commodities.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market Data Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {filters.useLocation && userLocation ? 'Markets Near You' : 'Current Market Prices'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {filters.useLocation && userLocation 
                    ? `Within 50km of your location (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})`
                    : 'Live prices from major markets across India'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                {filters.useLocation && !userLocation && (
                  <span className="text-yellow-200 text-sm">
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    Detecting location...
                  </span>
                )}
                <Store className="h-4 w-4" />
                <span className="text-sm">{marketData.length} {marketData.length === 1 ? 'Market' : 'Markets'}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹/q)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{item.state || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.district || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.market || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.commodity || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{item.modal_price?.toLocaleString() || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.arrival_date || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MarketInsights;
