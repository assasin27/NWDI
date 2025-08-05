// Simple test script to verify variant selection functionality
// Run this in the browser console

console.log('🧪 Testing Variant Selection Functionality');

// Test 1: Check if Rice product has variants
const riceProduct = {
  id: "rice",
  name: "Rice",
  price: 100,
  variants: [
    { name: "Indrayani Full", price: 100 },
    { name: "Indrayani Cut", price: 40 },
    { name: "Shakti Full", price: 100 }
  ]
};

console.log('✅ Rice product has variants:', riceProduct.variants?.length > 0);

// Test 2: Check if Dhoopbatti product has variants
const dhoopbattiProduct = {
  id: "dhoopbatti",
  name: "Dhoopbatti",
  price: 120,
  variants: [
    { name: "Chandan", price: 120 },
    { name: "Lobhan", price: 120 },
    { name: "Havan", price: 100 }
  ]
};

console.log('✅ Dhoopbatti product has variants:', dhoopbattiProduct.variants?.length > 0);

// Test 3: Simulate variant selection logic
function testVariantLogic(product, action) {
  console.log(`🔍 Testing ${action} for ${product.name}`);
  
  if (product.variants && product.variants.length > 0) {
    console.log(`✅ Should show variant selector for ${action}`);
    console.log(`📋 Available variants:`, product.variants.map(v => v.name));
    return true;
  } else {
    console.log(`❌ No variants, should add directly to ${action}`);
    return false;
  }
}

// Test both products
testVariantLogic(riceProduct, 'cart');
testVariantLogic(riceProduct, 'wishlist');
testVariantLogic(dhoopbattiProduct, 'cart');
testVariantLogic(dhoopbattiProduct, 'wishlist');

console.log('🧪 Variant selection test completed!');
console.log('📝 Now try clicking "Add to Wishlist" on Rice or Dhoopbatti products'); 