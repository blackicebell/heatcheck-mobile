# API Roadmap

No real APIs are currently integrated. All data is mocked in `src/data/mockData.ts`.

## Platform Integration Goals

### Spotify

Goals:

- connect artist account or relevant artist profile
- read streams, saves, listeners, followers, playlist activity where available
- support release-level performance
- support audience growth and repeat listener signals

Potential data:

- track streams
- saves
- listeners
- follower changes
- playlist adds
- release dates

OAuth:

- Spotify OAuth required
- backend should store encrypted refresh tokens
- client should never directly own long-lived provider tokens

### YouTube

Goals:

- read channel/video performance
- detect upload engagement spikes
- support release/video traction

Potential data:

- views
- watch time or retention where available
- likes
- comments
- subscribers
- upload dates

OAuth:

- Google OAuth required
- scopes should be minimal and clearly explained

### Instagram

Goals:

- read public content and engagement movement
- detect Reels/posts that may influence music traction
- support social conversion signals

Potential data:

- reach
- likes
- comments
- shares if available
- profile visits if available
- content publish dates

OAuth:

- Meta/Instagram Graph API approval may be required
- scope availability depends on account type and app review

### SoundCloud

Goals:

- support early independent artist traction
- read plays, likes, reposts, comments where API access allows

Potential data:

- plays
- likes
- reposts
- comments
- followers
- track publish dates

OAuth:

- depends on current SoundCloud API access and approval process

## MVP API Priorities

1. Authenticated user identity
2. Artist profile persistence
3. Platform connection records
4. Spotify connection and basic metrics
5. Heat Score input snapshots
6. Notifications and settings
7. Subscription entitlement state

## Mock Data Vs Future Real Data

Current mock data includes:

- Heat Score
- notifications
- releases
- audience segments
- insights
- connection states
- trial/paywall content
- share cards

Future real data should be normalized before reaching UI screens. Screens should not depend on raw provider response shapes.

## Recommended API Pattern

Create backend endpoints that serve app-ready data:

- `GET /me`
- `GET /artist/profile`
- `GET /artist/heat-score`
- `GET /artist/insights`
- `GET /artist/releases`
- `GET /artist/audience`
- `GET /artist/share-cards`
- `GET /notifications`
- `PATCH /notifications/:id`
- `GET /connections`
- `POST /connections/:provider/start`
- `POST /connections/:provider/callback`
- `PATCH /notification-settings`
- `GET /subscription`

Keep scoring, sync, cooldown, token storage, and provider transformations backend-owned.
