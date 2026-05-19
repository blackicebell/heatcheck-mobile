export const artist = {
  name: "Your artist",
  handle: "@yourartist",
  focus: "Connect a platform to start reading real signal.",
  initials: "YA",
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

export const notificationGroups = [
  "Heat Movement",
  "Engagement Spikes",
  "Release Momentum",
  "Audience Reach",
  "Comeback",
] as const;

export const settings = [
  {
    label: "Heat Alerts",
    body: "Notify me when connected platform signals move.",
    enabled: true,
  },
  {
    label: "Engagement Alerts",
    body: "Tell me when public plays, favorites, reposts, or channel reach are worth checking.",
    enabled: true,
  },
  {
    label: "Release Alerts",
    body: "Alert me when a connected track becomes the clearest signal.",
    enabled: true,
  },
  {
    label: "Audience Reach Alerts",
    body: "Tell me when connected public reach signals are worth checking.",
    enabled: true,
  },
  {
    label: "Weekly Summaries",
    body: "A calm recap from connected platform signals.",
    enabled: true,
  },
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
    detail: "Public views, subscribers, videos",
    permission: "Paste a public YouTube channel handle or URL. HeatRadar reads public stats only.",
  },
  {
    id: "spotify",
    name: "Spotify",
    status: "Not connected",
    detail: "Profile, followers, top tracks",
    permission: "HeatRadar reads available Spotify profile signals. It cannot access Spotify for Artists private analytics yet.",
  },
];

export const emptyStates = {
  connectedAccounts: {
    title: "Connect one account to start feeling the heat",
    body: "Start with Audius or YouTube. HeatRadar only needs enough signal to show what is beginning to move.",
  },
  insights: {
    title: "No fresh signals yet",
    body: "Once your next trend appears, this space becomes a focused list of what deserves action.",
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
    body: "Connect Audius, YouTube, or Spotify so HeatRadar can show the signals it can actually read.",
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
    title: "Audience reach",
    body: "YouTube views and subscribers, plus Spotify followers when available, help show the size of your connected audience signal.",
  },
  {
    title: "Public engagement",
    body: "Audius plays, favorites, and reposts help show whether a public track is getting action.",
  },
  {
    title: "Release activity",
    body: "Connected Spotify top tracks and Audius tracks help identify which songs have the clearest available signal.",
  },
  {
    title: "Cross-platform traction",
    body: "HeatRadar compares only the platforms you connect, then explains which available signal is driving the read.",
  },
];
