import { AudiusTrack } from "@/services/audius";
import { SpotifyConnection } from "@/services/spotify";
import { YouTubeConnection } from "@/services/youtube";

export type SignalInsight = {
  body: string;
  detail: string;
  source: "Audius" | "Spotify" | "YouTube" | "HeatRadar";
  title: string;
  tone: "green" | "blue" | "pink";
};

type SignalInsightsInput = {
  audiusTracks: AudiusTrack[];
  spotifyConnection: SpotifyConnection | null;
  youtubeConnection: YouTubeConnection | null;
};

export function buildSignalInsights({
  audiusTracks,
  spotifyConnection,
  youtubeConnection,
}: SignalInsightsInput): SignalInsight[] {
  const signalInsights: SignalInsight[] = [];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const topAudiusTrack = audiusTracks[0];

  if (topSpotifyTrack) {
    signalInsights.push({
      body: `${topSpotifyTrack.name} is the clearest recent Spotify listener signal in your account.`,
      detail: getSpotifyInsightDetail(topSpotifyTrack.popularity),
      source: "Spotify",
      title: "Spotify is showing repeat interest",
      tone: "green",
    });
  }

  if (topAudiusTrack) {
    const engagement = topAudiusTrack.favorite_count + topAudiusTrack.repost_count;

    signalInsights.push({
      body: `${topAudiusTrack.title} is giving HeatRadar a public traction read from plays, favorites, and reposts.`,
      detail: getAudiusInsightDetail(topAudiusTrack.play_count, engagement),
      source: "Audius",
      title: "Audius is confirming public movement",
      tone: "blue",
    });
  }

  if (youtubeConnection) {
    signalInsights.push({
      body: `${youtubeConnection.title} is giving HeatRadar a video-side audience signal.`,
      detail: getYouTubeInsightDetail(youtubeConnection),
      source: "YouTube",
      title: "YouTube is widening the read",
      tone: "pink",
    });
  }

  return signalInsights;
}

function getSpotifyInsightDetail(popularity: number) {
  if (popularity >= 60) {
    return "That is a strong Spotify-side cue. Use the track as the center of the next short-form post instead of splitting attention across too many songs.";
  }

  if (popularity >= 30) {
    return "The listener signal is early but useful. A hook-first clip or story mention can help test whether this track is ready for a bigger push.";
  }

  return "Spotify has enough listening context to point at a track, but not enough to call it a breakout yet. Treat this as a watch signal.";
}

function getAudiusInsightDetail(plays: number, engagement: number) {
  if (plays > 0 && engagement > 0) {
    return "Public plays plus engagement make this more trustworthy than a vanity metric. This is the kind of early traction artists should not ignore.";
  }

  if (plays > 0) {
    return "Plays are starting to form a read, but favorites and reposts will tell us whether people are actually leaning in.";
  }

  return "Audius is connected, but this track still needs more public movement before HeatRadar can make a stronger call.";
}

function getYouTubeInsightDetail(connection: YouTubeConnection) {
  if (connection.viewCount > 0 && connection.subscriberCount > 0) {
    return "Views and subscribers together help show whether video attention is turning into audience reach. Keep the next post tied to the song that needs lift.";
  }

  if (connection.viewCount > 0) {
    return "The channel has reach, but HeatRadar needs more audience growth data before calling it a strong release signal.";
  }

  return "YouTube is connected. Once uploads start moving, this can become an early signal for release discovery.";
}
