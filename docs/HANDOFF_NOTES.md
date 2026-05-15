# Handoff Notes

## Current Prototype Status

HeatRadar is currently a frontend-only Expo React Native prototype. It is designed to validate product direction, UX flows, copy, information hierarchy, and emotional retention mechanics.

The app is not production-ready yet because there is no real backend, authentication, platform data, push notification delivery, native sharing, or subscription implementation.

## What Is Completed

Screens:

- Splash
- Onboarding
- Login preview
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

All product data currently comes from `src/data/mockData.ts`, including:

- artist profile
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

## Backend Work Still Needed

- real authentication
- user profile persistence
- artist profile persistence
- platform connection token handling
- platform sync jobs
- Heat Score calculation
- notification generation
- notification cooldown logic
- subscription entitlement sync
- real settings persistence

## APIs Not Integrated Yet

- Spotify OAuth/API
- YouTube/Google OAuth/API
- Instagram/Meta API
- SoundCloud API
- real push notification service
- real payment/subscription provider
- native sharing

## Known Limitations

- UI state resets on reload.
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
3. Add Firebase Auth and user profile persistence.
4. Implement Firestore security rules and schema.
5. Add Spotify OAuth as the first real platform integration.
6. Replace Heat Score mock data with backend snapshots.
7. Add real notification storage and read states.
8. Implement push notifications and cooldown logic.
9. Implement subscription entitlement handling.
10. Prepare App Store and Play Store deployment requirements.

## Recommended Next Engineering Steps

Start small:

1. Confirm app runs locally with `npm install` and `npm run start`.
2. Test on iOS and Android simulators.
3. Review `src/data/mockData.ts` and define real data contracts.
4. Add a service layer before replacing mock data.
5. Implement auth and persistence before provider integrations.
6. Replace one screen at a time with real data.
