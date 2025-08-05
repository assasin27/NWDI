// Test script for clear cart and wishlist functionality
// Run this in the browser console

console.log('🧪 Testing Clear Cart and Wishlist Functionality');

// Test 1: Check if clear cart button exists
function testClearCartButton() {
  console.log('1. Testing Clear Cart Button...');
  
  // Check if we're on cart page
  const cartDrawer = document.querySelector('[data-testid="cart-drawer"]') || 
                    document.querySelector('.fixed.inset-0.z-50');
  
  if (cartDrawer) {
    const clearButton = document.querySelector('button[onclick*="clear"]') || 
                       document.querySelector('button:has-text("Clear")');
    
    if (clearButton) {
      console.log('✅ Clear cart button found');
      console.log('📋 Button text:', clearButton.textContent);
      console.log('📋 Button disabled:', clearButton.disabled);
    } else {
      console.log('❌ Clear cart button not found');
    }
  } else {
    console.log('❌ Cart drawer not found - navigate to cart page first');
  }
}

// Test 2: Check if clear wishlist button exists
function testClearWishlistButton() {
  console.log('2. Testing Clear Wishlist Button...');
  
  // Check if we're on wishlist page
  const wishlistTitle = document.querySelector('h1:has-text("My Wishlist")');
  
  if (wishlistTitle) {
    const clearButton = document.querySelector('button:has-text("Clear Wishlist")');
    
    if (clearButton) {
      console.log('✅ Clear wishlist button found');
      console.log('📋 Button text:', clearButton.textContent);
      console.log('📋 Button disabled:', clearButton.disabled);
    } else {
      console.log('❌ Clear wishlist button not found');
    }
  } else {
    console.log('❌ Wishlist page not found - navigate to /wishlist first');
  }
}

// Test 3: Check cart and wishlist items count
function testItemCounts() {
  console.log('3. Testing Item Counts...');
  
  // Check cart items
  const cartItems = document.querySelectorAll('[data-testid*="cart-item"]') ||
                   document.querySelectorAll('.card[class*="border-green"]');
  console.log('📦 Cart items count:', cartItems.length);
  
  // Check wishlist items
  const wishlistItems = document.querySelectorAll('[data-testid*="wishlist-item"]') ||
                       document.querySelectorAll('.grid.grid-cols-1 .card');
  console.log('❤️ Wishlist items count:', wishlistItems.length);
}

// Test 4: Simulate clear functionality
function testClearFunctionality() {
  console.log('4. Testing Clear Functionality...');
  
  // Test clear cart
  const clearCartButton = document.querySelector('button:has-text("Clear")');
  if (clearCartButton && !clearCartButton.disabled) {
    console.log('✅ Clear cart button is clickable');
    console.log('💡 Click the clear cart button to test');
  }
  
  // Test clear wishlist
  const clearWishlistButton = document.querySelector('button:has-text("Clear Wishlist")');
  if (clearWishlistButton && !clearWishlistButton.disabled) {
    console.log('✅ Clear wishlist button is clickable');
    console.log('💡 Click the clear wishlist button to test');
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Clear Cart and Wishlist Tests...');
  console.log('==========================================');
  
  testClearCartButton();
  console.log('---');
  testClearWishlistButton();
  console.log('---');
  testItemCounts();
  console.log('---');
  testClearFunctionality();
  console.log('---');
  
  console.log('✅ All clear functionality tests completed!');
  console.log('📝 Manual testing instructions:');
  console.log('1. Add items to cart and wishlist');
  console.log('2. Click "Clear" button in cart to empty cart');
  console.log('3. Click "Clear Wishlist" button to empty wishlist');
  console.log('4. Verify items are removed and success notifications appear');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testClearFunctionality = {
    testClearCartButton,
    testClearWishlistButton,
    testItemCounts,
    testClearFunctionality,
    runAllTests
  };
  
  console.log('🧪 Clear functionality test loaded. Run testClearFunctionality.runAllTests() to start testing.');
} 