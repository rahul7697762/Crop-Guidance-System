import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, FarmerProfile } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone,
  MapPin,
  MapPinOff,
  LocateFixed,
  Leaf,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface SignupProps {
  onSwitchToLogin?: () => void;  // Make it optional with ?
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber: string;
  farmLocation: {
    address: string;
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmDetails: {
    totalArea: number;
    soilType: string;
    irrigationType: string[];
    currentCrops: string[];
  };
  preferences: {
    language: string;
    units: 'metric' | 'imperial';
    notifications: boolean;
  };
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin = () => {} }) => {  // Provide default empty function
  const { signup } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [areaUnit, setAreaUnit] = useState('hectares');
  const [convertedArea, setConvertedArea] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
    farmLocation: {
      address: '',
      state: '',
      district: '',
      pincode: ''
    },
    farmDetails: {
      totalArea: 0,
      soilType: '',
      irrigationType: [],
      currentCrops: []
    },
    preferences: {
      language: currentLanguage?.code || 'en',
      units: 'metric',
      notifications: true
    }
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const soilTypes = ['Clay', 'Loamy', 'Sandy', 'Silt', 'Peat', 'Chalk'];
  const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Tube well'];
  const commonCrops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Tomato', 'Potato', 'Onion'];

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (number: string) => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(number);
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.displayName || !formData.phoneNumber) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!validateMobile(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.farmLocation.address || !formData.farmLocation.state || !formData.farmLocation.district || !formData.farmLocation.pincode) {
      setError('Please fill in all location fields');
      return false;
    }
    
    // Validate pincode (6 digits for Indian pincode)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.farmLocation.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    // Step 3 is now mandatory - require at least basic farm details
    if (!formData.farmDetails.totalArea || formData.farmDetails.totalArea <= 0) {
      setError('Please enter your farm area');
      return false;
    }
    
    if (!formData.farmDetails.soilType) {
      setError('Please select your soil type');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      // This shouldn't be called since step 3 is the last step
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      
      // Validate all steps before submitting
      if (!validateStep1() || !validateStep2() || !validateStep3()) {
        return; // Stop if any validation fails
      }
      
      setLoading(true);
      
      const additionalData: Partial<FarmerProfile> = {
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        farmLocation: {
          ...formData.farmLocation,
          address: formData.farmLocation.address.trim(),
          state: formData.farmLocation.state.trim(),
          district: formData.farmLocation.district.trim()
        },
        farmDetails: {
          ...formData.farmDetails,
          soilType: formData.farmDetails.soilType.trim(),
          currentCrops: formData.farmDetails.currentCrops.map(crop => crop.trim())
        },
        preferences: formData.preferences
      };

      await signup(formData.email.trim(), formData.password, additionalData);
      
      // Redirect to home page after successful signup
      navigate('/');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Update coordinates in form data immediately
          updateFormData('farmLocation.coordinates', { latitude, longitude });
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch address');
          }
          
          const data = await response.json();
          const address = data.display_name || '';
          const state = data.address?.state || '';
          const district = data.address?.county || data.address?.city || data.address?.town || '';
          const postcode = data.address?.postcode || '';
          
          // Update form data with address details
          updateFormData('farmLocation.address', address);
          updateFormData('farmLocation.state', state);
          updateFormData('farmLocation.district', district);
          if (postcode) {
            updateFormData('farmLocation.pincode', postcode);
          }
          
        } catch (error) {
          console.error('Error getting address:', error);
          setLocationError('Error getting address details. Coordinates saved successfully.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to retrieve your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const convertArea = (value: string, fromUnit: string) => {
    if (!value || isNaN(parseFloat(value))) {
      setConvertedArea({});
      return;
    }

    let num = parseFloat(value);
    let bigha = 0, katha = 0, dhur = 0, biswa = 0, sqm = 0, hectares = 0;

    // Convert input to bigha first
    switch (fromUnit) {
      case 'bigha':
        bigha = num;
        break;
      case 'katha':
        bigha = num / 5;
        break;
      case 'dhur':
        bigha = num / 100; // 1 bigha = 100 dhur
        break;
      case 'biswa':
        bigha = num / 5; // 1 bigha = 5 biswa
        break;
      case 'sqm':
        bigha = num / 1337.8; // 1 bigha ≈ 1337.8 m²
        break;
      case 'hectares':
        bigha = num * 7.47493; // 1 hectare ≈ 7.47493 bigha (Assam)
        break;
      default:
        break;
    }

    // Convert bigha to all other units
    katha = bigha * 5;
    dhur = bigha * 100;
    biswa = bigha * 5;
    sqm = bigha * 1337.8;
    hectares = bigha / 7.47493;

    setConvertedArea({
      bigha: bigha.toFixed(4),
      katha: katha.toFixed(4),
      dhur: dhur.toFixed(4),
      biswa: biswa.toFixed(4),
      sqm: sqm.toFixed(2),
      hectares: hectares.toFixed(4)
    });

    // Update the form data with the value in hectares
    updateFormData('farmDetails.totalArea', parseFloat(hectares.toFixed(4)));
  };

  const handleAreaChange = (value: string) => {
    convertArea(value, areaUnit);
  };

  const handleArrayToggle = (path: string, value: string) => {
    const keys = path.split('.');
    let current: any = formData;
    for (const key of keys) {
      current = current[key];
    }
    
    const currentArray = current as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFormData(path, newArray);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join CropWise</h2>
          <p className="text-gray-600 mt-2">Step {step} of 3 - Let's set up your account</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  stepNum <= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                } text-sm font-medium`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    stepNum < step ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => updateFormData('displayName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formData.email && !validateEmail(formData.email) 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                    placeholder="Enter your email"
                  />
                </div>
                {formData.email && !validateEmail(formData.email) && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      // Only allow numbers and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateFormData('phoneNumber', value);
                    }}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formData.phoneNumber && !validateMobile(formData.phoneNumber) 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                {formData.phoneNumber && !validateMobile(formData.phoneNumber) && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid 10-digit mobile number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Farm Location */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Address *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.farmLocation.address}
                      onChange={(e) => updateFormData('farmLocation.address', e.target.value)}
                      className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      placeholder="Enter your farm address"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Detect current location with GPS coordinates"
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LocateFixed className="h-4 w-4" />
                      )}
                      <span className="ml-1">GPS</span>
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {locationError}
                    </p>
                  )}
                  {formData.farmLocation.coordinates && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-xs font-medium text-green-800 mb-1">📍 Location Detected</div>
                      <div className="text-xs text-green-700">
                        <div>Latitude: {formData.farmLocation.coordinates.latitude.toFixed(6)}</div>
                        <div>Longitude: {formData.farmLocation.coordinates.longitude.toFixed(6)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.farmLocation.state}
                  onChange={(e) => updateFormData('farmLocation.state', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                >
                  <option value="">Select your state</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.farmLocation.district}
                  onChange={(e) => updateFormData('farmLocation.district', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  placeholder="Enter your district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.farmLocation.pincode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    updateFormData('farmLocation.pincode', value);
                  }}
                  className={`w-full px-3 py-3 border ${
                    formData.farmLocation.pincode && !/^\d{6}$/.test(formData.farmLocation.pincode)
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors`}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
                {formData.farmLocation.pincode && !/^\d{6}$/.test(formData.farmLocation.pincode) && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid 6-digit pincode</p>
                )}
              </div>
            </>
          )}

          {/* Step 3: Farm Details & Preferences */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Farm Details & Preferences</h3>
                <p className="text-sm text-gray-600">Tell us about your farm to get personalized recommendations</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Farm Area *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Enter area value"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => {
                      setAreaUnit(e.target.value);
                      if (Object.keys(convertedArea).length > 0) {
                        handleAreaChange(convertedArea[areaUnit] || '0');
                      }
                    }}
                    className="w-32 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  >
                    <option value="hectares">Hectares</option>
                    <option value="bigha">Bigha</option>
                    <option value="katha">Katha</option>
                    <option value="dhur">Dhur</option>
                    <option value="biswa">Biswa</option>
                    <option value="sqm">m²</option>
                  </select>
                </div>
                {Object.keys(convertedArea).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-medium mb-1">Converted to:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <span>Hectares: {convertedArea.hectares || '0'}</span>
                      <span>Bigha: {convertedArea.bigha || '0'}</span>
                      <span>Katha: {convertedArea.katha || '0'}</span>
                      <span>Dhur: {convertedArea.dhur || '0'}</span>
                      <span>Biswa: {convertedArea.biswa || '0'}</span>
                      <span>m²: {convertedArea.sqm || '0'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Soil Type *
                </label>
                <select
                  value={formData.farmDetails.soilType}
                  onChange={(e) => updateFormData('farmDetails.soilType', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Irrigation Methods
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {irrigationTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.farmDetails.irrigationType.includes(type)}
                        onChange={() => handleArrayToggle('farmDetails.irrigationType', type)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Crops
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {commonCrops.map(crop => (
                    <label key={crop} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.farmDetails.currentCrops.includes(crop)}
                        onChange={() => handleArrayToggle('farmDetails.currentCrops', crop)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">{crop}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={formData.preferences.language}
                  onChange={(e) => {
                    const selectedLanguage = languages.find(lang => lang.name === e.target.value);
                    if (selectedLanguage) {
                      setLanguage(selectedLanguage);
                    }
                    updateFormData('preferences.language', e.target.value);
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={(e) => updateFormData('preferences.notifications', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label className="text-sm text-gray-700">
                  Send me notifications about weather alerts and market prices
                </label>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;