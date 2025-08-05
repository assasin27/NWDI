# Cart and Wishlist Debugging Guide

## 🚀 Quick Test Instructions

### 1. **Start the Development Server**
```bash
npm run dev
```

### 2. **Open Browser Console**
- Press `F12` to open developer tools
- Go to the `Console` tab

### 3. **Run Manual Tests**
Copy and paste this into the browser console:

```javascript
// Load the manual test script
fetch('/src/test/manual-cart-test.ts')
  .then(response => response.text())
  .then(code => {
    eval(code);
    manualCartTest.runAllTests();
  })
  .catch(() => {
    console.log('Manual test script not found. Running basic tests...');
    
    // Basic manual tests
    console.log('🧪 Basic Cart and Wishlist Tests');
    
    // Test 1: Check if user is logged in
    const userMenu = document.querySelector('[data-testid="user-menu"]');
    console.log('User logged in:', !!userMenu);
    
    // Test 2: Try to add item to cart
    const addToCartButtons = document.querySelectorAll('button[data-testid="add-to-cart"]');
    console.log('Add to cart buttons found:', addToCartButtons.length);
    
    if (addToCartButtons.length > 0) {
      addToCartButtons[0].click();
      console.log('✅ Clicked add to cart button');
    }
    
    // Test 3: Check cart count
    setTimeout(() => {
      const cartCount = document.querySelector('[data-testid="cart-count"]');
      console.log('Cart count:', cartCount ? cartCount.textContent : 'Not found');
    }, 1000);
  });
```

## 🔍 **Step-by-Step Manual Testing**

### **Test 1: User Authentication**
1. **Check if user is logged in**
   - Look for user menu in navbar
   - If not logged in, you'll see "Login" button
   - If logged in, you'll see user email/profile

2. **Test login flow**
   - Click "Login" button
   - Enter credentials
   - Verify you're logged in

### **Test 2: Add to Cart**
1. **Find a product**
   - Look for "Add to Cart" buttons
   - Click on any product's "Add to Cart" button

2. **Check for success**
   - Should see "Item added to cart!" notification
   - Cart count in navbar should increase
   - No error messages in console

3. **Test cart drawer**
   - Click cart icon in navbar
   - Should see items in cart
   - Should be able to remove items

### **Test 3: Add to Wishlist**
1. **Find a product**
   - Look for "Add to Wishlist" buttons
   - Click on any product's "Add to Wishlist" button

2. **Check for success**
   - Should see "Item added to wishlist!" notification
   - No error messages in console

3. **Test wishlist page**
   - Navigate to `/wishlist` page
   - Should see items in wishlist
   - Should be able to remove items

### **Test 4: Variant Selection (Rice/Dhoopbatti)**
1. **Find rice products**
   - Look for products with "Rice" in the name
   - Click "Add to Cart" on a rice product

2. **Check variant selector**
   - Should see a dropdown with rice varieties
   - Select a variety (e.g., "Indrayani Full")
   - Click "Add to Cart"

3. **Find dhoopbatti products**
   - Look for products with "Dhoopbatti" in the name
   - Click "Add to Cart" on a dhoopbatti product

4. **Check fragrance selector**
   - Should see a dropdown with fragrances
   - Select a fragrance (e.g., "Sandalwood")
   - Click "Add to Cart"

### **Test 5: Cart/Wishlist Persistence**
1. **Add items to cart and wishlist**
2. **Refresh the page**
3. **Check if items are still there**
   - Cart should show same items
   - Wishlist should show same items

### **Test 6: Logout Functionality**
1. **Add items to cart and wishlist**
2. **Logout**
3. **Check if cart/wishlist is empty**
   - Cart should be empty
   - Wishlist should be empty

## 🐛 **Common Issues and Solutions**

### **Issue 1: "Items not being added to cart"**
**Symptoms:**
- Click "Add to Cart" but nothing happens
- No success notification
- Cart count doesn't increase

**Debug Steps:**
1. Check browser console for errors
2. Verify user is logged in
3. Check network tab for failed requests
4. Verify database connection

**Solutions:**
```javascript
// Check if user is authenticated
console.log('User:', window.supabase?.auth?.getUser());

// Check cart service
console.log('Cart service available:', !!window.cartService);
```

### **Issue 2: "Database connection errors"**
**Symptoms:**
- Console shows "Database connection failed"
- 400/500 errors in network tab

**Debug Steps:**
1. Check Supabase configuration
2. Verify environment variables
3. Check database schema

**Solutions:**
```javascript
// Test database connection
fetch('/api/test-connection')
  .then(response => response.json())
  .then(data => console.log('DB connection:', data));
```

### **Issue 3: "Variant selector not appearing"**
**Symptoms:**
- Click "Add to Cart" on rice/dhoopbatti
- No variant dropdown appears

**Debug Steps:**
1. Check if product has variants defined
2. Verify variant selector component
3. Check console for errors

**Solutions:**
```javascript
// Check product variants
const riceProducts = document.querySelectorAll('[data-testid*="rice"]');
console.log('Rice products with variants:', riceProducts.length);
```

### **Issue 4: "Cart/Wishlist not persisting"**
**Symptoms:**
- Items disappear after refresh
- Cart/wishlist empty after page reload

**Debug Steps:**
1. Check if items are saved to database
2. Verify user authentication
3. Check cart/wishlist loading

**Solutions:**
```javascript
// Check local storage
console.log('Local storage:', localStorage.getItem('cart'));

// Check session storage
console.log('Session storage:', sessionStorage.getItem('wishlist'));
```

## 📊 **Performance Testing**

### **Test Cart Performance**
```javascript
// Test adding multiple items
const addToCartButtons = document.querySelectorAll('button[data-testid="add-to-cart"]');
const startTime = performance.now();

for (let i = 0; i < 5; i++) {
  addToCartButtons[i].click();
}

const endTime = performance.now();
console.log(`Added 5 items in ${endTime - startTime}ms`);
```

### **Test Wishlist Performance**
```javascript
// Test adding multiple wishlist items
const addToWishlistButtons = document.querySelectorAll('button[data-testid="add-to-wishlist"]');
const startTime = performance.now();

for (let i = 0; i < 5; i++) {
  addToWishlistButtons[i].click();
}

const endTime = performance.now();
console.log(`Added 5 wishlist items in ${endTime - startTime}ms`);
```

## 🔧 **Database Verification**

### **Check Cart Items in Database**
```sql
-- Run this in Supabase SQL editor
SELECT * FROM cart_items WHERE user_id = 'your-user-id';
```

### **Check Wishlist Items in Database**
```sql
-- Run this in Supabase SQL editor
SELECT * FROM wishlist_items WHERE user_id = 'your-user-id';
```

### **Verify selectedVariant Column**
```sql
-- Check if selectedVariant column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cart_items' AND column_name = 'selectedVariant';
```

## 📝 **Test Results Template**

Copy this template and fill it out:

```markdown
## Test Results - [Date]

### ✅ Working Features
- [ ] User authentication
- [ ] Add to cart
- [ ] Add to wishlist
- [ ] Remove from cart
- [ ] Remove from wishlist
- [ ] Cart persistence
- [ ] Wishlist persistence
- [ ] Variant selection (rice)
- [ ] Variant selection (dhoopbatti)
- [ ] Logout clears cart/wishlist

### ❌ Issues Found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### 🔧 Fixes Applied
- [ ] Fix 1: [Description]
- [ ] Fix 2: [Description]

### 📊 Performance
- Cart operations: [X]ms average
- Wishlist operations: [X]ms average
- Database queries: [X]ms average
```

## 🚨 **Emergency Debugging**

If everything is broken, run this emergency debug script:

```javascript
// Emergency debug script
console.log('🚨 Emergency Debug Started');

// Check all critical components
const checks = {
  user: !!document.querySelector('[data-testid="user-menu"]'),
  cart: !!document.querySelector('[data-testid="cart-button"]'),
  wishlist: !!document.querySelector('a[href="/wishlist"]'),
  products: document.querySelectorAll('button[data-testid="add-to-cart"]').length,
  supabase: !!window.supabase,
  console: !console.error
};

console.log('Component Status:', checks);

// Test basic functionality
try {
  const addToCartButton = document.querySelector('button[data-testid="add-to-cart"]');
  if (addToCartButton) {
    addToCartButton.click();
    console.log('✅ Add to cart button works');
  } else {
    console.log('❌ Add to cart button not found');
  }
} catch (error) {
  console.error('❌ Add to cart failed:', error);
}

console.log('🚨 Emergency Debug Complete');
```

## 📞 **Support**

If you're still having issues:

1. **Check the browser console** for error messages
2. **Check the network tab** for failed requests
3. **Verify database connection** in Supabase dashboard
4. **Test with a different browser** to rule out cache issues
5. **Clear browser cache and cookies** and try again

**Common Error Messages:**
- `"User not authenticated"` → User needs to log in
- `"Database connection failed"` → Check Supabase configuration
- `"selectedVariant column not found"` → Run the SQL to add the column
- `"Cart provider not found"` → Check React context setup 