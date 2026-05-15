# HeatRadar Agent Instructions

HeatRadar is the official app name. Keep this terminology consistent across UI, documentation, code comments, and product copy.

Use **Heat Score** for the central score concept. Heat Score should feel transparent, motivating, and easy to understand. Explain it through audience growth, engagement movement, release activity, and cross-platform traction.

## Product Direction

HeatRadar is a mobile-first growth tracking app for independent music artists.

The product focus is:

- audience traction
- engagement movement
- release performance
- Heat Score growth
- emotional motivation for artists

The app should feel:

- simple
- premium
- emotionally rewarding
- culturally relevant
- modern
- motivating

The product feeling is: "the app artists open to see if they're getting heat."

Avoid positioning HeatRadar as:

- enterprise analytics software
- productivity/task management
- generic creator SaaS
- an admin dashboard
- a confusing data visualization tool

## Current Prototype Rules

- Use mock data only.
- Do not add Firebase yet.
- Do not add real APIs yet.
- Do not add real authentication yet.
- Do not add real payments or subscriptions yet.
- Do not add real push notifications yet.
- Do not add new product features during handoff/documentation work.

## UX Principles

- Make small artist wins feel meaningful.
- Keep empty states encouraging.
- Keep notifications exciting but not spammy.
- Pair Heat Score with plain-language explanation.
- Use progressive disclosure instead of dense dashboards.
- Prefer emotional clarity over raw metric volume.

## Engineering Notes

- Keep shared UI in `src/components/ui`.
- Keep layout primitives in `src/components/layout`.
- Keep loading and empty states in `src/components/feedback`.
- Keep mock product data centralized in `src/data/mockData.ts`.
- Keep theme values centralized in `src/theme`.
- Keep documentation in `docs`.
- Add comments only where they clarify non-obvious prototype behavior.
- Prefer simple, maintainable architecture over clever abstractions.
