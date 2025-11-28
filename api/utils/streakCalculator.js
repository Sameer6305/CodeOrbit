/**
 * Unified Streak Calculator
 * Calculates current and longest streaks from submission calendar data
 * Works with any platform's submission data in format: { "YYYY-MM-DD": count }
 */

/**
 * Calculate streak from submission calendar
 * @param {Object} submissionCalendar - Object with dates as keys and submission counts as values
 * @returns {Object} { current: number, longest: number, lastActivity: string }
 */
export function calculateStreakFromCalendar(submissionCalendar) {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
    return { current: 0, longest: 0, lastActivity: null };
  }

  // Get all dates with activity (count > 0) and sort them
  const activityDates = Object.keys(submissionCalendar)
    .filter(date => submissionCalendar[date] > 0)
    .sort();

  if (activityDates.length === 0) {
    return { current: 0, longest: 0, lastActivity: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate CURRENT streak
  const lastActivityDate = new Date(activityDates[activityDates.length - 1]);
  lastActivityDate.setHours(0, 0, 0, 0);

  // Check if last activity was within grace period (today or yesterday)
  const daysSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

  let currentStreak = 0;
  if (daysSinceLastActivity <= 1) {
    // Count backwards from last activity date
    let checkDate = new Date(lastActivityDate);

    for (let i = activityDates.length - 1; i >= 0; i--) {
      const expectedDate = checkDate.toISOString().split('T')[0];
      const actualDate = activityDates[i];

      if (expectedDate === actualDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Gap found, stop counting
        break;
      }
    }
  }

  // Calculate LONGEST streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < activityDates.length; i++) {
    const prevDate = new Date(activityDates[i - 1]);
    const currDate = new Date(activityDates[i]);

    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      // Consecutive day
      tempStreak++;
    } else {
      // Gap found, save this streak if it's the longest
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  // Don't forget to check the last streak
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    lastActivity: activityDates[activityDates.length - 1]
  };
}

/**
 * Calculate streak from array of dates (for backwards compatibility)
 * @param {Array<string>} dates - Array of date strings in YYYY-MM-DD format
 * @returns {Object} { current: number, longest: number }
 */
export function calculateStreakFromDates(dates) {
  if (!dates || dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Convert to calendar format
  const calendar = {};
  dates.forEach(date => {
    calendar[date] = 1;
  });

  const result = calculateStreakFromCalendar(calendar);
  return { current: result.current, longest: result.longest };
}

/**
 * Create submission calendar from Codeforces submissions
 * @param {Array} submissions - Array of Codeforces submission objects
 * @returns {Object} Submission calendar with dates as keys
 */
export function createCodeforcesCalendar(submissions) {
  const calendar = {};

  submissions.forEach(submission => {
    if (submission.verdict === 'OK') {
      const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
      calendar[date] = (calendar[date] || 0) + 1;
    }
  });

  return calendar;
}

/**
 * Parse LeetCode submission calendar JSON
 * @param {string} submissionCalendarJson - JSON string from LeetCode API
 * @returns {Object} Submission calendar with dates as keys
 */
export function parseLeetCodeCalendar(submissionCalendarJson) {
  if (!submissionCalendarJson) {
    return {};
  }

  const calendar = {};

  try {
    // LeetCode returns: '{"1609459200": 1, "1609545600": 3}'
    const rawCalendar = JSON.parse(submissionCalendarJson);

    Object.entries(rawCalendar).forEach(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
      calendar[date] = count;
    });
  } catch (error) {
    console.error('Error parsing LeetCode calendar:', error);
  }

  return calendar;
}
