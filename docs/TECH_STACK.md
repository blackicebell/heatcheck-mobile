# Tech Stack

## Current Frontend Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Expo Haptics
- Expo Linear Gradient
- React Native Gesture Handler
- React Native Reanimated
- React Native Safe Area Context
- React Native Screens

## Expo / React Native Setup

Entry points:

- `index.ts`
- `App.tsx`

Navigation:

- Root stack in `src/navigation/RootNavigator.tsx`
- Bottom tabs in `src/navigation/AppTabs.tsx`

Current app config:

- `app.json`
- `babel.config.js`
- `tsconfig.json`

## TypeScript Usage

TypeScript is used for:

- navigation param lists
- component props
- mock data-derived types
- simple utility contracts

Recommended next step:

- formalize domain types in `src/types`
- avoid deriving too many app-level types directly from mock data once real APIs exist

## Recommended Architecture

Current structure:

- `src/components/ui`: reusable UI components
- `src/components/layout`: screen structure and layout helpers
- `src/components/feedback`: loading and empty states
- `src/screens`: route-level screens
- `src/navigation`: navigation setup
- `src/data`: mock data
- `src/hooks`: local hooks
- `src/theme`: shared design tokens
- `src/utils`: small utilities

Recommended production additions:

- `src/services`: app-facing data service layer
- `src/domain`: domain types and transformation helpers
- `src/store` or query cache if state grows
- `src/features` only if screens become too large

Do not over-abstract early. Keep the app understandable.

## Backend Recommendations

Recommended near-term backend:

- Firebase Auth
- Firestore
- Cloud Functions
- Firebase Cloud Messaging

Alternative backend:

- Supabase or custom Node API if SQL/reporting needs become more important

For the current product, Firebase is a good fit because the MVP needs auth, user state, notification storage, background sync, and push notifications.

## Firebase Recommendations

Use Firebase for:

- authentication
- user/artist profile storage
- notification storage
- settings persistence
- subscription entitlement mirror
- Heat Score snapshots

Use Cloud Functions or another secure backend for:

- OAuth token exchange
- provider sync
- Heat Score calculation
- notification cooldown logic

## Development Standards

- Keep product copy clear and artist-friendly.
- Keep Heat Score explanations transparent.
- Avoid enterprise dashboard patterns.
- Keep mock and real data boundaries obvious.
- Prefer readable components over clever abstractions.
