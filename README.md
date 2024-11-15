# Digit Recognition

This is a web application for recognizing handwritten digits using a Convolutional Neural Network (CNN) model trained on the MNIST dataset. The backend is built using **Flask** and **TensorFlow**, while the frontend is created with **React**.

Users can draw digits on a canvas or upload an image to get a prediction from the trained model. The prediction results are displayed along with the confidence and a graph of probabilities for each digit (0-9).

## Features
- **Draw Digits**: Users can draw digits on a canvas, which is then sent to the backend for prediction.
- **Upload Image**: Users can upload an image of a digit, which is then predicted by the model.
- **Prediction Results**: Displays the predicted digit along with confidence scores and a chart of probabilities.
- **Dark/Light Mode**: Switch between dark and light themes for a personalized UI experience.
- **Previous Predictions**: A history of the last few predictions is displayed for quick reference.

## Technologies Used
- **Backend**: Flask, TensorFlow, Keras, PIL
- **Frontend**: React, Material-UI, Framer Motion, Chart.js
- **Machine Learning**: CNN trained on the MNIST dataset
- **Image Processing**: TensorFlow/Keras for model inference, PIL for image manipulation

## Installation

### Prerequisites
To run the application locally, you'll need the following software installed:
- Python 3.7 or higher
- Node.js and npm
- TensorFlow
- React and Material-UI dependencies

### Backend Setup (Flask)
1. Clone the repository:

2. Install the required Python dependencies:

3. Download or train the MNIST model (`digit_recognition_model.h5`) and place it in the root directory. You can use the `mnist_digit_recognition.py` script to train the model if you don't have it.

4. Start the Flask server:
   ```bash
   python app.py
   ```

The Flask server will run on `http://localhost:5000` by default.

### Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The React app will be available at `http://localhost:3000`.

### Running the Application
Once both the Flask backend and React frontend are running:
1. Open your browser and go to `http://localhost:3000`.
2. You can draw a digit on the canvas, upload an image of a digit, or see predictions from previously drawn digits.

### Model Training
If you'd like to train the model yourself:
1. Run the `mnist_digit_recognition.py` script:
   ```bash
   python mnist_digit_recognition.py
   ```
2. This will train a CNN on the MNIST dataset, save the trained model (`digit_recognition_model.h5`), and generate a sample prediction image.

### Deployment
For deployment, you can host the Flask backend on platforms like Heroku, AWS, or DigitalOcean, and deploy the React frontend using services like Vercel or Netlify.

---


## Contributing
Feel free to fork the repository and submit issues or pull requests. All contributions are welcome!

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.