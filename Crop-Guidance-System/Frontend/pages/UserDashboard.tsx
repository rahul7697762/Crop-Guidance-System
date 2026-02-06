import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { 
  User,
  Settings,
  LogOut,
  Edit3,
  MapPin,
  Phone,
  Calendar,
  BarChart3,
  Leaf,
  TrendingUp,
  Save,
  X
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { farmerProfile, updateFarmerProfile, logout } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(farmerProfile);


  useEffect(() => {
    setEditData(farmerProfile);
  }, [farmerProfile]);

  const handleSaveProfile = async () => {
    if (!editData) return;
    
    try {
      setLoading(true);
      await updateFarmerProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!farmerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-3 rounded-full">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {farmerProfile.displayName}!
                </h1>
                <p className="text-gray-600">Manage your farming profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <User className="h-6 w-6 text-green-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.displayName || ''}
                    onChange={(e) => setEditData(prev => prev ? {...prev, displayName: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{farmerProfile.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{farmerProfile.email}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={editData?.phoneNumber || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, phoneNumber: e.target.value} : null)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">{farmerProfile.phoneNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(farmerProfile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Farm Location</h2>
              <MapPin className="h-6 w-6 text-green-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    value={editData?.farmLocation.address || ''}
                    onChange={(e) => setEditData(prev => prev ? {
                      ...prev,
                      farmLocation: { ...prev.farmLocation, address: e.target.value }
                    } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter farm address"
                  />
                ) : (
                  <p className="text-gray-900">{farmerProfile.farmLocation.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.farmLocation.state || ''}
                      onChange={(e) => setEditData(prev => prev ? {
                        ...prev,
                        farmLocation: { ...prev.farmLocation, state: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{farmerProfile.farmLocation.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.farmLocation.district || ''}
                      onChange={(e) => setEditData(prev => prev ? {
                        ...prev,
                        farmLocation: { ...prev.farmLocation, district: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{farmerProfile.farmLocation.district}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Farm Details</h2>
              <Leaf className="h-6 w-6 text-green-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (acres)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData?.farmDetails.totalArea || ''}
                    onChange={(e) => setEditData(prev => prev ? {
                      ...prev,
                      farmDetails: { ...prev.farmDetails, totalArea: parseFloat(e.target.value) || 0 }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.1"
                  />
                ) : (
                  <p className="text-gray-900">{farmerProfile.farmDetails.totalArea} acres</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                {isEditing ? (
                  <select
                    value={editData?.farmDetails.soilType || ''}
                    onChange={(e) => setEditData(prev => prev ? {
                      ...prev,
                      farmDetails: { ...prev.farmDetails, soilType: e.target.value }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select soil type</option>
                    <option value="Clay">Clay</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Silt">Silt</option>
                    <option value="Peat">Peat</option>
                    <option value="Chalk">Chalk</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{farmerProfile.farmDetails.soilType || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Methods</label>
                <div className="flex flex-wrap gap-2">
                  {farmerProfile.farmDetails.irrigationType.map((method) => (
                    <span
                      key={method}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {method}
                    </span>
                  ))}
                  {farmerProfile.farmDetails.irrigationType.length === 0 && (
                    <span className="text-gray-500 text-sm">None specified</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Crops</label>
                <div className="flex flex-wrap gap-2">
                  {farmerProfile.farmDetails.currentCrops.map((crop) => (
                    <span
                      key={crop}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {crop}
                    </span>
                  ))}
                  {farmerProfile.farmDetails.currentCrops.length === 0 && (
                    <span className="text-gray-500 text-sm">None specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
              <Settings className="h-6 w-6 text-green-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                {isEditing ? (
                  <select
                    value={editData?.preferences.language || 'English'}
                    onChange={(e) => {
                      const selectedLanguage = languages.find(lang => lang.name === e.target.value);
                      if (selectedLanguage) {
                        setLanguage(selectedLanguage);
                      }
                      setEditData(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, language: e.target.value }
                      } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.name}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{currentLanguage.nativeName}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                {isEditing ? (
                  <select
                    value={editData?.preferences.units || 'metric'}
                    onChange={(e) => setEditData(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, units: e.target.value as 'metric' | 'imperial' }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{farmerProfile.preferences.units}</p>
                )}
              </div> */}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isEditing ? editData?.preferences.notifications : farmerProfile.preferences.notifications}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditData(prev => prev ? {
                          ...prev,
                          preferences: { ...prev.preferences, notifications: e.target.checked }
                        } : null)
                      }
                    }}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Receive notifications about weather and market alerts
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(farmerProfile.lastLogin).toLocaleDateString()} at {new Date(farmerProfile.lastLogin).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(farmerProfile);
                }}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{farmerProfile.farmDetails.totalArea}</div>
              <div className="text-sm text-gray-600">Total Acres</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Leaf className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{farmerProfile.farmDetails.currentCrops.length}</div>
              <div className="text-sm text-gray-600">Crop Types</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{Math.floor((new Date().getTime() - new Date(farmerProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}</div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </div>
      </div> */}
      </div>
    </div>
  );
};

export default UserDashboard;