import os
import sys
import django

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

try:
    from users.models import User, SellerProfile
    print("Users models imported successfully")
    print(f"User model: {User}")
    print(f"SellerProfile model: {SellerProfile}")
except ImportError as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()