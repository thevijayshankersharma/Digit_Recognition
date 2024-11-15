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
import traceback

# Set up logging
logging.basicConfig(level=logging.DEBUG)
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
    logger.error(traceback.format_exc())
    raise

# Initialize Flask app
app = Flask(__name__, static_folder='frontend/build')

CORS(app)

def prepare_image(image_data):
    try:
        image = Image.open(io.BytesIO(image_data)).convert("L").resize((28, 28))
        image_array = img_to_array(image) / 255.0
        return np.expand_dims(image_array, axis=0)
    except Exception as e:
        logger.error(f"Error in prepare_image: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.route("/predict", methods=["POST"])
def predict():
    logger.info("Received request on /predict")
    data = request.get_json()
    logger.info(f"Received data keys: {data.keys()}")

    if not data or 'image' not in data:
        logger.error("No image data provided")
        return jsonify({"error": "No image data provided"}), 400

    try:
        # Decode the base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])
        
        # Prepare the image
        processed_image = prepare_image(image_data)

        # Get model prediction
        prediction = model.predict(processed_image)
        digit = np.argmax(prediction)
        confidence = float(prediction[0][digit])

        logger.info(f"Prediction: digit {digit} with confidence {confidence:.2f}")

        return jsonify({
            "digit": int(digit),
            "confidence": confidence,
            "probabilities": prediction[0].tolist()
        })
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

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
    logger.error(traceback.format_exc())
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))