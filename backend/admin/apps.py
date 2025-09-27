from django.apps import AppConfig


class AdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin'
    verbose_name = 'Admin Panel'

    def ready(self):
        try:
            import admin.signals  # noqa F401
        except ImportError:
            pass
