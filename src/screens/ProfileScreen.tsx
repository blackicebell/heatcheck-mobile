import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Card,
  EmptyState,
  LockedFeatureCard,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import {
  emptyStates,
  settings,
} from "@/data/mockData";
import { useArtistIdentity } from "@/hooks/useArtistIdentity";
import {
  AudiusConnection,
  getAudiusConnection,
} from "@/services/audius";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import {
  PlatformId,
  PlatformSyncStatus,
  getPlatformSyncStatuses,
} from "@/services/syncStatus";
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const artistIdentity = useArtistIdentity();
  const [audiusConnection, setAudiusConnection] = useState<AudiusConnection | null>(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [syncStatuses, setSyncStatuses] = useState<Partial<Record<PlatformId, PlatformSyncStatus>>>({});
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const connectedAccounts = useMemo(
    () =>
      [
        audiusConnection
          ? {
              detail: `@${audiusConnection.handle}`,
              id: "audius" as const,
              name: "Audius",
              syncStatus: syncStatuses.audius,
            }
          : null,
        youtubeConnection
          ? {
              detail: youtubeConnection.customUrl ?? youtubeConnection.title,
              id: "youtube" as const,
              name: "YouTube",
              syncStatus: syncStatuses.youtube,
            }
          : null,
        spotifyConnection
          ? {
              detail: spotifyConnection.displayName,
              id: "spotify" as const,
              name: "Spotify",
              syncStatus: syncStatuses.spotify,
            }
          : null,
      ].filter((account) => account !== null),
    [audiusConnection, spotifyConnection, syncStatuses, youtubeConnection],
  );
  const syncedCount = Object.values(syncStatuses).filter((status) => status?.state === "success").length;
  const enabledNotifications = settings.filter((setting) => setting.enabled);
  const accountItems = [
    { label: "Plan", value: "HeatRadar Pro preview" },
    { label: "Artist profile", value: artistIdentity.name },
    { label: "Sign-in email", value: artistIdentity.email },
    { label: "Sign-in method", value: artistIdentity.provider },
    { label: "Connected signals", value: `${connectedAccounts.length}/3` },
  ];

  const loadProfileSignals = useCallback(async () => {
    const [savedAudiusConnection, savedSpotifyConnection, savedSyncStatuses, savedYouTubeConnection] =
      await Promise.all([
        getAudiusConnection(),
        getSpotifyConnection(),
        getPlatformSyncStatuses(),
        getYouTubeConnection(),
      ]);

    setAudiusConnection(savedAudiusConnection);
    setSpotifyConnection(savedSpotifyConnection);
    setSyncStatuses(savedSyncStatuses);
    setYouTubeConnection(savedYouTubeConnection);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileSignals();
    }, [loadProfileSignals]),
  );

  return (
    <ScreenContainer>
      <NavigationHeader label="Artist profile" actionIcon="person-circle" />
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={["rgba(255,104,179,0.95)", "rgba(255,207,95,0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Ionicons name="person" size={34} color={colors.black} />
          <View style={styles.avatarPulse} />
        </LinearGradient>
        <View style={styles.profileCopy}>
          <AppText variant="h1">{artistIdentity.name}</AppText>
          <AppText muted>
            {artistIdentity.handle} / {artistIdentity.city}
          </AppText>
        </View>
      </View>

      <Card elevated>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Ionicons name="radio" size={22} color={colors.black} />
          </View>
          <View style={styles.copy}>
            <AppText variant="h2">Your connected signals</AppText>
            <AppText muted>
              {connectedAccounts.length > 0
                ? `${connectedAccounts.length} of 3 platforms connected. ${syncedCount} synced cleanly.`
                : "Connect a platform to start building your artist signal profile."}
            </AppText>
          </View>
        </View>
        <View style={styles.summaryGrid}>
          <SummaryMetric label="Platforms" value={`${connectedAccounts.length}/3`} />
          <SummaryMetric label="Synced" value={`${syncedCount}/3`} />
          <SummaryMetric label="Account" value={artistIdentity.provider} />
        </View>
      </Card>

      <SectionHeader title="Connected accounts" />
      {connectedAccounts.length > 0 ? (
        <StaggeredList
          data={connectedAccounts}
          keyExtractor={(account) => account.id}
          renderItem={(account) => (
            <Card>
              <View style={styles.row}>
                <Ionicons name="checkmark-circle" size={24} color={colors.green} />
                <View style={styles.copy}>
                  <AppText variant="h3">{account.name}</AppText>
                  <AppText muted>{account.detail}</AppText>
                  <AppText variant="tiny" muted>
                    {formatSyncStatus(account.syncStatus)}
                  </AppText>
                </View>
              </View>
            </Card>
          )}
        />
      ) : (
        <EmptyState icon="link" {...emptyStates.connectedAccounts} />
      )}

      <SectionHeader title="Notification settings" />
      <StaggeredList
        data={enabledNotifications}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <View style={styles.row}>
              <Ionicons name="notifications" size={22} color={colors.blue} />
              <View style={styles.copy}>
                <AppText variant="h3">{setting.label}</AppText>
                <AppText muted>{setting.body}</AppText>
              </View>
            </View>
          </Card>
        )}
      />

      <SectionHeader title="Account" />
      <LockedFeatureCard
        title="HeatRadar Pro"
        body="Unlock deeper score explanations, weekly heat recaps, and shareable milestone cards after the free trial."
        onPress={() => navigation.navigate("TrialPaywall")}
      />
      <StaggeredList
        data={accountItems}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <View style={styles.accountRow}>
              <AppText variant="h3">{setting.label}</AppText>
              <AppText muted>{setting.value}</AppText>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  avatarPulse: {
    position: "absolute",
    bottom: 20,
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(5,6,8,0.42)",
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryMetric: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  accountRow: {
    gap: spacing.xs,
  },
});

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryMetric}>
      <AppText variant="tiny" muted>
        {label}
      </AppText>
      <AppText variant="h3">{value}</AppText>
    </View>
  );
}

function formatSyncStatus(status?: PlatformSyncStatus) {
  if (!status) {
    return "Not synced yet";
  }

  if (status.state === "failed") {
    return status.message;
  }

  return `${status.message} ${formatRelativeTime(status.checkedAt)}`;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "recently";
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
