import axios from 'axios';

async function checkCodeforcesHandle() {
  const handle = '8aK9aTbn24';
  
  console.log('🔵 Checking Codeforces handle:', handle);
  
  try {
    // Try to get user info first
    const userInfo = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    console.log('✅ User exists!');
    console.log('Rating:', userInfo.data.result[0].rating);
    console.log('Max Rating:', userInfo.data.result[0].maxRating);
    
    // Now try submissions
    const submissions = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10`);
    console.log('Total submissions returned:', submissions.data.result.length);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.comment || error.message);
    console.log('Suggestion: This handle might not exist on Codeforces');
  }
}

checkCodeforcesHandle();
