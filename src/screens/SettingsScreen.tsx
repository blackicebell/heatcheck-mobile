import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  AppText,
  Button,
  BottomSheetModal,
  Card,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
  ToggleRow,
} from "@/components";
import { platformConnections, settings } from "@/data/mockData";
import { useArtistIdentity } from "@/hooks/useArtistIdentity";
import {
  AudiusConnection,
  AudiusTrack,
  AudiusUser,
  clearAudiusConnection,
  getAudiusConnection,
  getAudiusTracksByHandle,
  saveAudiusConnection,
  searchAudiusUsers,
} from "@/services/audius";
import { clearLocalArtistProfile } from "@/services/artistProfile";
import { auth } from "@/services/firebase";
import {
  SpotifyConnection,
  clearSpotifyConnection,
  connectSpotifyAccount,
  getSpotifyConnection,
} from "@/services/spotify";
import {
  YouTubeConnection,
  clearYouTubeConnection,
  connectYouTubeChannel,
  getYouTubeConnection,
} from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { impactLight, notifySuccess } from "@/utils/haptics";

type PlatformConnection = (typeof platformConnections)[number];
type ConnectionStatus = PlatformConnection["status"];

export function SettingsScreen() {
  const navigation = useNavigation();
  const artistIdentity = useArtistIdentity();
  const [connectionModal, setConnectionModal] = useState<PlatformConnection | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connections, setConnections] = useState(platformConnections);
  const [audiusConnection, setAudiusConnection] = useState<AudiusConnection | null>(null);
  const [audiusError, setAudiusError] = useState("");
  const [audiusQuery, setAudiusQuery] = useState(artistIdentity.name);
  const [audiusResults, setAudiusResults] = useState<AudiusUser[]>([]);
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [searchingAudius, setSearchingAudius] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [spotifyError, setSpotifyError] = useState("");
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const [youtubeError, setYouTubeError] = useState("");
  const [toggleStates, setToggleStates] = useState(() =>
    Object.fromEntries(settings.map((item) => [item.label, item.enabled])),
  );

  useEffect(() => {
    let active = true;

    async function loadConnections() {
      const [savedAudiusConnection, savedSpotifyConnection, savedYouTubeConnection] = await Promise.all([
        getAudiusConnection(),
        getSpotifyConnection(),
        getYouTubeConnection(),
      ]);

      if (!active) {
        return;
      }

      if (savedAudiusConnection) {
        setAudiusConnection(savedAudiusConnection);
        markAudiusConnected(savedAudiusConnection);
        loadAudiusTracks(savedAudiusConnection.handle);
      }

      if (savedYouTubeConnection) {
        setYouTubeConnection(savedYouTubeConnection);
        markYouTubeConnected(savedYouTubeConnection);
      }

      if (savedSpotifyConnection) {
        setSpotifyConnection(savedSpotifyConnection);
        markSpotifyConnected(savedSpotifyConnection);
      }
    }

    loadConnections();

    return () => {
      active = false;
    };
  }, []);

  function connectPlatform(platform: PlatformConnection) {
    if (platform.id === "audius") {
      setConnectionModal(platform);

      if (audiusConnection) {
        loadAudiusTracks(audiusConnection.handle);
      }

      return;
    }

    if (platform.id === "youtube") {
      setConnectionModal(platform);

      if (!youtubeConnection) {
        connectYouTube();
      }

      return;
    }

    if (platform.id === "spotify") {
      setConnectionModal(platform);

      if (!spotifyConnection) {
        connectSpotify();
      }

      return;
    }

    setConnectionModal(platform);
    setConnectingId(platform.id);

    setTimeout(() => {
      const connectedPlatform = { ...platform, status: "Connected" };
      setConnections((items) =>
        items.map((item) =>
          item.id === platform.id ? connectedPlatform : item,
        ),
      );
      setConnectionModal(connectedPlatform);
      setConnectingId(null);
      notifySuccess();
    }, 1200);
  }

  async function searchAudius() {
    if (searchingAudius) {
      return;
    }

    impactLight();
    setAudiusError("");
    setSearchingAudius(true);

    try {
      const results = await searchAudiusUsers(audiusQuery);
      setAudiusResults(results);

      if (results.length === 0) {
        setAudiusError("No Audius artists found yet. Try a different artist name or handle.");
      }
    } catch {
      setAudiusError("Audius search did not respond. Check your connection and try again.");
    } finally {
      setSearchingAudius(false);
    }
  }

  async function connectAudius(user: AudiusUser) {
    impactLight();
    setAudiusError("");
    setConnectingId("audius");

    try {
      const savedConnection = await saveAudiusConnection(user);
      setAudiusConnection(savedConnection);
      markAudiusConnected(savedConnection);
      await loadAudiusTracks(savedConnection.handle);
      notifySuccess();
    } catch {
      setAudiusError("We could not save that Audius profile yet. Try again.");
    } finally {
      setConnectingId(null);
    }
  }

  async function loadAudiusTracks(handle: string) {
    try {
      const tracks = await getAudiusTracksByHandle(handle);
      setAudiusTracks(tracks);
    } catch {
      setAudiusTracks([]);
    }
  }

  async function refreshAudius() {
    if (!audiusConnection || connectingId === "audius") {
      return;
    }

    impactLight();
    setAudiusError("");
    setConnectingId("audius");

    try {
      await loadAudiusTracks(audiusConnection.handle);
      notifySuccess();
    } catch {
      setAudiusError("Audius did not refresh yet. Check your connection and try again.");
    } finally {
      setConnectingId(null);
    }
  }

  function markAudiusConnected(connection: AudiusConnection) {
    setConnections((items) =>
      items.map((item) =>
        item.id === "audius"
          ? {
              ...item,
              detail: `@${connection.handle}`,
              status: "Connected",
            }
          : item,
      ),
    );
  }

  async function disconnectAudius() {
    impactLight();
    await clearAudiusConnection();
    setAudiusConnection(null);
    setAudiusTracks([]);
    resetPlatformConnection("audius");
    notifySuccess();
  }

  async function connectYouTube() {
    if (connectingId === "youtube") {
      return;
    }

    impactLight();
    setYouTubeError("");
    setConnectingId("youtube");

    try {
      const savedConnection = await connectYouTubeChannel();
      setYouTubeConnection(savedConnection);
      markYouTubeConnected(savedConnection);
      notifySuccess();
    } catch (error) {
      setYouTubeError(getYouTubeErrorMessage(error));
    } finally {
      setConnectingId(null);
    }
  }

  function markYouTubeConnected(connection: YouTubeConnection) {
    setConnections((items) =>
      items.map((item) =>
        item.id === "youtube"
          ? {
              ...item,
              detail: connection.customUrl ?? connection.title,
              status: "Connected",
            }
          : item,
      ),
    );
  }

  async function disconnectYouTube() {
    impactLight();
    await clearYouTubeConnection();
    setYouTubeConnection(null);
    setYouTubeError("");
    resetPlatformConnection("youtube");
    notifySuccess();
  }

  async function connectSpotify() {
    if (connectingId === "spotify") {
      return;
    }

    impactLight();
    setSpotifyError("");
    setConnectingId("spotify");

    try {
      const savedConnection = await connectSpotifyAccount();
      setSpotifyConnection(savedConnection);
      markSpotifyConnected(savedConnection);
      notifySuccess();
    } catch (error) {
      setSpotifyError(getSpotifyErrorMessage(error));
    } finally {
      setConnectingId(null);
    }
  }

  function markSpotifyConnected(connection: SpotifyConnection) {
    setConnections((items) =>
      items.map((item) =>
        item.id === "spotify"
          ? {
              ...item,
              detail: connection.displayName,
              status: "Connected",
            }
          : item,
      ),
    );
  }

  async function disconnectSpotify() {
    impactLight();
    await clearSpotifyConnection();
    setSpotifyConnection(null);
    setSpotifyError("");
    resetPlatformConnection("spotify");
    notifySuccess();
  }

  function resetPlatformConnection(platformId: string) {
    const originalPlatform = platformConnections.find((platform) => platform.id === platformId);

    if (!originalPlatform) {
      return;
    }

    setConnections((items) =>
      items.map((item) => (item.id === platformId ? originalPlatform : item)),
    );
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    impactLight();
    setSigningOut(true);

    await Promise.allSettled([
      GoogleSignin.signOut(),
      signOut(auth),
      clearLocalArtistProfile(),
    ]);

    notifySuccess();
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }),
    );
  }

  return (
    <ScreenContainer>
      <NavigationHeader label="Signal settings" actionIcon="shield-checkmark" />
      <SectionHeader
        title="Settings."
        body="Keep HeatRadar focused on the signals that tell you when listener movement is picking up."
      />
      <SectionHeader title="Platform connections" />
      <StaggeredList
        data={connections}
        keyExtractor={(platform) => platform.id}
        renderItem={(platform) => {
          const isConnecting = connectingId === platform.id;
          const connected = platform.status === "Connected";
          const failed = platform.status === "Failed";
          const reconnect = platform.status === "Reconnect";

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                impactLight();
                if (connected) {
                  setConnectionModal(platform);
                  return;
                }

                connectPlatform(platform);
              }}
              style={({ pressed }) => (pressed ? styles.pressed : undefined)}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.platformIcon}>
                    <Ionicons
                      name={getPlatformIcon(platform.id)}
                      size={22}
                      color={connected ? colors.green : failed ? colors.red : colors.textMuted}
                    />
                  </View>
                  <View style={styles.copy}>
                    <AppText variant="h3">{platform.name}</AppText>
                    <AppText muted>{platform.detail}</AppText>
                    <AppText variant="tiny" muted>
                      {platform.permission}
                    </AppText>
                  </View>
                  {isConnecting ? (
                    <ActivityIndicator color={colors.green} />
                  ) : (
                    <AppText
                      variant="small"
                      style={getConnectionStyle(platform.status)}
                    >
                      {connected
                        ? "Connected"
                        : failed
                          ? "Retry"
                          : reconnect
                            ? "Reconnect"
                            : "Connect"}
                    </AppText>
                  )}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <SectionHeader title="Notification settings" />
      <StaggeredList
        data={settings}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <ToggleRow
              label={setting.label}
              body={setting.body}
              enabled={Boolean(toggleStates[setting.label])}
              onChange={(enabled) =>
                setToggleStates((state) => ({ ...state, [setting.label]: enabled }))
              }
            />
          </Card>
        )}
      />
      <Card>
        <AppText variant="h2">Privacy-first preview</AppText>
        <AppText muted>
          HeatRadar uses Firebase for account access. Platform connections are
          still previews until Audius, YouTube, and Spotify are connected.
        </AppText>
      </Card>
      <SectionHeader title="Session" />
      <Card>
        <View style={styles.sessionCard}>
          <View style={styles.copy}>
            <AppText variant="h3">Signed in as {artistIdentity.name}</AppText>
            <AppText muted>
              {artistIdentity.email} / {artistIdentity.provider}
            </AppText>
            <AppText variant="small" muted>
              Sign out when you want to test another account or reset the login flow.
            </AppText>
          </View>
          <Button variant="secondary" loading={signingOut} onPress={handleSignOut}>
            Sign out
          </Button>
        </View>
      </Card>
      <BottomSheetModal
        visible={Boolean(connectionModal)}
        onClose={() => setConnectionModal(null)}
        title={connectionModal?.name ?? "Connection"}
      >
        {connectionModal ? (
          connectionModal.id === "audius" ? (
            <AudiusConnectionContent
              connection={audiusConnection}
              error={audiusError}
              onConnect={connectAudius}
              onDisconnect={disconnectAudius}
              onRefresh={refreshAudius}
              onSearch={searchAudius}
              query={audiusQuery}
              results={audiusResults}
              searching={searchingAudius || connectingId === "audius"}
              setQuery={setAudiusQuery}
              tracks={audiusTracks}
            />
          ) : connectionModal.id === "youtube" ? (
            <YouTubeConnectionContent
              connection={youtubeConnection}
              error={youtubeError}
              loading={connectingId === "youtube"}
              onConnect={connectYouTube}
              onDisconnect={disconnectYouTube}
              onRefresh={connectYouTube}
            />
          ) : connectionModal.id === "spotify" ? (
            <SpotifyConnectionContent
              connection={spotifyConnection}
              error={spotifyError}
              loading={connectingId === "spotify"}
              onConnect={connectSpotify}
              onDisconnect={disconnectSpotify}
              onRefresh={connectSpotify}
            />
          ) : (
            <>
              <AppText variant="h2">
                {connectingId === connectionModal.id
                  ? "Connecting..."
                  : connectionModal.status === "Failed"
                    ? "Connection needs another try"
                    : connectionModal.status === "Reconnect"
                      ? "Reconnect safely"
                      : "Ready to preview"}
              </AppText>
              <AppText muted>
                {connectionModal.permission}
              </AppText>
              <AppText muted>
                This stays mock-only. A real version would explain permissions
                before asking for access.
              </AppText>
            </>
          )
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  platformIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  connected: {
    color: colors.green,
  },
  failed: {
    color: colors.red,
  },
  connect: {
    color: colors.blue,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  sessionCard: {
    gap: spacing.md,
  },
  searchInput: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    fontSize: 16,
    fontWeight: "600",
  },
  modalScroll: {
    maxHeight: 420,
  },
  resultCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
  },
  trackCard: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  youtubeMetricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  dangerText: {
    color: colors.red,
    fontWeight: "800",
  },
});

type AudiusConnectionContentProps = {
  connection: AudiusConnection | null;
  error: string;
  onConnect: (user: AudiusUser) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onSearch: () => void;
  query: string;
  results: AudiusUser[];
  searching: boolean;
  setQuery: (query: string) => void;
  tracks: AudiusTrack[];
};

function AudiusConnectionContent({
  connection,
  error,
  onConnect,
  onDisconnect,
  onRefresh,
  onSearch,
  query,
  results,
  searching,
  setQuery,
  tracks,
}: AudiusConnectionContentProps) {
  if (connection) {
    return (
      <>
        <AppText variant="h2">Audius is connected</AppText>
        <AppText muted>
          @{connection.handle} is now feeding real public Audius context into this preview.
        </AppText>
        <AppText variant="small" muted>
          Last synced {formatSyncTime(connection.connectedAt)}
        </AppText>
        <View style={styles.actionRow}>
          <Button loading={searching} onPress={onRefresh} style={styles.actionButton}>
            Refresh
          </Button>
          <Button variant="secondary" onPress={onDisconnect} style={styles.actionButton}>
            Disconnect
          </Button>
        </View>
        <SectionHeader title="Top public tracks" />
        {tracks.length > 0 ? (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {tracks.map((track) => (
              <View key={track.id} style={styles.trackCard}>
                <AppText variant="h3">{track.title}</AppText>
                <AppText muted>
                  {formatCompactNumber(track.play_count)} plays / {formatCompactNumber(track.favorite_count)} favorites / {formatCompactNumber(track.repost_count)} reposts
                </AppText>
              </View>
            ))}
          </ScrollView>
        ) : (
          <AppText muted>
            No public Audius tracks came back yet. The connection is saved, but there may not be public track data available.
          </AppText>
        )}
      </>
    );
  }

  return (
    <>
      <AppText variant="h2">Find your Audius profile</AppText>
      <AppText muted>
        Search by artist name or handle. This uses public Audius data only, so no password or OAuth is needed for this first pass.
      </AppText>
      <TextInput
        autoCapitalize="words"
        onChangeText={setQuery}
        onSubmitEditing={onSearch}
        placeholder="Search artist or handle"
        placeholderTextColor={colors.textSubtle}
        returnKeyType="search"
        style={styles.searchInput}
        value={query}
      />
      <Button loading={searching} onPress={onSearch}>
        Search Audius
      </Button>
      {error ? (
        <AppText variant="small" style={styles.failed}>
          {error}
        </AppText>
      ) : null}
      {results.length > 0 ? (
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {results.map((user) => (
            <Pressable
              accessibilityRole="button"
              key={user.id}
              onPress={() => onConnect(user)}
              style={({ pressed }) => [styles.resultCard, pressed ? styles.pressed : undefined]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.copy}>
                  <AppText variant="h3">
                    {user.name}{user.is_verified ? " / verified" : ""}
                  </AppText>
                  <AppText muted>@{user.handle}</AppText>
                </View>
                <AppText variant="small" style={styles.connect}>
                  Connect
                </AppText>
              </View>
              <View style={styles.metricRow}>
                <MetricPill label={`${formatCompactNumber(user.follower_count)} followers`} />
                <MetricPill label={`${formatCompactNumber(user.track_count)} tracks`} />
                <MetricPill label={`${formatCompactNumber(user.repost_count)} reposts`} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </>
  );
}

function MetricPill({ label }: { label: string }) {
  return (
    <View style={styles.metricPill}>
      <AppText variant="tiny" muted>
        {label}
      </AppText>
    </View>
  );
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

type YouTubeConnectionContentProps = {
  connection: YouTubeConnection | null;
  error: string;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
};

function YouTubeConnectionContent({
  connection,
  error,
  loading,
  onConnect,
  onDisconnect,
  onRefresh,
}: YouTubeConnectionContentProps) {
  if (connection) {
    return (
      <>
        <AppText variant="h2">YouTube is connected</AppText>
        <AppText muted>
          {connection.title} is now connected with read-only channel access.
        </AppText>
        <AppText variant="small" muted>
          Last synced {formatSyncTime(connection.connectedAt)}
        </AppText>
        <View style={styles.youtubeMetricGrid}>
          <MetricPill label={`${formatCompactNumber(connection.viewCount)} views`} />
          <MetricPill label={`${formatCompactNumber(connection.subscriberCount)} subscribers`} />
          <MetricPill label={`${formatCompactNumber(connection.videoCount)} videos`} />
        </View>
        <AppText muted>
          Next we can turn uploads, views, and subscriber movement into HeatRadar signals.
        </AppText>
        <View style={styles.actionRow}>
          <Button loading={loading} onPress={onRefresh} style={styles.actionButton}>
            Refresh
          </Button>
          <Button variant="secondary" onPress={onDisconnect} style={styles.actionButton}>
            Disconnect
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <AppText variant="h2">Connect YouTube</AppText>
      <AppText muted>
        HeatRadar asks for read-only YouTube access so it can read channel and video movement. It will not upload, edit, or delete anything.
      </AppText>
      <Button loading={loading} onPress={onConnect}>
        Continue with Google
      </Button>
      {error ? (
        <AppText variant="small" style={styles.failed}>
          {error}
        </AppText>
      ) : null}
    </>
  );
}

function getYouTubeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "youtube-cancelled") {
    return "YouTube connection was cancelled. You can try again anytime.";
  }

  if (error instanceof Error && error.message === "youtube-channel-not-found") {
    return "No YouTube channel was found for that Google account.";
  }

  return "YouTube did not connect yet. Make sure the YouTube Data API is enabled for this Google project, then try again.";
}

type SpotifyConnectionContentProps = {
  connection: SpotifyConnection | null;
  error: string;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
};

function SpotifyConnectionContent({
  connection,
  error,
  loading,
  onConnect,
  onDisconnect,
  onRefresh,
}: SpotifyConnectionContentProps) {
  if (connection) {
    const topTrack = connection.topTracks[0];

    return (
      <>
        <AppText variant="h2">Spotify is connected</AppText>
        <AppText muted>
          {connection.displayName} is connected with read-only Spotify access.
        </AppText>
        <AppText variant="small" muted>
          Last synced {formatSyncTime(connection.connectedAt)}
        </AppText>
        <View style={styles.youtubeMetricGrid}>
          <MetricPill label={`${formatCompactNumber(connection.followers)} followers`} />
          <MetricPill label={`${connection.topTracks.length} top tracks`} />
        </View>
        {topTrack ? (
          <AppText muted>
            Current top track context: {topTrack.name} by {topTrack.artist}.
          </AppText>
        ) : (
          <AppText muted>
            Spotify is connected. HeatRadar will show top-track context once Spotify returns enough listening history.
          </AppText>
        )}
        <View style={styles.actionRow}>
          <Button loading={loading} onPress={onRefresh} style={styles.actionButton}>
            Refresh
          </Button>
          <Button variant="secondary" onPress={onDisconnect} style={styles.actionButton}>
            Disconnect
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <AppText variant="h2">Connect Spotify</AppText>
      <AppText muted>
        HeatRadar asks for read-only Spotify access to understand profile and listening context. Spotify public APIs do not include private Spotify for Artists analytics.
      </AppText>
      <Button loading={loading} onPress={onConnect}>
        Continue with Spotify
      </Button>
      {error ? (
        <AppText variant="small" style={styles.failed}>
          {error}
        </AppText>
      ) : null}
    </>
  );
}

function getSpotifyErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "spotify-cancelled") {
    return "Spotify connection was cancelled. You can try again anytime.";
  }

  if (error instanceof Error && error.message === "spotify-profile-failed") {
    return "Spotify connected, but profile data did not come back yet. Try again in a moment.";
  }

  return "Spotify did not connect yet. Check that your Spotify redirect URI is heatradar://spotify-auth, then try again.";
}

function getConnectionStyle(status: ConnectionStatus) {
  if (status === "Connected") {
    return styles.connected;
  }

  if (status === "Failed") {
    return styles.failed;
  }

  return styles.connect;
}

function formatSyncTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });
}

function getPlatformIcon(platformId: string): keyof typeof Ionicons.glyphMap {
  if (platformId === "audius") {
    return "musical-notes";
  }

  if (platformId === "youtube") {
    return "logo-youtube";
  }

  if (platformId === "spotify") {
    return "radio";
  }

  return "cloud";
}
