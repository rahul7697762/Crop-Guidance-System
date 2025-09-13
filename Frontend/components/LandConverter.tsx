import React, { useState, useEffect } from "react";
import { ArrowLeft, Info, RefreshCcw, Calculator } from "lucide-react";
import Footer from "./Footer";

const units = {
    acre: 4046.86, // square meters
    hectare: 10000,
    bigha: 2508.38, // approx (varies by state)
    sqm: 1,
    sqf: 0.092903,
    kattha: 126.441, // Bihar example
};

interface LandConverterProps {
    onBack: () => void;
}

const LandConverter: React.FC<LandConverterProps> = ({ onBack }) => {
    const [value, setValue] = useState<number>(0);
    const [fromUnit, setFromUnit] = useState<string>("acre");
    const [toUnit, setToUnit] = useState<string>("hectare");
    const [result, setResult] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        if (!value) {
            setResult(null);
            return;
        }
        const inSqm = value * units[fromUnit as keyof typeof units];
        const converted = inSqm / units[toUnit as keyof typeof units];
        setResult(converted);
        setLastUpdated(new Date());
    }, [value, fromUnit, toUnit]);

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
                                Land Converter
                            </h1>
                            <p className="text-sm text-gray-600">
                                Convert between different land measurement units
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Status Bar */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-900">
                                Conversion Ready
                            </span>
                            <span className="text-sm text-gray-500">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calculator className="h-4 w-4" />
                            <span>Land Conversion Tool</span>
                        </div>
                    </div>
                </div>

                {/* Converter Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-green-700 mb-4">
                        🌾 Convert Units
                    </h2>

                    {/* Input */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-gray-700">
                            Enter Value
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                                setValue(Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Enter land size"
                        />
                    </div>

                    {/* From / To Units */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                From Unit
                            </label>
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                {Object.keys(units).map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                To Unit
                            </label>
                            <select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                {Object.keys(units).map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => {
                            setValue(0);
                            setResult(null);
                        }}
                        className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition space-x-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Reset</span>
                    </button>

                    {/* Result */}
                    {result !== null && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-semibold">
                                ✅ Result: {result.toFixed(4)}{" "}
                                {toUnit.toUpperCase()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Recommendation Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <Info className="h-6 w-6 text-white" />
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Land Conversion Notes
                                </h3>
                                <p className="text-green-100 text-sm">
                                    Based on regional variations
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-gray-700 text-sm">
                                ⚠️ Note: Some land units (like Bigha, Kattha)
                                vary by region/state. Always cross-check with
                                local standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LandConverter;
