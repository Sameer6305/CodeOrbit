/**
 * Utility functions to parse platform profile URLs and validate usernames
 */

/**
 * Extract username from Codeforces URL
 * @param {string} input - URL or username
 * @returns {string|null} - Extracted username or null
 */
export function parseCodeforcesUrl(input) {
  if (!input) return null;
  
  // If it's already just a username (no slash or dot)
  if (!input.includes('/') && !input.includes('.')) {
    return input.trim();
  }

  // Handle various Codeforces URL formats
  const patterns = [
    /codeforces\.com\/profile\/([^\/\?#]+)/i,
    /codeforces\.com\/profile\/([^\/\?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  // Try to extract from any URL ending
  const urlMatch = input.match(/\/([^\/\?#]+)\/?$/);
  if (urlMatch) return urlMatch[1];

  return input.trim();
}

/**
 * Extract username from LeetCode URL
 * @param {string} input - URL or username
 * @returns {string|null} - Extracted username or null
 */
export function parseLeetCodeUrl(input) {
  if (!input) return null;

  // If it's already just a username
  if (!input.includes('/') && !input.includes('.')) {
    return input.trim();
  }

  // Handle LeetCode URL formats
  const patterns = [
    /leetcode\.com\/([^\/\?#]+)\/?$/i,
    /leetcode\.com\/u\/([^\/\?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  // Try to extract from URL
  const urlMatch = input.match(/\/([^\/\?#]+)\/?$/);
  if (urlMatch) return urlMatch[1];

  return input.trim();
}

/**
 * Extract username from CodeChef URL
 * @param {string} input - URL or username
 * @returns {string|null} - Extracted username or null
 */
export function parseCodeChefUrl(input) {
  if (!input) return null;

  // If it's already just a username
  if (!input.includes('/') && !input.includes('.')) {
    return input.trim();
  }

  // Handle CodeChef URL formats
  const patterns = [
    /codechef\.com\/users\/([^\/\?#]+)/i,
    /codechef\.com\/user\/profile\/([^\/\?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  // Try to extract from URL
  const urlMatch = input.match(/\/([^\/\?#]+)\/?$/);
  if (urlMatch) return urlMatch[1];

  return input.trim();
}

/**
 * Validate if username exists on platform (frontend check)
 * @param {string} platform - Platform name
 * @param {string} username - Username to validate
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validatePlatformUsername(platform, username) {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }

  try {
    switch (platform) {
      case 'codeforces':
        // Check if user exists via API
        const cfResponse = await fetch(
          `https://codeforces.com/api/user.info?handles=${username}`
        );
        const cfData = await cfResponse.json();
        if (cfData.status === 'OK') {
          return { 
            valid: true, 
            message: `✓ Found: ${cfData.result[0].handle} (${cfData.result[0].rating || 'Unrated'})` 
          };
        }
        return { valid: false, message: 'User not found on Codeforces' };

      case 'leetcode':
        // LeetCode - use simple profile URL check (GraphQL has CORS issues)
        try {
          const lcResponse = await fetch(`https://leetcode.com/${username}/`, {
            method: 'HEAD',
            mode: 'no-cors'
          });
          // no-cors doesn't give us response data, so just validate format
          if (username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username)) {
            return { 
              valid: true, 
              message: '✓ Username format valid (verify on sync)' 
            };
          }
        } catch (error) {
          // If fetch fails, just validate format
          if (username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username)) {
            return { 
              valid: true, 
              message: '✓ Username format valid (verify on sync)' 
            };
          }
        }
        return { valid: false, message: 'Invalid username format' };

      case 'codechef':
        // CodeChef requires scraping, so just check format
        if (username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)) {
          return { 
            valid: true, 
            message: '✓ Username format valid (verify on sync)' 
          };
        }
        return { valid: false, message: 'Invalid username format' };

      default:
        return { valid: false, message: 'Unknown platform' };
    }
  } catch (error) {
    return { 
      valid: false, 
      message: `Error validating: ${error.message}` 
    };
  }
}

/**
 * Generate profile URL from username
 * @param {string} platform - Platform name
 * @param {string} username - Username
 * @returns {string} - Full profile URL
 */
export function getProfileUrl(platform, username) {
  if (!username) return '#';

  const urls = {
    codeforces: `https://codeforces.com/profile/${username}`,
    leetcode: `https://leetcode.com/${username}`,
    codechef: `https://www.codechef.com/users/${username}`,
  };

  return urls[platform] || '#';
}

/**
 * Generate contest page URL for platform
 * @param {string} platform - Platform name
 * @returns {string} - Contests page URL
 */
export function getContestsUrl(platform) {
  const urls = {
    codeforces: 'https://codeforces.com/contests',
    leetcode: 'https://leetcode.com/contest/',
    codechef: 'https://www.codechef.com/contests',
    atcoder: 'https://atcoder.jp/contests/',
    hackerrank: 'https://www.hackerrank.com/contests',
  };

  return urls[platform.toLowerCase()] || '#';
}
