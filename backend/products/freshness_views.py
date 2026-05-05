import os
import base64
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import cv2


@csrf_exempt
@require_http_methods(["POST"])
def predict_freshness(request):
    """
    Predict freshness of a product from uploaded image.

    Accepts:
        - image: Base64 encoded image string OR uploaded file
        - image_url: URL of image to analyze (optional)

    Returns:
        JSON response with:
        - status: 'fresh' or 'stale'
        - confidence: prediction confidence (0-1)
        - score: probability of being stale (0-1)
        - is_fresh: boolean
        - grade: freshness grade (A+, A, B, C, D, F)
        - description: human-readable description
    """
    try:
        # Import predictor lazily to avoid circular imports
        from utils.freshness_predictor import FreshnessPredictor, get_freshness_predictor

        predictor = get_freshness_predictor()

        # Check if model is loaded
        if predictor.model is None:
            try:
                predictor.load_model()
            except FileNotFoundError:
                return JsonResponse({
                    'error': 'Model not trained. Please train the model using the notebook in data/ directory.',
                    'status': 'error',
                    'model_path': predictor.model_path
                }, status=503)

        # Get image from request
        image_data = None
        image_source = None

        # Try to get base64 image from POST data
        if request.POST.get('image'):
            image_data = request.POST.get('image')
            image_source = 'base64'
        elif request.POST.get('image_url'):
            image_data = request.POST.get('image_url')
            image_source = 'url'
        elif request.FILES.get('image'):
            # Handle file upload
            uploaded_file = request.FILES.get('image')
            file_bytes = np.frombuffer(uploaded_file.read(), np.uint8)
            image_data = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            if image_data is None:
                return JsonResponse({
                    'error': 'Failed to decode uploaded image',
                    'status': 'error'
                }, status=400)
            image_source = 'file'
        else:
            return JsonResponse({
                'error': 'No image provided. Send base64 image, image_url, or upload a file.',
                'status': 'error'
            }, status=400)

        # Decode base64 image
        if image_source == 'base64':
            try:
                # Remove data URL prefix if present
                if ',' in image_data:
                    image_data = image_data.split(',')[1]

                # Decode base64 to numpy array
                image_bytes = base64.b64decode(image_data)
                image_array = np.frombuffer(image_bytes, np.uint8)
                image_data = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

                if image_data is None:
                    return JsonResponse({
                        'error': 'Failed to decode base64 image',
                        'status': 'error'
                    }, status=400)
            except Exception as e:
                return JsonResponse({
                    'error': f'Failed to decode base64 image: {str(e)}',
                    'status': 'error'
                }, status=400)

        # Make prediction
        result = predictor.predict(image_data)

        # Add freshness grade
        grade_info = predictor.get_freshness_grade(result)
        result['grade'] = grade_info['grade']
        result['description'] = grade_info['description']

        return JsonResponse({
            'success': True,
            'prediction': result
        })

    except Exception as e:
        return JsonResponse({
            'error': f'Prediction failed: {str(e)}',
            'status': 'error',
            'details': str(type(e).__name__)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def freshness_model_status(request):
    """
    Check the status of the freshness prediction model.

    Returns:
        JSON response with model status information
    """
    try:
        from utils.freshness_predictor import get_freshness_predictor
        import os

        print("DEBUG: Getting freshness predictor...")
        predictor = get_freshness_predictor()
        print(f"DEBUG: Predictor obtained: {predictor}")
        print(f"DEBUG: Model path: {predictor.model_path}")

        model_exists = os.path.exists(predictor.model_path)
        print(f"DEBUG: Model exists: {model_exists}")

        model_loaded = predictor.model is not None
        print(f"DEBUG: Model loaded: {model_loaded}")

        return JsonResponse({
            'model_exists': model_exists,
            'model_path': predictor.model_path,
            'model_loaded': model_loaded,
            'input_size': predictor.INPUT_SIZE,
            'class_labels': predictor.class_labels,
            'status': 'ready' if model_exists and model_loaded else 'not_trained'
        })

    except Exception as e:
        import traceback
        print(f"DEBUG: Error in freshness_model_status: {e}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'error': f'Failed to check model status: {str(e)}',
            'status': 'error'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def predict_batch_freshness(request):
    """
    Predict freshness for multiple images.

    Accepts:
        - images: Array of base64 encoded images or URLs

    Returns:
        JSON response with array of predictions
    """
    try:
        from utils.freshness_predictor import FreshnessPredictor, get_freshness_predictor

        predictor = get_freshness_predictor()

        if predictor.model is None:
            try:
                predictor.load_model()
            except FileNotFoundError:
                return JsonResponse({
                    'error': 'Model not trained',
                    'status': 'error'
                }, status=503)

        # Get images array from request
        images = request.POST.getlist('images')
        if not images:
            import json
            try:
                data = json.loads(request.body)
                images = data.get('images', [])
            except:
                pass

        if not images:
            return JsonResponse({
                'error': 'No images provided. Send an array of base64 images or URLs.',
                'status': 'error'
            }, status=400)

        # Process each image
        results = []
        for i, image_data in enumerate(images):
            try:
                # Decode base64 if needed
                if ',' in image_data:
                    image_data = image_data.split(',')[1]

                image_bytes = base64.b64decode(image_data)
                image_array = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

                if image is None:
                    results.append({
                        'index': i,
                        'status': 'error',
                        'error': 'Failed to decode image'
                    })
                    continue

                result = predictor.predict(image)
                grade_info = predictor.get_freshness_grade(result)
                result['grade'] = grade_info['grade']
                result['description'] = grade_info['description']
                result['index'] = i
                results.append(result)

            except Exception as e:
                results.append({
                    'index': i,
                    'status': 'error',
                    'error': str(e)
                })

        return JsonResponse({
            'success': True,
            'predictions': results,
            'total': len(results),
            'successful': len([r for r in results if r.get('status') != 'error'])
        })

    except Exception as e:
        return JsonResponse({
            'error': f'Batch prediction failed: {str(e)}',
            'status': 'error'
        }, status=500)
