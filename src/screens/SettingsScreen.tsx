import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { deleteUser, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  AppText,
  Button,
  BottomSheetModal,
  Card,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import { platformConnections, settings } from "@/data/productContent";
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
import { clearLocalArtistProfile, deleteRemoteArtistProfile } from "@/services/artistProfile";
import { auth } from "@/services/firebase";
import {
  SpotifyConnection,
  clearSpotifyConnection,
  connectSpotifyAccount,
  getSpotifyConnection,
} from "@/services/spotify";
import {
  PlatformId,
  PlatformSyncStatus,
  clearPlatformSyncStatus,
  getPlatformSyncStatuses,
  markPlatformSyncFailed,
  markPlatformSyncSuccess,
} from "@/services/syncStatus";
import {
  YouTubeChannel,
  YouTubeConnection,
  clearYouTubeConnection,
  findYouTubeChannel,
  getYouTubeConnection,
  saveYouTubeChannelConnection,
} from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { impactLight, notifySuccess } from "@/utils/haptics";

type PlatformConnection = (typeof platformConnections)[number];
type ConnectionStatus = PlatformConnection["status"];
type CompactToggleRowProps = {
  body: string;
  enabled: boolean;
  label: string;
  onChange: (enabled: boolean) => void;
  showDivider: boolean;
};

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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [searchingAudius, setSearchingAudius] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [spotifyError, setSpotifyError] = useState("");
  const [syncStatuses, setSyncStatuses] = useState<Partial<Record<PlatformId, PlatformSyncStatus>>>({});
  const [youtubeChannelChoices, setYouTubeChannelChoices] = useState<YouTubeChannel[]>([]);
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const [youtubeError, setYouTubeError] = useState("");
  const [youtubeQuery, setYouTubeQuery] = useState("");
  const [youtubeSearching, setYouTubeSearching] = useState(false);
  const [toggleStates, setToggleStates] = useState(() =>
    Object.fromEntries(settings.map((item) => [item.label, item.enabled])),
  );
  const accountItems = [
    { label: "Account status", value: "Signed in" },
    { label: "Artist profile", value: artistIdentity.name },
    { label: "Sign-in email", value: artistIdentity.email },
    { label: "Sign-in method", value: artistIdentity.provider },
  ];

  useEffect(() => {
    let active = true;

    async function loadConnections() {
      const [savedAudiusConnection, savedSpotifyConnection, savedYouTubeConnection] = await Promise.all([
        getAudiusConnection(),
        getSpotifyConnection(),
        getYouTubeConnection(),
      ]);
      const savedSyncStatuses = await getPlatformSyncStatuses();

      if (!active) {
        return;
      }

      setSyncStatuses(savedSyncStatuses);

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
      await updateSyncSuccess("audius", "Audius refreshed.");
      notifySuccess();
    } catch {
      await updateSyncFailed("audius", "Could not save or refresh Audius.");
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
      await updateSyncSuccess("audius", "Audius refreshed.");
      notifySuccess();
    } catch {
      await updateSyncFailed("audius", "Could not refresh Audius.");
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
    await clearPlatformStatus("audius");
    setAudiusConnection(null);
    setAudiusTracks([]);
    resetPlatformConnection("audius");
    notifySuccess();
  }

  function getQuickDisconnectAction(platformId: string) {
    if (platformId === "audius" && audiusConnection) {
      return disconnectAudius;
    }

    if (platformId === "youtube" && youtubeConnection) {
      return disconnectYouTube;
    }

    if (platformId === "spotify" && spotifyConnection) {
      return disconnectSpotify;
    }

    return null;
  }

  async function refreshYouTube() {
    if (!youtubeConnection || connectingId === "youtube") {
      return;
    }

    impactLight();
    setYouTubeError("");
    setYouTubeChannelChoices([]);
    setConnectingId("youtube");

    try {
      const channel = await findYouTubeChannel(youtubeConnection.id);
      const savedConnection = await saveYouTubeChannelConnection(channel);
      setYouTubeConnection(savedConnection);
      markYouTubeConnected(savedConnection);
      await updateSyncSuccess("youtube", "YouTube refreshed.");
      notifySuccess();
    } catch (error) {
      await updateSyncFailed("youtube", "Could not refresh YouTube.");
      setYouTubeError(getYouTubeErrorMessage(error));
    } finally {
      setConnectingId(null);
    }
  }

  async function selectYouTubeChannel(channel: YouTubeChannel) {
    impactLight();
    setYouTubeError("");
    setConnectingId("youtube");

    try {
      const savedConnection = await saveYouTubeChannelConnection(channel);
      setYouTubeConnection(savedConnection);
      setYouTubeChannelChoices([]);
      markYouTubeConnected(savedConnection);
      await updateSyncSuccess("youtube", "YouTube refreshed.");
      notifySuccess();
    } catch {
      await updateSyncFailed("youtube", "Could not save YouTube.");
      setYouTubeError("We could not save that YouTube channel yet. Try again.");
    } finally {
      setConnectingId(null);
    }
  }

  async function searchYouTubeChannel() {
    if (youtubeSearching || connectingId === "youtube") {
      return;
    }

    impactLight();
    setYouTubeError("");
    setYouTubeChannelChoices([]);
    setYouTubeSearching(true);

    try {
      const channel = await findYouTubeChannel(youtubeQuery);
      setYouTubeChannelChoices([channel]);
    } catch (error) {
      setYouTubeError(getYouTubeErrorMessage(error));
    } finally {
      setYouTubeSearching(false);
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
    await clearPlatformStatus("youtube");
    setYouTubeConnection(null);
    setYouTubeChannelChoices([]);
    setYouTubeError("");
    setYouTubeQuery("");
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
      await updateSyncSuccess("spotify", "Spotify refreshed.");
      notifySuccess();
    } catch (error) {
      await updateSyncFailed("spotify", "Could not refresh Spotify.");
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
    await clearPlatformStatus("spotify");
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

  async function updateSyncSuccess(platformId: PlatformId, message: string) {
    await markPlatformSyncSuccess(platformId, message);
    setSyncStatuses(await getPlatformSyncStatuses());
  }

  async function updateSyncFailed(platformId: PlatformId, message: string) {
    await markPlatformSyncFailed(platformId, message);
    setSyncStatuses(await getPlatformSyncStatuses());
  }

  async function clearPlatformStatus(platformId: PlatformId) {
    await clearPlatformSyncStatus(platformId);
    setSyncStatuses(await getPlatformSyncStatuses());
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

  function confirmDeleteAccount() {
    impactLight();
    setDeleteAccountError("");

    Alert.alert(
      "Delete account?",
      "This removes your HeatRadar account from this device and deletes the Firebase login account. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          onPress: deleteCurrentAccount,
          style: "destructive",
        },
      ],
    );
  }

  async function deleteCurrentAccount() {
    if (deletingAccount) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setDeleteAccountError("No signed-in account was found. Sign in again, then try deleting the account.");
      return;
    }

    setDeletingAccount(true);
    setDeleteAccountError("");

    try {
      await Promise.allSettled([
        clearAudiusConnection(),
        clearSpotifyConnection(),
        clearYouTubeConnection(),
        clearLocalArtistProfile(),
        clearPlatformSyncStatus("audius"),
        clearPlatformSyncStatus("spotify"),
        clearPlatformSyncStatus("youtube"),
        deleteRemoteArtistProfile(currentUser.uid),
      ]);

      await deleteUser(currentUser);
      await GoogleSignin.signOut().catch(() => undefined);

      notifySuccess();
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
    } catch (error) {
      setDeleteAccountError(getDeleteAccountMessage(error));
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <ScreenContainer>
      <NavigationHeader label="Signal settings" />
      <SectionHeader
        title="Settings"
        body="Keep HeatRadar focused on the signals that tell you when listener movement is picking up."
      />
      <SectionHeader title="Platform Connections" />
      <StaggeredList
        data={connections}
        keyExtractor={(platform) => platform.id}
        renderItem={(platform) => {
          const isConnecting = connectingId === platform.id;
          const connected = platform.status === "Connected";
          const failed = platform.status === "Failed";
          const reconnect = platform.status === "Reconnect";
          const quickDisconnect = getQuickDisconnectAction(platform.id);

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
                    <SyncStatusLine
                      loading={isConnecting}
                      status={syncStatuses[platform.id as PlatformId]}
                    />
                    <AppText variant="small" muted style={styles.platformPermission}>
                      {platform.permission}
                    </AppText>
                  </View>
                  <View style={styles.connectionActions}>
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
                    {quickDisconnect ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={(event) => {
                          event.stopPropagation();
                          quickDisconnect();
                        }}
                        style={({ pressed }) => [styles.quickDisconnect, pressed ? styles.pressed : undefined]}
                      >
                        <AppText variant="tiny" style={styles.quickDisconnectText}>
                          Disconnect
                        </AppText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <SectionHeader title="Notification Settings" />
      <Card>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications" size={18} color={colors.black} />
          </View>
          <View style={styles.copy}>
            <AppText variant="h3">Alert preferences</AppText>
            <AppText muted>Choose the signal moments worth interrupting you for.</AppText>
          </View>
        </View>
        <View style={styles.notificationList}>
          {settings.map((setting, index) => (
            <CompactToggleRow
              key={setting.label}
              body={setting.body}
              enabled={Boolean(toggleStates[setting.label])}
              label={setting.label}
              showDivider={index < settings.length - 1}
              onChange={(enabled) =>
                setToggleStates((state) => ({ ...state, [setting.label]: enabled }))
              }
            />
          ))}
        </View>
      </Card>
      <Card>
        <AppText variant="h2">Privacy-first access</AppText>
        <AppText muted>
          HeatRadar uses Firebase for account access. Platform connections stay
          read-only and under your control.
        </AppText>
      </Card>
      <SectionHeader title="Account" />
      <Card>
        <View style={styles.sessionCard}>
          <View style={styles.accountList}>
            {accountItems.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.accountRow,
                  index < accountItems.length - 1 ? styles.accountRowDivider : undefined,
                ]}
              >
                <AppText variant="small">{item.label}</AppText>
                <AppText variant="small" muted style={styles.accountValue}>
                  {item.value}
                </AppText>
              </View>
            ))}
          </View>
          <View style={styles.copy}>
            <AppText variant="small" muted>
              Sign out when you want to test another account or reset the login flow.
            </AppText>
          </View>
          <Button variant="secondary" loading={signingOut} onPress={handleSignOut}>
            Sign out
          </Button>
          <View style={styles.deleteAccountBlock}>
            <AppText variant="small" muted>
              Need to leave HeatRadar? You can delete your account and local connection data here.
            </AppText>
            {deleteAccountError ? (
              <AppText variant="small" style={styles.failed}>
                {deleteAccountError}
              </AppText>
            ) : null}
            <Button variant="secondary" loading={deletingAccount} onPress={confirmDeleteAccount}>
              <AppText variant="body" style={styles.deleteAccountText}>
                Delete account
              </AppText>
            </Button>
          </View>
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
              syncStatus={syncStatuses.audius}
              tracks={audiusTracks}
            />
          ) : connectionModal.id === "youtube" ? (
            <YouTubeConnectionContent
              channelChoices={youtubeChannelChoices}
              connection={youtubeConnection}
              error={youtubeError}
              loading={connectingId === "youtube" || youtubeSearching}
              onChannelSelect={selectYouTubeChannel}
              onDisconnect={disconnectYouTube}
              onRefresh={refreshYouTube}
              onSearch={searchYouTubeChannel}
              query={youtubeQuery}
              setQuery={setYouTubeQuery}
              syncStatus={syncStatuses.youtube}
            />
          ) : connectionModal.id === "spotify" ? (
            <SpotifyConnectionContent
              connection={spotifyConnection}
              error={spotifyError}
              loading={connectingId === "spotify"}
              onConnect={connectSpotify}
              onDisconnect={disconnectSpotify}
              onRefresh={connectSpotify}
              syncStatus={syncStatuses.spotify}
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
                      : "Ready to connect"}
              </AppText>
              <AppText muted>
                {connectionModal.permission}
              </AppText>
              <AppText muted>
                HeatRadar explains what it needs before asking for access.
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
  platformPermission: {
    fontWeight: "600",
    lineHeight: 19,
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
  connectionActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  quickDisconnect: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.22)",
  },
  quickDisconnectText: {
    color: colors.red,
    fontWeight: "900",
  },
  sessionCard: {
    gap: spacing.md,
  },
  deleteAccountBlock: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  deleteAccountText: {
    color: colors.red,
    fontWeight: "800",
    textAlign: "center",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  notificationList: {
    marginTop: spacing.sm,
  },
  compactToggleRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  compactToggleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  compactToggleCopy: {
    flex: 1,
    gap: 2,
  },
  compactToggleBody: {
    fontWeight: "600",
    lineHeight: 19,
  },
  compactSwitch: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: colors.surfaceSoft,
  },
  compactSwitchOn: {
    backgroundColor: colors.green,
  },
  compactKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textMuted,
  },
  compactKnobOn: {
    transform: [{ translateX: 18 }],
    backgroundColor: colors.black,
  },
  accountList: {
    gap: 0,
  },
  accountRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  accountRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  accountValue: {
    flex: 1,
    textAlign: "right",
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
  syncLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textSubtle,
  },
  syncDotSuccess: {
    backgroundColor: colors.green,
  },
  syncDotFailed: {
    backgroundColor: colors.red,
  },
  syncTextFailed: {
    color: colors.red,
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
  syncStatus?: PlatformSyncStatus;
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
  syncStatus,
  tracks,
}: AudiusConnectionContentProps) {
  if (connection) {
    return (
      <>
        <AppText variant="h2">Audius is connected</AppText>
        <AppText muted>
          @{connection.handle} is now feeding real public Audius context into your signal read.
        </AppText>
        <AppText variant="small" muted>
          Last synced {formatSyncTime(connection.connectedAt)}
        </AppText>
        <SyncStatusLine loading={searching} status={syncStatus} />
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

function CompactToggleRow({
  body,
  enabled,
  label,
  onChange,
  showDivider,
}: CompactToggleRowProps) {
  function toggle() {
    impactLight();
    onChange(!enabled);
  }

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={toggle}
      style={[styles.compactToggleRow, showDivider ? styles.compactToggleDivider : undefined]}
    >
      <View style={styles.compactToggleCopy}>
        <AppText variant="small">{label}</AppText>
        <AppText variant="small" muted style={styles.compactToggleBody}>
          {body}
        </AppText>
      </View>
      <View style={[styles.compactSwitch, enabled ? styles.compactSwitchOn : undefined]}>
        <View style={[styles.compactKnob, enabled ? styles.compactKnobOn : undefined]} />
      </View>
    </Pressable>
  );
}

function SyncStatusLine({
  loading,
  status,
}: {
  loading?: boolean;
  status?: PlatformSyncStatus;
}) {
  const failed = status?.state === "failed";
  const message = loading
    ? "Syncing..."
    : status
      ? `${status.message} ${formatRelativeSyncTime(status.checkedAt)}`
      : "Not synced yet";

  return (
    <View style={styles.syncLine}>
      <View
        style={[
          styles.syncDot,
          status?.state === "success" ? styles.syncDotSuccess : undefined,
          failed ? styles.syncDotFailed : undefined,
        ]}
      />
      <AppText
        variant="tiny"
        muted={!failed}
        style={failed ? styles.syncTextFailed : undefined}
      >
        {message}
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
  channelChoices: YouTubeChannel[];
  connection: YouTubeConnection | null;
  error: string;
  loading: boolean;
  onChannelSelect: (channel: YouTubeChannel) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onSearch: () => void;
  query: string;
  setQuery: (query: string) => void;
  syncStatus?: PlatformSyncStatus;
};

function YouTubeConnectionContent({
  channelChoices,
  connection,
  error,
  loading,
  onChannelSelect,
  onDisconnect,
  onRefresh,
  onSearch,
  query,
  setQuery,
  syncStatus,
}: YouTubeConnectionContentProps) {
  if (connection) {
    return (
      <>
        <AppText variant="h2">YouTube is connected</AppText>
        <AppText muted>
          {connection.title} is now connected with public channel stats.
        </AppText>
        <AppText variant="small" muted>
          Last synced {formatSyncTime(connection.connectedAt)}
        </AppText>
        <SyncStatusLine loading={loading} status={syncStatus} />
        <View style={styles.youtubeMetricGrid}>
          <MetricPill label={`${formatCompactNumber(connection.viewCount)} views`} />
          <MetricPill label={`${formatCompactNumber(connection.subscriberCount)} subscribers`} />
          <MetricPill label={`${formatCompactNumber(connection.videoCount)} videos`} />
        </View>
        <AppText muted>
          Next we can turn public channel stats into HeatRadar signals.
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

  if (channelChoices.length > 0) {
    return (
      <>
        <AppText variant="h2">Choose your YouTube channel</AppText>
        <AppText muted>
          Pick the channel you want HeatRadar to use for video-side movement.
        </AppText>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {channelChoices.map((channel) => (
            <Pressable
              accessibilityRole="button"
              key={channel.id}
              onPress={() => onChannelSelect(channel)}
              style={({ pressed }) => [styles.resultCard, pressed ? styles.pressed : undefined]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.copy}>
                  <AppText variant="h3">{channel.snippet.title}</AppText>
                  <AppText muted>{channel.snippet.customUrl ?? channel.id}</AppText>
                </View>
                <AppText variant="small" style={styles.connect}>
                  Use this
                </AppText>
              </View>
              <View style={styles.metricRow}>
                <MetricPill label={`${formatCompactNumber(Number(channel.statistics?.viewCount ?? 0))} views`} />
                <MetricPill label={`${formatCompactNumber(Number(channel.statistics?.subscriberCount ?? 0))} subscribers`} />
                <MetricPill label={`${formatCompactNumber(Number(channel.statistics?.videoCount ?? 0))} videos`} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
        {error ? (
          <AppText variant="small" style={styles.failed}>
            {error}
          </AppText>
        ) : null}
      </>
    );
  }

  return (
    <>
      <AppText variant="h2">Connect YouTube</AppText>
      <AppText muted>
        Paste your public channel handle or URL. HeatRadar will read public channel stats without asking for private Google access.
      </AppText>
      <TextInput
        autoCapitalize="none"
        onChangeText={setQuery}
        onSubmitEditing={onSearch}
        placeholder="@yourchannel or channel URL"
        placeholderTextColor={colors.textSubtle}
        returnKeyType="search"
        style={styles.searchInput}
        value={query}
      />
      <Button loading={loading} onPress={onSearch}>
        Find channel
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

  if (error instanceof Error && error.message === "youtube-channel-query-invalid") {
    return "Enter a YouTube handle, channel URL, or channel ID.";
  }

  if (error instanceof Error && error.message === "youtube-channel-not-found") {
    return "No public YouTube channel was found. Try the channel handle, channel URL, or exact channel name.";
  }

  if (error instanceof Error && error.message === "youtube-api-key-blocked") {
    return "YouTube lookup is blocked by the API key settings. Make sure the YouTube Data API key can be used by this app.";
  }

  if (error instanceof Error && error.message === "youtube-api-quota") {
    return "YouTube lookup has hit its daily limit. Try again later.";
  }

  return "YouTube did not connect yet. Try a channel handle, channel URL, channel ID, or exact channel name.";
}

type SpotifyConnectionContentProps = {
  connection: SpotifyConnection | null;
  error: string;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  syncStatus?: PlatformSyncStatus;
};

function SpotifyConnectionContent({
  connection,
  error,
  loading,
  onConnect,
  onDisconnect,
  onRefresh,
  syncStatus,
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
        <SyncStatusLine loading={loading} status={syncStatus} />
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

function getDeleteAccountMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  if (code.includes("requires-recent-login")) {
    return "For security, sign out and sign back in, then return here to delete the account.";
  }

  if (code.includes("network-request-failed")) {
    return "The connection dropped before the account could be deleted. Try again in a moment.";
  }

  return "The account could not be deleted yet. Try again in a moment.";
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

function formatRelativeSyncTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const differenceInMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (differenceInMinutes < 1) {
    return "just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
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
