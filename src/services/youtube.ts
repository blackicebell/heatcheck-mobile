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

type ConnectYouTubeOptions = {
  forceAccountSelection?: boolean;
};

export async function getAvailableYouTubeChannels({
  forceAccountSelection = false,
}: ConnectYouTubeOptions = {}) {
  configureGoogleSignin();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  if (forceAccountSelection && GoogleSignin.hasPreviousSignIn()) {
    await GoogleSignin.signOut();
  }

  if (forceAccountSelection || !GoogleSignin.hasPreviousSignIn()) {
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
  return getMyYouTubeChannels(accessToken);
}

export async function connectYouTubeChannel(options?: ConnectYouTubeOptions) {
  const channels = await getAvailableYouTubeChannels(options);
  const channel = channels[0];

  if (!channel) {
    throw new Error("youtube-channel-not-found");
  }

  return saveYouTubeChannelConnection(channel);
}

export async function findYouTubeChannel(query: string) {
  const channelLookup = parseYouTubeChannelQuery(query);

  if (!channelLookup) {
    throw new Error("youtube-channel-query-invalid");
  }

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
  const params = new URLSearchParams({
    part: "snippet,statistics",
    [channelLookup.type]: channelLookup.value,
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

export async function saveYouTubeChannelConnection(channel: YouTubeChannel) {
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

async function getMyYouTubeChannels(accessToken: string) {
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
  const channels = payload.items ?? [];

  if (channels.length === 0) {
    throw new Error("youtube-channel-not-found");
  }

  return channels;
}

function parseYouTubeChannelQuery(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  const channelIdMatch = trimmedQuery.match(/(UC[\w-]{20,})/);

  if (channelIdMatch?.[1]) {
    return { type: "id", value: channelIdMatch[1] };
  }

  const handleMatch = trimmedQuery.match(/@[\w.-]+/);

  if (handleMatch?.[0]) {
    return { type: "forHandle", value: handleMatch[0] };
  }

  return { type: "forHandle", value: trimmedQuery.startsWith("@") ? trimmedQuery : `@${trimmedQuery}` };
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
