// Test script to verify API endpoints are working correctly
import axios from 'axios';

const TEST_USERNAMES = {
  leetcode: '8aK9aTbn24',
  codechef: 'sameerkadam05',
  codeforces: 'Sameer6305'
};

async function testLeetCode() {
  console.log('\n🟡 Testing LeetCode API...');
  try {
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount { difficulty count }
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      { 
        query, 
        variables: { username: TEST_USERNAMES.leetcode } 
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const stats = response.data.data;
    
    if (!stats.matchedUser) {
      console.log('❌ User not found:', TEST_USERNAMES.leetcode);
      return;
    }

    const solved = stats.matchedUser.submitStats.acSubmissionNum.reduce(
      (sum, x) => sum + x.count,
      0
    );

    console.log('✅ LeetCode Success!');
    console.log('   Username:', TEST_USERNAMES.leetcode);
    console.log('   Total Solved:', solved);
    console.log('   Breakdown:', stats.matchedUser.submitStats.acSubmissionNum);
  } catch (error) {
    console.log('❌ LeetCode Error:', error.message);
    if (error.response) {
      console.log('   Response:', error.response.data);
    }
  }
}

async function testCodeChef() {
  console.log('\n🟤 Testing CodeChef Scraping...');
  try {
    const response = await axios.get(
      `https://www.codechef.com/users/${TEST_USERNAMES.codechef}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    // Check if page loaded
    if (response.status !== 200) {
      console.log('❌ Failed to fetch CodeChef page');
      return;
    }

    console.log('✅ CodeChef Page Loaded');
    console.log('   Status:', response.status);
    console.log('   Content Length:', response.data.length);
    
    // Try to find the solved count in HTML
    const cheerio = await import('cheerio');
    const $ = cheerio.load(response.data);
    
    // Try multiple selectors
    const selectors = [
      '.rating-data-section .problems-solved h5',
      '.rating-data-section h5',
      '.problems-solved h5',
      'h5:contains("Problems Solved")',
      '.rating-data-section'
    ];

    console.log('   Trying selectors:');
    selectors.forEach(sel => {
      const text = $(sel).text().trim();
      console.log(`   "${sel}": "${text.substring(0, 50)}..."`);
    });

  } catch (error) {
    console.log('❌ CodeChef Error:', error.message);
  }
}

async function testCodeforces() {
  console.log('\n🔵 Testing Codeforces API...');
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${TEST_USERNAMES.codeforces}&from=1&count=100`
    );

    if (response.data.status !== 'OK') {
      console.log('❌ API returned error:', response.data.comment);
      return;
    }

    const submissions = response.data.result;
    const uniqueProblems = new Set();

    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        uniqueProblems.add(problemId);
      }
    });

    console.log('✅ Codeforces Success!');
    console.log('   Username:', TEST_USERNAMES.codeforces);
    console.log('   Total Submissions:', submissions.length);
    console.log('   Unique Problems Solved:', uniqueProblems.size);
  } catch (error) {
    console.log('❌ Codeforces Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('='.repeat(50));
  
  await testLeetCode();
  await testCodeChef();
  await testCodeforces();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests Complete!');
}

runTests();
