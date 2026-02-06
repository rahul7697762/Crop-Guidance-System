const API_KEY = '579b464db66ec23bdd00000194521d09db5044d07f275333b0e5c02d';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export interface MarketData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_date: string;
  [key: string]: any; // For any additional fields
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  radiusKm?: number; // Radius in kilometers
}

export interface MarketFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  limit?: number;
  offset?: number;
  searchQuery?: string;
  location?: Coordinates;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos((lat1 * Math.PI) / 180) * 
    Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

export const fetchMarketData = async (filters: MarketFilters = {}): Promise<MarketData[]> => {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    format: 'json', // Default to JSON
    limit: String(filters.limit || 10),
    offset: String(filters.offset || 0),
    ...Object.entries(filters)
      .filter(([key]) => !['limit', 'offset'].includes(key))
      .reduce((acc, [key, value]) => {
        if (value) {
          acc[`filters[${key}]`] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    let data = await response.json();
    let records: MarketData[] = data.records || [];
    
    // Filter by search query if provided
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      records = records.filter(item => 
        (item.market?.toLowerCase().includes(query)) ||
        (item.commodity?.toLowerCase().includes(query)) ||
        (item.district?.toLowerCase().includes(query)) ||
        (item.state?.toLowerCase().includes(query))
      );
    }
    
    // Filter by location if provided
    if (filters.location) {
      const { latitude, longitude, radiusKm = 50 } = filters.location;
      records = records.filter(item => {
        if (!item.latitude || !item.longitude) return false;
        const distance = calculateDistance(
          latitude, 
          longitude, 
          parseFloat(item.latitude), 
          parseFloat(item.longitude)
        );
        return distance <= radiusKm;
      });
    }
    
    return records;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

// Helper function to get unique values for filters
export const getFilterOptions = async (field: keyof MarketData): Promise<string[]> => {
  try {
    const data = await fetchMarketData({ limit: 1000 });
    const uniqueValues = new Set<string>();
    
    data.forEach(item => {
      if (item[field]) {
        uniqueValues.add(String(item[field]));
      }
    });

    return Array.from(uniqueValues).sort();
  } catch (error) {
    console.error(`Error getting ${field} options:`, error);
    return [];
  }
};
