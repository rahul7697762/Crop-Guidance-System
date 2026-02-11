import React, { useState } from "react";

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
    <div className="p-6 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6">🌱 Crop Prediction</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Nitrogen */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Nitrogen (N)</label>
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
          <label className="font-medium mb-1">Phosphorus (P)</label>
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
          <label className="font-medium mb-1">Potassium (K)</label>
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
          <label className="font-medium mb-1">Temperature (°C)</label>
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
          <label className="font-medium mb-1">Humidity (%)</label>
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
          <label className="font-medium mb-1">Soil pH</label>
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

        {/* Rainfall spans 2 columns on large screens */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-2">
          <label className="font-medium mb-1">Rainfall (mm)</label>
          <input
            type="number"
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        {/* Predict button */}
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 self-end"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {prediction && (
        <div className="mt-6 p-4 bg-green-100 border rounded w-full max-w-md">
          <h2 className="text-lg font-semibold">✅ Recommended Crop:</h2>
          <p className="text-xl font-bold">{prediction}</p>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default CropPrediction;
