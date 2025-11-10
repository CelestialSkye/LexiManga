const cacheManager = require('./cache-manager');

async function testCache() {
  console.log('🧪 Testing cache system...\n');

  try {
    // Test 1: Save cache
    console.log('1️⃣  Testing setCacheInFirebase...');
    const testKey = 'test:trending';
    const testData = [
      { id: 1, title: { romaji: 'Test Manga 1', english: 'Test Manga 1' } },
      { id: 2, title: { romaji: 'Test Manga 2', english: 'Test Manga 2' } },
    ];
    const result = await cacheManager.setCacheInFirebase(testKey, testData, 3600);
    console.log('Result:', result);

    // Test 2: Retrieve cache
    console.log('\n2️⃣  Testing getCacheFromFirebase...');
    const retrieved = await cacheManager.getCacheFromFirebase(testKey);
    console.log(
      'Retrieved data:',
      retrieved ? `✅ Found (${retrieved.data.length} items)` : '❌ Not found'
    );

    // Test 3: Get stats
    console.log('\n3️⃣  Testing getCacheStats...');
    const stats = await cacheManager.getCacheStats();
    console.log('Cache stats:', stats);

    console.log('\n✅ Cache system is working!');
    console.log('\n📊 Check your Firestore Database:');
    console.log('   - Go to Firebase Console');
    console.log('   - Select "vocabularymanga" project');
    console.log('   - Open "Firestore Database"');
    console.log('   - Look for "anilist_cache" collection');
    console.log('   - You should see the test documents there!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCache();
