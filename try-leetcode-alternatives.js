import axios from 'axios';

async function tryAlternativeLeetCodeQueries() {
  const username = 'Sameer6305';
  
  console.log('🟡 Trying alternative LeetCode queries for:', username);
  
  // Query 1: Different field names
  const query1 = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;
  
  // Query 2: User contest ranking and solved
  const query2 = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          userAvatar
          realName
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
      }
    }
  `;
  
  for (const [i, query] of [query1, query2].entries()) {
    console.log(`\n--- Query ${i + 1} ---`);
    try {
      const response = await axios.post(
        'https://leetcode.com/graphql',
        { query, variables: { username } },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 1000));
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
  
  // Query 3: Try direct profile page scraping
  console.log('\n--- Trying direct profile page ---');
  try {
    const profilePage = await axios.get(`https://leetcode.com/${username}/`);
    console.log('Profile page loaded, length:', profilePage.data.length);
    
    // Look for JSON data in the page
    const match = profilePage.data.match(/ng-init="totalSolved\s*=\s*(\d+)/);
    if (match) {
      console.log('Found solved count in page:', match[1]);
    } else {
      console.log('Could not find solved count in HTML');
    }
  } catch (error) {
    console.log('Profile page error:', error.message);
  }
}

tryAlternativeLeetCodeQueries();
