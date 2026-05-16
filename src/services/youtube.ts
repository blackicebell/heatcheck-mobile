import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { configureGoogleSignin } from "@/services/google";

const youtubeApiBaseUrl = "https://www.googleapis.com/youtube/v3";
const youtubeConnectionStorageKey = "heatradar.connection.youtube";
const youtubeReadonlyScope = "https://www.googleapis.com/auth/youtube.readonly";

export type YouTubeChannel = {
  id: string;
  snippet: {
    customUrl?: string;
    description?: string;
    publishedAt?: string;
    title: string;
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
};

export type YouTubeConnection = {
  connectedAt: string;
  customUrl?: string;
  id: string;
  subscriberCount: number;
  title: string;
  videoCount: number;
  viewCount: number;
};

type YouTubeChannelResponse = {
  items?: YouTubeChannel[];
};

export async function connectYouTubeChannel() {
  configureGoogleSignin();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  if (!GoogleSignin.hasPreviousSignIn()) {
    const response = await GoogleSignin.signIn();

    if (response.type !== "success") {
      throw new Error("youtube-cancelled");
    }
  }

  const scopeResponse = await GoogleSignin.addScopes({
    scopes: [youtubeReadonlyScope],
  });

  if (scopeResponse?.type === "cancelled") {
    throw new Error("youtube-cancelled");
  }

  const { accessToken } = await GoogleSignin.getTokens();
  const channel = await getMyYouTubeChannel(accessToken);
  const connection = toYouTubeConnection(channel);

  await AsyncStorage.setItem(youtubeConnectionStorageKey, JSON.stringify(connection));

  return connection;
}

export async function getYouTubeConnection() {
  const rawConnection = await AsyncStorage.getItem(youtubeConnectionStorageKey);

  if (!rawConnection) {
    return null;
  }

  try {
    return JSON.parse(rawConnection) as YouTubeConnection;
  } catch {
    return null;
  }
}

export async function clearYouTubeConnection() {
  await AsyncStorage.removeItem(youtubeConnectionStorageKey);
}

async function getMyYouTubeChannel(accessToken: string) {
  const params = new URLSearchParams({
    mine: "true",
    part: "snippet,statistics",
  });
  const response = await fetch(`${youtubeApiBaseUrl}/channels?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("youtube-channel-fetch-failed");
  }

  const payload = (await response.json()) as YouTubeChannelResponse;
  const channel = payload.items?.[0];

  if (!channel) {
    throw new Error("youtube-channel-not-found");
  }

  return channel;
}

function toYouTubeConnection(channel: YouTubeChannel): YouTubeConnection {
  return {
    connectedAt: new Date().toISOString(),
    customUrl: channel.snippet.customUrl,
    id: channel.id,
    subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
    title: channel.snippet.title,
    videoCount: Number(channel.statistics?.videoCount ?? 0),
    viewCount: Number(channel.statistics?.viewCount ?? 0),
  };
}
