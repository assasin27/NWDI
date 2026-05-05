from django.conf import settings
from django.urls import get_resolver
print('ROOT_URLCONF=', settings.ROOT_URLCONF)
r = get_resolver()
for p in r.url_patterns:
    print(p)
