// Manual test script for cart and wishlist functionality
// This script can be run in the browser console to test the functionality

export const manualCartTest = {
  // Test cart functionality
  testCart: async () => {
    console.log('🧪 Testing Cart Functionality...');
    
    try {
      // Test 1: Add item to cart
      console.log('1. Testing add to cart...');
      const addToCartButtons = document.querySelectorAll('button[data-testid="add-to-cart"]');
      if (addToCartButtons.length > 0) {
        addToCartButtons[0].click();
        console.log('✅ Add to cart button clicked');
      } else {
        console.log('❌ No add to cart buttons found');
      }

      // Test 2: Check cart count
      console.log('2. Checking cart count...');
      const cartCount = document.querySelector('[data-testid="cart-count"]');
      if (cartCount) {
        console.log(`✅ Cart count: ${cartCount.textContent}`);
      } else {
        console.log('❌ Cart count not found');
      }

      // Test 3: Open cart drawer
      console.log('3. Testing cart drawer...');
      const cartButton = document.querySelector('[data-testid="cart-button"]');
      if (cartButton) {
        cartButton.click();
        console.log('✅ Cart drawer opened');
      } else {
        console.log('❌ Cart button not found');
      }

      console.log('✅ Cart functionality test completed');
    } catch (error) {
      console.error('❌ Cart test failed:', error);
    }
  },

  // Test wishlist functionality
  testWishlist: async () => {
    console.log('🧪 Testing Wishlist Functionality...');
    
    try {
      // Test 1: Add item to wishlist
      console.log('1. Testing add to wishlist...');
      const addToWishlistButtons = document.querySelectorAll('button[data-testid="add-to-wishlist"]');
      if (addToWishlistButtons.length > 0) {
        addToWishlistButtons[0].click();
        console.log('✅ Add to wishlist button clicked');
      } else {
        console.log('❌ No add to wishlist buttons found');
      }

      // Test 2: Check wishlist count
      console.log('2. Checking wishlist count...');
      const wishlistCount = document.querySelector('[data-testid="wishlist-count"]');
      if (wishlistCount) {
        console.log(`✅ Wishlist count: ${wishlistCount.textContent}`);
      } else {
        console.log('❌ Wishlist count not found');
      }

      // Test 3: Navigate to wishlist page
      console.log('3. Testing wishlist page...');
      const wishlistLink = document.querySelector('a[href="/wishlist"]');
      if (wishlistLink) {
        wishlistLink.click();
        console.log('✅ Wishlist page navigated');
      } else {
        console.log('❌ Wishlist link not found');
      }

      console.log('✅ Wishlist functionality test completed');
    } catch (error) {
      console.error('❌ Wishlist test failed:', error);
    }
  },

  // Test authentication
  testAuth: async () => {
    console.log('🧪 Testing Authentication...');
    
    try {
      // Test 1: Check if user is logged in
      console.log('1. Checking user authentication...');
      const userMenu = document.querySelector('[data-testid="user-menu"]');
      if (userMenu) {
        console.log('✅ User is logged in');
      } else {
        console.log('❌ User is not logged in');
      }

      // Test 2: Test login/logout
      console.log('2. Testing login/logout...');
      const loginButton = document.querySelector('a[href="/login"]');
      const logoutButton = document.querySelector('[data-testid="logout-button"]');
      
      if (loginButton) {
        console.log('✅ Login button found');
      }
      if (logoutButton) {
        console.log('✅ Logout button found');
      }

      console.log('✅ Authentication test completed');
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
    }
  },

  // Test variant selection
  testVariants: async () => {
    console.log('🧪 Testing Variant Selection...');
    
    try {
      // Test 1: Find rice products
      console.log('1. Testing rice variants...');
      const riceProducts = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes('Rice')
      );
      
      if (riceProducts.length > 0) {
        console.log(`✅ Found ${riceProducts.length} rice products`);
        
        // Try to add rice to cart
        const riceAddButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent?.includes('Add to Cart') && 
          btn.closest('[data-testid*="rice"]')
        );
        
        if (riceAddButtons.length > 0) {
          riceAddButtons[0].click();
          console.log('✅ Rice add to cart clicked');
          
          // Check for variant selector
          setTimeout(() => {
            const variantSelector = document.querySelector('[data-testid="variant-selector"]');
            if (variantSelector) {
              console.log('✅ Variant selector appeared');
            } else {
              console.log('❌ Variant selector not found');
            }
          }, 1000);
        }
      } else {
        console.log('❌ No rice products found');
      }

      // Test 2: Find dhoopbatti products
      console.log('2. Testing dhoopbatti variants...');
      const dhoopbattiProducts = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes('Dhoopbatti')
      );
      
      if (dhoopbattiProducts.length > 0) {
        console.log(`✅ Found ${dhoopbattiProducts.length} dhoopbatti products`);
      } else {
        console.log('❌ No dhoopbatti products found');
      }

      console.log('✅ Variant selection test completed');
    } catch (error) {
      console.error('❌ Variant test failed:', error);
    }
  },

  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Starting Manual Cart and Wishlist Tests...');
    console.log('==========================================');
    
    await manualCartTest.testAuth();
    console.log('---');
    await manualCartTest.testCart();
    console.log('---');
    await manualCartTest.testWishlist();
    console.log('---');
    await manualCartTest.testVariants();
    console.log('---');
    
    console.log('✅ All manual tests completed!');
    console.log('Check the console for any errors or issues.');
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).manualCartTest = manualCartTest;
  console.log('Manual cart test loaded. Run manualCartTest.runAllTests() to start testing.');
} 