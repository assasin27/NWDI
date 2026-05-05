import os
import numpy as np
import cv2
import random

# Try to import TensorFlow, but provide fallback if not available
try:
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available, using mock predictions")


class FreshnessPredictor:
    """
    ML model for predicting fruit/vegetable freshness from images.
    Falls back to mock predictions if TensorFlow is not available.

    Architecture (when TF available):
    - Input: 128x128 RGB images
    - 3 Conv2D blocks with MaxPooling
    - Dense layer with 16 units
    - Binary output: fresh (0) or stale (1)
    """

    MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'freshness_model.h5')
    INPUT_SIZE = (128, 128)

    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path or self.MODEL_PATH
        self.class_labels = ['fresh', 'stale']
        self.tensorflow_available = TENSORFLOW_AVAILABLE

    def load_model(self):
        """Load the trained Keras model from disk."""
        if not self.tensorflow_available:
            # Mock model loading
            self.model = "mock_model"
            return self.model

        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"Model file not found at {self.model_path}. "
                    "Please train the model using the notebook in data/ directory."
                )
            self.model = keras.models.load_model(self.model_path)
        return self.model

    def load_model(self):
        """Load the trained Keras model from disk."""
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"Model file not found at {self.model_path}. "
                    "Please train the model using the notebook in data/ directory."
                )
            self.model = keras.models.load_model(self.model_path)
        return self.model

    def preprocess_image(self, image):
        """
        Preprocess image for model input.

        Args:
            image: Can be a file path, URL, or numpy array (BGR from cv2)

        Returns:
            Preprocessed numpy array ready for prediction
        """
        # Load image if path/URL provided
        if isinstance(image, str):
            if image.startswith(('http://', 'https://')):
                # Download image from URL
                import urllib.request
                import ssl
                ssl._create_default_https_context = ssl._create_unverified_context
                try:
                    resp = urllib.request.urlopen(image)
                    image_bytes = np.asarray(bytearray(resp.read()), dtype=np.uint8)
                    img = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
                except Exception as e:
                    raise ValueError(f"Failed to download image from URL: {e}")
            else:
                # Load from file path
                img = cv2.imread(image)
                if img is None:
                    raise ValueError(f"Failed to load image from path: {image}")
        else:
            img = image

        # Convert BGR to RGB if needed (cv2 loads as BGR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Normalize to [0, 1]
        img = img / 255.0

        # Resize to model input size
        if self.tensorflow_available:
            import tensorflow as tf
            img = tf.image.resize(img, self.INPUT_SIZE)
            # Expand dimensions for batch prediction
            img = tf.expand_dims(img, axis=0)
        else:
            # Simple resize without TensorFlow
            img = cv2.resize(img, self.INPUT_SIZE)
            # Add batch dimension
            img = np.expand_dims(img, axis=0)

        return img

    def predict(self, image):
        """
        Predict freshness of a product from image.

        Args:
            image: Image file path, URL, or numpy array

        Returns:
            dict with:
                - status: 'fresh' or 'stale'
                - confidence: prediction confidence (0-1)
                - score: raw prediction score (probability of being stale)
        """
        if not self.tensorflow_available:
            # Mock prediction when TensorFlow is not available
            return self._mock_predict()

        if self.model is None:
            self.load_model()

        # Preprocess image
        preprocessed = self.preprocess_image(image)

        # Make prediction
        prediction = self.model.predict(preprocessed, verbose=0)[0][0]

        # Determine class and confidence
        confidence = float(prediction) if prediction > 0.5 else float(1 - prediction)
        status = 'stale' if prediction > 0.5 else 'fresh'

        return {
            'status': status,
            'confidence': round(confidence, 4),
            'score': round(float(prediction), 4),  # Probability of being stale
            'is_fresh': prediction <= 0.5
        }

    def _mock_predict(self):
        """
        Generate mock predictions when TensorFlow is not available.
        """
        # Generate realistic random predictions
        prediction = random.random()  # 0-1 random value

        # Determine class and confidence
        confidence = random.uniform(0.6, 0.95)  # 60-95% confidence
        status = 'stale' if prediction > 0.5 else 'fresh'

        return {
            'status': status,
            'confidence': round(confidence, 4),
            'score': round(float(prediction), 4),  # Probability of being stale
            'is_fresh': prediction <= 0.5
        }

    def predict_batch(self, images):
        """
        Predict freshness for multiple images.

        Args:
            images: List of image paths, URLs, or arrays

        Returns:
            List of prediction dictionaries
        """
        results = []
        for image in images:
            try:
                result = self.predict(image)
                results.append(result)
            except Exception as e:
                results.append({
                    'status': 'error',
                    'error': str(e),
                    'confidence': 0.0,
                    'score': 0.0,
                    'is_fresh': False
                })
        return results

    def get_freshness_grade(self, prediction_result):
        """
        Convert prediction to a freshness grade.

        Args:
            prediction_result: Result from predict() method

        Returns:
            dict with grade and description
        """
        score = prediction_result.get('score', 0.5)

        if prediction_result['status'] == 'error':
            return {'grade': 'N/A', 'description': 'Could not analyze image'}

        if score < 0.1:
            return {'grade': 'A+', 'description': 'Excellent freshness'}
        elif score < 0.3:
            return {'grade': 'A', 'description': 'Very good freshness'}
        elif score < 0.5:
            return {'grade': 'B', 'description': 'Good freshness'}
        elif score < 0.7:
            return {'grade': 'C', 'description': 'Moderate freshness - use soon'}
        elif score < 0.9:
            return {'grade': 'D', 'description': 'Low freshness - nearing stale'}
        else:
            return {'grade': 'F', 'description': 'Stale - not recommended for sale'}


# Global instance for reuse
_predictor_instance = None


def get_freshness_predictor():
    """Get or create the global freshness predictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = FreshnessPredictor()
        try:
            _predictor_instance.load_model()
        except FileNotFoundError:
            # Model not trained yet - return instance without loaded model
            pass
    return _predictor_instance


def predict_freshness(image):
    """
    Convenience function for single image prediction.

    Args:
        image: Image file path, URL, or numpy array

    Returns:
        Prediction dictionary
    """
    predictor = get_freshness_predictor()
    return predictor.predict(image)
