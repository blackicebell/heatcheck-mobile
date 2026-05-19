import { AudiusTrack } from "@/services/audius";
import { ReleaseRadarItem } from "@/services/releaseRadar";
import { SpotifyConnection } from "@/services/spotify";
import { PlatformSyncStatus } from "@/services/syncStatus";
import { YouTubeConnection } from "@/services/youtube";

type NotificationCategory =
  | "Heat Movement"
  | "Engagement Spikes"
  | "Release Momentum"
  | "Audience Reach"
  | "Comeback";

export type SignalNotification = {
  body: string;
  category: NotificationCategory;
  cooldown: string;
  id: string;
  reward: string;
  timestamp: string;
  title: string;
  unread: boolean;
};

type SignalNotificationInput = {
  audiusTracks: AudiusTrack[];
  releaseRadar: ReleaseRadarItem[];
  spotifyConnection: SpotifyConnection | null;
  syncStatuses: Partial<Record<string, PlatformSyncStatus>>;
  youtubeConnection: YouTubeConnection | null;
};

export function buildSignalNotifications({
  audiusTracks,
  releaseRadar,
  spotifyConnection,
  syncStatuses,
  youtubeConnection,
}: SignalNotificationInput): SignalNotification[] {
  const signalNotifications: SignalNotification[] = [];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const topAudiusTrack = audiusTracks[0];
  const topRelease = releaseRadar[0];

  if (topSpotifyTrack) {
    signalNotifications.push({
      body: `${topSpotifyTrack.name} is giving HeatRadar a stronger listener-side read.`,
      category: "Heat Movement",
      cooldown: "Heat alerts only appear when a connected platform shows a useful signal.",
      id: "spotify-heat",
      reward: `Popularity ${topSpotifyTrack.popularity}/100`,
      timestamp: getSignalTimestamp(syncStatuses.spotify?.checkedAt),
      title: "Spotify is showing listener interest.",
      unread: true,
    });
  }

  if (topAudiusTrack) {
    const engagement = topAudiusTrack.favorite_count + topAudiusTrack.repost_count;

    signalNotifications.push({
      body: `${topAudiusTrack.title} is getting public plays, favorites, or reposts on Audius.`,
      category: "Engagement Spikes",
      cooldown: "Engagement alerts stay quiet unless public movement is worth checking.",
      id: "audius-engagement",
      reward: `${formatCompactNumber(engagement)} public actions`,
      timestamp: getSignalTimestamp(syncStatuses.audius?.checkedAt),
      title: "Audius engagement is moving.",
      unread: true,
    });
  }

  if (topRelease) {
    signalNotifications.push({
      body: `${topRelease.title} is the clearest release to watch right now.`,
      category: "Release Momentum",
      cooldown: "Release momentum alerts are limited so they feel meaningful.",
      id: "release-momentum",
      reward: `Release heat ${topRelease.score}`,
      timestamp: "Today",
      title: "A release has a fresh signal.",
      unread: signalNotifications.length < 2,
    });
  }

  if (youtubeConnection) {
    signalNotifications.push({
      body: `${youtubeConnection.title} is helping widen the audience read beyond audio platforms.`,
      category: "Audience Reach",
      cooldown: "Reach alerts appear only from connected public platform data.",
      id: "youtube-audience",
      reward: `${formatCompactNumber(youtubeConnection.viewCount)} views`,
      timestamp: getSignalTimestamp(syncStatuses.youtube?.checkedAt),
      title: "YouTube is adding reach context.",
      unread: false,
    });
  }

  if (hasFailedSync(syncStatuses)) {
    signalNotifications.push({
      body: "One connected platform needs another refresh before HeatRadar has the cleanest read.",
      category: "Comeback",
      cooldown: "Comeback nudges only appear when there is something useful to check.",
      id: "sync-comeback",
      reward: "Refresh needed",
      timestamp: "Now",
      title: "One signal needs a quick refresh.",
      unread: true,
    });
  }

  if (signalNotifications.length === 0) {
    return [];
  }

  return signalNotifications;
}

function hasFailedSync(syncStatuses: Partial<Record<string, PlatformSyncStatus>>) {
  return Object.values(syncStatuses).some((status) => status?.state === "failed");
}

function getSignalTimestamp(dateString?: string) {
  if (!dateString) {
    return "Today";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  const differenceInMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (differenceInMinutes < 1) {
    return "Just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} min ago`;
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours} hr ago`;
  }

  return "Earlier";
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
