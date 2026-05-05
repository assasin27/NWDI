import os
import numpy as np
import cv2
import pickle
import random
from skimage.feature import graycomatrix, graycoprops
from scipy.stats import skew, kurtosis


class FreshnessPredictor:
    """
    ML model for predicting fruit/vegetable freshness from images.
    Uses scikit-learn Random Forest model trained on image features.

    Features extracted:
    - Color histograms (RGB)
    - Texture features (GLCM)
    - Shape features (Hu moments)
    - Statistical features (mean, std, skewness, kurtosis)
    """

    MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'freshness_model.pkl')
    INPUT_SIZE = (128, 128)

    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path or self.MODEL_PATH
        self.class_labels = ['fresh', 'stale']

    def load_model(self):
        """Load the trained scikit-learn model from disk."""
        if self.model is not None and (
            not hasattr(self.model, 'predict_proba') or not hasattr(self.model, 'predict')
        ):
            # Reload if the cached model object is not a usable estimator.
            self.model = None

        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"Model file not found at {self.model_path}. "
                    "Please train the model using train_freshness_model.py"
                )
            with open(self.model_path, 'rb') as f:
                loaded = pickle.load(f)

            # Some saved model artifacts may wrap the estimator in a dict
            if isinstance(loaded, dict):
                if 'model' in loaded:
                    self.model = loaded['model']
                elif 'estimator' in loaded:
                    self.model = loaded['estimator']
                else:
                    raise ValueError(
                        f"Loaded model artifact is a dict but contains no usable estimator keys. "
                        f"Available keys: {list(loaded.keys())}"
                    )
            else:
                self.model = loaded

            if not hasattr(self.model, 'predict_proba') or not hasattr(self.model, 'predict'):
                raise ValueError(
                    f"Loaded model object is not a scikit-learn estimator: {type(self.model)}"
                )
        return self.model

    def extract_color_features(self, image):
        """Extract color histogram features from RGB channels"""
        features = []

        # Convert to RGB if needed
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

        # Calculate histograms for each channel
        for channel in range(3):  # RGB channels
            hist = cv2.calcHist([image], [channel], None, [32], [0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            features.extend(hist)

        return np.array(features)

    def extract_texture_features(self, image):
        """Extract texture features using GLCM (Gray Level Co-occurrence Matrix)"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        # Reduce to 16 gray levels for GLCM
        gray = (gray / 16).astype(np.uint8)

        # Calculate GLCM
        glcm = graycomatrix(gray, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
                           levels=16, symmetric=True, normed=True)

        # Extract properties
        features = []
        properties = ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation']

        for prop in properties:
            feature = graycoprops(glcm, prop).flatten()
            features.extend(feature)

        return np.array(features)

    def extract_shape_features(self, image):
        """Extract shape features using Hu moments"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        # Calculate Hu moments
        moments = cv2.moments(gray)
        hu_moments = cv2.HuMoments(moments).flatten()

        return hu_moments

    def extract_statistical_features(self, image):
        """Extract statistical features from pixel intensities"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        features = [
            np.mean(gray),      # Mean intensity
            np.std(gray),       # Standard deviation
            skew(gray.flatten()),    # Skewness
            kurtosis(gray.flatten()), # Kurtosis
            np.min(gray),       # Minimum intensity
            np.max(gray),       # Maximum intensity
            np.median(gray),    # Median intensity
        ]

        return np.array(features)

    def preprocess_image(self, image):
        """
        Preprocess image for feature extraction.

        Args:
            image: Can be a file path, URL, or numpy array (BGR from cv2)

        Returns:
            Preprocessed numpy array ready for feature extraction
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

        # Resize to model input size
        img = cv2.resize(img, self.INPUT_SIZE)

        return img

    def extract_features(self, image):
        """Extract all features from a preprocessed image"""
        # Extract all feature types
        color_features = self.extract_color_features(image)
        texture_features = self.extract_texture_features(image)
        shape_features = self.extract_shape_features(image)
        stat_features = self.extract_statistical_features(image)

        # Combine all features
        all_features = np.concatenate([
            color_features,
            texture_features,
            shape_features,
            stat_features
        ])

        return all_features.reshape(1, -1)  # Reshape for single prediction

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
        if self.model is None or not hasattr(self.model, 'predict_proba') or not hasattr(self.model, 'predict'):
            self.load_model()

        # Preprocess image
        preprocessed = self.preprocess_image(image)

        # Extract features
        features = self.extract_features(preprocessed)

        # Make prediction
        prediction_proba = self.model.predict_proba(features)[0]
        prediction = self.model.predict(features)[0]

        # Determine class and confidence
        confidence = float(max(prediction_proba))
        status = self.class_labels[prediction]

        return {
            'status': status,
            'confidence': round(confidence, 4),
            'score': round(float(prediction_proba[1]), 4),  # Probability of being stale
            'is_fresh': bool(prediction == 0)
        }

    def _mock_predict(self):
        """
        Generate mock predictions when model is not available.
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
        confidence = prediction_result['confidence']
        is_fresh = prediction_result['is_fresh']

        if is_fresh:
            if confidence >= 0.95:
                grade = 'A+'
                description = 'Excellent quality! This product appears very fresh and well-maintained.'
            elif confidence >= 0.90:
                grade = 'A'
                description = 'Good quality. The product looks fresh and suitable for consumption.'
            elif confidence >= 0.80:
                grade = 'B'
                description = 'Fair quality. Some signs of age but still acceptable.'
            else:
                grade = 'C'
                description = 'Average quality. Consider using soon or checking storage conditions.'
        else:
            if confidence >= 0.90:
                grade = 'F'
                description = 'Very poor quality. Not recommended for consumption.'
            elif confidence >= 0.80:
                grade = 'D'
                description = 'Poor quality. Signs of deterioration, use with caution.'
            else:
                grade = 'C'
                description = 'Average quality. Consider using soon or checking storage conditions.'

        return {
            'grade': grade,
            'description': description
        }


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