import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { configureGoogleSignin } from "@/services/google";

const youtubeApiBaseUrl = "https://www.googleapis.com/youtube/v3";
const youtubeConnectionStorageKey = "heatradar.connection.youtube";
const youtubeReadonlyScope = "https://www.googleapis.com/auth/youtube.readonly";
const youtubePublicApiKey = "AIzaSyBQ4IyrkL-kpeq2VF7HoJkQa7C8ukwMXiU";

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

type YouTubeSearchResponse = {
  items?: {
    id?: {
      channelId?: string;
    };
  }[];
};

type YouTubeApiErrorResponse = {
  error?: {
    code?: number;
    errors?: {
      reason?: string;
    }[];
    message?: string;
    status?: string;
  };
};

type YouTubeChannelLookup = {
  type: "forHandle" | "id" | "search";
  value: string;
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

  const channel = await getChannelByLookup(channelLookup);

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

async function getChannelByLookup(channelLookup: YouTubeChannelLookup) {
  if (channelLookup.type === "search") {
    return searchYouTubeChannelByQuery(channelLookup.value);
  }

  const channel = await fetchYouTubeChannel({
    [channelLookup.type]: channelLookup.value,
  });

  if (channel) {
    return channel;
  }

  return searchYouTubeChannelByQuery(channelLookup.value);
}

async function searchYouTubeChannelByQuery(query: string) {
  const payload = await fetchYouTubeJson<YouTubeSearchResponse>("search", {
    maxResults: "1",
    part: "snippet",
    q: cleanYouTubeSearchQuery(query),
    type: "channel",
  });
  const channelId = payload.items?.[0]?.id?.channelId;

  if (!channelId) {
    return null;
  }

  return fetchYouTubeChannel({ id: channelId });
}

async function fetchYouTubeChannel(params: Record<string, string>) {
  const payload = await fetchYouTubeJson<YouTubeChannelResponse>("channels", {
    part: "snippet,statistics",
    ...params,
  });

  return payload.items?.[0] ?? null;
}

async function fetchYouTubeJson<T>(path: "channels" | "search", params: Record<string, string>) {
  const searchParams = new URLSearchParams({
    key: youtubePublicApiKey,
    ...params,
  });
  const response = await fetch(`${youtubeApiBaseUrl}/${path}?${searchParams.toString()}`);
  const payload = (await response.json()) as T & YouTubeApiErrorResponse;

  if (!response.ok) {
    throw new Error(getYouTubeApiError(payload));
  }

  return payload;
}

function getYouTubeApiError(payload: YouTubeApiErrorResponse) {
  const reason = payload.error?.errors?.[0]?.reason;
  const status = payload.error?.status;

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded" || status === "RESOURCE_EXHAUSTED") {
    return "youtube-api-quota";
  }

  if (
    reason === "accessNotConfigured" ||
    reason === "forbidden" ||
    reason === "keyInvalid" ||
    reason === "ipRefererBlocked" ||
    status === "PERMISSION_DENIED"
  ) {
    return "youtube-api-key-blocked";
  }

  return "youtube-channel-fetch-failed";
}

function parseYouTubeChannelQuery(query: string): YouTubeChannelLookup | null {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  const urlLookup = parseYouTubeChannelUrl(trimmedQuery);

  if (urlLookup) {
    return urlLookup;
  }

  const channelIdMatch = trimmedQuery.match(/(UC[\w-]{20,})/);

  if (channelIdMatch?.[1]) {
    return { type: "id", value: channelIdMatch[1] };
  }

  const handleMatch = trimmedQuery.match(/@[\w.-]+/);

  if (handleMatch?.[0]) {
    return { type: "forHandle", value: handleMatch[0] };
  }

  return { type: "search", value: trimmedQuery };
}

function parseYouTubeChannelUrl(query: string): YouTubeChannelLookup | null {
  if (!query.includes("youtube.com") && !query.includes("youtu.be")) {
    return null;
  }

  try {
    const url = new URL(query.startsWith("http") ? query : `https://${query}`);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const channelId = pathParts.find((part) => /^UC[\w-]{20,}$/.test(part));

    if (channelId) {
      return { type: "id", value: channelId };
    }

    const handle = pathParts.find((part) => part.startsWith("@"));

    if (handle) {
      return { type: "forHandle", value: handle };
    }

    const customPath = pathParts.find((part) => !["c", "channel", "user"].includes(part.toLowerCase()));

    if (customPath) {
      return { type: "search", value: customPath.replace(/[-_]/g, " ") };
    }
  } catch {
    return null;
  }

  return null;
}

function cleanYouTubeSearchQuery(query: string) {
  return query.replace(/^@/, "").replace(/[-_]/g, " ").trim();
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
