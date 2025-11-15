/**
 * Platform URL Parser
 * Extracts usernames from profile URLs and validates them
 */

export const platformPatterns = {
  codeforces: {
    patterns: [
      /codeforces\.com\/profile\/([a-zA-Z0-9_-]+)/,
      /codeforces\.com\/profile\/([a-zA-Z0-9_-]+)\?/,
    ],
    example: "https://codeforces.com/profile/tourist",
    baseUrl: "https://codeforces.com/profile/",
  },
  leetcode: {
    patterns: [
      /leetcode\.com\/u\/([a-zA-Z0-9_-]+)/,
      /leetcode\.com\/([a-zA-Z0-9_-]+)/,
      /leetcode\.com\/u\/([a-zA-Z0-9_-]+)\//,
    ],
    example: "https://leetcode.com/u/username",
    baseUrl: "https://leetcode.com/u/",
  },
  codechef: {
    patterns: [
      /codechef\.com\/users\/([a-zA-Z0-9_-]+)/,
      /codechef\.com\/users\/([a-zA-Z0-9_-]+)\?/,
    ],
    example: "https://www.codechef.com/users/username",
    baseUrl: "https://www.codechef.com/users/",
  },
};

/**
 * Extract username from platform URL or return username as-is
 * @param {string} input - URL or username
 * @param {string} platform - Platform name (codeforces, leetcode, codechef)
 * @returns {object} { username: string, isValid: boolean, error: string|null }
 */
export function parseProfileInput(input, platform) {
  if (!input || !input.trim()) {
    return { username: null, isValid: false, error: "Input is required" };
  }

  const trimmedInput = input.trim();
  const platformConfig = platformPatterns[platform.toLowerCase()];

  if (!platformConfig) {
    return { username: null, isValid: false, error: "Invalid platform" };
  }

  // Check if input is a URL
  if (trimmedInput.includes("http://") || trimmedInput.includes("https://") || trimmedInput.includes(".com")) {
    // Try to extract username from URL
    for (const pattern of platformConfig.patterns) {
      const match = trimmedInput.match(pattern);
      if (match && match[1]) {
        return {
          username: match[1],
          isValid: true,
          error: null,
          url: trimmedInput,
        };
      }
    }
    
    // URL provided but couldn't extract username
    return {
      username: null,
      isValid: false,
      error: `Invalid ${platform} URL format. Expected: ${platformConfig.example}`,
    };
  }

  // Input is a username (no URL detected)
  // Validate username format (alphanumeric, underscore, hyphen)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
    return {
      username: trimmedInput,
      isValid: true,
      error: null,
      url: platformConfig.baseUrl + trimmedInput,
    };
  }

  return {
    username: null,
    isValid: false,
    error: "Username can only contain letters, numbers, underscores, and hyphens",
  };
}

/**
 * Validate if a profile exists on the platform
 * @param {string} username - Extracted username
 * @param {string} platform - Platform name
 * @returns {Promise<object>} { exists: boolean, error: string|null }
 */
export async function validateProfile(username, platform) {
  try {
    switch (platform.toLowerCase()) {
      case "codeforces":
        const cfRes = await fetch(
          `https://codeforces.com/api/user.info?handles=${username}`
        );
        const cfData = await cfRes.json();
        if (cfData.status === "OK") {
          return { exists: true, error: null, data: cfData.result[0] };
        }
        return { exists: false, error: cfData.comment || "User not found" };

      case "leetcode":
        // LeetCode validation via GraphQL
        const lcRes = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query { matchedUser(username: "${username}") { username } }`,
          }),
        });
        const lcData = await lcRes.json();
        if (lcData.data?.matchedUser) {
          return { exists: true, error: null, data: lcData.data.matchedUser };
        }
        return { exists: false, error: "User not found" };

      case "codechef":
        // CodeChef has no API, so we'll validate by checking if page loads
        const ccRes = await fetch(
          `https://www.codechef.com/users/${username}`,
          { method: "HEAD" }
        );
        if (ccRes.ok) {
          return { exists: true, error: null };
        }
        return { exists: false, error: "User not found or profile is private" };

      default:
        return { exists: false, error: "Unknown platform" };
    }
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * Get platform-specific contest page URL
 * @param {string} platform - Platform name
 * @returns {string} Contest page URL
 */
export function getContestPageUrl(platform) {
  const contestUrls = {
    codeforces: "https://codeforces.com/contests",
    leetcode: "https://leetcode.com/contest/",
    codechef: "https://www.codechef.com/contests",
    atcoder: "https://atcoder.jp/contests/",
    hackerrank: "https://www.hackerrank.com/contests",
  };

  return contestUrls[platform.toLowerCase()] || "#";
}

/**
 * Build profile URL from username
 * @param {string} username - Username
 * @param {string} platform - Platform name
 * @returns {string} Profile URL
 */
export function buildProfileUrl(username, platform) {
  const platformConfig = platformPatterns[platform.toLowerCase()];
  if (!platformConfig || !username) return "#";
  return platformConfig.baseUrl + username;
}
