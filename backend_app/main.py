from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from pydantic import BaseModel
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = "model.pkl"
if not os.path.exists(MODEL_PATH):
    # Try finding it in the same directory as this file
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

class CropPredictionRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.get("/")
def home():
    return {"message": "Crop Recommendation API is running"}

@app.post("/predict")
def predict_crop(data: CropPredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare data for prediction
        # The feature order must match training data: N, P, K, temperature, humidity, ph, rainfall
        features = [[
            data.nitrogen,
            data.phosphorus,
            data.potassium,
            data.temperature,
            data.humidity,
            data.ph,
            data.rainfall
        ]]
        
        prediction = model.predict(features)
        predicted_crop = prediction[0]
        
        return {
            "prediction": predicted_crop,
            "confidence": 0.95, # Mock confidence for now as RandomForest predict doesn't give prob easily unless predict_proba is used
            "recommendations": [
                {
                    "name": predicted_crop.capitalize(),
                    "confidence": 0.95,
                    "season": "Season info placeholder", 
                    "requirements": "Requirements info placeholder"
                }
            ]
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
