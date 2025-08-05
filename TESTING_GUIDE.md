# 🧪 Comprehensive Testing Guide for FarmFresh

## 📋 Overview

This guide provides comprehensive instructions for testing the FarmFresh application. We follow a multi-layered testing approach to ensure code quality and reliability.

## 🏗️ Testing Architecture

### **1. Unit Tests** (`src/__tests__/`)
- **Purpose**: Test individual components and functions in isolation
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, Hooks, Services, Utilities

### **2. Integration Tests** (`src/__tests__/integration/`)
- **Purpose**: Test component interactions and user workflows
- **Framework**: Jest + React Testing Library
- **Coverage**: Complete user journeys, data flow, error handling

### **3. Manual Test Scripts** (`src/test/`)
- **Purpose**: Browser console tests for quick verification
- **Framework**: Vanilla JavaScript
- **Usage**: Copy to browser console for immediate testing

### **4. Test Runner** (`src/test/test-runner.js`)
- **Purpose**: Comprehensive test orchestration
- **Features**: Multiple test categories, performance testing, accessibility testing

## 🚀 Quick Start

### **Run All Tests**
```bash
npm test
```

### **Run Specific Test Categories**
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Clear functionality tests only
npm run test:clear-functionality

# Cart and wishlist tests only
npm run test:cart-wishlist

# Quick test (most important)
npm run test:quick
```

### **Run with Coverage**
```bash
npm run test:coverage
```

### **Run Manual Tests**
```bash
npm run test:manual
```

## 📝 Test Categories

### **Unit Tests**
```bash
# Test components
npm run test:components

# Test hooks
npm run test:hooks

# Test services
npm run test:services
```

### **Integration Tests**
```bash
# Test complete workflows
npm run test:integration

# Test specific features
npm run test:clear-functionality
npm run test:cart-wishlist
```

### **Manual Tests**
1. Open browser console
2. Copy content from `src/test/test-runner.js`
3. Run `runAllTests()` or specific test functions

## 🧪 Test Examples

### **Clear Cart/Wishlist Functionality**

#### **Unit Tests**
```typescript
// src/__tests__/components/ClearCartWishlist.test.tsx
describe('Clear Cart and Wishlist Functionality', () => {
  it('should render clear cart button when cart has items', async () => {
    // Test implementation
  });

  it('should call clearCart when clear button is clicked', async () => {
    // Test implementation
  });
});
```

#### **Integration Tests**
```typescript
// src/__tests__/integration/clear-functionality-integration.test.tsx
describe('Complete Cart Clear Workflow', () => {
  it('should complete full cart clear workflow', async () => {
    // Complete user journey test
  });
});
```

#### **Manual Tests**
```javascript
// Browser console
runClearTests(); // Run clear functionality tests
runAllTests();   // Run all test categories
```

## 🎯 Testing Checklist

### **For Every New Feature:**

#### **Before Implementation**
- [ ] Define test scenarios
- [ ] Plan unit test structure
- [ ] Plan integration test structure
- [ ] Create manual test script outline

#### **During Implementation**
- [ ] Write unit tests alongside code
- [ ] Test edge cases and error scenarios
- [ ] Verify component behavior
- [ ] Test user interactions

#### **After Implementation**
- [ ] Run all existing tests
- [ ] Create integration tests
- [ ] Create manual test scripts
- [ ] Update test documentation
- [ ] Verify test coverage

## 📊 Test Coverage Goals

### **Minimum Coverage Requirements**
- **Components**: 90%+ coverage
- **Hooks**: 95%+ coverage
- **Services**: 85%+ coverage
- **Integration**: 80%+ coverage

### **Coverage Metrics**
- **Lines**: Percentage of code lines executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches taken
- **Statements**: Percentage of statements executed

## 🛠️ Test Commands Reference

### **Basic Commands**
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test:verbose       # Run tests with verbose output
```

### **Specific Test Categories**
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:components    # Component tests only
npm run test:hooks         # Hook tests only
npm run test:services      # Service tests only
```

### **Feature-Specific Tests**
```bash
npm run test:clear-functionality  # Clear cart/wishlist tests
npm run test:cart-wishlist        # Cart and wishlist tests
npm run test:security             # Security tests
```

### **Advanced Commands**
```bash
npm run test:quick        # Quick test run (most important tests)
npm run test:debug        # Debug mode with open handles detection
npm run test:update       # Update snapshots
npm run test:ci          # CI/CD mode
npm run test:all         # Run all test categories
```

## 🧪 Manual Testing Guide

### **Browser Console Testing**

#### **Load Test Runner**
1. Open browser console (F12)
2. Copy content from `src/test/test-runner.js`
3. Press Enter

#### **Available Commands**
```javascript
// Run all tests
runAllTests()

// Run specific test categories
TestRunner.runUnitTests()
TestRunner.runIntegrationTests()
TestRunner.runClearFunctionalityTests()
TestRunner.runPerformanceTests()
TestRunner.runAccessibilityTests()

// Generate test report
generateReport()
```

#### **Clear Functionality Testing**
```javascript
// Test clear cart and wishlist buttons
runClearTests()

// Check if buttons exist and are functional
TestRunner.runClearFunctionalityTests()
```

### **Manual Test Scenarios**

#### **Clear Cart Testing**
1. Add items to cart
2. Open cart drawer
3. Verify "Clear" button appears
4. Click "Clear" button
5. Verify success notification
6. Verify cart is empty

#### **Clear Wishlist Testing**
1. Add items to wishlist
2. Navigate to wishlist page
3. Verify "Clear Wishlist" button appears
4. Click "Clear Wishlist" button
5. Verify success notification
6. Verify wishlist is empty

## 🔍 Debugging Tests

### **Common Issues**

#### **Test Not Found**
```bash
# Check if test file exists
ls src/__tests__/

# Run specific test file
npm test -- --testPathPattern="ClearCartWishlist"
```

#### **Mock Issues**
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm run test:verbose
```

#### **Coverage Issues**
```bash
# Generate detailed coverage report
npm run test:coverage

# Check coverage thresholds
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

### **Debug Mode**
```bash
# Run tests with debugging
npm run test:debug

# Run specific test with debugging
npm test -- --testPathPattern="ClearCartWishlist" --detectOpenHandles
```

## 📈 Performance Testing

### **Manual Performance Tests**
```javascript
// Run performance tests in browser console
TestRunner.runPerformanceTests()

// Check memory usage
console.log('Memory usage:', performance.memory)

// Check page load time
console.log('Load time:', performance.now())
```

### **Automated Performance Tests**
```bash
# Run tests with performance monitoring
npm test -- --verbose --detectOpenHandles
```

## ♿ Accessibility Testing

### **Manual Accessibility Tests**
```javascript
// Run accessibility tests in browser console
TestRunner.runAccessibilityTests()

// Check button accessibility
const buttons = document.querySelectorAll('button')
buttons.forEach(button => {
  console.log('Button:', button.textContent, 'Accessible:', !!button.getAttribute('aria-label'))
})
```

### **Automated Accessibility Tests**
```bash
# Run tests with accessibility checks
npm test -- --testPathPattern="accessibility"
```

## 🚨 Error Handling Testing

### **Manual Error Tests**
```javascript
// Run error handling tests
TestRunner.runErrorHandlingTests()

// Simulate network errors
// Simulate authentication errors
// Simulate database errors
```

### **Automated Error Tests**
```bash
# Run error handling tests
npm test -- --testPathPattern="error"
```

## 📋 Test Maintenance

### **Regular Tasks**
- [ ] Update tests when features change
- [ ] Add tests for new features
- [ ] Remove obsolete tests
- [ ] Update test documentation
- [ ] Monitor test coverage

### **Test Review Checklist**
- [ ] All new features have tests
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Performance is acceptable
- [ ] Accessibility is verified

## 🎯 Best Practices

### **Test Writing**
1. **Write tests first** (TDD approach)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests simple and focused**
5. **Mock external dependencies**

### **Test Organization**
1. **Group related tests**
2. **Use consistent naming**
3. **Separate unit and integration tests**
4. **Maintain test data separately**

### **Test Maintenance**
1. **Update tests with code changes**
2. **Remove obsolete tests**
3. **Keep test data current**
4. **Monitor test performance**

## 📚 Additional Resources

### **Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Strategy Guide](TESTING_STRATEGY.md)

### **Test Files**
- `src/__tests__/components/ClearCartWishlist.test.tsx` - Unit tests for clear functionality
- `src/__tests__/integration/clear-functionality-integration.test.tsx` - Integration tests
- `src/test/test-runner.js` - Manual test runner
- `src/test/clear-cart-wishlist-test.js` - Manual clear functionality tests

### **Configuration Files**
- `jest.config.js` - Jest configuration
- `package.json` - Test scripts
- `tsconfig.test.json` - TypeScript test configuration

---

**Remember**: Good tests are documentation, design tools, and confidence builders. Every test makes the codebase more maintainable and reliable. 