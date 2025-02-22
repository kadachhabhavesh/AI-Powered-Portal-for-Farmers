from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import json

# Load model and class labels
model = load_model('./trained_model/plant_disease_prediction_model.h5')
with open('class_indices.json', 'r') as f:
    class_indices = json.load(f)
class_labels = {int(k): v for k, v in class_indices.items()}  # Convert keys to integers

# Initialize Flask app
app = Flask(__name__)

# Function to preprocess image
def preprocess_image(image, target_size=(224, 224)):
    image = image.resize(target_size)
    image = np.array(image) / 255.0  # Normalize the image
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Home route to display a simple HTML upload form
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    image = Image.open(file).convert("RGB")
    processed_image = preprocess_image(image)

    # Predict using the model
    prediction = model.predict(processed_image)
    class_idx = np.argmax(prediction, axis=1)[0]
    confidence = float(np.max(prediction))

    # Get class label from class_labels dictionary
    if class_idx in class_labels:
        label = class_labels[class_idx]
        return jsonify({"class": label, "confidence": confidence})
    else:
        return jsonify({"error": "Predicted class index out of range"}), 500

# app.py
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

