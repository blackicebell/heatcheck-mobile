# Subscription Plan

Real payments are not currently integrated.

## Current Prototype

The app currently includes:

- 7-day free trial screen
- `$4.99/month` subscription copy
- trial countdown UI
- locked premium feature cards
- upgrade CTAs

All subscription behavior is UI-only.

## Pricing

Initial proposed plan:

- 7-day free trial
- `$4.99/month` after trial

This price supports a lightweight independent artist tool. Revisit pricing after testing perceived value with real artists.

## Paywall Strategy

Do not block the first emotional reward.

Good paywall moments:

- after Heat Score value is understood
- when tapping locked share card tools
- when trying to unlock deeper score breakdown
- after seeing notification or milestone value

Avoid:

- hard paywall before onboarding value
- fear-based upgrade copy
- making free users feel punished

## Premium Features

Potential Pro features:

- full cross-platform Heat Score breakdown
- shareable milestone cards
- weekly HeatCheck recap
- deeper release traction history
- advanced notification controls
- platform-by-platform signal explanations

## Trial Conversion UX

The trial should feel like:

"I want more clarity because something is starting to move."

Trial screen should explain:

- what unlocks
- how long the trial lasts
- monthly price
- no real payment in prototype

Future production should clearly communicate billing timing and cancellation terms.

## App Store Subscription Considerations

Production mobile subscriptions need:

- Apple In-App Purchase setup
- Google Play Billing setup
- subscription product IDs
- entitlement validation
- restore purchases
- cancellation handling
- terms and privacy policy
- App Store review compliance

Recommended implementation path:

1. Use RevenueCat or similar subscription entitlement layer.
2. Keep entitlement state synced to backend.
3. Avoid trusting local state for premium access.
4. Add analytics around trial start, paywall view, conversion, cancellation.
