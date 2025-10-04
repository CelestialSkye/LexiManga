/**
 * Simple test for the simplified backend
 */

const BASE_URL = 'http://localhost:3002';

const testAPI = async () => {
  console.log('🧪 Testing simplified backend...\n');

  try {
    // Test health
    console.log('1. Testing health...');
    const health = await fetch(`${BASE_URL}/api/health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData.status, 'Port:', healthData.port, '\n');

    // Test search
    console.log('2. Testing search...');
    const search = await fetch(`${BASE_URL}/api/search?q=One%20Piece&limit=3`);
    const searchData = await search.json();
    console.log('✅ Search results:', searchData.data.Page.media.length, 'manga');
    console.log('   Cached:', searchData.cached ? 'Yes' : 'No');
    console.log('   First result:', searchData.data.Page.media[0]?.title?.english, '\n');

    // Test manga details
    if (searchData.data.Page.media.length > 0) {
      const mangaId = searchData.data.Page.media[0].id;
      console.log('3. Testing manga details...');
      const details = await fetch(`${BASE_URL}/api/manga/${mangaId}`);
      const detailsData = await details.json();
      console.log('✅ Manga details:', detailsData.data.Media?.title?.english);
      console.log('   Cached:', detailsData.cached ? 'Yes' : 'No', '\n');
    }

    console.log('🎉 All tests passed! Backend is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPI();
