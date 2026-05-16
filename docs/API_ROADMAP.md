# API Roadmap

No real music-platform APIs are currently integrated. Account access uses Firebase Auth, while product data still comes from `src/data/mockData.ts`.

## Platform Strategy

HeatRadar should prioritize platforms that feel native to independent artists and early audience movement:

1. Audius
2. SoundCloud
3. YouTube
4. Spotify

Shazam is intentionally out of scope. It points the product toward recognition tech instead of artist growth tracking.

## Phase 1: Audius

Why first:

- indie-friendly platform fit
- public developer API
- good first proof for real track and engagement data
- lower OAuth and approval friction than larger platforms

Goals:

- connect or search an artist profile
- read track catalog and public engagement
- detect track-level movement
- feed basic Heat Score inputs

Potential data:

- track plays
- favorites
- reposts
- comments
- follower count
- release dates
- trending/context signals where available

Implementation notes:

- start with read-only endpoints
- keep API keys off the client once a backend exists
- normalize Audius data before it reaches screens

## Phase 1: SoundCloud

Why early:

- very relevant for indie artists, demos, remixes, DJs, and early fans
- culturally aligned with artist discovery
- helps HeatRadar feel less like generic streaming analytics

Goals:

- connect SoundCloud account or profile
- read track-level movement where API access allows
- support early traction cards and release movement

Potential data:

- plays
- likes
- reposts
- comments
- followers
- track publish dates

Risks:

- advanced SoundCloud Insights may depend on SoundCloud account tier or API access
- verify available analytics before promising deep SoundCloud stats

OAuth:

- SoundCloud OAuth required for private/account-level data
- backend should store encrypted refresh tokens

## Phase 2: YouTube

Why next:

- strong signal for music videos, shorts, visualizers, and performance clips
- useful engagement data for artists who promote through video

Goals:

- connect Google/YouTube account
- read channel and video performance
- detect engagement spikes around uploads
- support release/video traction

Potential data:

- views
- likes
- comments
- subscribers
- upload dates
- retention/watch-time where available through approved scopes

OAuth:

- Google OAuth required
- use minimal scopes and clear permission copy

## Phase 3: Spotify

Why later:

- important credibility and catalog context
- public Spotify API is useful, but does not replace Spotify for Artists analytics

Goals:

- connect Spotify user/account
- read available catalog, artist, follower, and track context
- support release metadata and audience context where available

Potential data:

- artist profile metadata
- top tracks
- followers
- release dates
- playlists and catalog context where available

Risks:

- public Spotify API may not provide private artist analytics such as true streams, saves, and listener demographics
- avoid positioning Spotify as the primary source of Heat Score until data access is verified

## MVP API Priorities

1. Firebase user identity
2. Artist profile persistence
3. Provider connection records
4. Audius read-only proof of concept
5. SoundCloud read-only proof of concept
6. Heat Score input snapshots
7. YouTube connection and video metrics
8. Spotify catalog/context connection
9. Notification settings and in-app notification records
10. Subscription entitlement state

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
