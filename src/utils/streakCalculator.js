/**
 * Computes streak statistics from daily coding activity data
 * @param {Array} dailyStats - Array of objects with { date: 'YYYY-MM-DD', solved: number }
 * @returns {Object} { currentStreak, longestStreak, streakHistory }
 */
export function computeStreak(dailyStats) {
  if (!dailyStats || dailyStats.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    };
  }

  // Sort by date ascending
  const sortedStats = [...dailyStats]
    .filter(stat => stat.solved > 0) // Only count days with activity
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedStats.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    };
  }

  const streaks = [];
  let currentStreakData = {
    start: sortedStats[0].date,
    end: sortedStats[0].date,
    length: 1
  };

  // Build streak history
  for (let i = 1; i < sortedStats.length; i++) {
    const prevDate = new Date(sortedStats[i - 1].date);
    const currDate = new Date(sortedStats[i].date);
    
    // Calculate day difference
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      // Consecutive day - extend current streak
      currentStreakData.end = sortedStats[i].date;
      currentStreakData.length++;
    } else {
      // Gap found - save current streak and start new one
      streaks.push({ ...currentStreakData });
      currentStreakData = {
        start: sortedStats[i].date,
        end: sortedStats[i].date,
        length: 1
      };
    }
  }

  // Push the final streak
  streaks.push(currentStreakData);

  // Calculate longest streak
  const longestStreak = Math.max(...streaks.map(s => s.length), 0);

  // Calculate current streak (check if it extends to today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivityDate = new Date(sortedStats[sortedStats.length - 1].date);
  lastActivityDate.setHours(0, 0, 0, 0);
  
  const daysSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
  
  // Current streak is valid if last activity was today or yesterday
  const currentStreak = (daysSinceLastActivity <= 1) 
    ? streaks[streaks.length - 1].length 
    : 0;

  return {
    currentStreak,
    longestStreak,
    streakHistory: streaks
  };
}

/**
 * Formats streak history for display
 * @param {Array} streakHistory - Array of streak objects
 * @returns {Array} Formatted streak data
 */
export function formatStreakHistory(streakHistory) {
  return streakHistory.map(streak => ({
    ...streak,
    startFormatted: new Date(streak.start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    endFormatted: new Date(streak.end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }));
}
