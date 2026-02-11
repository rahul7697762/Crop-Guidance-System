import React, { useState } from "react";
import {
  Sprout,
  Thermometer,
  Droplets,
  CloudRain,
  Activity,
  FlaskConical,
  ScanSearch,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Define InputField outside to prevent re-rendering and focus loss
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  icon: any;
  placeholder: string;
  step?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  icon: Icon,
  placeholder,
  step = "any",
  onChange
}) => (
  <div className="group">
    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-emerald-500/70 group-focus-within:text-emerald-600 transition-colors" />
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="premium-input w-full pl-10 pr-4 py-3 bg-slate-50 border-slate-200 focus:bg-white transition-all duration-300"
        placeholder={placeholder}
        required
      />
    </div>
  </div>
);

const CropPrediction: React.FC = () => {
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/predict`, {
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
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40 shadow-2xl shadow-emerald-900/5">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-12 space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100/50 rounded-2xl mb-4 text-emerald-600">
              <Sprout className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Smart <span className="gradient-text">Crop Advisor</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Leverage advanced AI analysis to determine the optimal crop for your specific soil and climate conditions.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="w-full lg:w-2/3 bg-white/50 rounded-3xl p-6 md:p-8 border border-white/50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Soil Composition</h3>
                  <InputField label="Nitrogen Ratio (N)" name="nitrogen" value={formData.nitrogen} icon={FlaskConical} placeholder="e.g., 90" onChange={handleChange} />
                  <InputField label="Phosphorus Ratio (P)" name="phosphorus" value={formData.phosphorus} icon={FlaskConical} placeholder="e.g., 42" onChange={handleChange} />
                  <InputField label="Potassium Ratio (K)" name="potassium" value={formData.potassium} icon={FlaskConical} placeholder="e.g., 43" onChange={handleChange} />
                  <InputField label="Soil pH Level" name="ph" value={formData.ph} icon={Activity} placeholder="e.g., 6.5" step="0.1" onChange={handleChange} />
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Environmental Data</h3>
                  <InputField label="Temperature (°C)" name="temperature" value={formData.temperature} icon={Thermometer} placeholder="e.g., 20.8" step="0.1" onChange={handleChange} />
                  <InputField label="Humidity (%)" name="humidity" value={formData.humidity} icon={Droplets} placeholder="e.g., 82" step="0.1" onChange={handleChange} />
                  <InputField label="Rainfall (mm)" name="rainfall" value={formData.rainfall} icon={CloudRain} placeholder="e.g., 202.9" step="0.1" onChange={handleChange} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-8 rounded-xl flex items-center shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="w-5 h-5 mr-2" />
                      Analyze & Recommend
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Results Section */}
            <div className="w-full lg:w-1/3">
              {prediction ? (
                <div className="animate-float bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden h-full min-h-[300px] flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm mb-2">Recommendation</p>
                    <h2 className="text-4xl font-black mb-6 capitalize">{prediction}</h2>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm font-medium text-emerald-50 leading-relaxed border border-white/10">
                      Based on the provided soil and environmental data, {prediction} is the optimal crop for cultivation.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400 border-dashed">
                  <Sprout className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">Enter agricultural data to receive AI-powered recommendations</p>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start text-red-600 animate-pulse-soft">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropPrediction;
