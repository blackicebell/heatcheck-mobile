import { AudiusTrack } from "@/services/audius";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

type HeatScoreInput = {
  audiusTracks: AudiusTrack[];
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

type HeatScoreContributor = {
  label: string;
  value: string;
  change: string;
};

export type HeatScoreRead = {
  action: string;
  contributors: HeatScoreContributor[];
  explanation: string;
  headline: string;
  score: number;
  scoreBoost: string;
  sparkline: number[];
  weeklyChange: string;
};

export function calculateHeatScore({
  audiusTracks,
  spotifyConnection,
  youtubeConnection,
}: HeatScoreInput): HeatScoreRead {
  const topAudiusTrack = audiusTracks[0];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const connectedSignalCount = [
    topAudiusTrack,
    spotifyConnection,
    youtubeConnection,
  ].filter(Boolean).length;

  const audiusScore = topAudiusTrack
    ? clamp(
        normalizeLog(topAudiusTrack.play_count, 100000) * 0.55 +
          normalizeLog(topAudiusTrack.favorite_count + topAudiusTrack.repost_count, 5000) * 0.45,
      )
    : 0;
  const youtubeScore = youtubeConnection
    ? clamp(
        normalizeLog(youtubeConnection.viewCount, 1000000) * 0.55 +
          normalizeLog(youtubeConnection.subscriberCount, 100000) * 0.3 +
          normalizeLog(youtubeConnection.videoCount, 500) * 0.15,
      )
    : 0;
  const spotifyScore = spotifyConnection
    ? clamp(
        normalizeLog(spotifyConnection.followers, 100000) * 0.35 +
          ((topSpotifyTrack?.popularity ?? 0) / 100) * 0.5 +
          normalizeLog(spotifyConnection.topTracks.length, 10) * 0.15,
      )
    : 0;

  const platformStrength = audiusScore * 0.34 + youtubeScore * 0.33 + spotifyScore * 0.33;
  const connectionLift = connectedSignalCount * 5;
  const score =
    connectedSignalCount === 0
      ? 0
      : Math.round(clamp(38 + platformStrength * 47 + connectionLift, 0, 100));
  const weeklyChange = getWeeklyChange(score, connectedSignalCount);
  const strongestSignal = getStrongestSignal({
    audiusScore,
    spotifyScore,
    youtubeScore,
  });

  return {
    action: getRecommendedAction(strongestSignal),
    contributors: [
      {
        label: "Audience reach",
        value: getStrengthLabel(Math.max(youtubeScore, spotifyScore)),
        change: getAudienceChange(youtubeConnection, spotifyConnection),
      },
      {
        label: "Public engagement",
        value: getStrengthLabel(Math.max(audiusScore, spotifyScore)),
        change: getEngagementChange(topAudiusTrack, topSpotifyTrack?.popularity ?? 0),
      },
      {
        label: "Platform coverage",
        value: `${connectedSignalCount}/3`,
        change: connectedSignalCount === 3 ? "Full read" : "Connect more",
      },
    ],
    explanation: getScoreExplanation(strongestSignal, connectedSignalCount),
    headline: getHeadline(score, connectedSignalCount),
    score,
    scoreBoost: getScoreBoost(strongestSignal),
    sparkline: buildSparkline(score),
    weeklyChange,
  };
}

function normalizeLog(value: number, ceiling: number) {
  if (value <= 0) {
    return 0;
  }

  return clamp(Math.log10(value + 1) / Math.log10(ceiling + 1));
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getWeeklyChange(score: number, connectedSignalCount: number) {
  if (connectedSignalCount === 0) {
    return "No signals";
  }

  return `${connectedSignalCount}/3 sources`;
}

function getStrongestSignal({
  audiusScore,
  spotifyScore,
  youtubeScore,
}: {
  audiusScore: number;
  spotifyScore: number;
  youtubeScore: number;
}) {
  const signals = [
    { id: "audius", score: audiusScore },
    { id: "youtube", score: youtubeScore },
    { id: "spotify", score: spotifyScore },
  ].sort((first, second) => second.score - first.score);

  return signals[0]?.id ?? "none";
}

function getHeadline(score: number, connectedSignalCount: number) {
  if (connectedSignalCount === 0) {
    return "Connect a platform to start reading your heat.";
  }

  if (score >= 80) {
    return "You're gaining stronger traction this week.";
  }

  if (score >= 65) {
    return "Your audience movement is starting to heat up.";
  }

    return "Your first real signals are starting to show.";
}

function getScoreExplanation(strongestSignal: string, connectedSignalCount: number) {
  if (connectedSignalCount === 0) {
    return "Heat Score needs at least one connected platform before it can explain real movement.";
  }

  if (strongestSignal === "spotify") {
    return "Driven by Spotify listener interest and recent top-track activity.";
  }

  if (strongestSignal === "youtube") {
    return "Driven by YouTube audience reach and channel activity.";
  }

  return "Driven by Audius plays, favorites, and repost movement.";
}

function getScoreBoost(strongestSignal: string) {
  if (strongestSignal === "spotify") {
    return "Your recent top track is giving a clearer listener-side read.";
  }

  if (strongestSignal === "youtube") {
    return "Video views and subscribers are helping lift your audience read.";
  }

  if (strongestSignal === "audius") {
    return "Public track engagement is helping confirm early traction.";
  }

  return "Connect Audius, YouTube, or Spotify to turn the score into a real read.";
}

function getRecommendedAction(strongestSignal: string) {
  if (strongestSignal === "spotify") {
    return "Turn your strongest recent Spotify track into a short clip and point listeners back to the hook.";
  }

  if (strongestSignal === "youtube") {
    return "Post a short YouTube clip that opens with the strongest visual or chorus moment.";
  }

  if (strongestSignal === "audius") {
    return "Push the Audius track getting the most public movement while the signal is fresh.";
  }

  return "Connect one music platform first. The clearest next move will show once real movement appears.";
}

function getStrengthLabel(value: number) {
  if (value >= 0.72) {
    return "Strong";
  }

  if (value >= 0.45) {
    return "Rising";
  }

  if (value > 0) {
    return "Early";
  }

  return "Waiting";
}

function getAudienceChange(
  youtubeConnection: YouTubeConnection | null,
  spotifyConnection: SpotifyConnection | null,
) {
  const totalAudience =
    (youtubeConnection?.subscriberCount ?? 0) + (spotifyConnection?.followers ?? 0);

  if (totalAudience >= 10000) {
    return formatCompactNumber(totalAudience);
  }

  if (totalAudience >= 1000) {
    return formatCompactNumber(totalAudience);
  }

  if (totalAudience > 0) {
    return formatCompactNumber(totalAudience);
  }

  return "No signal";
}

function getEngagementChange(topAudiusTrack: AudiusTrack | undefined, spotifyPopularity: number) {
  const publicEngagement =
    (topAudiusTrack?.favorite_count ?? 0) + (topAudiusTrack?.repost_count ?? 0);

  if (publicEngagement > 0) {
    return formatCompactNumber(publicEngagement);
  }

  if (spotifyPopularity > 0) {
    return `${spotifyPopularity}/100`;
  }

  return "No public signal";
}

function buildSparkline(score: number) {
  const start = Math.max(12, score - 34);
  const middle = Math.max(start + 4, score - 18);

  return [
    start,
    start + 4,
    start + 2,
    middle - 5,
    middle,
    middle + 6,
    score - 9,
    score - 4,
    score - 7,
    score,
  ].map((value) => Math.round(clamp(value, 0, 100)));
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
