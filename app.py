from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import io
import base64
import logging
from logging.handlers import RotatingFileHandler
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Load the trained model
try:
    model = load_model('digit_recognition_model.h5')
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise

# Initialize Flask app
app = Flask(__name__, static_folder='frontend/build')

# Enable CORS for the entire app (or specify the frontend URL in the resource section)
CORS(app, resources={r"/predict": {"origins": "https://digit-recognition-orpin.vercel.app"}})

def prepare_image(image):
    try:
        # Convert the image to grayscale and resize to 28x28 pixels
        image = image.convert("L").resize((28, 28))
        # Convert the image to an array and normalize
        image = img_to_array(image) / 255.0
        # Add a batch dimension
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        logger.error(f"Error in prepare_image: {str(e)}")
        raise

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or 'image' not in data:
        logger.error("No image data provided")
        return jsonify({"error": "No image data provided"}), 400

    try:
        # Decode the base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])  # Strip base64 header
        image = Image.open(io.BytesIO(image_data))  # Open the image
        
        # Prepare the image (grayscale, resize, normalize)
        processed_image = prepare_image(image)

        # Get model prediction
        prediction = model.predict(processed_image)
        digit = np.argmax(prediction)
        confidence = float(prediction[0][digit])

        logger.info(f"Prediction made: digit {digit} with confidence {confidence:.2f}")

        return jsonify({
            "digit": int(digit),
            "confidence": confidence,
            "probabilities": prediction[0].tolist()
        })
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": "An error occurred during prediction"}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
