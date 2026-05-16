import AsyncStorage from "@react-native-async-storage/async-storage";

const audiusApiBaseUrl = "https://api.audius.co/v1";
const audiusConnectionStorageKey = "heatradar.connection.audius";

export type AudiusUser = {
  bio?: string;
  follower_count: number;
  handle: string;
  id: string;
  is_verified: boolean;
  name: string;
  profile_picture?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  repost_count: number;
  track_count: number;
};

export type AudiusTrack = {
  comment_count: number;
  favorite_count: number;
  genre: string;
  id: string;
  play_count: number;
  release_date?: string;
  repost_count: number;
  title: string;
};

export type AudiusConnection = {
  connectedAt: string;
  handle: string;
  id: string;
  name: string;
};

type AudiusResponse<T> = {
  data: T;
};

export async function searchAudiusUsers(query: string) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    limit: "6",
    query: trimmedQuery,
  });

  const response = await fetch(`${audiusApiBaseUrl}/users/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("audius-search-failed");
  }

  const payload = (await response.json()) as AudiusResponse<AudiusUser[]>;

  return payload.data;
}

export async function getAudiusTracksByHandle(handle: string) {
  const response = await fetch(
    `${audiusApiBaseUrl}/users/handle/${encodeURIComponent(handle)}/tracks?limit=5&sort_method=plays&sort_direction=desc`,
  );

  if (!response.ok) {
    throw new Error("audius-tracks-failed");
  }

  const payload = (await response.json()) as AudiusResponse<AudiusTrack[]>;

  return payload.data;
}

export async function saveAudiusConnection(user: AudiusUser) {
  const connection: AudiusConnection = {
    connectedAt: new Date().toISOString(),
    handle: user.handle,
    id: user.id,
    name: user.name,
  };

  await AsyncStorage.setItem(audiusConnectionStorageKey, JSON.stringify(connection));

  return connection;
}

export async function getAudiusConnection() {
  const rawConnection = await AsyncStorage.getItem(audiusConnectionStorageKey);

  if (!rawConnection) {
    return null;
  }

  try {
    return JSON.parse(rawConnection) as AudiusConnection;
  } catch {
    return null;
  }
}
