export const artist = {
  name: "Mira Vale",
  handle: "@miravale",
  city: "Atlanta, GA",
  focus: "Turning stronger listener movement into real release heat.",
  initials: "MV",
};

export const onboardingSlides = [
  {
    title: "See what's actually moving your audience.",
    body: "HeatRadar turns scattered music signals into a simple read on growth, traction, and engagement.",
    accent: "#44F08A",
  },
  {
    title: "Know why you're getting heat.",
    body: "See what changed, what helped, and where listeners are leaning in this week.",
    accent: "#72A7FF",
  },
  {
    title: "Feel the lift.",
    body: "Open the app for a quick hit of progress without digging through confusing dashboards.",
    accent: "#FF68B3",
  },
];

export const dashboard = {
  isLoading: false,
  heatScore: 84,
  weeklyChange: "+12%",
  headline: "You're gaining stronger traction this week.",
  scoreExplanation: "Driven by audience growth and engagement this week.",
  scoreBoost: "Your latest release boosted listener activity.",
  scoreAction: "Engagement increased after your recent upload.",
  nextMove: "Post the acoustic hook clip before 7 PM. Saves are strongest after work today.",
  contributors: [
    { label: "Audience growth", value: "Strong", change: "+18%" },
    { label: "Engagement", value: "Rising", change: "+24%" },
    { label: "Release lift", value: "Hot", change: "+12%" },
  ],
  stats: [
    { label: "Streams", value: "128.4K", change: "+18%" },
    { label: "Saves", value: "9.8K", change: "+24%" },
    { label: "Followers", value: "42.1K", change: "+7%" },
  ],
  sparkline: [18, 24, 22, 36, 42, 51, 48, 63, 76, 84],
};

export const notifications = [
  {
    id: "heat-1",
    category: "Heat Movement",
    title: "Your Heat Score increased this week.",
    body: "Audience growth and engagement are both moving in the right direction.",
    timestamp: "12 min ago",
    unread: true,
    cooldown: "Next similar alert in 2 days",
    reward: "Heat Score +12%",
  },
  {
    id: "engagement-1",
    category: "Engagement Spikes",
    title: "Your latest upload is outperforming recent posts.",
    body: "Listeners are saving and replaying more than usual today.",
    timestamp: "1 hr ago",
    unread: true,
    cooldown: "Engagement alerts are limited to meaningful spikes.",
    reward: "Engagement +24%",
  },
  {
    id: "release-1",
    category: "Release Momentum",
    title: "Your latest release is gaining traction.",
    body: "Soft Static is pulling stronger repeat listens than your last release.",
    timestamp: "Yesterday",
    unread: false,
    cooldown: "Release alerts pause after one strong signal per day.",
    reward: "Release lift +12%",
  },
  {
    id: "milestone-1",
    category: "Milestones",
    title: "New audience milestone unlocked.",
    body: "Your audience grew 20% this month.",
    timestamp: "2 days ago",
    unread: false,
    cooldown: "Milestones only trigger when something worth celebrating happens.",
    reward: "20% monthly growth",
  },
  {
    id: "comeback-1",
    category: "Comeback",
    title: "Things are moving. Check your Heat Score.",
    body: "Your audience activity changed since your last visit.",
    timestamp: "4 days ago",
    unread: false,
    cooldown: "Comeback nudges stay quiet unless there is a fresh signal.",
    reward: "New traction insight",
  },
];

export const notificationGroups = [
  "Heat Movement",
  "Engagement Spikes",
  "Release Momentum",
  "Milestones",
  "Comeback",
] as const;

export const retentionHighlights = [
  {
    label: "Heat Score movement",
    value: "+12%",
    body: "You're gaining stronger traction this week.",
  },
  {
    label: "Engagement spike",
    value: "+24%",
    body: "Your newest upload is getting more saves and replays.",
  },
  {
    label: "Release traction",
    value: "91",
    body: "Soft Static is pulling repeat listeners.",
  },
];

export const notificationCooldown = {
  summary: "HeatRadar is holding back 6 low-signal alerts this week.",
  detail:
    "Only meaningful movement becomes a notification, so the app feels exciting without getting noisy.",
};

export const insights = [
  {
    title: "Late-night listeners are converting",
    body: "Saves between 10 PM and midnight are up 31%. Lean into intimate clips and lyric-led posts.",
    detail: "The strongest audience behavior is happening after the daily commute. A simple vertical clip with the hook first should feel timely without overproducing it.",
    tone: "green" as const,
  },
  {
    title: "Chicago is over-indexing",
    body: "Audience lift is 2.3x stronger than your average market. This is a strong test city for release week.",
    detail: "Chicago listeners are arriving from short-form discovery and staying through the second chorus. Treat it like an early market signal, not just a lucky spike.",
    tone: "blue" as const,
  },
  {
    title: "Completion dipped on track 4",
    body: "The intro may be too long for first-time listeners. Consider a short-form edit.",
    detail: "Returning fans are fine, but first-time listeners are skipping before the vocal starts. A tighter edit could protect discovery traction.",
    tone: "pink" as const,
  },
];

export const releases = [
  {
    title: "Soft Static",
    date: "May 24",
    status: "Pre-save live",
    score: 91,
    detail: "Strongest traction is coming from saves and repeat listens. Keep the campaign focused on intimacy and anticipation.",
  },
  {
    title: "Downtown Weather",
    date: "Apr 12",
    status: "Climbing",
    score: 78,
    detail: "This release is still gaining through playlist explorers. A low-effort visualizer could extend its life another week.",
  },
  {
    title: "Room Tone",
    date: "Feb 02",
    status: "Catalog lift",
    score: 66,
    detail: "Catalog listeners are finding it after Soft Static. Surface it as a companion track instead of pushing it like a new single.",
  },
];

export const audienceSegments = [
  { label: "Day-one fans", value: 38, color: "#44F08A" },
  { label: "Playlist explorers", value: 27, color: "#72A7FF" },
  { label: "Social converts", value: 21, color: "#FF68B3" },
  { label: "Dormant listeners", value: 14, color: "#FFCF5F" },
];

export const settings = [
  {
    label: "Heat alerts",
    body: "Notify me when listener movement spikes.",
    enabled: true,
  },
  {
    label: "Engagement alerts",
    body: "Tell me when listeners are saving, replaying, or responding more than usual.",
    enabled: true,
  },
  {
    label: "Release alerts",
    body: "Alert me when a song starts picking up.",
    enabled: true,
  },
  {
    label: "Milestone alerts",
    body: "Celebrate meaningful audience growth without overdoing it.",
    enabled: true,
  },
  {
    label: "Weekly summaries",
    body: "A calm recap of heat, engagement, and release movement.",
    enabled: true,
  },
  {
    label: "Push notifications",
    body: "Mock-only push preference for future notification delivery.",
    enabled: false,
  },
  {
    label: "Quiet mode",
    body: "Reduce nonessential alerts during creative time.",
    enabled: false,
  },
];

export const accountSettings = [
  { label: "Plan", value: "HeatRadar Pro preview" },
  { label: "Artist profile", value: "Mira Vale" },
  { label: "Data mode", value: "Mock only" },
];

export const platformConnections = [
  {
    id: "audius",
    name: "Audius",
    status: "Connected",
    detail: "Tracks, favorites, reposts",
    permission: "HeatRadar reads public track movement and engagement. It never posts for you.",
  },
  {
    id: "youtube",
    name: "YouTube",
    status: "Reconnect",
    detail: "Views, subscribers, retention",
    permission: "HeatRadar reads video performance and retention signals. Your channel stays in your control.",
  },
  {
    id: "spotify",
    name: "Spotify",
    status: "Not connected",
    detail: "Catalog, followers, top tracks",
    permission: "HeatRadar reads available catalog and listener context. It cannot access Spotify for Artists private analytics yet.",
  },
];

export const emptyStates = {
  connectedAccounts: {
    title: "Connect one account to start feeling the heat",
    body: "Start with Audius or YouTube. HeatRadar only needs enough signal to show what is beginning to move.",
  },
  insights: {
    title: "No fresh signals yet",
    body: "Once your next mock trend appears, this space becomes a focused list of what deserves action.",
  },
  notifications: {
    title: "No heat alerts yet",
    body: "When something meaningful changes, this becomes the place that makes you want to open the app.",
  },
  releases: {
    title: "No releases queued",
    body: "Your release performance will show here once a song has enough movement to read.",
  },
  traction: {
    title: "Your traction read is warming up",
    body: "Small numbers still matter. HeatRadar will call out early saves, repeat listens, and new pockets of attention.",
  },
  audience: {
    title: "Audience mix is warming up",
    body: "Segments appear once HeatRadar has enough mock listener behavior to make the read useful.",
  },
  audienceGrowth: {
    title: "Audience growth starts with tiny signals",
    body: "A few saves, shares, or repeat listeners can be the first hint that something is catching.",
  },
};

export const loadingCopy = {
  dashboard: "Checking your latest heat...",
  syncMessages: [
    "Checking for new audience movement...",
    "Scanning for traction signals...",
    "Updating your Heat Score...",
    "Looking for new release activity...",
  ],
};

export const heatScoreEducation = [
  {
    title: "Audience growth",
    body: "New listeners, returning fans, and city-level movement help show whether your audience is expanding.",
  },
  {
    title: "Engagement",
    body: "Saves, replays, shares, and comments tell HeatRadar whether people are leaning in.",
  },
  {
    title: "Release activity",
    body: "New songs, catalog lifts, and pre-save movement help explain what is creating heat.",
  },
  {
    title: "Cross-platform traction",
    body: "HeatRadar looks across connected platforms so one strong signal does not get buried.",
  },
];

export const trialPlan = {
  daysLeft: 7,
  price: "$4.99/month",
  headline: "Try HeatRadar Pro free for 7 days",
  body: "Unlock deeper heat explanations, share cards, and platform-by-platform traction reads. No real payment is connected in this prototype.",
  lockedFeatures: [
    "Full cross-platform Heat Score breakdown",
    "Shareable milestone cards",
    "Weekly heat recap",
  ],
};

export const shareCards = [
  {
    title: "Heat Score up",
    value: "+12%",
    body: "Audience growth and engagement pushed your score higher this week.",
    accent: "#44F08A",
  },
  {
    title: "Audience milestone",
    value: "1K",
    body: "You hit 1,000 total listeners.",
    accent: "#72A7FF",
  },
  {
    title: "Release traction",
    value: "91",
    body: "Soft Static is gaining stronger repeat listens.",
    accent: "#FF68B3",
  },
  {
    title: "Engagement spike",
    value: "+24%",
    body: "Your latest upload is outperforming recent posts.",
    accent: "#FFCF5F",
  },
];
