# Task: Implement Preferences and Appearance Modals in User Profiles

Refactor the "Preferences" and "Appearance" settings into bottom-sheet style modals accessible directly from user profile screens (`ProfileScreen` and `StudentProfileScreen`).

## Status
- [x] Analysis of existing settings logic
- [x] Implementation of `AppearanceModal` component
- [x] Implementation of `PreferencesModal` component
- [x] Integration into `ProfileScreen.tsx`
- [x] Integration into `StudentProfileScreen.tsx`
- [x] Verification and bug fixes

## Details
- Modals should follow the "Bottom Sheet" pattern ("que sobre").
- Changes should be applied instantly.
- Consistent design with the rest of the application (Modern/Glassmorphism).

## 1. Analysis
- `SettingsScreen.tsx` contains the current implementation of these settings.
- `ThemeToggleSwitch.js` handles theme selection.
- `useTheme` and `useAuthFacade` provide the necessary context.

## 2. Components to Create
- `src/presentation/components/modals/AppearanceModal.tsx`
- `src/presentation/components/modals/PreferencesModal.tsx`

## 3. Integration
- Add triggers to `ProfileScreen.tsx`.
- Add triggers to `StudentProfileScreen.tsx`.
