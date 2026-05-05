#!/usr/bin/env python
"""
Freshness Prediction Model Training Script

This script trains a machine learning model to predict fruit/vegetable freshness
from images using scikit-learn instead of TensorFlow for Python 3.14 compatibility.

Features extracted:
- Color histograms (RGB)
- Texture features (GLCM)
- Shape features (Hu moments)
- Statistical features (mean, std, skewness, kurtosis)
"""

import os
import numpy as np
import cv2
from PIL import Image
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from skimage.feature import graycomatrix, graycoprops
from scipy.stats import skew, kurtosis
import warnings
warnings.filterwarnings('ignore')

class FreshnessModelTrainer:
    def __init__(self, data_dir=None, model_dir=None):
        base_dir = os.path.dirname(__file__)
        self.data_dir = data_dir or os.path.join(base_dir, '..', 'data', 'archive')
        self.model_dir = model_dir or os.path.join(base_dir, 'models')
        self.input_size = (128, 128)

        # Ensure model directory exists
        os.makedirs(self.model_dir, exist_ok=True)

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

    def extract_features(self, image_path):
        """Extract all features from an image"""
        # Load and preprocess image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")

        image = cv2.resize(image, self.input_size)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

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

        return all_features

    def load_dataset(self):
        """Load and preprocess the dataset"""
        print("Loading dataset...")

        X = []
        y = []

        # Process fresh images (label 0)
        fresh_dirs = [d for d in os.listdir(self.data_dir) if d.startswith('fresh_')]
        for fresh_dir in fresh_dirs:
            dir_path = os.path.join(self.data_dir, fresh_dir)
            if os.path.isdir(dir_path):
                print(f"Processing fresh images from {fresh_dir}...")
                for filename in os.listdir(dir_path):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                        image_path = os.path.join(dir_path, filename)
                        try:
                            features = self.extract_features(image_path)
                            X.append(features)
                            y.append(0)  # Fresh
                        except Exception as e:
                            print(f"Error processing {image_path}: {e}")

        # Process stale images (label 1)
        stale_dirs = [d for d in os.listdir(self.data_dir) if d.startswith('stale_')]
        for stale_dir in stale_dirs:
            dir_path = os.path.join(self.data_dir, stale_dir)
            if os.path.isdir(dir_path):
                print(f"Processing stale images from {stale_dir}...")
                for filename in os.listdir(dir_path):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                        image_path = os.path.join(dir_path, filename)
                        try:
                            features = self.extract_features(image_path)
                            X.append(features)
                            y.append(1)  # Stale
                        except Exception as e:
                            print(f"Error processing {image_path}: {e}")

        X = np.array(X)
        y = np.array(y)

        print(f"Dataset loaded: {len(X)} samples, {X.shape[1]} features per sample")
        print(f"Fresh samples: {np.sum(y == 0)}, Stale samples: {np.sum(y == 1)}")

        return X, y

    def train_model(self, X, y, model_type='rf'):
        """Train the ML model"""
        print(f"\nTraining {model_type} model...")

        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

        # Choose model
        if model_type == 'rf':
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'svm':
            model = SVC(
                kernel='rbf',
                C=1.0,
                gamma='scale',
                probability=True,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        # Train model
        model.fit(X_train, y_train)

        # Evaluate model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        print(".2f")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Fresh', 'Stale']))

        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        return model, accuracy

    def save_model(self, model, filename='freshness_model.pkl'):
        """Save the trained model"""
        model_path = os.path.join(self.model_dir, filename)
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        print(f"Model saved to {model_path}")
        return model_path

    def train_and_save(self, model_type='rf'):
        """Complete training pipeline"""
        print("Starting freshness model training...")

        # Load dataset
        X, y = self.load_dataset()

        # Train model
        model, accuracy = self.train_model(X, y, model_type)

        # Save model
        model_path = self.save_model(model)

        print("\nTraining completed!")
        print(".2f")
        return model_path


if __name__ == '__main__':
    # Initialize trainer
    trainer = FreshnessModelTrainer()

    # Train and save model
    model_path = trainer.train_and_save(model_type='rf')  # Use Random Forest

    print(f"\nModel training completed! Model saved at: {model_path}")
    print("You can now use this model in your freshness predictor.")