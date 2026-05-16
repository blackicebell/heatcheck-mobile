import { AudiusTrack } from "@/services/audius";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

type BaseRelease = {
  date: string;
  detail: string;
  score: number;
  status: string;
  title: string;
};

type ReleaseRadarInput = {
  audiusTracks: AudiusTrack[];
  baseReleases: BaseRelease[];
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

export type ReleaseRadarItem = BaseRelease & {
  action: string;
  confidence: "Mock read" | "Mixed read" | "Real signal";
  drivers: {
    label: string;
    value: string;
  }[];
  platform: "Audius" | "Spotify" | "YouTube" | "Mock";
};

export function buildReleaseRadar({
  audiusTracks,
  baseReleases,
  spotifyConnection,
  youtubeConnection,
}: ReleaseRadarInput): ReleaseRadarItem[] {
  const topAudiusTrack = audiusTracks[0];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const connectedPlatforms = [
    topAudiusTrack ? "Audius" : null,
    topSpotifyTrack ? "Spotify" : null,
    youtubeConnection ? "YouTube" : null,
  ].filter(Boolean).length;

  const realLeadRelease = getRealLeadRelease({
    baseRelease: baseReleases[0],
    topAudiusTrack,
    topSpotifyTrack,
    youtubeConnection,
  });

  return baseReleases.map((release, index) => {
    if (index === 0 && realLeadRelease) {
      return realLeadRelease;
    }

    return {
      ...release,
      action: getMockReleaseAction(release.score),
      confidence: connectedPlatforms > 0 ? "Mixed read" : "Mock read",
      drivers: [
        { label: "Release heat", value: `${release.score}/100` },
        { label: "Signal source", value: connectedPlatforms > 0 ? "Catalog context" : "Mock data" },
      ],
      platform: "Mock",
    };
  });
}

function getRealLeadRelease({
  baseRelease,
  topAudiusTrack,
  topSpotifyTrack,
  youtubeConnection,
}: {
  baseRelease: BaseRelease | undefined;
  topAudiusTrack?: AudiusTrack;
  topSpotifyTrack?: SpotifyConnection["topTracks"][number];
  youtubeConnection: YouTubeConnection | null;
}): ReleaseRadarItem | null {
  if (!baseRelease) {
    return null;
  }

  if (topSpotifyTrack) {
    return {
      ...baseRelease,
      action: "Clip the strongest hook from this track and send people back to Spotify while it is fresh.",
      confidence: "Real signal",
      date: "Spotify",
      detail: `${topSpotifyTrack.name} is your strongest recent Spotify track. HeatRadar is treating it as the current release to watch.`,
      drivers: [
        { label: "Spotify popularity", value: `${topSpotifyTrack.popularity}/100` },
        { label: "Top-track source", value: topSpotifyTrack.artist },
      ],
      platform: "Spotify",
      score: clampScore(52 + topSpotifyTrack.popularity * 0.42),
      status: "Listener signal",
      title: topSpotifyTrack.name,
    };
  }

  if (topAudiusTrack) {
    const engagement = topAudiusTrack.favorite_count + topAudiusTrack.repost_count;

    return {
      ...baseRelease,
      action: "Give this track another push while public plays and reposts are easy to read.",
      confidence: "Real signal",
      date: topAudiusTrack.release_date ?? "Audius",
      detail: `${topAudiusTrack.title} is the clearest public release signal coming from Audius right now.`,
      drivers: [
        { label: "Plays", value: formatCompactNumber(topAudiusTrack.play_count) },
        { label: "Engagement", value: formatCompactNumber(engagement) },
      ],
      platform: "Audius",
      score: clampScore(46 + normalizeLog(topAudiusTrack.play_count, 100000) * 32 + normalizeLog(engagement, 5000) * 22),
      status: "Public track lift",
      title: topAudiusTrack.title,
    };
  }

  if (youtubeConnection) {
    return {
      ...baseRelease,
      action: "Use your next video post to point people toward the song that needs the most lift.",
      confidence: "Mixed read",
      detail: "YouTube is connected, so HeatRadar can read channel reach even before a specific release is matched.",
      drivers: [
        { label: "Views", value: formatCompactNumber(youtubeConnection.viewCount) },
        { label: "Subscribers", value: formatCompactNumber(youtubeConnection.subscriberCount) },
      ],
      platform: "YouTube",
      score: clampScore(44 + normalizeLog(youtubeConnection.viewCount, 1000000) * 34 + normalizeLog(youtubeConnection.subscriberCount, 100000) * 16),
      status: "Video-side lift",
    };
  }

  return null;
}

function getMockReleaseAction(score: number) {
  if (score >= 85) {
    return "Keep pressure on this song with one clear fan-facing moment today.";
  }

  if (score >= 70) {
    return "Give this release a lightweight visual or behind-the-song clip.";
  }

  return "Let this catalog track support the stronger release instead of forcing a full push.";
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
