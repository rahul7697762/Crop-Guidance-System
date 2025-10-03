from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
from pathlib import Path
import logging
from datetime import datetime
import json


# CONFIG (use env vars)

MODEL_DIR = Path(os.getenv("MODEL_DIR", "models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Filename pattern: model-{model_name}-v{version}.pkl
RF_MODEL_TEMPLATE = MODEL_DIR / "rf_model-v{version}.pkl"
XGB_MODEL_TEMPLATE = MODEL_DIR / "xgb_model-v{version}.pkl"
SCALER_TEMPLATE = MODEL_DIR / "scaler-v{version}.pkl"
ENCODER_TEMPLATE = MODEL_DIR / "label_encoder-v{version}.pkl"

# Default versions to try to load (you can bump these when you save new models)
DEFAULT_VERSION = os.getenv("MODEL_VERSION", "1")

PREDICTION_LOG = Path(os.getenv("PREDICTION_LOG", "logs/predictions.log"))
PREDICTION_LOG.parent.mkdir(parents=True, exist_ok=True)


# Logging setup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


# Flask app init

app = Flask(__name__)
CORS(app)


# ML COMPONENT LOADER

def load_components(version=DEFAULT_VERSION):
    """
    Load models, scaler and encoder by version.
    Returns tuple (rf_model, xgb_model, scaler, encoder, metadata)
    If files missing, returns (None,... ) and sets USE_MOCK True.
    """
    rf_path = RF_MODEL_TEMPLATE.with_name(RF_MODEL_TEMPLATE.name.format(version=version))
    xgb_path = XGB_MODEL_TEMPLATE.with_name(XGB_MODEL_TEMPLATE.name.format(version=version))
    scaler_path = SCALER_TEMPLATE.with_name(SCALER_TEMPLATE.name.format(version=version))
    encoder_path = ENCODER_TEMPLATE.with_name(ENCODER_TEMPLATE.name.format(version=version))

    components = {"rf": None, "xgb": None, "scaler": None, "encoder": None}
    meta = {"version": version, "loaded": False, "loaded_at": None, "source_paths": {}}

    try:
        if rf_path.exists():
            components["rf"] = joblib.load(rf_path)
            meta["source_paths"]["rf"] = str(rf_path)
        if xgb_path.exists():
            components["xgb"] = joblib.load(xgb_path)
            meta["source_paths"]["xgb"] = str(xgb_path)
        if scaler_path.exists():
            components["scaler"] = joblib.load(scaler_path)
            meta["source_paths"]["scaler"] = str(scaler_path)
        if encoder_path.exists():
            components["encoder"] = joblib.load(encoder_path)
            meta["source_paths"]["encoder"] = str(encoder_path)

        # If at least scaler and encoder present and one model present, consider loaded
        if components["scaler"] is not None and components["encoder"] is not None and (components["rf"] or components["xgb"]):
            meta["loaded"] = True
            meta["loaded_at"] = datetime.utcnow().isoformat() + "Z"
        return components["rf"], components["xgb"], components["scaler"], components["encoder"], meta
    except Exception as e:
        logging.exception("Error loading components: %s", e)
        return None, None, None, None, meta

# Load on startup (versioned)
rf_model, xgb_model, scaler, encoder, metadata = load_components(DEFAULT_VERSION)
USE_MOCK = not metadata.get("loaded", False)


# Simple input schema & validation

REQUIRED_FIELDS = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]

def validate_input(data):
    """
    Basic validation:
     - required fields present
     - convertible to float
     - optional small-range sanity checks
    Returns (valid: bool, message_or_features)
    """
    for field in REQUIRED_FIELDS:
        if field not in data:
            return False, f"Missing field: {field}"
    try:
        N = float(data["nitrogen"])
        P = float(data["phosphorus"])
        K = float(data["potassium"])
        temp = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data["rainfall"])
    except Exception as e:
        return False, f"Invalid numeric value: {e}"

    # sanity ranges (tweak to your domain)
    if not (0 <= N <= 500): return False, "nitrogen out of expected range [0,500]"
    if not (0 <= P <= 500): return False, "phosphorus out of expected range [0,500]"
    if not (0 <= K <= 500): return False, "potassium out of expected range [0,500]"
    if not (-50 <= temp <= 60): return False, "temperature out of expected range [-50,60]"
    if not (0 <= humidity <= 100): return False, "humidity must be 0-100"
    if not (0 <= ph <= 14): return False, "ph must be between 0 and 14"
    if not (0 <= rainfall <= 10000): return False, "rainfall out of expected range"

    features = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)
    return True, features


# Helper: prediction logging for monitoring

def log_prediction(input_json, model_used, prediction, model_version):
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "model": model_used,
        "model_version": model_version,
        "input": input_json,
        "prediction": str(prediction)
    }
    with open(PREDICTION_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


# ENDPOINTS

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "crop-prediction-api"})

@app.route("/api/health", methods=["GET"])
def health():
    """
    Deployment/Monitoring: quick health check.
    """
    return jsonify({"status": "ok", "model_loaded": not USE_MOCK, "metadata": metadata})

@app.route("/api/metadata", methods=["GET"])
def model_metadata():
    """
    Returns model metadata. In production, add model training_date, metrics (accuracy/F1), dataset hash, etc.
    """
    # Placeholder metrics: replace with real metrics persisted from training pipeline
    metrics = {
        "accuracy": None,
        "f1_score": None,
        "training_date": None,
        "notes": "Populate with real training metadata after training pipeline runs"
    }
    meta = {"loaded": not USE_MOCK, "model_version": metadata.get("version"), "metrics": metrics, "source_paths": metadata.get("source_paths", {})}
    return jsonify(meta)

@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    Deployment: accepts a JSON with required features and returns a predicted crop name.
    """
    try:
        if USE_MOCK:
            return jsonify({"error": "Models not found. Please train and save models (see /api/retrain or load models into models/)."}), 500

        data = request.get_json(force=True)
        valid, result = validate_input(data)
        if not valid:
            return jsonify({"error": result}), 400

        features = result  # numpy array
        # Scale input
        final = scaler.transform(features)

        # Choose model (default = RF)
        model_choice = data.get("model", "rf").lower()
        if model_choice == "xgb" and xgb_model is not None:
            prediction_idx = xgb_model.predict(final)[0]
            model_used = "xgb"
        elif rf_model is not None:
            prediction_idx = rf_model.predict(final)[0]
            model_used = "rf"
        else:
            return jsonify({"error": "Requested model not available."}), 500

        # Decode prediction
        predicted_crop = encoder.inverse_transform([prediction_idx])[0]

        # Log prediction for monitoring/observability
        log_prediction(data, model_used, predicted_crop, metadata.get("version"))

        return jsonify({"prediction": predicted_crop, "model": model_used, "model_version": metadata.get("version")})

    except Exception as e:
        logging.exception("Prediction error")
        return jsonify({"error": str(e)}), 400

@app.route("/api/retrain", methods=["POST"])
def retrain():
    """
    MAINTENANCE: skeleton endpoint to trigger retraining.
    Security note: In production this endpoint should be protected (auth, only internal), and retraining should be executed by a training pipeline (CI/CD).
    Expected JSON:
    {
      "dataset_path": "data/training.csv",
      "new_version": "2",
      "train_params": {...}
    }
    This handler only shows where to plug your training code.
    """
    try:
        req = request.get_json(force=True)
        dataset_path = req.get("dataset_path")
        new_version = req.get("new_version")
        train_params = req.get("train_params", {})

        if not dataset_path or not new_version:
            return jsonify({"error": "Provide dataset_path and new_version in request body."}), 400

        
        
        # 1. load dataset from dataset_path
        # 2. preprocess & split (train/test)
        # 3. fit scaler, encoder, and model(s)
        # 4. evaluate metrics and save them
        # 5. persist artifacts with version new_version
        # For now we only return a message.
        return jsonify({
            "status": "retrain_triggered",
            "note": "This is a skeleton. Implement training code here or invoke your pipeline/orchestration.",
            "requested_new_version": new_version
        })

    except Exception as e:
        logging.exception("Retrain error")
        return jsonify({"error": str(e)}), 400


# Start app

if __name__ == "__main__":
    logging.info("Starting Crop Prediction API (version %s). USE_MOCK=%s", metadata.get("version"), USE_MOCK)
    app.run(debug=True)
