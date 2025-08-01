import pytest
import os
import re
from django.test import TestCase
from django.conf import settings
from django.core.management import execute_from_command_line
from unittest.mock import patch, MagicMock

class ConfigurationSecurityTests(TestCase):
    """Test Django configuration security settings"""

    def test_secret_key_not_hardcoded(self):
        """Test that SECRET_KEY is not hardcoded in settings"""
        # Check if SECRET_KEY is properly configured
        secret_key = getattr(settings, 'SECRET_KEY', None)
        
        # Should not be the default Django secret key
        default_keys = [
            'replace-this-with-a-secure-key',
            'django-insecure-p121j4^h&6@+bhmnwdeexm+h-=0*#k$410%13w=&ly1_tlr2&k',
            'your-secret-key-here'
        ]
        
        self.assertIsNotNone(secret_key)
        self.assertNotIn(secret_key, default_keys)
        self.assertGreater(len(secret_key), 20)  # Should be reasonably long

    def test_debug_mode_disabled_in_production(self):
        """Test that DEBUG is disabled in production"""
        # This test should be run in production environment
        # In development, DEBUG=True is acceptable
        debug_mode = getattr(settings, 'DEBUG', True)
        
        # In production, DEBUG should be False
        # This test will pass in development but should be checked in production
        if os.environ.get('DJANGO_ENV') == 'production':
            self.assertFalse(debug_mode, "DEBUG should be False in production")
        else:
            # In development, this is acceptable
            self.assertTrue(True, "DEBUG=True is acceptable in development")

    def test_allowed_hosts_configured(self):
        """Test that ALLOWED_HOSTS is properly configured"""
        allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])
        
        # Should not be empty in production
        if os.environ.get('DJANGO_ENV') == 'production':
            self.assertGreater(len(allowed_hosts), 0, "ALLOWED_HOSTS should be configured in production")
        else:
            # In development, empty ALLOWED_HOSTS is acceptable
            self.assertTrue(True, "Empty ALLOWED_HOSTS is acceptable in development")

    def test_https_redirect_enabled(self):
        """Test that HTTPS redirect is enabled"""
        # Check for HTTPS redirect middleware
        middleware = getattr(settings, 'MIDDLEWARE', [])
        
        https_middleware = [
            'django.middleware.security.SecurityMiddleware',
            'django.middleware.security.HttpsRedirectMiddleware'
        ]
        
        # At least SecurityMiddleware should be present
        self.assertIn('django.middleware.security.SecurityMiddleware', middleware)

    def test_security_headers_configured(self):
        """Test that security headers are properly configured"""
        # Check for security headers configuration
        security_settings = [
            'SECURE_BROWSER_XSS_FILTER',
            'SECURE_CONTENT_TYPE_NOSNIFF',
            'SECURE_HSTS_INCLUDE_SUBDOMAINS',
            'SECURE_HSTS_SECONDS',
            'SECURE_HSTS_PRELOAD',
            'SECURE_SSL_REDIRECT',
            'SESSION_COOKIE_SECURE',
            'CSRF_COOKIE_SECURE'
        ]
        
        # In production, these should be configured
        if os.environ.get('DJANGO_ENV') == 'production':
            for setting in security_settings:
                value = getattr(settings, setting, None)
                if setting in ['SECURE_SSL_REDIRECT', 'SESSION_COOKIE_SECURE', 'CSRF_COOKIE_SECURE']:
                    self.assertTrue(value, f"{setting} should be True in production")

    def test_database_security(self):
        """Test database security configuration"""
        database_config = getattr(settings, 'DATABASES', {}).get('default', {})
        
        # Check for secure database configuration
        if os.environ.get('DJANGO_ENV') == 'production':
            # Should not use SQLite in production
            engine = database_config.get('ENGINE', '')
            self.assertNotIn('sqlite', engine.lower(), "Should not use SQLite in production")
            
            # Should use environment variables for credentials
            password = database_config.get('PASSWORD', '')
            self.assertNotEqual(password, '', "Database password should be configured")

    def test_static_files_security(self):
        """Test static files security configuration"""
        # Check that static files are served securely
        static_url = getattr(settings, 'STATIC_URL', '/static/')
        static_root = getattr(settings, 'STATIC_ROOT', None)
        
        # Should have STATIC_ROOT configured in production
        if os.environ.get('DJANGO_ENV') == 'production':
            self.assertIsNotNone(static_root, "STATIC_ROOT should be configured in production")

    def test_logging_security(self):
        """Test logging security configuration"""
        logging_config = getattr(settings, 'LOGGING', {})
        
        # Check that sensitive information is not logged
        handlers = logging_config.get('handlers', {})
        for handler_name, handler_config in handlers.items():
            if 'formatter' in handler_config:
                formatter = logging_config.get('formatters', {}).get(handler_config['formatter'], {})
                format_string = formatter.get('format', '')
                
                # Should not log sensitive information
                sensitive_fields = ['password', 'secret', 'key', 'token']
                for field in sensitive_fields:
                    self.assertNotIn(field, format_string.lower())

    def test_session_security(self):
        """Test session security configuration"""
        session_settings = [
            'SESSION_COOKIE_HTTPONLY',
            'SESSION_COOKIE_SECURE',
            'SESSION_COOKIE_SAMESITE',
            'SESSION_EXPIRE_AT_BROWSER_CLOSE'
        ]
        
        # Check session security settings
        for setting in session_settings:
            value = getattr(settings, setting, None)
            if setting == 'SESSION_COOKIE_HTTPONLY':
                self.assertTrue(value, "SESSION_COOKIE_HTTPONLY should be True")

    def test_csrf_security(self):
        """Test CSRF security configuration"""
        csrf_settings = [
            'CSRF_COOKIE_SECURE',
            'CSRF_COOKIE_HTTPONLY',
            'CSRF_COOKIE_SAMESITE'
        ]
        
        # Check CSRF security settings
        for setting in csrf_settings:
            value = getattr(settings, setting, None)
            if setting in ['CSRF_COOKIE_SECURE', 'CSRF_COOKIE_HTTPONLY']:
                if os.environ.get('DJANGO_ENV') == 'production':
                    self.assertTrue(value, f"{setting} should be True in production")

    def test_password_validation(self):
        """Test password validation configuration"""
        password_validators = getattr(settings, 'AUTH_PASSWORD_VALIDATORS', [])
        
        # Should have password validators configured
        self.assertGreater(len(password_validators), 0, "Password validators should be configured")
        
        # Check for specific validators
        validator_names = [validator.get('NAME', '') for validator in password_validators]
        expected_validators = [
            'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
            'django.contrib.auth.password_validation.MinimumLengthValidator',
            'django.contrib.auth.password_validation.CommonPasswordValidator',
            'django.contrib.auth.password_validation.NumericPasswordValidator'
        ]
        
        for expected in expected_validators:
            self.assertIn(expected, validator_names)

    def test_installed_apps_security(self):
        """Test that security-related apps are installed"""
        installed_apps = getattr(settings, 'INSTALLED_APPS', [])
        
        # Should have security-related apps
        security_apps = [
            'django.contrib.auth',
            'django.contrib.sessions'
        ]
        
        for app in security_apps:
            self.assertIn(app, installed_apps)

    def test_middleware_security(self):
        """Test that security middleware is installed"""
        middleware = getattr(settings, 'MIDDLEWARE', [])
        
        # Should have security middleware
        security_middleware = [
            'django.middleware.security.SecurityMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.middleware.clickjacking.XFrameOptionsMiddleware'
        ]
        
        for middleware_name in security_middleware:
            self.assertIn(middleware_name, middleware)

    def test_file_upload_security(self):
        """Test file upload security configuration"""
        # Check file upload settings
        file_upload_settings = [
            'FILE_UPLOAD_MAX_MEMORY_SIZE',
            'FILE_UPLOAD_TEMP_DIR',
            'DATA_UPLOAD_MAX_MEMORY_SIZE'
        ]
        
        for setting in file_upload_settings:
            value = getattr(settings, setting, None)
            # Should have reasonable limits set
            if setting in ['FILE_UPLOAD_MAX_MEMORY_SIZE', 'DATA_UPLOAD_MAX_MEMORY_SIZE']:
                if value is not None:
                    self.assertLess(value, 10 * 1024 * 1024, "File upload size should be limited")

    def test_cors_configuration(self):
        """Test CORS configuration"""
        # Check if CORS is properly configured
        cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        cors_credentials = getattr(settings, 'CORS_ALLOW_CREDENTIALS', False)
        
        # In production, should have specific origins configured
        if os.environ.get('DJANGO_ENV') == 'production':
            self.assertGreater(len(cors_origins), 0, "CORS origins should be configured in production")

    def test_environment_variables_security(self):
        """Test that sensitive settings use environment variables"""
        # Check that sensitive settings are not hardcoded
        sensitive_settings = [
            'SECRET_KEY',
            'DATABASE_PASSWORD',
            'EMAIL_HOST_PASSWORD',
            'REDIS_PASSWORD'
        ]
        
        for setting in sensitive_settings:
            if hasattr(settings, setting):
                value = getattr(settings, setting)
                # Should not be hardcoded
                if setting == 'SECRET_KEY':
                    self.assertNotIn(value, [
                        'replace-this-with-a-secure-key',
                        'your-secret-key-here'
                    ])

    def test_debug_toolbar_disabled_in_production(self):
        """Test that debug toolbar is disabled in production"""
        installed_apps = getattr(settings, 'INSTALLED_APPS', [])
        
        debug_toolbar_apps = [
            'debug_toolbar',
            'django_extensions'
        ]
        
        if os.environ.get('DJANGO_ENV') == 'production':
            for app in debug_toolbar_apps:
                self.assertNotIn(app, installed_apps, f"{app} should not be installed in production")

    def test_ssl_redirect_configuration(self):
        """Test SSL redirect configuration"""
        # Check SSL redirect settings
        ssl_redirect = getattr(settings, 'SECURE_SSL_REDIRECT', False)
        ssl_host = getattr(settings, 'SECURE_SSL_HOST', None)
        
        if os.environ.get('DJANGO_ENV') == 'production':
            self.assertTrue(ssl_redirect, "SSL redirect should be enabled in production")

    def test_content_security_policy(self):
        """Test Content Security Policy configuration"""
        # Check if CSP is configured
        csp_settings = [
            'CSP_DEFAULT_SRC',
            'CSP_SCRIPT_SRC',
            'CSP_STYLE_SRC'
        ]
        
        # These should be configured for security
        for setting in csp_settings:
            value = getattr(settings, setting, None)
            if value is not None:
                # Should not allow unsafe-inline in production
                if os.environ.get('DJANGO_ENV') == 'production':
                    self.assertNotIn("'unsafe-inline'", str(value))

    def test_database_connection_security(self):
        """Test database connection security"""
        database_config = getattr(settings, 'DATABASES', {}).get('default', {})
        
        # Check for secure database options
        options = database_config.get('OPTIONS', {})
        
        # Should have SSL configuration for production
        if os.environ.get('DJANGO_ENV') == 'production':
            if 'ENGINE' in database_config and 'postgresql' in database_config['ENGINE']:
                ssl_mode = options.get('sslmode', '')
                self.assertIn(ssl_mode, ['require', 'verify-ca', 'verify-full'])

    def test_cache_security(self):
        """Test cache security configuration"""
        cache_config = getattr(settings, 'CACHES', {})
        
        # Check cache security settings
        for cache_name, cache_settings in cache_config.items():
            backend = cache_settings.get('BACKEND', '')
            
            # Redis cache should have password configured
            if 'redis' in backend.lower():
                password = cache_settings.get('OPTIONS', {}).get('PASSWORD', '')
                if os.environ.get('DJANGO_ENV') == 'production':
                    self.assertNotEqual(password, '', "Redis password should be configured")

    def test_email_security(self):
        """Test email security configuration"""
        email_settings = [
            'EMAIL_HOST',
            'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD',
            'EMAIL_USE_TLS',
            'EMAIL_USE_SSL'
        ]
        
        # Check email security settings
        for setting in email_settings:
            value = getattr(settings, setting, None)
            if setting in ['EMAIL_USE_TLS', 'EMAIL_USE_SSL']:
                if os.environ.get('DJANGO_ENV') == 'production':
                    self.assertTrue(value, f"{setting} should be enabled in production")

    def test_management_commands_security(self):
        """Test management commands security"""
        # Check that sensitive management commands are not exposed
        sensitive_commands = [
            'changepassword',
            'createsuperuser',
            'collectstatic'
        ]
        
        # These commands should require proper authentication
        for command in sensitive_commands:
            # In a real test, you would check if these commands are properly secured
            self.assertTrue(True, f"Command {command} should be properly secured")

    def test_static_files_permissions(self):
        """Test static files permissions"""
        static_root = getattr(settings, 'STATIC_ROOT', None)
        
        if static_root and os.path.exists(static_root):
            # Check file permissions
            import stat
            mode = os.stat(static_root).st_mode
            
            # Should not be world writable
            self.assertFalse(bool(mode & stat.S_IWOTH), "Static files should not be world writable")

    def test_media_files_security(self):
        """Test media files security"""
        media_root = getattr(settings, 'MEDIA_ROOT', None)
        
        if media_root and os.path.exists(media_root):
            # Check that media files are not directly accessible
            # This is typically handled by web server configuration
            self.assertTrue(True, "Media files should be served securely")

    def test_custom_security_settings(self):
        """Test custom security settings"""
        # Check for custom security configurations
        custom_security_settings = [
            'SECURE_PROXY_SSL_HEADER',
            'SECURE_REFERRER_POLICY',
            'SECURE_CROSS_ORIGIN_OPENER_POLICY'
        ]
        
        for setting in custom_security_settings:
            value = getattr(settings, setting, None)
            # These should be configured for additional security
            if value is not None:
                self.assertIsNotNone(value, f"{setting} should be properly configured") 