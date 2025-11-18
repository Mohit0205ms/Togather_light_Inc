import { GamificationService } from '../../src/services/gamificationService';
import { User } from '../../src/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    removeItem: jest.fn(),
    getAllKeys: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('GamificationService', () => {
  const mockUser: User = {
    id: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@test.com',
    phone: '1234567890',
    createdAt: '2024-01-01T00:00:00.000Z',
    loginStreak: 1,
    totalLogins: 1,
    lastLoginDate: '2024-01-01',
    points: 100,
    badges: ['First Steps'],
    joinedFriends: 0
  };

  describe('updateLoginStats', () => {
    it('should update login stats for first-time login', async () => {
      const user = { ...mockUser, totalLogins: 0, loginStreak: 0 };

      const result = await GamificationService.updateLoginStats(user);

      expect(result.totalLogins).toBe(1);
      expect(result.loginStreak).toBe(1);
      expect(result.badges).toContain('First Login');
    });

    it('should increase streak on consecutive login', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const user = {
        ...mockUser,
        lastLoginDate: yesterday,
        loginStreak: 2
      };

      const result = await GamificationService.updateLoginStats(user);

      expect(result.loginStreak).toBe(3);
      expect(result.totalLogins).toBe(mockUser.totalLogins + 1);
    });

    it('should reset streak on gap', async () => {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toDateString();
      const user = {
        ...mockUser,
        lastLoginDate: twoDaysAgo,
        loginStreak: 5
      };

      const result = await GamificationService.updateLoginStats(user);

      expect(result.loginStreak).toBe(1);
      expect(result.totalLogins).toBe(mockUser.totalLogins + 1);
    });

    it('should award streak badges', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      const testCases = [
        { currentStreak: 2, newStreak: 3, expectedBadge: 'Streaker' },
        { currentStreak: 6, newStreak: 7, expectedBadge: 'Week Warrior' },
        { currentStreak: 29, newStreak: 30, expectedBadge: 'Month Master' }
      ];

      for (const testCase of testCases) {
        const user = {
          ...mockUser,
          lastLoginDate: yesterday,
          loginStreak: testCase.currentStreak,
          badges: []
        };

        const result = await GamificationService.updateLoginStats(user);

        expect(result.loginStreak).toBe(testCase.newStreak);
        expect(result.badges).toContain(testCase.expectedBadge);
      }
    });

    it('should handle multiple badge awards', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const user = {
        ...mockUser,
        lastLoginDate: yesterday,
        loginStreak: 2,
        totalLogins: 4,
        badges: []
      };

      const result = await GamificationService.updateLoginStats(user);

      expect(result.badges).toContain('Streaker');
      expect(result.badges).toContain('Regular User');
    });

    it('should add daily points based on streak', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const user = { ...mockUser, points: 100, loginStreak: 7, lastLoginDate: yesterday };

      const result = await GamificationService.updateLoginStats(user);

      expect(result.points).toBe(140); // streak becomes 8, min(50, 8*5)=min(50,40)=40, total=100+40=140
    });
  });

  describe('getNextMilestone', () => {
    it('should return correct next milestone for different point levels', () => {
      const testCases = [
        { points: 0, milestone: 500, reward: 'Enrolled Badge' },
        { points: 300, milestone: 500, reward: 'Enrolled Badge' },
        { points: 600, milestone: 1000, reward: 'Active Member Badge' },
        { points: 3000, milestone: 5000, reward: 'Veteran Badge' },
        { points: 9000, milestone: 10000, reward: 'Legend Badge' }
      ];

      testCases.forEach(({ points, milestone, reward }) => {
        const result = GamificationService.getNextMilestone(points);
        expect(result.milestone).toBe(milestone);
        expect(result.reward).toBe(reward);
        expect(result.remaining).toBe(milestone - points);
      });
    });

    it('should handle max points reached', () => {
      const result = GamificationService.getNextMilestone(15000);

      expect(result.remaining).toBe(0);
      expect(result.reward).toBe('Ultimate Achievement');
    });
  });

  describe('getRankTitle', () => {
    it('should return correct rank titles', () => {
      const testCases = [
        { points: 0, rank: '🌱 Newcomer' },
        { points: 499, rank: '🌱 Newcomer' },
        { points: 500, rank: '✨ Enrolled' },
        { points: 1000, rank: '🔥 Active Member' },
        { points: 2500, rank: '⭐ Contributor' },
        { points: 5000, rank: '🌟 Veteran' },
        { points: 10000, rank: '🏆 Legend' }
      ];

      testCases.forEach(({ points, rank }) => {
        expect(GamificationService.getRankTitle(points)).toBe(rank);
      });
    });
  });

  describe('getStreakBonus', () => {
    it('should return correct bonus multipliers', () => {
      const testCases = [
        { streak: 0, bonus: 1.0 },
        { streak: 1, bonus: 1.0 },
        { streak: 2, bonus: 1.0 },
        { streak: 3, bonus: 1.5 },
        { streak: 6, bonus: 1.5 },
        { streak: 7, bonus: 2.0 },
        { streak: 20, bonus: 2.0 },
        { streak: 30, bonus: 2.5 },
        { streak: 50, bonus: 2.5 },
        { streak: 100, bonus: 3.0 }
      ];

      testCases.forEach(({ streak, bonus }) => {
        expect(GamificationService.getStreakBonus(streak)).toBe(bonus);
      });
    });
  });

  describe('formatPoints', () => {
    it('should format points with thousands separator', () => {
      const testCases = [
        { input: 0, expected: '0' },
        { input: 100, expected: '100' },
        { input: 1000, expected: '1,000' },
        { input: 10000, expected: '10,000' },
        { input: 100000, expected: '100,000' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(GamificationService.formatPoints(input)).toBe(expected);
      });
    });
  });
});
