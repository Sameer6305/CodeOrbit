import { computeStreak, formatStreakHistory } from '../src/utils/streakCalculator';

describe('computeStreak', () => {
  test('returns zero streaks for empty array', () => {
    const result = computeStreak([]);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    });
  });

  test('returns zero streaks for null input', () => {
    const result = computeStreak(null);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    });
  });

  test('returns zero streaks when all days have zero solved', () => {
    const dailyStats = [
      { date: '2025-11-10', solved: 0 },
      { date: '2025-11-11', solved: 0 },
      { date: '2025-11-12', solved: 0 }
    ];
    const result = computeStreak(dailyStats);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    });
  });

  test('calculates streak for single day', () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const dailyStats = [
      { date: todayStr, solved: 5 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.streakHistory).toHaveLength(1);
    expect(result.streakHistory[0]).toEqual({
      start: todayStr,
      end: todayStr,
      length: 1
    });
  });

  test('calculates streak for consecutive days', () => {
    const dailyStats = [
      { date: '2025-11-10', solved: 3 },
      { date: '2025-11-11', solved: 5 },
      { date: '2025-11-12', solved: 2 },
      { date: '2025-11-13', solved: 4 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(4);
    expect(result.streakHistory).toHaveLength(1);
    expect(result.streakHistory[0]).toEqual({
      start: '2025-11-10',
      end: '2025-11-13',
      length: 4
    });
  });

  test('handles multiple streaks with gaps', () => {
    const dailyStats = [
      { date: '2025-11-01', solved: 2 },
      { date: '2025-11-02', solved: 3 },
      { date: '2025-11-03', solved: 1 },
      // Gap of 2 days
      { date: '2025-11-06', solved: 4 },
      { date: '2025-11-07', solved: 2 },
      // Gap of 3 days
      { date: '2025-11-11', solved: 5 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(3);
    expect(result.streakHistory).toHaveLength(3);
    expect(result.streakHistory[0]).toEqual({
      start: '2025-11-01',
      end: '2025-11-03',
      length: 3
    });
    expect(result.streakHistory[1]).toEqual({
      start: '2025-11-06',
      end: '2025-11-07',
      length: 2
    });
    expect(result.streakHistory[2]).toEqual({
      start: '2025-11-11',
      end: '2025-11-11',
      length: 1
    });
  });

  test('current streak is 0 if last activity was more than 1 day ago', () => {
    const dailyStats = [
      { date: '2025-11-10', solved: 2 },
      { date: '2025-11-11', solved: 3 },
      { date: '2025-11-12', solved: 1 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.currentStreak).toBe(0); // Today is Nov 15, last activity was Nov 12
    expect(result.longestStreak).toBe(3);
  });

  test('current streak is valid if last activity was yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    const dailyStats = [
      { date: twoDaysAgoStr, solved: 2 },
      { date: yesterdayStr, solved: 3 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  test('current streak is valid if last activity was today', () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dailyStats = [
      { date: yesterdayStr, solved: 2 },
      { date: todayStr, solved: 5 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  test('handles unsorted dates correctly', () => {
    const dailyStats = [
      { date: '2025-11-03', solved: 1 },
      { date: '2025-11-01', solved: 2 },
      { date: '2025-11-02', solved: 3 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(3);
    expect(result.streakHistory[0]).toEqual({
      start: '2025-11-01',
      end: '2025-11-03',
      length: 3
    });
  });

  test('ignores days with zero solved problems', () => {
    const dailyStats = [
      { date: '2025-11-10', solved: 2 },
      { date: '2025-11-11', solved: 0 }, // Should be ignored
      { date: '2025-11-12', solved: 3 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.streakHistory).toHaveLength(2);
    expect(result.longestStreak).toBe(1);
  });

  test('handles leap year correctly', () => {
    const dailyStats = [
      { date: '2024-02-28', solved: 1 },
      { date: '2024-02-29', solved: 2 },
      { date: '2024-03-01', solved: 3 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(3);
    expect(result.streakHistory[0].length).toBe(3);
  });

  test('handles year boundary correctly', () => {
    const dailyStats = [
      { date: '2024-12-30', solved: 1 },
      { date: '2024-12-31', solved: 2 },
      { date: '2025-01-01', solved: 3 },
      { date: '2025-01-02', solved: 4 }
    ];
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(4);
    expect(result.streakHistory).toHaveLength(1);
  });

  test('handles long streak correctly', () => {
    const dailyStats = [];
    const startDate = new Date('2025-01-01');
    
    // Generate 100 consecutive days
    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        solved: Math.floor(Math.random() * 10) + 1
      });
    }
    
    const result = computeStreak(dailyStats);
    expect(result.longestStreak).toBe(100);
    expect(result.streakHistory).toHaveLength(1);
  });
});

describe('formatStreakHistory', () => {
  test('formats streak history with readable dates', () => {
    const streakHistory = [
      { start: '2025-11-01', end: '2025-11-03', length: 3 },
      { start: '2025-11-10', end: '2025-11-12', length: 3 }
    ];
    
    const formatted = formatStreakHistory(streakHistory);
    expect(formatted).toHaveLength(2);
    expect(formatted[0]).toHaveProperty('startFormatted');
    expect(formatted[0]).toHaveProperty('endFormatted');
    expect(formatted[0].startFormatted).toMatch(/Nov/);
    expect(formatted[0].length).toBe(3);
  });

  test('handles empty streak history', () => {
    const formatted = formatStreakHistory([]);
    expect(formatted).toEqual([]);
  });
});
