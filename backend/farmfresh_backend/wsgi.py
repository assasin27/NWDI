import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

application = get_wsgi_application()
