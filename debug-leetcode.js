import axios from 'axios';

async function debugLeetCode() {
  const username = 'Sameer6305';
  
  console.log('🟡 Debugging LeetCode for:', username);
  
  // Try the exact query we use
  const query = `
    query getUserProfile($username: String!) {
      allQuestionsCount { difficulty count }
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
        profile {
          ranking
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('\n✅ Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const stats = response.data.data;
    
    if (stats.matchedUser) {
      const solved = stats.matchedUser.submitStats.acSubmissionNum.reduce(
        (sum, x) => sum + x.count,
        0
      );
      console.log('\n📊 Parsed Data:');
      console.log('Total Solved:', solved);
      console.log('Breakdown:', stats.matchedUser.submitStats.acSubmissionNum);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.response?.data);
  }
}

debugLeetCode();
