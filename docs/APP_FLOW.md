# App Flow

## Onboarding Flow

Current flow:

1. Splash introduces HeatRadar.
2. Onboarding explains audience movement, why the artist is getting heat, and progress/reward.
3. Login preview enters the mock app without real authentication.

Goal:

- help users understand the app in seconds
- avoid asking for too much setup too early
- make small artists feel included
- establish Heat Score as understandable, not mysterious

Future onboarding should add platform connection after value is clear, not before.

## Navigation Structure

Root stack:

- Splash
- Onboarding
- Login
- AppTabs
- Notifications
- HeatScoreEducation
- TrialPaywall

Bottom tabs:

- Home
- Insights
- Releases
- Audience
- Profile
- Settings

## Dashboard Flow

Home is the main retention surface.

It currently shows:

- Heat Score
- weekly score movement
- plain-language explanation
- contributing signals
- sync messages
- reward highlights since last alert
- locked share card preview
- share card previews
- next move

Dashboard should always answer:

- Am I getting heat?
- Why did the score move?
- What should I notice?
- What feels worth opening the app for?

## Notifications Flow

Home bell opens Notifications Center.

Notifications Center includes:

- grouped categories
- unread states
- timestamps
- reward signals
- cooldown explanation
- notification detail bottom sheets

Notification categories:

- Heat Movement
- Engagement Spikes
- Release Momentum
- Milestones
- Comeback

Notifications should create curiosity without pressure.

## Connection Flow

Settings includes fake platform connections for:

- Spotify
- YouTube
- Instagram
- SoundCloud

Current states:

- connected
- not connected
- failed
- reconnect
- loading

Each platform includes permission explanation copy. Real OAuth is not implemented.

## Paywall And Trial Flow

TrialPaywall screen includes:

- 7-day free trial
- `$4.99/month`
- trial countdown UI
- locked feature list
- upgrade CTA

Current state is UI-only. No real payments are implemented.

## Settings And Profile Flow

Profile focuses on:

- simple artist profile info
- Heat Score summary
- connected accounts
- notification settings
- account/subscription preview

Settings focuses on:

- platform connections
- notification preferences
- mock privacy/backend status

Avoid task management or artist admin workflows.

## Heat Score Flow

Heat Score appears on Home and Profile.

HeatScoreEducation explains the score through:

- audience growth
- engagement
- release activity
- cross-platform traction

Heat Score should always be paired with supporting explanation.

## Empty States

Empty states exist for:

- no connected accounts
- no releases yet
- no notifications yet
- no traction yet
- no audience growth yet

Tone should be motivating. Small numbers should feel like early signals, not failure.

## Retention Loops

Current retention mechanics:

- notifications with reward signals
- Heat Score movement
- "Since your last alert" highlights
- shareable milestone previews
- pull-to-refresh
- haptic feedback
- trial/paywall upgrade moments

Future retention should remain tasteful and non-spammy.
