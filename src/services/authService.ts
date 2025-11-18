import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { User, LoginFormData } from '../types';
import { GamificationService } from './gamificationService';

const USER_DATA_KEY = 'user_data';
const CURRENT_USER_KEY = 'current_user';
const FAILED_ATTEMPTS_KEY = 'failed_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds lockout
const LOCKOUT_TIME_KEY = 'lockout_time';

export class AuthService {
  static async saveCredentials(email: string, password: string): Promise<void> {
    try {
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
      await SecureStore.setItemAsync(`credentials_${sanitizedEmail}`, JSON.stringify({ email, password }));
    } catch (error) {
      throw new Error('Failed to save credentials');
    }
  }

  static async getCredentials(email: string): Promise<{ email: string; password: string } | null> {
    try {
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
      const credentials = await SecureStore.getItemAsync(`credentials_${sanitizedEmail}`);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      return null;
    }
  }

  static async saveUserData(user: User): Promise<void> {
    try {
      let users: User[] = [];
      const existingUsers = await AsyncStorage.getItem(USER_DATA_KEY);
      if (existingUsers) {
        users = JSON.parse(existingUsers);
        if (!Array.isArray(users)) {
          users = [];
        }
      }
      const existingIndex = users.findIndex(u => u.email === user.email);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
    } catch (error) {
      throw new Error('Failed to save user data');
    }
  }

  static async getUserData(email: string): Promise<User | null> {
    try {
      const usersJson = await AsyncStorage.getItem(USER_DATA_KEY);
      if (usersJson) {
        const users = JSON.parse(usersJson);
        if (Array.isArray(users)) {
          return users.find(u => u.email === email) || null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async login(data: LoginFormData): Promise<User | null> {
    const sanitizedEmail = data.email.replace(/[^a-zA-Z0-9]/g, '_');
    const isLocked = await this.isAccountLocked(sanitizedEmail);
    if (isLocked) {
      throw new Error('Account locked due to too many failed attempts');
    }

    const storedCredentials = await this.getCredentials(data.email);
    if (storedCredentials && storedCredentials.password === data.password) {
      await this.resetFailedAttempts(sanitizedEmail);

      let user = await this.getUserData(data.email);
      if (user) {
        user = await GamificationService.updateLoginStats(user);
        await this.saveUserData(user);
      }

      await this.setCurrentUser(data.email);
      await AsyncStorage.setItem('biometricEnabled', 'true');
      return user;
    } else {
      await this.incrementFailedAttempts(sanitizedEmail);
      const newAttempts = await this.getFailedAttempts(sanitizedEmail);
      if (newAttempts >= MAX_ATTEMPTS) {
        await this.setLockoutTime(sanitizedEmail);
      }
      throw new Error('Invalid email or password');
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  }

  static async isLoggedIn(): Promise<boolean> {
    const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    return Boolean(currentUserEmail);
  }

  static async getCurrentUser(): Promise<User | null> {
    const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    if (currentUserEmail) {
      return await this.getUserData(currentUserEmail);
    }
    return null;
  }

  private static async getFailedAttempts(email: string): Promise<number> {
    try {
      const attempts = await SecureStore.getItemAsync(`${FAILED_ATTEMPTS_KEY}_${email}`);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  }

  private static async incrementFailedAttempts(email: string): Promise<void> {
    const attempts = await this.getFailedAttempts(email);
    await SecureStore.setItemAsync(`${FAILED_ATTEMPTS_KEY}_${email}`, (attempts + 1).toString());
  }

  static async resetFailedAttempts(email: string): Promise<void> {
    await SecureStore.deleteItemAsync(`${FAILED_ATTEMPTS_KEY}_${email}`);
  }

  static async setCurrentUser(email: string): Promise<void> {
    await SecureStore.setItemAsync(CURRENT_USER_KEY, email);
  }

  static async getRemainingAttempts(email: string): Promise<number> {
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const attempts = await this.getFailedAttempts(sanitizedEmail);
    const now = Date.now();
    const lockoutTime = await this.getLockoutTime(sanitizedEmail);

    if (lockoutTime && lockoutTime > now && attempts >= MAX_ATTEMPTS) {
      return 0;
    }

    return Math.max(0, MAX_ATTEMPTS - attempts);
  }

  private static async isAccountLocked(email: string): Promise<boolean> {
    const attempts = await this.getFailedAttempts(email);
    if (attempts < MAX_ATTEMPTS) {
      return false;
    }

    const lockoutTime = await this.getLockoutTime(email);
    if (!lockoutTime) {
      return false;
    }

    const now = Date.now();
    if (now > lockoutTime) {
      await this.resetFailedAttempts(email);
      return false;
    }

    return true;
  }

  private static async setLockoutTime(email: string): Promise<void> {
    const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
    await SecureStore.setItemAsync(`${LOCKOUT_TIME_KEY}_${email}`, lockoutTime.toString());
  }

  private static async getLockoutTime(email: string): Promise<number | null> {
    try {
      const lockoutTimeStr = await SecureStore.getItemAsync(`${LOCKOUT_TIME_KEY}_${email}`);
      return lockoutTimeStr ? parseInt(lockoutTimeStr, 10) : null;
    } catch {
      return null;
    }
  }

  static async biometricLogin(): Promise<User> {
    try {
      const isEnrolled = await LocalAuthentication.hasHardwareAsync();
      const isEnrolledBiometric = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled || !isEnrolledBiometric) {
        throw new Error('Biometric authentication not available or enrolled');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometric authentication',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
        if (currentUserEmail) {
          const user = await this.getUserData(currentUserEmail);
          if (user) return user;
        }

        const stored = await AsyncStorage.getItem(USER_DATA_KEY);
        if (stored) {
          const users = JSON.parse(stored);
          if (Array.isArray(users) && users.length > 0) {
            const user = users[0];
            await this.setCurrentUser(user.email);
            return user;
          }
        }
        throw new Error('No user account found for biometric login');
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Biometric login failed');
    }
  }
}
