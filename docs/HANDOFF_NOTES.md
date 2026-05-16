# Handoff Notes

## Current Prototype Status

HeatRadar is currently an Expo React Native prototype with Firebase Auth connected. It is designed to validate product direction, UX flows, copy, information hierarchy, and emotional retention mechanics.

The app is not production-ready yet because there is no production backend for platform data, push notification delivery, native sharing, or subscription implementation.

## What Is Completed

Screens:

- Splash
- Onboarding
- Login
- Artist Setup
- Home
- Insights
- Releases
- Audience
- Profile
- Settings
- Notifications Center
- Heat Score Education
- Trial Paywall

Reusable systems:

- shared UI components
- screen containers
- bottom sheet modals
- stat cards
- insight cards
- traction alerts
- loading skeletons
- empty states
- haptic helper
- mock refresh hook
- locked feature cards
- share milestone cards

Mock flows:

- Heat Score explanation
- notification categories and cooldown simulation
- platform connection states
- pull-to-refresh
- release detail bottom sheets
- audience and insight detail bottom sheets
- local settings toggles
- trial/paywall preview
- locked premium states
- shareable milestone previews

## What Uses Mock Data

Most product data currently comes from `src/data/mockData.ts`, including:

- Heat Score
- Heat Score contributors
- insights
- releases
- audience segments
- notifications
- notification cooldown copy
- platform connection states
- trial/subscription copy
- share card content
- empty state content

Firebase Auth is real. Artist name is saved locally and attempted in Firestore, then used in Home, Profile, and Settings.

## Backend Work Still Needed

- production user profile persistence
- production artist profile persistence
- platform connection token handling
- platform sync jobs
- Heat Score calculation
- notification generation
- notification cooldown logic
- subscription entitlement sync
- real settings persistence

## APIs Not Integrated Yet

- Audius API
- YouTube/Google OAuth/API
- Spotify OAuth/API
- real push notification service
- real payment/subscription provider
- native sharing

## Known Limitations

- Platform connection state is local-only.
- Notification read state is local-only.
- Heat Score is static mock data.
- Trial/paywall is UI-only.
- Share cards are previews only.
- No device QA has been completed in this environment.
- Accessibility pass still needed.

## Development Priorities

1. Run and QA the Expo app on real devices.
2. Clean up package versions if needed after installing dependencies.
3. Harden Firebase Auth, Firestore rules, and user profile persistence.
4. Add Audius as the first real platform proof of concept.
5. Add YouTube/Google API as the second platform integration.
6. Replace Heat Score mock data with backend snapshots.
7. Add Spotify catalog/context integration.
9. Add real notification storage and read states.
10. Implement push notifications and cooldown logic.
11. Implement subscription entitlement handling.
12. Prepare App Store and Play Store deployment requirements.

## Recommended Next Engineering Steps

Start small:

1. Confirm app runs locally with `npm install` and `npm run start`.
2. Test on iOS and Android simulators.
3. Review `src/data/mockData.ts` and define real data contracts.
4. Add a service layer before replacing mock data.
5. Implement auth and persistence before provider integrations.
6. Replace one screen at a time with real data.
