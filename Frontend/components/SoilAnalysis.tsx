import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Droplets, 
  TestTube, 
  Leaf, 
  Wifi, 
  Satellite,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Thermometer
} from 'lucide-react';
import Footer from './Footer';

interface SoilData {
  ph: number;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
}

interface GaugeProps {
  value: number;
  max: number;
  min: number;
  label: string;
  unit: string;
  icon: React.ComponentType<any>;
  color: string;
  optimal: [number, number];
}

const Gauge: React.FC<GaugeProps> = ({ value, max, min, label, unit, icon: Icon, color, optimal }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const isOptimal = value >= optimal[0] && value <= optimal[1];
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">{unit}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isOptimal ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</span>
          <span className="text-sm text-gray-500">{min} - {max}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              isOptimal ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low</span>
          <span>Optimal: {optimal[0]} - {optimal[1]}</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

const SoilAnalysis: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [soilData, setSoilData] = useState<SoilData>({
    ph: 6.8,
    moisture: 45,
    nitrogen: 78,
    phosphorus: 65,
    potassium: 82,
    temperature: 24.5
  });
  
  const [dataSource, setDataSource] = useState<'iot' | 'satellite'>('iot');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSoilData(prev => ({
        ph: Math.max(5.0, Math.min(8.5, prev.ph + (Math.random() - 0.5) * 0.2)),
        moisture: Math.max(0, Math.min(100, prev.moisture + (Math.random() - 0.5) * 5)),
        nitrogen: Math.max(0, Math.min(100, prev.nitrogen + (Math.random() - 0.5) * 3)),
        phosphorus: Math.max(0, Math.min(100, prev.phosphorus + (Math.random() - 0.5) * 3)),
        potassium: Math.max(0, Math.min(100, prev.potassium + (Math.random() - 0.5) * 3)),
        temperature: Math.max(15, Math.min(35, prev.temperature + (Math.random() - 0.5) * 1))
      }));
      setLastUpdated(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const gaugeConfigs = [
    {
      key: 'ph',
      value: soilData.ph,
      max: 8.5,
      min: 5.0,
      label: 'pH Level',
      unit: 'pH',
      icon: TestTube,
      color: 'bg-blue-500',
      optimal: [6.0, 7.5] as [number, number]
    },
    {
      key: 'moisture',
      value: soilData.moisture,
      max: 100,
      min: 0,
      label: 'Moisture',
      unit: '%',
      icon: Droplets,
      color: 'bg-cyan-500',
      optimal: [40, 70] as [number, number]
    },
    {
      key: 'temperature',
      value: soilData.temperature,
      max: 35,
      min: 15,
      label: 'Temperature',
      unit: '°C',
      icon: Thermometer,
      color: 'bg-orange-500',
      optimal: [20, 28] as [number, number]
    },
    {
      key: 'nitrogen',
      value: soilData.nitrogen,
      max: 100,
      min: 0,
      label: 'Nitrogen (N)',
      unit: 'ppm',
      icon: Leaf,
      color: 'bg-green-500',
      optimal: [60, 90] as [number, number]
    },
    {
      key: 'phosphorus',
      value: soilData.phosphorus,
      max: 100,
      min: 0,
      label: 'Phosphorus (P)',
      unit: 'ppm',
      icon: TrendingUp,
      color: 'bg-purple-500',
      optimal: [50, 80] as [number, number]
    },
    {
      key: 'potassium',
      value: soilData.potassium,
      max: 100,
      min: 0,
      label: 'Potassium (K)',
      unit: 'ppm',
      icon: TestTube,
      color: 'bg-amber-500',
      optimal: [70, 95] as [number, number]
    }
  ];

  const getSoilTips = () => {
    const tips = [];
    
    if (soilData.ph < 6.0) {
      tips.push({
        type: 'warning',
        title: 'pH Too Low',
        description: 'Add lime to increase soil pH and improve nutrient availability.',
        icon: AlertTriangle
      });
    } else if (soilData.ph > 7.5) {
      tips.push({
        type: 'warning',
        title: 'pH Too High',
        description: 'Add sulfur or organic matter to lower soil pH.',
        icon: AlertTriangle
      });
    }
    
    if (soilData.moisture < 40) {
      tips.push({
        type: 'warning',
        title: 'Low Moisture',
        description: 'Increase irrigation frequency or add mulch to retain moisture.',
        icon: Droplets
      });
    }
    
    if (soilData.nitrogen < 60) {
      tips.push({
        type: 'info',
        title: 'Nitrogen Deficiency',
        description: 'Apply nitrogen-rich fertilizer or compost to boost plant growth.',
        icon: Leaf
      });
    }
    
    if (tips.length === 0) {
      tips.push({
        type: 'success',
        title: 'Soil Health Excellent',
        description: 'Your soil conditions are optimal for most crops. Continue current practices.',
        icon: CheckCircle
      });
    }
    
    return tips;
  };

  const tips = getSoilTips();

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
                <h1 className="text-xl font-bold text-gray-900">Soil Analysis</h1>
                <p className="text-sm text-gray-600">Real-time soil monitoring</p>
              </div>
            </div>
            
            {/* Data Source Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDataSource('iot')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  dataSource === 'iot' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wifi className="h-4 w-4" />
                <span>IoT Sensor</span>
              </button>
              <button
                onClick={() => setDataSource('satellite')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  dataSource === 'satellite' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Satellite className="h-4 w-4" />
                <span>Satellite</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Live Data</span>
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {dataSource === 'iot' ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Field Sensor #1</span>
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4" />
                  <span>Satellite Data</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Soil Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gaugeConfigs.map((config) => (
            <Gauge key={config.key} {...config} />
          ))}
        </div>

        {/* Tips and Recommendations */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Info className="h-6 w-6 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">Soil Health Recommendations</h3>
                <p className="text-green-100 text-sm">Based on current soil analysis</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className={`p-2 rounded-lg ${
                    tip.type === 'success' ? 'bg-green-100' :
                    tip.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <tip.icon className={`h-5 w-5 ${
                      tip.type === 'success' ? 'text-green-600' :
                      tip.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SoilAnalysis;