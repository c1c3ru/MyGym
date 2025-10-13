# Overview

MyGym is a comprehensive martial arts academy management application built with React Native and Expo. The app serves three user types: students, instructors, and administrators, each with role-specific dashboards and features. The system handles student management, class scheduling, payment tracking, graduation progress, and real-time notifications through a clean architecture pattern.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React Native with Expo for cross-platform mobile development
- **UI Components**: React Native Paper for Material Design components
- **Navigation**: React Navigation with role-based navigation structures
- **State Management**: Context API for global state and Zustand stores for local feature state
- **Architecture Pattern**: Clean Architecture with feature-based organization

## Backend Architecture
- **Backend as a Service**: Firebase for all backend functionality
- **Authentication**: Firebase Auth with custom claims for role-based access control
- **Database**: Firestore for real-time data storage and synchronization
- **File Storage**: Firebase Storage for images and documents

## Code Organization
- **Clean Architecture**: Separated into presentation, domain, infrastructure, and data layers
- **Feature-Based Structure**: Code organized by business features (auth, students, instructors, admin)
- **Dependency Injection**: Custom DI container for managing service dependencies
- **Import Aliases**: Babel-configured aliases for clean imports (@components, @screens, @services, etc.)

## Data Architecture
- **Entity Models**: Domain entities for User, Academy, Student, and authentication credentials
- **Repository Pattern**: Abstract repository interfaces with concrete Firestore implementations
- **Use Cases**: Business logic encapsulated in domain use cases (SignIn, SignUp, GetCurrentUser)
- **Data Mapping**: Mappers between Firebase data structures and domain entities

## Authentication & Authorization
- **Multi-Provider Auth**: Email/password with planned social login support (Google, Facebook, Microsoft, Apple)
- **Role-Based Access**: Custom claims system with three user types (student, instructor, admin)
- **Session Management**: Firebase Auth state persistence with automatic token refresh
- **Academy Association**: Users linked to specific academies through custom claims

## Design System & Colors
- **Centralized Color Palette**: All colors defined in `src/shared/constants/colors.js`
- **Professional Color Scheme**:
  - **Main Palette**: Black (#0D0D0D), Dark Gray (#262626), White (#FFFFFF), Vibrant Red (#FF3B3B)
  - **Student Profile**: Cobalt Blue (#007BFF) - Represents calm, confidence, and progress
  - **Instructor Profile**: Emerald Green (#2ECC71) - Symbolizes growth, vitality, and knowledge
  - **Administrator Profile**: Gold Yellow (#FFD700) - Conveys power, organization, and authority
- **Status Colors**: Success (green), Warning (orange), Error (red), Info (blue) with gradient variants
- **Helper Functions**: `getProfileColors()`, `getPrimaryColor()`, `getProfileGradient()`, `getBeltColor()`, `getStatusColor()`
- **Theme Support**: Light and dark theme configurations with proper text contrast
- **Color Psychology**: Colors chosen to reinforce each role's purpose and create clear visual hierarchy

# External Dependencies

## Core Services
- **Firebase**: Complete backend infrastructure including Authentication, Firestore database, and Storage
- **Expo**: Development platform providing native module access and build tools
- **React Native Paper**: Material Design component library for consistent UI

## Development Tools
- **TypeScript**: Type safety for domain entities and service interfaces
- **Jest**: Testing framework with specialized configs for unit, integration, and e2e tests
- **ESLint**: Code quality and consistency enforcement
- **Babel**: Code transformation with module resolution for import aliases

## Third-Party Libraries
- **React Navigation**: Multi-stack navigation with drawer, stack, and tab navigators
- **React Native Calendars**: Calendar component for class scheduling and check-ins
- **React Hook Form**: Form validation and management
- **React Native Chart Kit**: Data visualization for reports and statistics
- **Expo Notifications**: Push notifications for academy announcements and reminders

## Build & Deployment
- **Expo Application Services (EAS)**: Build and deployment pipeline for app stores
- **Firebase Hosting**: Web version deployment capability
- **Google Services**: Android build configuration for Firebase integration

# Replit Environment Setup

## Latest Setup Status
✅ **Project successfully re-imported and configured in Replit** (October 13, 2025)
- Fresh clone from GitHub repository set up successfully
- All dependencies installed successfully (1815 packages)
- Development server running on port 5000 with Metro bundler
- Application tested and verified working correctly - Login screen displays properly with all UI elements
- Deployment configuration completed (autoscale with build and serve commands)
- Firebase services initialized successfully for web platform
- Dark mode toggle working
- Language selector functional (Portuguese)

## Configuration Files
- **metro.config.js**: Configured Expo Metro bundler for Replit environment with proper caching headers and port 5000
- **scripts/start-replit.js**: Custom startup script using local Expo CLI (`node_modules/.bin/expo`) to avoid version conflicts, runs on port 5000 with `lan` host mode (binds to 0.0.0.0)
- **babel.config.js**: Configured with module resolver for import aliases (@components, @screens, @services, etc.)
- **Firebase Config**: Hardcoded Firebase credentials in `src/infrastructure/firebase/app.ts` and `src/services/firebase.js` (can be overridden with EXPO_PUBLIC_* environment variables)

## Development Workflow
- **Port**: Frontend runs on port 5000 (required for Replit proxy)
- **Host Mode**: Uses `lan` mode which binds to 0.0.0.0, allowing Replit's proxy to access the server
- **Auto-Restart**: Workflow automatically restarts when dependencies are installed
- **Workflow Name**: "MyGym App" - Runs `npm start` command

## Important Fixes Applied
- **Circular Dependencies**: Fixed 16 service re-export files in `src/services/` that were importing from themselves (`@services/`) instead of from `@infrastructure/services/`
- **Import Aliases**: Corrected imports to use proper aliases pattern (e.g., `@domain/auth/errors` instead of relative paths or incorrect aliases)
- **Migration Scripts**: Disabled automatic migration scripts that were incorrectly modifying imports on every startup

## Deployment Configuration
- **Build Command**: `npm run build:prod` - Exports Expo web app to `dist/` folder
- **Run Command**: `npx serve dist -l 5000 -s` - Serves static files with single-page app support
- **Target**: Autoscale deployment (stateless web app)
- **Deployment**: Ready to publish when needed

## Recent Changes (October 13, 2025)
- **GitHub Import**: Fresh clone of repository successfully imported to Replit
- **Dependency Installation**: All 1815 packages installed without critical errors
- **Startup Script Fix**: Updated `scripts/start-replit.js` to use local Expo CLI instead of npx to prevent version mismatch
- **Host Configuration**: Verified `lan` host mode (0.0.0.0) works correctly with Replit's proxy
- **Deployment Setup**: Configured autoscale deployment with production build and serve commands
- **Testing**: Login screen verified working with all features (dark mode, language selector, social auth buttons)

## Known Issues
- One remaining require cycle in `src/shared/utils/scheduleUtils.js` (does not affect functionality)
- Some peer dependency warnings (do not affect runtime)
- Some deprecation warnings for native animations (expected for web platform)
- Node version warning: Metro requires Node >=20.19.4, but 20.19.3 is installed (still works correctly)