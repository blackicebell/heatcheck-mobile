import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthRequest,
  ResponseType,
  exchangeCodeAsync,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const spotifyApiBaseUrl = "https://api.spotify.com/v1";
const spotifyAuthorizationEndpoint = "https://accounts.spotify.com/authorize";
const spotifyClientId = "c6d7a2ef80f4415492ca0aece68d6a3d";
const spotifyConnectionStorageKey = "heatradar.connection.spotify";
const spotifyRedirectUri = "heatradar://spotify-auth";

const spotifyDiscovery = {
  authorizationEndpoint: spotifyAuthorizationEndpoint,
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const spotifyScopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
];

export type SpotifyConnection = {
  connectedAt: string;
  displayName: string;
  email?: string;
  followers: number;
  id: string;
  topTracks: SpotifyTrackSummary[];
};

export type SpotifyTrackSummary = {
  artist: string;
  id: string;
  name: string;
  popularity: number;
};

type SpotifyProfileResponse = {
  display_name?: string;
  email?: string;
  followers?: {
    total?: number;
  };
  id: string;
};

type SpotifyTopTracksResponse = {
  items?: {
    artists?: { name: string }[];
    id: string;
    name: string;
    popularity?: number;
  }[];
};

export async function connectSpotifyAccount() {
  const request = new AuthRequest({
    clientId: spotifyClientId,
    redirectUri: spotifyRedirectUri,
    responseType: ResponseType.Code,
    scopes: spotifyScopes,
    usePKCE: true,
  });
  const result = await request.promptAsync(spotifyDiscovery);

  if (result.type !== "success" || !result.params.code) {
    throw new Error("spotify-cancelled");
  }

  const token = await exchangeCodeAsync(
    {
      clientId: spotifyClientId,
      code: result.params.code,
      extraParams: {
        code_verifier: request.codeVerifier ?? "",
      },
      redirectUri: spotifyRedirectUri,
    },
    spotifyDiscovery,
  );
  const [profile, topTracks] = await Promise.all([
    getSpotifyProfile(token.accessToken),
    getSpotifyTopTracks(token.accessToken),
  ]);
  const connection = toSpotifyConnection(profile, topTracks);

  await AsyncStorage.setItem(spotifyConnectionStorageKey, JSON.stringify(connection));

  return connection;
}

export async function getSpotifyConnection() {
  const rawConnection = await AsyncStorage.getItem(spotifyConnectionStorageKey);

  if (!rawConnection) {
    return null;
  }

  try {
    return JSON.parse(rawConnection) as SpotifyConnection;
  } catch {
    return null;
  }
}

export async function clearSpotifyConnection() {
  await AsyncStorage.removeItem(spotifyConnectionStorageKey);
}

async function getSpotifyProfile(accessToken: string) {
  const response = await fetch(`${spotifyApiBaseUrl}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("spotify-profile-failed");
  }

  return (await response.json()) as SpotifyProfileResponse;
}

async function getSpotifyTopTracks(accessToken: string) {
  const params = new URLSearchParams({
    limit: "5",
    time_range: "short_term",
  });
  const response = await fetch(`${spotifyApiBaseUrl}/me/top/tracks?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as SpotifyTopTracksResponse;

  return payload.items ?? [];
}

function toSpotifyConnection(
  profile: SpotifyProfileResponse,
  topTracks: NonNullable<SpotifyTopTracksResponse["items"]>,
): SpotifyConnection {
  return {
    connectedAt: new Date().toISOString(),
    displayName: profile.display_name || profile.id,
    email: profile.email,
    followers: profile.followers?.total ?? 0,
    id: profile.id,
    topTracks: topTracks.map((track) => ({
      artist: track.artists?.[0]?.name ?? "Unknown artist",
      id: track.id,
      name: track.name,
      popularity: track.popularity ?? 0,
    })),
  };
}
