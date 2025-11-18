import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export interface FOMOItem {
  id: string;
  type: 'friend_joined' | 'post_missed' | 'achievement_unlocked' | 'streak_reminder';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface GlobalGamificationData {
  totalUsers: number;
  activeUsersToday: number;
  recentPosts: number;
  trendingTopics: string[];
  lastUpdated: string;
}

export class GamificationService {
  static async updateLoginStats(user: User): Promise<User> {
    const updatedUser = {
      ...user,
      badges: user.badges || [] // Ensure badges is always an array
    };

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const lastLoginDate = user.lastLoginDate;

    // Update login counts
    updatedUser.totalLogins += 1;

    // Calculate login streak
    if (lastLoginDate === yesterday) {
      // Consecutive day - increase streak
      updatedUser.loginStreak += 1;

      // Award streak badges
      if (updatedUser.loginStreak === 3 && !updatedUser.badges.includes('Streaker')) {
        updatedUser.badges.push('Streaker');
      } else if (updatedUser.loginStreak === 7 && !updatedUser.badges.includes('Week Warrior')) {
        updatedUser.badges.push('Week Warrior');
      } else if (updatedUser.loginStreak === 30 && !updatedUser.badges.includes('Month Master')) {
        updatedUser.badges.push('Month Master');
      } else if (updatedUser.loginStreak === 100 && !updatedUser.badges.includes('Century Club')) {
        updatedUser.badges.push('Century Club');
      }
    } else if (lastLoginDate !== today) {
      // Not consecutive - reset streak to 1
      updatedUser.loginStreak = 1;
    }

    // Award daily login points
    const dailyPoints = Math.min(50, updatedUser.loginStreak * 5); // Up to 50 points for 10+ streak
    updatedUser.points += dailyPoints;

    // Award FIRST LOGIN badge (immediate achievement)
    if (updatedUser.totalLogins === 1 && !updatedUser.badges.includes('First Login')) {
      updatedUser.badges.push('First Login');
    }

    // Award milestone badges
    if (updatedUser.totalLogins === 5 && !updatedUser.badges.includes('Regular User')) {
      updatedUser.badges.push('Regular User');
    } else if (updatedUser.totalLogins === 25 && !updatedUser.badges.includes('Dedicated Member')) {
      updatedUser.badges.push('Dedicated Member');
    } else if (updatedUser.totalLogins === 100 && !updatedUser.badges.includes('Power User')) {
      updatedUser.badges.push('Power User');
    }

    // Check for point milestones
    if (updatedUser.points >= 500 && !updatedUser.badges.includes('Point Collector')) {
      updatedUser.badges.push('Point Collector');
    }

    updatedUser.lastLoginDate = today;

    return updatedUser;
  }

  // Get FOMO notifications for user
  static async getFOMONotifications(): Promise<FOMOItem[]> {
    try {
      const stored = await AsyncStorage.getItem('fomo_notifications');
      if (stored) {
        const notifications = JSON.parse(stored) as any[];
        return notifications.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading FOMO notifications:', error);
      return [];
    }
  }

  // Add new FOMO notification
  static async addFOMONotification(notification: Omit<FOMOItem, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const existing = await this.getFOMONotifications();
      const newNotif: FOMOItem = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
      };

      existing.unshift(newNotif);
      // Keep only last 10 notifications
      const recent = existing.slice(0, 10);
      await AsyncStorage.setItem('fomo_notifications', JSON.stringify(recent));
    } catch (error) {
      console.error('Error adding FOMO notification:', error);
    }
  }

  // Mark notification as read
  static async markNotificationRead(id: string): Promise<void> {
    try {
      const existing = await this.getFOMONotifications();
      const updated = existing.map(item =>
        item.id === id ? { ...item, read: true } : item
      );
      await AsyncStorage.setItem('fomo_notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  }

  // Get global gamification data (mock data for demo)
  static async getGlobalData(): Promise<GlobalGamificationData> {
    const stored = await AsyncStorage.getItem('global_gamification');
    if (stored) {
      return JSON.parse(stored);
    }

    // Return mock data
    return {
      totalUsers: 12547,
      activeUsersToday: 847,
      recentPosts: 156,
      trendingTopics: ['#TechTalk', '#WeekendPlans', '#NewMusic'],
      lastUpdated: new Date().toISOString()
    };
  }

  // Generate daily FOMO updates
  static async generateDailyFOMONotifications(): Promise<void> {
    const globalData = await this.getGlobalData();

    // Simulate some activity
    const activities = [
      'friend_joined',
      'post_missed',
      'achievement_unlocked',
      'streak_reminder'
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    let message = '';
    switch (randomActivity) {
      case 'friend_joined':
        message = `${Math.floor(Math.random() * 5) + 1} friends from your contacts joined today!`;
        break;
      case 'post_missed':
        message = `You missed ${Math.floor(Math.random() * 8) + 2} posts in communities you're interested in!`;
        break;
      case 'achievement_unlocked':
        message = 'New achievements unlocked! Check your profile to see what you earned.';
        break;
      case 'streak_reminder':
        message = 'Keep your login streak going! Daily check-ins earn bonus points!';
        break;
    }

    await this.addFOMONotification({
      type: randomActivity as any,
      message
    });
  }

  // Get user's rank comparison
  static getRankTitle(points: number): string {
    if (points >= 10000) return '🏆 Legend';
    if (points >= 5000) return '🌟 Veteran';
    if (points >= 2500) return '⭐ Contributor';
    if (points >= 1000) return '🔥 Active Member';
    if (points >= 500) return '✨ Enrolled';
    return '🌱 Newcomer';
  }

  // Get next milestone info
  static getNextMilestone(points: number): { milestone: number; remaining: number; reward: string } {
    const milestones = [
      { milestone: 500, reward: 'Enrolled Badge' },
      { milestone: 1000, reward: 'Active Member Badge' },
      { milestone: 2500, reward: 'Contributor Badge' },
      { milestone: 5000, reward: 'Veteran Badge' },
      { milestone: 10000, reward: 'Legend Badge' },
    ];

    for (const { milestone, reward } of milestones) {
      if (points < milestone) {
        return {
          milestone,
          remaining: milestone - points,
          reward
        };
      }
    }

    return {
      milestone: milestones[milestones.length - 1].milestone,
      remaining: 0,
      reward: 'Ultimate Achievement'
    };
  }

  // Get streak bonus multiplier
  static getStreakBonus(streak: number): number {
    if (streak >= 100) return 3.0;
    if (streak >= 30) return 2.5;
    if (streak >= 7) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
  }

  // Format points with thousands separator
  static formatPoints(points: number): string {
    return points.toLocaleString();
  }
}
