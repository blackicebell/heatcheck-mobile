import AsyncStorage from "@react-native-async-storage/async-storage";

import { AudiusTrack } from "@/services/audius";
import { HeatScoreRead } from "@/services/heatScore";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

const signalHistoryStorageKey = "heatradar.signal-history";
const maxStoredSnapshots = 14;

export type SignalSnapshot = {
  capturedAt: string;
  connectedSources: number;
  heatScore: number;
  publicEngagement: number;
  topSignal: "Audius" | "Spotify" | "YouTube" | "Waiting";
  topTrack?: string;
  totalAudience: number;
};

export type SignalHistoryRead = {
  body: string;
  headline: string;
  label: string;
  tone: "green" | "blue" | "pink";
  value: string;
};

type SignalHistoryInput = {
  audiusTracks: AudiusTrack[];
  heatScoreRead: HeatScoreRead;
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

export async function saveSignalSnapshot(input: SignalHistoryInput) {
  const snapshot = toSignalSnapshot(input);

  if (snapshot.connectedSources === 0) {
    return getSignalHistory();
  }

  const existingHistory = await getSignalHistory();
  const todayKey = getDayKey(snapshot.capturedAt);
  const withoutToday = existingHistory.filter(
    (item) => getDayKey(item.capturedAt) !== todayKey,
  );
  const nextHistory = [snapshot, ...withoutToday]
    .sort(
      (first, second) =>
        new Date(second.capturedAt).getTime() - new Date(first.capturedAt).getTime(),
    )
    .slice(0, maxStoredSnapshots);

  await AsyncStorage.setItem(signalHistoryStorageKey, JSON.stringify(nextHistory));

  return nextHistory;
}

export async function getSignalHistory() {
  const rawHistory = await AsyncStorage.getItem(signalHistoryStorageKey);

  if (!rawHistory) {
    return [];
  }

  try {
    return JSON.parse(rawHistory) as SignalSnapshot[];
  } catch {
    return [];
  }
}

export function buildSignalHistoryReads(history: SignalSnapshot[]): SignalHistoryRead[] {
  const [latest, previous] = history;

  if (!latest) {
    return [];
  }

  const scoreMovement = previous ? latest.heatScore - previous.heatScore : 0;
  const audienceMovement = previous ? latest.totalAudience - previous.totalAudience : 0;
  const engagementMovement = previous
    ? latest.publicEngagement - previous.publicEngagement
    : 0;

  return [
    {
      body: previous
        ? getMovementBody("Heat Score", scoreMovement)
        : "Today starts your HeatRadar history. Future reads will show what changed.",
      headline: previous ? "Heat Score movement" : "History starts today",
      label: "HEAT HISTORY",
      tone: scoreMovement >= 0 ? "green" : "blue",
      value: previous ? formatSigned(scoreMovement) : String(latest.heatScore),
    },
    {
      body:
        audienceMovement > 0
          ? "Your connected audience reach is higher than the last saved read."
          : "Audience reach has not moved enough yet. Keep watching the next signal.",
      headline: "Audience reach",
      label: latest.topSignal.toUpperCase(),
      tone: "blue",
      value: previous ? formatSigned(audienceMovement) : formatCompactNumber(latest.totalAudience),
    },
    {
      body:
        engagementMovement > 0
          ? "Public listener action is moving in the right direction."
          : "Public engagement is still waiting for a stronger move.",
      headline: latest.topTrack ? `${latest.topTrack} is on watch` : "Track signal watch",
      label: "PUBLIC ACTION",
      tone: "pink",
      value: previous
        ? formatSigned(engagementMovement)
        : formatCompactNumber(latest.publicEngagement),
    },
  ];
}

export function buildWeeklySummary(history: SignalSnapshot[]) {
  if (history.length === 0) {
    return "Connect a platform and HeatRadar will start saving daily signal reads.";
  }

  if (history.length === 1) {
    return "Your first signal snapshot is saved. Come back tomorrow to see what moved.";
  }

  const latest = history[0];
  const oldest = history[history.length - 1];
  const scoreMovement = latest.heatScore - oldest.heatScore;
  const audienceMovement = latest.totalAudience - oldest.totalAudience;

  if (scoreMovement > 0 && audienceMovement > 0) {
    return `Heat Score is ${formatSigned(scoreMovement)} while connected audience reach is ${formatSigned(
      audienceMovement,
    )} across the saved reads.`;
  }

  if (scoreMovement > 0) {
    return `Heat Score is ${formatSigned(scoreMovement)} across the saved reads. Keep pushing the strongest signal.`;
  }

  return "Your saved reads are steady. Watch for the next platform signal before making a big push.";
}

function toSignalSnapshot({
  audiusTracks,
  heatScoreRead,
  spotifyConnection,
  youtubeConnection,
}: SignalHistoryInput): SignalSnapshot {
  const topAudiusTrack = audiusTracks[0];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const publicEngagement =
    (topAudiusTrack?.favorite_count ?? 0) +
    (topAudiusTrack?.repost_count ?? 0) +
    (topAudiusTrack?.comment_count ?? 0);
  const totalAudience =
    (youtubeConnection?.subscriberCount ?? 0) + (spotifyConnection?.followers ?? 0);
  const connectedSources = [
    topAudiusTrack,
    spotifyConnection,
    youtubeConnection,
  ].filter(Boolean).length;

  return {
    capturedAt: new Date().toISOString(),
    connectedSources,
    heatScore: heatScoreRead.score,
    publicEngagement,
    topSignal: getTopSignal({ publicEngagement, spotifyConnection, youtubeConnection }),
    topTrack: topSpotifyTrack?.name ?? topAudiusTrack?.title,
    totalAudience,
  };
}

function getTopSignal({
  publicEngagement,
  spotifyConnection,
  youtubeConnection,
}: {
  publicEngagement: number;
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
}): SignalSnapshot["topSignal"] {
  const spotifyStrength = spotifyConnection?.topTracks[0]?.popularity ?? 0;
  const youtubeStrength = youtubeConnection?.viewCount ?? 0;

  if (publicEngagement >= spotifyStrength && publicEngagement >= youtubeStrength) {
    return publicEngagement > 0 ? "Audius" : "Waiting";
  }

  if (spotifyStrength >= youtubeStrength) {
    return "Spotify";
  }

  return "YouTube";
}

function getMovementBody(label: string, movement: number) {
  if (movement > 0) {
    return `${label} is up since the last saved read. That is the kind of movement worth checking.`;
  }

  if (movement < 0) {
    return `${label} cooled off since the last saved read. Watch the next signal before changing plans.`;
  }

  return `${label} is steady since the last saved read. No forced hype, just the current read.`;
}

function getDayKey(dateString: string) {
  return new Date(dateString).toISOString().slice(0, 10);
}

function formatSigned(value: number) {
  if (value > 0) {
    return `+${formatCompactNumber(value)}`;
  }

  if (value < 0) {
    return `-${formatCompactNumber(Math.abs(value))}`;
  }

  return "0";
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
