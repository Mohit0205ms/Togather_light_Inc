# TogetherLight App

A React Native application demonstrating account registration and authentication with local data persistence.

## Overview

This app replicates the account setup experience from a web form (without CAPTCHA), providing local registration, login, and profile viewing with secure credential storage.

## Features

- **User Registration**: Multi-field form with validation (name, email, password, phone, country, date of birth)
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
- **Confirm Password**: Must match password
- **Phone**: International format (+country code)
- **Country**: Required selection
- **Date of Birth**: Required

### Login Form
- **Email**: Valid format
- **Password**: Required

All required fields enforced with inline errors and disabled submit.

## Trade-offs and Limitations

- Local-only operation (no backend integration)
- Partial form pre-filling not implemented (clears on app restart)
- Biometric authentication not implemented
- Dark mode not implemented
- E2E tests not included
- UI tested on Expo Go only

## Development Notes

- Built in ~4-5 hours using AI-assisted development (Claude)
- Follows React Native best practices
- TypeScript strict mode enabled
- Accessibility labels added to form elements
- Code formatted with Prettier, linted with ESLint

## Screenshots

[Screenshots would be included here showing login, registration, and home screens on iOS/Android]

## Deployment

For production deployment:

1. Configure app.json for release
2. Set up code signing for iOS/Android
3. Build with expo build
4. Submit to app stores

## Contact

For questions or issues, contact andrii@togetherlight.com
