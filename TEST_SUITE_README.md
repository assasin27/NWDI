# Comprehensive Test Suite for Farm Fresh E-commerce Application

## Overview

This comprehensive test suite covers all aspects of the Farm Fresh E-commerce application, including frontend components, backend APIs, custom hooks, services, and integration flows. The test suite is designed to ensure robust functionality, maintain code quality, and provide confidence in the application's reliability across all user scenarios.

## 🎯 Test Coverage

### Frontend Components (95%+ coverage target)
- **ProductsSection.tsx**: Main product listing with search, filtering, cart/wishlist functionality
- **ProductCard.tsx**: Individual product display with add to cart/wishlist actions
- **VariantSelector.tsx**: Modal for selecting product variants (rice grains, dhoopbatti fragrances)
- **CartDrawer.tsx**: Shopping cart sidebar component
- **NavBar.tsx**: Navigation with cart/wishlist indicators

### Custom Hooks (95%+ coverage target)
- **useCart.tsx**: Cart state management with Supabase integration
- **useWishlist.tsx**: Wishlist state management with Supabase integration
- **use-mobile.tsx**: Mobile responsiveness hook
- **use-toast.ts**: Toast notification system

### Services (95%+ coverage target)
- **cartService.ts**: Cart CRUD operations with Supabase
- **wishlistService.ts**: Wishlist CRUD operations with Supabase
- **productService.ts**: Product management and operations
- **orderService.ts**: Order processing and management
- **emailService.ts**: Email notifications

### Backend APIs (95%+ coverage target)
- **Cart API**: CRUD operations for shopping cart
- **Wishlist API**: CRUD operations for wishlist
- **Product API**: Product management endpoints
- **Order API**: Order processing endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Python (v3.9 or higher)
- pip

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd T-ER
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements-test.txt
   cd ..
   ```

### Running Tests

#### Option 1: Using the Comprehensive Test Runner (Recommended)

```bash
# Run all tests
.\run-comprehensive-tests.ps1

# Run specific test types
.\run-comprehensive-tests.ps1 -TestType frontend
.\run-comprehensive-tests.ps1 -TestType backend
.\run-comprehensive-tests.ps1 -TestType integration
.\run-comprehensive-tests.ps1 -TestType performance

# Run with coverage
.\run-comprehensive-tests.ps1 -Coverage

# Run with verbose output
.\run-comprehensive-tests.ps1 -Verbose

# Generate test report
.\run-comprehensive-tests.ps1 -GenerateReport
```

#### Option 2: Using Individual Commands

```bash
# Frontend tests
npm test

# Frontend tests with coverage
npm test -- --coverage

# Backend tests
cd backend && python -m pytest

# Backend tests with coverage
cd backend && python -m pytest --cov

# Specific test files
npm test -- ProductsSection.test.tsx
npm test -- useCart.test.tsx
cd backend && python -m pytest tests/test_cart_api.py
```

## 📋 Test Categories

### 1. Unit Tests
- **Component Tests**: Test individual React components in isolation
- **Hook Tests**: Test custom React hooks
- **Service Tests**: Test service layer functions
- **Utility Tests**: Test helper functions and utilities

### 2. Integration Tests
- **User Flow Tests**: End-to-end user scenarios
- **API Integration Tests**: Frontend-backend integration
- **Database Integration Tests**: Data persistence and retrieval

### 3. Performance Tests
- **Load Testing**: Large dataset handling
- **Concurrent Operations**: Race condition testing
- **Memory Usage**: Memory leak detection

### 4. Accessibility Tests
- **ARIA Compliance**: Screen reader compatibility
- **Keyboard Navigation**: Keyboard-only usage
- **Focus Management**: Proper focus indicators

## 🧪 Test Structure

### Frontend Test Files
```
src/__tests__/
├── components/
│   ├── ProductsSection.test.tsx
│   ├── ProductCard.test.tsx
│   ├── VariantSelector.test.tsx
│   ├── CartDrawer.test.tsx
│   └── NavBar.test.tsx
├── hooks/
│   ├── useCart.test.tsx
│   ├── useWishlist.test.tsx
│   ├── use-mobile.test.tsx
│   └── use-toast.test.tsx
├── lib/
│   ├── cartService.test.ts
│   ├── wishlistService.test.ts
│   ├── productService.test.ts
│   ├── orderService.test.ts
│   └── emailService.test.ts
└── integration/
    ├── user-flows.test.tsx
    └── database.test.ts
```

### Backend Test Files
```
backend/tests/
├── test_cart_api_comprehensive.py
├── test_wishlist_api_comprehensive.py
├── test_product_api.py
├── test_order_api.py
└── test_integration.py
```

## 📊 Test Coverage Goals

| Category | Target Coverage | Current Coverage |
|----------|----------------|------------------|
| Frontend Components | 95%+ | TBD |
| Custom Hooks | 95%+ | TBD |
| Services | 95%+ | TBD |
| Backend APIs | 95%+ | TBD |
| Integration Tests | 90%+ | TBD |
| Performance Tests | 85%+ | TBD |

## 🔍 Test Scenarios Covered

### Frontend Component Tests
- **Rendering**: Component displays correctly
- **User Interactions**: Button clicks, form submissions
- **State Management**: Component state changes
- **Props Validation**: Component prop handling
- **Error Handling**: Error state management
- **Accessibility**: ARIA labels, keyboard navigation
- **Edge Cases**: Missing data, invalid inputs

### Hook Tests
- **State Management**: Hook state changes
- **Side Effects**: useEffect cleanup
- **Error Handling**: Error state management
- **Performance**: Hook optimization
- **Integration**: Hook with external services

### Service Tests
- **CRUD Operations**: Create, read, update, delete
- **Error Handling**: Network errors, validation errors
- **Data Validation**: Input validation
- **Performance**: Large dataset handling
- **Security**: Authentication, authorization

### Integration Tests
- **User Flows**: Complete user journeys
- **API Integration**: Frontend-backend communication
- **Database Operations**: Data persistence
- **Authentication**: Login/logout flows
- **Error Scenarios**: Network failures, timeouts

## 🛠️ Test Configuration

### Jest Configuration (Frontend)
```javascript
// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
```

### Pytest Configuration (Backend)
```ini
# pytest.ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = farmfresh_backend.settings
python_files = tests.py test_*.py *_tests.py
addopts = --strict-markers --disable-warnings
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
```

## 📈 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - run: npm run lint
  
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: cd backend && pip install -r requirements-test.txt
      - run: cd backend && python -m pytest --cov
```

## 🔧 Test Maintenance

### Regular Tasks
1. **Weekly**: Review test coverage reports
2. **Bi-weekly**: Update test data and mocks
3. **Monthly**: Review and update integration tests
4. **Quarterly**: Performance test review

### When Adding New Features
1. Create unit tests for new components
2. Create integration tests for new user flows
3. Update existing tests if interfaces change
4. Add performance tests for new features
5. Update documentation

## 🐛 Troubleshooting

### Common Issues

#### Frontend Tests
```bash
# Tests not running
npm install
npm test

# Coverage not generating
npm test -- --coverage --watchAll=false

# Specific test failing
npm test -- --verbose ProductsSection.test.tsx
```

#### Backend Tests
```bash
# Tests not running
cd backend
pip install -r requirements-test.txt
python -m pytest

# Coverage not generating
python -m pytest --cov --cov-report=html

# Specific test failing
python -m pytest tests/test_cart_api.py -v
```

#### Database Issues
```bash
# Reset test database
cd backend
python manage.py flush
python manage.py migrate
```

### Debug Mode
```bash
# Frontend debug
npm test -- --verbose --no-coverage

# Backend debug
cd backend && python -m pytest -v -s
```

## 📚 Test Documentation

### Writing New Tests

#### Frontend Component Test Template
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    // Define default props
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const mockHandler = jest.fn();
    render(<ComponentName {...defaultProps} onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

#### Backend API Test Template
```python
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestAPIEndpoint:
    def test_endpoint_functionality(self, api_client):
        url = reverse('endpoint-name')
        data = {'key': 'value'}
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['key'] == 'value'
```

## 🎯 Best Practices

### Test Organization
1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** and isolated
5. **Use meaningful assertions** with clear error messages

### Test Data Management
1. **Use factories** for creating test data
2. **Clean up after tests** to avoid state pollution
3. **Mock external dependencies** to isolate units
4. **Use realistic test data** that represents real scenarios

### Performance Considerations
1. **Run tests in parallel** when possible
2. **Use efficient mocks** to avoid slow operations
3. **Limit test data size** to reasonable amounts
4. **Cache expensive operations** in test setup

## 📞 Support

### Getting Help
- **Test Issues**: Check the troubleshooting section above
- **Coverage Issues**: Review the coverage goals and thresholds
- **Performance Issues**: Use the performance test suite
- **Integration Issues**: Check the integration test documentation

### Contributing
1. **Write tests** for new features
2. **Update existing tests** when changing functionality
3. **Maintain test coverage** above the specified thresholds
4. **Follow the test patterns** established in the codebase

## 📄 License

This test suite is part of the Farm Fresh E-commerce application and follows the same license terms as the main project.

---

**Note**: This test suite is designed to be comprehensive and maintainable. Regular updates and improvements are encouraged to keep it aligned with the evolving application requirements. 