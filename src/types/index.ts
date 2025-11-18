export interface Country {
  code: string;
  name: string;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  loginStreak: number;
  totalLogins: number;
  lastLoginDate: string;
  points: number;
  badges: string[];
  joinedFriends: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface PartialRegistrationData extends Partial<RegistrationFormData> {
  step: number;
}
