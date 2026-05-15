# Notification System

Real push notifications are not currently implemented. The current notification system is mock UI and local state only.

## Philosophy

Notifications are a core retention mechanic for HeatRadar. They should make artists feel:

- encouraged
- validated
- excited
- curious
- motivated

The core feeling is:

"Something exciting might be happening with my music."

Avoid:

- spammy alerts
- anxiety-inducing language
- fake hype
- corporate analytics wording
- cluttered inbox behavior

## Dopamine / Reward Loop Strategy

Notification loop:

1. Artist receives a meaningful alert.
2. Alert creates curiosity without pressure.
3. Opening the app reveals Heat Score movement, a highlighted insight, engagement spike, release traction, or milestone.
4. Artist feels rewarded for checking.
5. App remains quiet until something meaningful changes again.

## Notification Categories

### Heat Movement

Examples:

- "Your Heat Score increased this week."
- "You're gaining stronger traction."
- "Your audience activity is heating up."

### Engagement Spikes

Examples:

- "Your latest upload is outperforming recent posts."
- "Listener engagement increased today."
- "Your audience is responding to your newest release."

### Release Momentum

Examples:

- "Your latest release is gaining traction."
- "This track is outperforming your last release."
- "Your newest song is building momentum."

### Milestones

Examples:

- "You hit 1,000 total listeners."
- "Your audience grew 20% this month."
- "New audience milestone unlocked."

### Comeback / Re-Engagement

Examples:

- "Things are moving. Check your Heat Score."
- "Your audience activity changed since your last visit."
- "You've got new traction insights waiting."

## Milestone Logic

Milestones should trigger only for emotionally meaningful events:

- listener count thresholds
- audience growth percentages
- Heat Score jumps
- release performance outliers
- engagement spikes

Avoid celebrating every tiny change. The app should preserve trust.

## Cooldown Logic

Cooldown rules should prevent spam.

Suggested rules:

- no duplicate category alerts within a short window
- suppress low-signal changes
- prioritize one strong alert over several weak ones
- batch small updates into weekly summaries
- avoid comeback nudges unless there is real new movement

Current prototype includes cooldown copy only. Real cooldown logic must be server-side.

## Push Vs In-App Behavior

Push notifications:

- only for meaningful movement
- short and curiosity-driven
- no dense metrics

In-app notifications:

- can include more detail
- show category, timestamp, reward signal, and explanation
- support read/unread state

## Retention Strategy

Retention should come from emotional usefulness, not noise.

Best retention surfaces:

- Home reward highlights
- Notifications Center
- Heat Score movement
- shareable milestone cards
- weekly summaries

## Current Prototype

Built:

- grouped Notifications Center
- unread states
- timestamps
- category indicators
- reward signals
- cooldown messaging
- detail bottom sheets
- mark-all-read action

Not built:

- real push delivery
- push tokens
- server-side notification generation
- server-side cooldowns
- persisted read state
