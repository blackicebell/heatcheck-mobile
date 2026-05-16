# Firebase Plan

Firebase is not currently integrated.

## Firebase Auth Setup Goals

Use Firebase Authentication for:

- email/password or magic link login
- Apple sign-in
- Google sign-in
- session persistence

Auth should establish user identity only. Platform OAuth tokens should be handled separately and stored securely server-side.

## Firestore Structure Recommendations

Suggested collections:

- `users`
- `artists`
- `platformConnections`
- `heatScoreSnapshots`
- `insights`
- `releases`
- `audienceSnapshots`
- `notifications`
- `notificationSettings`
- `subscriptions`
- `shareCards`

## User Profile Structure

Example `users/{userId}`:

```json
{
  "displayName": "Mira Vale",
  "email": "artist@example.com",
  "artistId": "artist_123",
  "createdAt": "timestamp",
  "lastSeenAt": "timestamp"
}
```

Example `artists/{artistId}`:

```json
{
  "name": "Mira Vale",
  "handle": "@miravale",
  "city": "Atlanta, GA",
  "ownerUserId": "user_123",
  "createdAt": "timestamp"
}
```

## Notification Storage

Example `notifications/{notificationId}`:

```json
{
  "artistId": "artist_123",
  "category": "Heat Movement",
  "title": "Your Heat Score increased this week.",
  "body": "Audience growth and engagement are moving.",
  "reward": "Heat Score +12%",
  "read": false,
  "createdAt": "timestamp"
}
```

## Heat Score Storage

Use snapshots so the app can explain score movement over time.

Example `heatScoreSnapshots/{snapshotId}`:

```json
{
  "artistId": "artist_123",
  "score": 84,
  "change": 12,
  "contributors": {
    "audienceGrowth": 18,
    "engagement": 24,
    "releaseActivity": 12,
    "crossPlatformTraction": 9
  },
  "explanation": "Driven by audience growth and engagement this week.",
  "createdAt": "timestamp"
}
```

## Subscription Status Handling

Store entitlement state separately from payment provider events.

Example `subscriptions/{userId}`:

```json
{
  "status": "trialing",
  "plan": "pro",
  "trialEndsAt": "timestamp",
  "provider": "revenuecat",
  "updatedAt": "timestamp"
}
```

## Scalable Architecture Recommendations

- Keep provider tokens out of client-readable Firestore.
- Use Cloud Functions or a secure backend for platform sync.
- Store normalized metric snapshots, not only raw API payloads.
- Calculate Heat Score server-side.
- Generate notifications server-side using cooldown rules.
- Use Firestore security rules to isolate user and artist data.
- Add indexes for artist timelines, notifications, and score snapshots.

## Suggested Build Order

1. Firebase project setup.
2. Firebase Auth.
3. User and artist profile persistence.
4. Firestore security rules.
5. Platform connection records.
6. Audius sync proof of concept.
7. Heat Score snapshots.
8. Notifications and notification settings.
9. Subscription entitlement state.
