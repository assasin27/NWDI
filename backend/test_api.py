#!/usr/bin/env python
import os
import sys
import django

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.http import HttpRequest
from products.freshness_views import freshness_model_status

# Create a mock request
request = HttpRequest()
request.method = 'GET'

try:
    response = freshness_model_status(request)
    print("Response status:", response.status_code)
    print("Response content:", response.content.decode('utf-8'))
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()