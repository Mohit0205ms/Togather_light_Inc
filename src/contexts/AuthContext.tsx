import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (user: User, password: string) => Promise<void>;
  biometricLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload, isLoading: false };
    case 'REGISTER_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { isAuthenticated: false, user: null, isLoading: false };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Use promise chain to avoid async/await type coercion in JSI HostFunction
    AuthService.isLoggedIn()
      .then(isLoggedIn => {
        if (isLoggedIn) {
          return AuthService.getCurrentUser();
        }
        return Promise.resolve(null);
      })
      .then(user => {
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })
      .catch(error => {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await AuthService.login({ email, password });
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (user: User, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await AuthService.saveCredentials(user.email, password);
      await AuthService.saveUserData(user);
      await AuthService.setCurrentUser(user.email); // auto login after register
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const biometricLogin = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await AuthService.biometricLogin();
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        console.log("User is not present: ");
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, biometricLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
