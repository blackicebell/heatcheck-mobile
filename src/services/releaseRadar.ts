import { AudiusTrack } from "@/services/audius";
import { SpotifyConnection } from "@/services/spotify";

type BaseRelease = {
  date: string;
  detail: string;
  id: string;
  score: number;
  status: string;
  title: string;
};

type ReleaseRadarInput = {
  audiusTracks: AudiusTrack[];
  spotifyConnection: SpotifyConnection | null;
};

export type ReleaseRadarItem = BaseRelease & {
  action: string;
  confidence: "Starting read" | "Mixed read" | "Real signal";
  drivers: {
    label: string;
    value: string;
  }[];
  platform: "Audius" | "Spotify";
};

export function buildReleaseRadar({
  audiusTracks,
  spotifyConnection,
}: ReleaseRadarInput): ReleaseRadarItem[] {
  const realReleases: ReleaseRadarItem[] = [];

  spotifyConnection?.topTracks.slice(0, 3).forEach((track) => {
    realReleases.push({
      action: "Clip the strongest hook from this track and send people back to Spotify while it is fresh.",
      confidence: "Real signal",
      date: "Spotify",
      detail: `${track.name} is showing up as a real recent Spotify listener signal from the connected Spotify account.`,
      drivers: [
        { label: "Spotify popularity", value: `${track.popularity}/100` },
        { label: "Artist", value: track.artist },
      ],
      id: `spotify:${track.id}`,
      platform: "Spotify",
      score: clampScore(52 + track.popularity * 0.42),
      status: "Listener signal",
      title: track.name,
    });
  });

  audiusTracks.slice(0, 3).forEach((track) => {
    const engagement = track.favorite_count + track.repost_count;

    realReleases.push({
      action: "Give this track another push while public plays and reposts are easy to read.",
      confidence: "Real signal",
      date: track.release_date ?? "Audius",
      detail: `${track.title} is one of your clearest public Audius track signals right now, based on plays, favorites, and reposts.`,
      drivers: [
        { label: "Plays", value: formatCompactNumber(track.play_count) },
        { label: "Engagement", value: formatCompactNumber(engagement) },
      ],
      id: `audius:${track.id}`,
      platform: "Audius",
      score: clampScore(46 + normalizeLog(track.play_count, 100000) * 32 + normalizeLog(engagement, 5000) * 22),
      status: "Public track lift",
      title: track.title,
    });
  });

  if (realReleases.length > 0) {
    return realReleases.sort((first, second) => second.score - first.score);
  }

  return [];
}

function normalizeLog(value: number, ceiling: number) {
  if (value <= 0) {
    return 0;
  }

  return Math.min(1, Math.log10(value + 1) / Math.log10(ceiling + 1));
}

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
