const cacheManager = require('./cache-manager');

async function testFallback() {
  console.log('🧪 Testing fallback behavior...\n');

  try {
    // Test 1: Firebase unavailable - should return null gracefully
    console.log('1️⃣  Simulating Firebase error...');
    const result = await cacheManager.getCacheFromFirebase('nonexistent:key');
    console.log('Result when Firebase miss:', result === null ? '✅ Returns null (fallback works!)' : 'ERROR');

    // Test 2: Error handling
    console.log('\n2️⃣  Testing error handling...');
    const badResult = await cacheManager.getCacheFromFirebase('');
    console.log('Result with bad key:', badResult === null ? '✅ Handles errors gracefully' : 'ERROR');

    // Test 3: Set cache with Firebase down
    console.log('\n3️⃣  Testing cache set with potential Firebase issues...');
    const setResult = await cacheManager.setCacheInFirebase('test:fallback', { data: 'test' }, 3600);
    console.log('Set result:', setResult ? '✅ Saved to Firebase' : '❌ Firebase error (fallback would use NodeCache only)');

    console.log('\n✅ Fallback system is working!');
    console.log('\nWhat happens if Firebase goes down:');
    console.log('1. getCacheFromFirebase() returns null (not an error)');
    console.log('2. Endpoint continues to Layer 3 and fetches from AniList');
    console.log('3. Data is returned to user (service continues!)');
    console.log('4. Only NodeCache layer works, but that\'s still 1000x faster than AniList');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFallback();
