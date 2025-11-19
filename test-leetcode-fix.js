import axios from 'axios';

async function testLeetCodeFix() {
  const username = '8aK9aTbn24';
  
  console.log('🟡 Testing LeetCode API Fix...\n');
  
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;

  const response = await axios.post(
    'https://leetcode.com/graphql',
    { query, variables: { username } },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const stats = response.data.data;
  console.log('All difficulties returned:');
  stats.matchedUser.submitStats.acSubmissionNum.forEach(d => {
    console.log(`  ${d.difficulty}: ${d.count}`);
  });

  // Old method (WRONG - sums all)
  const oldMethod = stats.matchedUser.submitStats.acSubmissionNum.reduce(
    (sum, x) => sum + x.count,
    0
  );
  console.log(`\n❌ Old Method (sum all): ${oldMethod}`);

  // New method (CORRECT - only 'All')
  const allDifficulty = stats.matchedUser.submitStats.acSubmissionNum.find(
    x => x.difficulty === 'All'
  );
  const newMethod = allDifficulty ? allDifficulty.count : 0;
  console.log(`✅ New Method (only 'All'): ${newMethod}`);
  
  console.log(`\n🎯 Fixed! Now showing ${newMethod} instead of ${oldMethod}`);
}

testLeetCodeFix();
