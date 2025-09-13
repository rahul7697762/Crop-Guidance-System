import React, { useState } from "react";
import {
    ArrowLeft,
    Leaf,
    Droplets,
    Thermometer,
    CloudRain,
    TestTube,
    CheckCircle,
    AlertTriangle,
    Info,
} from "lucide-react";
import Footer from "./Footer";

const CropPrediction: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [formData, setFormData] = useState({
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        temperature: "",
        humidity: "",
        ph: "",
        rainfall: "",
    });

    const [prediction, setPrediction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to fetch prediction");

            const data = await response.json();
            setPrediction(data.prediction);
        } catch (err) {
            setError("⚠️ Error connecting to prediction API");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-green-100">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Crop Prediction
                            </h1>
                            <p className="text-sm text-gray-600">
                                Enter soil & weather parameters to get
                                recommendations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Input Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Nitrogen */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <Leaf className="h-4 w-4 text-green-600" />
                                <span>Nitrogen (N)</span>
                            </label>
                            <input
                                type="number"
                                name="nitrogen"
                                value={formData.nitrogen}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Phosphorus */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <TestTube className="h-4 w-4 text-purple-600" />
                                <span>Phosphorus (P)</span>
                            </label>
                            <input
                                type="number"
                                name="phosphorus"
                                value={formData.phosphorus}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Potassium */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <TestTube className="h-4 w-4 text-amber-600" />
                                <span>Potassium (K)</span>
                            </label>
                            <input
                                type="number"
                                name="potassium"
                                value={formData.potassium}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Temperature */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <Thermometer className="h-4 w-4 text-orange-600" />
                                <span>Temperature (°C)</span>
                            </label>
                            <input
                                type="number"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Humidity */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <Droplets className="h-4 w-4 text-cyan-600" />
                                <span>Humidity (%)</span>
                            </label>
                            <input
                                type="number"
                                name="humidity"
                                value={formData.humidity}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Soil pH */}
                        <div className="flex flex-col">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <TestTube className="h-4 w-4 text-blue-600" />
                                <span>Soil pH</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="ph"
                                value={formData.ph}
                                onChange={handleChange}
                                className="p-2 border rounded"
                                required
                            />
                        </div>

                        {/* Rainfall */}
                        <div className="flex flex-col sm:col-span-2 lg:col-span-2">
                            <label className="font-medium mb-1 flex items-center space-x-2">
                                <CloudRain className="h-4 w-4 text-blue-500" />
                                <span>Rainfall (mm)</span>
                            </label>
                            <input
                                type="number"
                                name="rainfall"
                                value={formData.rainfall}
                                onChange={handleChange}
                                className="p-2 border rounded w-full"
                                required
                            />
                        </div>

                        {/* Predict Button */}
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 self-end"
                        >
                            {loading ? "Predicting..." : "Predict"}
                        </button>
                    </form>
                </div>

                {/* Prediction Result */}
                {prediction && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <Info className="h-6 w-6 text-white" />
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Crop Recommendation
                                    </h3>
                                    <p className="text-green-100 text-sm">
                                        Based on soil & climate input
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        Recommended Crop
                                    </h4>
                                    <p className="text-xl font-bold text-green-700">
                                        {prediction}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-4 text-red-600 flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CropPrediction;
