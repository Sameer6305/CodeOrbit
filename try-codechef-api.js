// Try CodeChef API endpoint
import axios from 'axios';

async function tryCodeChefAPI() {
  const handle = 'impranav011';
  
  console.log('🔍 Trying CodeChef API endpoints...\n');
  
  // Try public API endpoint
  const endpoints = [
    `https://www.codechef.com/api/user/profile/${handle}`,
    `https://www.codechef.com/api/ratings/all?handle=${handle}`,
    `https://www.codechef.com/recent/user?page=0&user_handle=${handle}`,
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Success!');
      console.log('Response keys:', Object.keys(response.data));
      console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
      console.log('\n---\n');
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status || error.message}\n`);
    }
  }
}

tryCodeChefAPI();
