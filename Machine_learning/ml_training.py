import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Load the dataset
# Adjust path if needed, based on current working directory
csv_path = 'DataSet/Crop_recommendation.csv'

if not os.path.exists(csv_path):
    # Try finding it recursively or check common paths
    if os.path.exists('../Machine_learning/DataSet/Crop_recommendation.csv'):
        csv_path = '../Machine_learning/DataSet/Crop_recommendation.csv'
    else:
        raise FileNotFoundError(f"Could not find {csv_path}")

print(f"Loading data from {csv_path}...")
df = pd.read_csv(csv_path)

# Features and Target
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
print("Training RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save model
model_path = 'backend_app/model.pkl'
os.makedirs('backend_app', exist_ok=True)
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
