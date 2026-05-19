import { AudiusTrack } from "@/services/audius";
import { HeatScoreRead } from "@/services/heatScore";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

export type ShareCardSignal = {
  accent: string;
  body: string;
  category: string;
  footnote: string;
  title: string;
  value: string;
};

type ShareCardsInput = {
  audiusTracks: AudiusTrack[];
  heatScoreRead: HeatScoreRead;
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

export function buildShareCards({
  audiusTracks,
  heatScoreRead,
  spotifyConnection,
  youtubeConnection,
}: ShareCardsInput): ShareCardSignal[] {
  if (!spotifyConnection && !youtubeConnection && audiusTracks.length === 0) {
    return [];
  }

  const cards: ShareCardSignal[] = [
    {
      accent: "#44F08A",
      body: heatScoreRead.explanation,
      category: "HEAT SCORE",
      footnote: "Built from connected platform signals",
      title: getHeatScoreShareTitle(heatScoreRead.score),
      value: String(heatScoreRead.score),
    },
  ];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const topAudiusTrack = audiusTracks[0];

  if (topSpotifyTrack) {
    cards.push({
      accent: "#72A7FF",
      body: `${topSpotifyTrack.name} is your strongest recent Spotify listener signal.`,
      category: "SPOTIFY",
      footnote: "Spotify public profile signal",
      title: "Listener signal",
      value: `${topSpotifyTrack.popularity}/100`,
    });
  }

  if (youtubeConnection) {
    cards.push({
      accent: "#FF68B3",
      body: `${youtubeConnection.title} is showing public video reach across YouTube.`,
      category: "YOUTUBE",
      footnote: "Public YouTube channel reach",
      title: "Video reach",
      value: formatCompactNumber(youtubeConnection.viewCount),
    });
  }

  if (topAudiusTrack) {
    cards.push({
      accent: "#FFCF5F",
      body: `${topAudiusTrack.title} is getting public plays, favorites, and reposts on Audius.`,
      category: "AUDIUS",
      footnote: "Public Audius track movement",
      title: "Public traction",
      value: formatCompactNumber(topAudiusTrack.play_count),
    });
  }

  return cards.slice(0, 4);
}

function getHeatScoreShareTitle(score: number) {
  if (score >= 85) {
    return "Strong heat";
  }

  if (score >= 65) {
    return "Audience warming up";
  }

  if (score >= 40) {
    return "Movement building";
  }

  return "First signals";
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
