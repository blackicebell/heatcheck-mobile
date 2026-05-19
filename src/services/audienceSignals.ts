import { AudiusTrack } from "@/services/audius";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

export type AudienceSignal = {
  body: string;
  color: string;
  label: string;
  source: "Audius" | "Spotify" | "YouTube";
  value: number;
};

type AudienceSignalsInput = {
  audiusTracks: AudiusTrack[];
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

export function buildAudienceSignals({
  audiusTracks,
  spotifyConnection,
  youtubeConnection,
}: AudienceSignalsInput): AudienceSignal[] {
  const signals: AudienceSignal[] = [];
  const topAudiusTrack = audiusTracks[0];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];

  if (youtubeConnection) {
    signals.push({
      body: `${youtubeConnection.title} is giving a public video-side read from ${formatCompactNumber(
        youtubeConnection.viewCount,
      )} views and ${formatCompactNumber(youtubeConnection.subscriberCount)} subscribers.`,
      color: "#44F08A",
      label: "Video audience reach",
      source: "YouTube",
      value: clampPercent(
        28 +
          normalizeLog(youtubeConnection.viewCount, 1000000) * 46 +
          normalizeLog(youtubeConnection.subscriberCount, 100000) * 26,
      ),
    });
  }

  if (spotifyConnection) {
    signals.push({
      body: topSpotifyTrack
        ? `${topSpotifyTrack.name} is the strongest recent listener signal from Spotify.`
        : `${spotifyConnection.displayName} is connected, but Spotify needs more listening history before the audience read gets sharper.`,
      color: "#72A7FF",
      label: "Spotify listener pull",
      source: "Spotify",
      value: clampPercent(
        24 +
          normalizeLog(spotifyConnection.followers, 100000) * 28 +
          ((topSpotifyTrack?.popularity ?? 0) / 100) * 48,
      ),
    });
  }

  if (topAudiusTrack) {
    const engagement = topAudiusTrack.favorite_count + topAudiusTrack.repost_count;

    signals.push({
      body: `${topAudiusTrack.title} is showing public listener action through plays, favorites, and reposts.`,
      color: "#FF68B3",
      label: "Public fan action",
      source: "Audius",
      value: clampPercent(
        22 +
          normalizeLog(topAudiusTrack.play_count, 100000) * 42 +
          normalizeLog(engagement, 5000) * 36,
      ),
    });
  }

  return signals.sort((first, second) => second.value - first.value);
}

function normalizeLog(value: number, ceiling: number) {
  if (value <= 0) {
    return 0;
  }

  return Math.min(1, Math.log10(value + 1) / Math.log10(ceiling + 1));
}

function clampPercent(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
