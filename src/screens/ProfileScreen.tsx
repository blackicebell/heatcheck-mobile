import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Card,
  EmptyState,
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
import { impactLight } from "@/utils/haptics";

export function ProfileScreen() {
  const artistIdentity = useArtistIdentity();
  const [audiusConnection, setAudiusConnection] = useState<AudiusConnection | null>(null);
  const [notificationSettings, setNotificationSettings] = useState(settings);
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
  const accountItems = [
    { label: "Account status", value: "Standard" },
    { label: "Sign-in email", value: artistIdentity.email },
    { label: "Sign-in method", value: artistIdentity.provider },
  ];

  function toggleNotification(label: string) {
    impactLight();
    setNotificationSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.label === label ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    );
  }

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
          {notificationSettings.map((setting, index) => (
            <NotificationSettingRow
              key={setting.label}
              body={setting.body}
              enabled={setting.enabled}
              label={setting.label}
              showDivider={index < notificationSettings.length - 1}
              onPress={() => toggleNotification(setting.label)}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Account" />
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
  notificationRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  notificationRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  notificationCopy: {
    flex: 1,
    gap: 2,
  },
  switch: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: colors.surfaceSoft,
  },
  switchOn: {
    backgroundColor: colors.green,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textMuted,
  },
  knobOn: {
    transform: [{ translateX: 18 }],
    backgroundColor: colors.black,
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

function NotificationSettingRow({
  body,
  enabled,
  label,
  onPress,
  showDivider,
}: {
  body: string;
  enabled: boolean;
  label: string;
  onPress: () => void;
  showDivider: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={onPress}
      style={[styles.notificationRow, showDivider ? styles.notificationRowDivider : undefined]}
    >
      <View style={styles.notificationCopy}>
        <AppText variant="small">{label}</AppText>
        <AppText variant="tiny" muted>
          {body}
        </AppText>
      </View>
      <View style={[styles.switch, enabled ? styles.switchOn : undefined]}>
        <View style={[styles.knob, enabled ? styles.knobOn : undefined]} />
      </View>
    </Pressable>
  );
}

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
