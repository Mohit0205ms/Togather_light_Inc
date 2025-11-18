import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, LoginFormData } from '../utils/validation';
import { AuthService } from '../services/authService';

type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const { login, biometricLogin } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isFormValid = !!isValid;
  const watchedEmail = watch('email');

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isEnrolled = await LocalAuthentication.hasHardwareAsync();
        const isEnrolledBiometric = await LocalAuthentication.isEnrolledAsync();
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        const hasBiometricAccess = biometricEnabled === 'true';

        setIsBiometricAvailable(isEnrolled && isEnrolledBiometric && hasBiometricAccess);
      } catch (error) {
        setIsBiometricAvailable(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@')) {
      AuthService.getRemainingAttempts(watchedEmail).then(attempts => {
        setRemainingAttempts(attempts);
        if (attempts === 0) {
          setIsLocked(true);
          setCountdownSeconds(30);
          setLockoutMessage('Account locked due to too many failed attempts');
        } else {
          setIsLocked(false);
          setCountdownSeconds(0);
          setLockoutMessage(null);
        }
      });
    } else {
      setRemainingAttempts(null);
      setIsLocked(false);
      setCountdownSeconds(0);
      setLockoutMessage(null);
    }
  }, [watchedEmail]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLocked && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            // Timer expired - unlock and reset attempts
            setIsLocked(false);
            setLockoutMessage(null);
            setRemainingAttempts(5); // Reset to MAX_ATTEMPTS
            if (watchedEmail && watchedEmail.includes('@')) {
              AuthService.resetFailedAttempts(watchedEmail.replace(/[^a-zA-Z0-9]/g, '_'));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, countdownSeconds, watchedEmail]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      const errorMsg = error?.message || 'An error occurred';
      if (errorMsg.includes('Account locked')) {
        setLockoutMessage(errorMsg);
      } else {
        Alert.alert('Login Failed', errorMsg);
      }
      AuthService.getRemainingAttempts(data.email).then(setRemainingAttempts);
    } finally {
      setIsLoading(false);
    }
  };

  const onBiometricLogin = async () => {
    setIsBiometricLoading(true);
    try {
      await biometricLogin();
    } catch (error: any) {
      Alert.alert('Biometric Login Failed', error?.message || 'Biometric authentication failed');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#EC4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              We're glad to see you again! Enter your details to continue.
            </Text>

            {/* Show lockout message */}
            {lockoutMessage && (
              <View style={styles.warningContainer}>
                <Text style={styles.lockoutText}>
                  🚫 {lockoutMessage}
                  {isLocked && countdownSeconds > 0 ? `\nTry again in ${countdownSeconds} seconds` : ''}
                </Text>
              </View>
            )}

            {/* Show remaining attempts warning */}
            {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 3 && !lockoutMessage && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Warning: Only {remainingAttempts} attempts remaining!
                </Text>
              </View>
            )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLocked}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your registered email address"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLocked}
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={handleSubmit(onSubmit)}
              disabled={!isFormValid || isLoading || isLocked}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            onPress={() => navigation.navigate('Registration')}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>
              Don't have an account? Sign up here
            </Text>
          </TouchableOpacity>

          {isBiometricAvailable ? (
            <TouchableOpacity
              onPress={onBiometricLogin}
              accessibilityRole="button"
              disabled={isBiometricLoading}
            >
              <Text style={styles.biometricText}>
                {isBiometricLoading ? 'Authenticating...' : 'Login with Biometric 🔒'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.biometricHelpText}>
              Biometric login available after first password login
            </Text>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  innerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 48,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 48,
    fontWeight: '500',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputFocus: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  button: {
    borderRadius: 16,
    marginTop: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonInner: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  linkText: {
    textAlign: 'center',
    color: '#6366F1',
    fontSize: 14,
    marginTop: 32,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  biometricText: {
    textAlign: 'center',
    color: '#6366F1',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  biometricHelpText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  lockoutText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
