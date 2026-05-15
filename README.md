# HeatRadar

HeatRadar is a mobile-first growth tracking prototype for independent music artists. It helps artists understand audience traction, engagement movement, release performance, and Heat Score growth in a way that feels simple, premium, motivating, and emotionally rewarding.

The product should feel like the app artists open to see if they are getting heat. It should not feel like enterprise analytics software, productivity tooling, or generic creator SaaS.

## Current Status

This repository currently contains a polished frontend prototype built with mock data only. It is ready for product review, UX iteration, and developer handoff, but it is not production-connected yet.

Currently built:

- onboarding
- mock login preview
- Home dashboard
- Heat Score explanation
- Notifications Center
- Insights
- Releases
- Audience
- Profile
- Settings
- trial/paywall preview
- platform connection state previews
- shareable milestone card previews

Not built yet:

- real authentication
- Firebase backend
- real platform OAuth
- real Spotify, YouTube, Instagram, or SoundCloud data
- real push notifications
- real payments/subscriptions
- native sharing
- App Store / Play Store deployment

## Tech Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Expo Haptics
- Expo Linear Gradient
- mock data in `src/data/mockData.ts`

## Install And Run Locally

```bash
npm install
npm run start
```

Useful scripts:

```bash
npm run ios
npm run android
npm run web
npm run typecheck
npm run lint
```

## Project Structure

- `App.tsx`: root app container and navigation provider
- `src/navigation`: stack and tab navigation
- `src/screens`: product screens and prototype flows
- `src/components/ui`: reusable UI components
- `src/components/layout`: layout and animation helpers
- `src/components/feedback`: loading and empty states
- `src/data/mockData.ts`: centralized prototype data
- `src/theme`: colors, spacing, typography, animation tokens
- `src/hooks`: local prototype hooks
- `src/utils`: formatting, haptics, responsive helpers
- `docs`: product and technical handoff documentation

## Mock-Data-Only Limitations

All current product behavior is local and mocked:

- Heat Score is static mock data.
- Notification read states reset on reload.
- Platform connection states are simulated.
- Trial/paywall actions do not create subscriptions.
- Share cards do not use native sharing.
- Settings toggles do not persist to a backend.

## Developer Onboarding

Start here:

1. Read [docs/HANDOFF_NOTES.md](docs/HANDOFF_NOTES.md).
2. Read [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md).
3. Review `src/data/mockData.ts` to understand current data shapes.
4. Review navigation in `src/navigation`.
5. Run the app locally and QA core flows.
6. Before adding real integrations, define backend data contracts and service boundaries.

## Documentation

- [Product Brief](docs/PRODUCT_BRIEF.md)
- [App Flow](docs/APP_FLOW.md)
- [Tech Stack](docs/TECH_STACK.md)
- [API Roadmap](docs/API_ROADMAP.md)
- [Firebase Plan](docs/FIREBASE_PLAN.md)
- [Notification System](docs/NOTIFICATION_SYSTEM.md)
- [Subscription Plan](docs/SUBSCRIPTION_PLAN.md)
- [Handoff Notes](docs/HANDOFF_NOTES.md)
- [Future Ideas](docs/FUTURE_IDEAS.md)
