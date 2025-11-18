import AsyncStorage from '@react-native-async-storage/async-storage';
import { PartialRegistrationData } from '../types';

const PARTIAL_REGISTRATION_KEY = 'partial_registration';

export class RegistrationService {
  // Save partial registration data
  static async savePartialData(data: PartialRegistrationData): Promise<void> {
    try {
      await AsyncStorage.setItem(PARTIAL_REGISTRATION_KEY, JSON.stringify(data));
    } catch (error) {
      throw new Error('Failed to save partial registration data');
    }
  }

  // Get partial registration data
  static async getPartialData(): Promise<PartialRegistrationData | null> {
    try {
      const data = await AsyncStorage.getItem(PARTIAL_REGISTRATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  // Clear partial registration data
  static async clearPartialData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PARTIAL_REGISTRATION_KEY);
    } catch (error) {
      // ignore
    }
  }
}
