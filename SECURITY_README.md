# Security Test Suite README

## Overview

This security test suite provides comprehensive vulnerability testing for the Farm Fresh Goods application to ensure it can be deployed with lower risk of security breaches. The tests cover frontend, backend, configuration, and integration security aspects.

## 🔒 Security Vulnerabilities Tested

### 1. Configuration Security
- **Hardcoded Secrets**: Tests for exposed API keys, passwords, and tokens
- **DEBUG Mode**: Ensures DEBUG is disabled in production
- **Security Headers**: Validates proper security header configuration
- **HTTPS Enforcement**: Checks for SSL/TLS configuration
- **Database Security**: Validates secure database configuration

### 2. Authentication & Authorization
- **JWT Token Security**: Tests token validation, expiration, and tampering
- **Password Security**: Validates password strength and brute force protection
- **Session Security**: Tests session fixation and hijacking prevention
- **Authorization Bypass**: Prevents unauthorized access to resources

### 3. Input Validation & Sanitization
- **XSS Prevention**: Tests for Cross-Site Scripting vulnerabilities
- **SQL Injection**: Validates database query security
- **CSRF Protection**: Tests Cross-Site Request Forgery prevention
- **File Upload Security**: Validates secure file upload handling

### 4. API Security
- **Rate Limiting**: Tests API endpoint protection
- **Input Validation**: Validates request payload security
- **Error Handling**: Ensures sensitive information is not exposed
- **CORS Configuration**: Tests cross-origin request handling

### 5. Frontend Security
- **Client-Side Security**: Tests for exposed credentials
- **XSS in React**: Validates component security
- **DOM Security**: Tests for DOM-based vulnerabilities
- **Content Security Policy**: Validates CSP configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm
- pip

### Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r backend/requirements.txt

# Install security testing tools
npm install --save-dev eslint-plugin-security
pip install bandit safety
```

### Running Security Tests

#### Option 1: Using PowerShell Script (Recommended)
```powershell
# Run all security tests
.\run-security-tests.ps1

# Run specific categories
.\run-security-tests.ps1 -Category Frontend
.\run-security-tests.ps1 -Category Backend
.\run-security-tests.ps1 -Category Config
.\run-security-tests.ps1 -Category Integration
.\run-security-tests.ps1 -Category Dependencies

# Generate HTML report
.\run-security-tests.ps1 -GenerateReport

# Install dependencies and run tests
.\run-security-tests.ps1 -CheckDependencies
```

#### Option 2: Using npm Scripts
```bash
# Run all security tests
npm run test:security

# Run specific security test categories
npm run test:security:frontend
npm run test:security:backend
npm run test:security:config
npm run test:security:integration

# Run security audit
npm run security:audit

# Run comprehensive security scan
npm run security:scan
```

#### Option 3: Using Python/Django
```bash
# Run backend security tests
python backend/manage.py test backend.tests.security

# Run specific backend security tests
python backend/manage.py test backend.tests.security.api-security
python backend/manage.py test backend.tests.security.config-security
```

## 📋 Test Categories

### Frontend Security Tests (`src/__tests__/security/`)
- **`frontend-security.test.tsx`**: Comprehensive frontend security tests
- **`xss-vulnerability.test.tsx`**: XSS vulnerability testing
- **`authentication-security.test.tsx`**: Authentication security tests

### Backend Security Tests (`backend/tests/security/`)
- **`api-security.test.py`**: API security and authentication tests
- **`authentication-security.test.py`**: Authentication and authorization tests
- **`input-validation.test.py`**: Input validation and sanitization tests

### Configuration Security Tests (`backend/tests/security/`)
- **`config-security.test.py`**: Django settings and configuration security
- **`database-security.test.py`**: Database security configuration tests

### Integration Security Tests
- **`integration-security.test.tsx`**: End-to-end security testing
- **`integration-security.test.py`**: Backend integration security tests

## 🔍 Security Test Details

### Frontend Security Tests

#### Authentication Security
```typescript
// Tests for exposed credentials
it('should not expose sensitive credentials in client-side code', () => {
  // Checks for hardcoded API keys
  // Validates environment variable usage
  // Tests for exposed secrets
});

// Tests for input validation
it('should validate login input to prevent injection attacks', () => {
  // Tests XSS injection attempts
  // Validates SQL injection prevention
  // Checks input sanitization
});
```

#### XSS Prevention
```typescript
// Tests for XSS vulnerabilities
it('should prevent XSS in product descriptions', () => {
  // Tests stored XSS
  // Validates script tag filtering
  // Checks DOM-based XSS
});
```

#### Client-Side Security
```typescript
// Tests for localStorage security
it('should not store sensitive data in localStorage', () => {
  // Validates secure storage practices
  // Tests for credential exposure
  // Checks session security
});
```

### Backend Security Tests

#### API Security
```python
# Tests for authentication requirements
def test_authentication_required_for_protected_endpoints(self):
    # Validates protected endpoint security
    # Tests unauthorized access prevention
    # Checks authentication bypass attempts

# Tests for SQL injection prevention
def test_sql_injection_prevention(self):
    # Tests malicious SQL inputs
    # Validates query parameterization
    # Checks ORM security
```

#### Configuration Security
```python
# Tests for hardcoded secrets
def test_secret_key_not_hardcoded(self):
    # Validates environment variable usage
    # Tests for default secret keys
    # Checks secret key strength

# Tests for DEBUG mode
def test_debug_mode_disabled_in_production(self):
    # Ensures DEBUG is False in production
    # Validates error message security
    # Checks information disclosure
```

## 📊 Interpreting Results

### Test Status Codes
- **✅ PASS**: Security test passed - no vulnerabilities detected
- **❌ FAIL**: Security vulnerability detected - immediate attention required
- **⚠️ ERROR**: Test execution error - investigation needed

### Security Risk Levels
- **🔴 HIGH**: Critical security vulnerability (immediate fix required)
- **🟡 MEDIUM**: Moderate security risk (fix within 24-48 hours)
- **🟢 LOW**: Minor security concern (fix within 1 week)

### Common Security Issues

#### High Priority Issues
1. **Hardcoded Secrets**: API keys, passwords, or tokens in code
2. **DEBUG Mode in Production**: Information disclosure vulnerability
3. **SQL Injection**: Database security compromise
4. **XSS Vulnerabilities**: Client-side code execution
5. **Authentication Bypass**: Unauthorized access to resources

#### Medium Priority Issues
1. **Missing Security Headers**: CSP, HSTS, X-Frame-Options
2. **Weak Password Policies**: Insufficient password requirements
3. **CORS Misconfiguration**: Cross-origin request vulnerabilities
4. **Rate Limiting**: Brute force attack prevention
5. **File Upload Security**: Malicious file upload prevention

#### Low Priority Issues
1. **Information Disclosure**: Error message details
2. **Outdated Dependencies**: Known vulnerability packages
3. **Missing HTTPS**: SSL/TLS configuration
4. **Session Security**: Session management issues

## 🛠️ Remediation Guide

### Immediate Fixes (High Priority)

#### 1. Remove Hardcoded Secrets
```typescript
// ❌ BAD - Hardcoded API key
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✅ GOOD - Environment variable
const API_KEY = process.env.REACT_APP_API_KEY;
```

#### 2. Disable DEBUG in Production
```python
# ❌ BAD - DEBUG enabled in production
DEBUG = True

# ✅ GOOD - Environment-based DEBUG
DEBUG = os.environ.get('DJANGO_ENV') != 'production'
```

#### 3. Implement Input Validation
```typescript
// ❌ BAD - No input validation
const handleSubmit = (data) => {
  // Process data without validation
};

// ✅ GOOD - Input validation
const handleSubmit = (data) => {
  const sanitizedData = sanitizeInput(data);
  if (!validateInput(sanitizedData)) {
    throw new Error('Invalid input');
  }
  // Process validated data
};
```

### Security Headers Configuration
```python
# Django security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Rate Limiting Implementation
```python
# Django REST Framework rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

## 🔄 Continuous Security

### Pre-deployment Security Checks
```bash
# Run security tests before deployment
npm run security:scan
.\run-security-tests.ps1 -Category All -GenerateReport
```

### CI/CD Integration
```yaml
# GitHub Actions security workflow
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Security Tests
        run: |
          npm install
          npm run security:scan
          .\run-security-tests.ps1 -Category All
```

### Regular Security Audits
```bash
# Weekly security audit
npm audit
npm audit --audit-level=moderate
pip install safety
safety check
```

## 📚 Additional Resources

### Security Testing Tools
- **ESLint Security Plugin**: `eslint-plugin-security`
- **Bandit**: Python security linter
- **Safety**: Python dependency vulnerability scanner
- **npm audit**: Node.js dependency vulnerability scanner

### Security Standards
- **OWASP Top 10**: Web application security risks
- **CWE**: Common Weakness Enumeration
- **NIST Cybersecurity Framework**: Security best practices

### Security Headers
- **Content Security Policy (CSP)**: XSS prevention
- **HTTP Strict Transport Security (HSTS)**: HTTPS enforcement
- **X-Frame-Options**: Clickjacking prevention
- **X-Content-Type-Options**: MIME type sniffing prevention

## 🆘 Troubleshooting

### Common Issues

#### 1. Tests Failing Due to Missing Dependencies
```bash
# Install missing dependencies
npm install --save-dev @types/jest jest
pip install django djangorestframework pytest
```

#### 2. Environment Variable Issues
```bash
# Set required environment variables
export REACT_APP_API_KEY=your_api_key
export DJANGO_SECRET_KEY=your_secret_key
export DJANGO_ENV=production
```

#### 3. Database Connection Issues
```bash
# Run Django migrations
python backend/manage.py migrate

# Create test database
python backend/manage.py test --keepdb
```

### Getting Help
1. Check the test output for specific error messages
2. Review the security test documentation
3. Consult the OWASP security guidelines
4. Run tests in verbose mode for detailed output

## 📝 Security Test Maintenance

### Regular Updates
- Update security test dependencies monthly
- Review and update test cases quarterly
- Monitor for new security vulnerabilities
- Update security policies annually

### Test Coverage
- Maintain 90%+ security test coverage
- Add tests for new features
- Update tests for security policy changes
- Remove obsolete security tests

This security test suite ensures your application is protected against common vulnerabilities and can be deployed with confidence. 