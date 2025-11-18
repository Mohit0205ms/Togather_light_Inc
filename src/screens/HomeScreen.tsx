import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { GamificationService, FOMOItem } from '../services/gamificationService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [fomoNotifications, setFomoNotifications] = useState<FOMOItem[]>([]);
  const [dailyPointsEarned, setDailyPointsEarned] = useState(0);

  const { top, bottom } = useSafeAreaInsets();

  // Load gamification data when component mounts
  useEffect(() => {
    if (user) {
      // Load FOMO notifications
      GamificationService.getFOMONotifications().then(setFomoNotifications);

      // Calculate daily points from gamification service based on streak
      const loginStreak = user.loginStreak || 0;
      const streakBonus = GamificationService.getStreakBonus(loginStreak);
      const baseDailyPoints = Math.min(50, loginStreak * 5);
      setDailyPointsEarned(Math.floor(baseDailyPoints * streakBonus));

      // Generate some random FOMO notifications for demo (run 20% of the time)
      if (Math.random() > 0.8) {
        GamificationService.generateDailyFOMONotifications().then(() => {
          GamificationService.getFOMONotifications().then(setFomoNotifications);
        });
      }
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ],
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={{...styles.container, paddingTop: top, paddingBottom: bottom}}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back, {user.firstName}! 👋</Text>
          <Text style={styles.subtitle}>Ready to explore your premium features?</Text>
        </View>

        {/* Real Gamification Progress Card */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressTitle}>Your Journey</Text>

          {/* Points and Rank Display */}
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsDisplay}>
              {GamificationService.formatPoints(user.points || 0)} 🏆
            </Text>
            <Text style={styles.rankDisplay}>
              {GamificationService.getRankTitle(user.points || 0)}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.min(100, (user.points || 0) / 10)}%`
            }]} />
          </View>

          <Text style={styles.progressText}>
            {GamificationService.getNextMilestone(user.points || 0).reward} in {GamificationService.getNextMilestone(user.points || 0).remaining} points
          </Text>

          {/* Login Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.loginStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.totalLogins || 0}</Text>
              <Text style={styles.statLabel}>Total Logins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>+{dailyPointsEarned}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>

          {/* Dynamic Achievement badges */}
          <View style={styles.achievements}>
            {(user.badges || []).slice(0, 3).map((badge, index) => {
              const emojiMap = {
                'First Steps': '🎯',
                'First Login': '🚀',
                'Streaker': '🔥',
                'Week Warrior': '⚡',
                'Regular User': '🌟',
                'Point Collector': '💰',
                'Dedicated Member': '🏅',
                'Power User': '💎'
              };
              return (
                <View key={badge} style={styles.achievement}>
                  <Text style={styles.achievementEmoji}>
                    {emojiMap[badge as keyof typeof emojiMap] || '🏆'}
                  </Text>
                  <Text style={styles.achievementText} numberOfLines={2}>
                    {badge}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.exploreButton}
        >
          <TouchableOpacity style={styles.exploreButtonInner}>
            <Text style={styles.exploreButtonText}>Explore Premium Features 🎉</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Your Profile</Text>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>



          <View style={styles.infoItem}>
            <Text style={styles.label}>Member Since:</Text>
            <Text style={styles.value}>{new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* FOMO Element */}
        <View style={styles.fomoContainer}>
          <Text style={styles.fomoText}>
            🚀 Unlock 5 more features - 90% power users complete setup!
          </Text>
        </View>

        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutButton}
        >
          <TouchableOpacity style={styles.logoutButtonInner} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  progressCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsDisplay: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  rankDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  achievements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  achievement: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  achievementText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  exploreButton: {
    borderRadius: 16,
    marginBottom: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  exploreButtonInner: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    width: 130,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    fontWeight: '600',
  },
  fomoContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderLeftWidth: 6,
    borderLeftColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  fomoText: {
    fontSize: 15,
    color: '#92400E',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  logoutButton: {
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 32,
  },
  logoutButtonInner: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default HomeScreen;
