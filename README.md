# TogetherLight App

A React Native application demonstrating account registration and authentication with local data persistence.

## Overview

This app replicates the account setup experience from a web form (without CAPTCHA), providing local registration, login, and profile viewing with secure credential storage.

## Features

- **User Registration**: Multi-field form with validation (name, email, password, phone)
- **Login Authentication**: Email/password login with session persistence
- **Secure Storage**: Credentials stored securely using Expo SecureStore (Keychain/Keystore)
- **Form Validation**: Real-time validation using Zod schemas, inline error messages
- **Partial Data Persistence**: Registration form data survives app restarts
- **Account Lockout**: 5 failed login attempts trigger account lockout
- **Responsive UI**: Keyboard-aware forms with accessibility support
- **No Network Calls**: Fully local operation

## Technologys

- React Native 0.81.5 with TypeScript
- Expo SDK 54
- Navigation: React Navigation v7
- Form Management: React Hook Form with Zod validation
- State Management: Context API with useReducer
- Secure Storage: Expo SecureStore
- Data Persistence: AsyncStorage
- Testing: Jest with jest-expo

## Installation

Ensure you have Node.js and Expo CLI installed:

```bash
npm install -g @expo/cli
```

Clone or download the project, then:

```bash
cd TogetherLightApp
npm install
```

## Running the App

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web (limited functionality)
```bash
npm run web
```

Or start the development server:
```bash
npm start
```

Scan the QR code with Expo Go app on your device.

## Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests

## Architecture

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── data/          # Static data (countries)
├── screens/       # Screen components
├── services/      # Business logic and data services
├── types/         # TypeScript interfaces
└── utils/         # Utility functions
```

### Key Components

#### Services
- **AuthService**: Handles login, logout, credential storage, and session management
- **RegistrationService**: Manages partial form data persistence

#### Contexts
- **AuthContext**: Provides authentication state and methods throughout the app

#### Screens
- **RegistrationScreen**: Multi-step form with validation
- **LoginScreen**: Authentication with lockout protection
- **HomeScreen**: User profile display

#### Validation
- Zod schemas for type-safe form validation
- Password strength: minimum 8 chars, 1 uppercase, 1 lowercase, 1 number
- Email format validation
- Phone format validation (international)

## Security Approach

- **Credential Storage**: Expo SecureStore uses device Keychain/Keystore
- **No Plaintext Passwords**: Passwords stored securely, only hashed comparison
- **Session Management**: Login state persists across app restarts
- **Account Lockout**: Prevents brute force attacks after 5 failed attempts
- **Input Validation**: Client-side validation prevents malicious input

## Testing

Run tests with:
```bash
npm run test
```

Tests cover:
- Form validation logic
- Authentication service methods
- Registration data persistence

## Validation Rules Implemented

### Registration Form
- **First Name/Last Name**: Required, letters only
- **Email**: Valid email format
- **Password**: Min 8 chars, must contain uppercase, lowercase, number
- **Phone**: International format (+country code)

### Login Form
- **Email**: Valid format
- **Password**: Required

All required fields enforced with inline errors and disabled submit.

## Screenshots
| <img src="https://github.com/user-attachments/assets/b9a2561e-940f-4431-8561-138c31ec1c66" width="300"/> | <img src="https://github.com/user-attachments/assets/dc19ee15-c6cd-4bb7-90e3-aaa6a3a6e147" width="300"/> |
| <img src="https://github.com/user-attachments/assets/d7a98b44-be45-44ce-bd76-38c00449c382" width="300"/> | <img src="https://github.com/user-attachments/assets/5818919d-3a83-42b5-948b-f6b8fbc94c77" width="300"/> |
<img src="https://github.com/user-attachments/assets/1862791f-010e-4eae-ab4d-1caab8b7fcd8" width="300"/>


