import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'farmfresh_backend.settings'
import django
django.setup()
from django.conf import settings
from django.urls import get_resolver
print('SETTINGS_MODULE=', os.environ['DJANGO_SETTINGS_MODULE'])
print('ROOT_URLCONF=', settings.ROOT_URLCONF)
resolver = get_resolver()
print('patterns count=', len(resolver.url_patterns))
for p in resolver.url_patterns:
    print(p)
