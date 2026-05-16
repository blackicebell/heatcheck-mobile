import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import {
  AnimatedView,
  AppText,
  BottomSheetModal,
  Card,
  EmptyState,
  LoadingSkeleton,
  MiniBarChart,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  ShareMilestoneCard,
  StatCard,
  TractionAlert,
} from "@/components";
import {
  dashboard,
  emptyStates,
  loadingCopy,
  retentionHighlights,
  shareCards,
} from "@/data/mockData";
import { useArtistIdentity } from "@/hooks/useArtistIdentity";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import {
  AudiusConnection,
  AudiusTrack,
  getAudiusConnection,
  getAudiusTracksByHandle,
} from "@/services/audius";
import { calculateHeatScore } from "@/services/heatScore";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import {
  PlatformId,
  PlatformSyncStatus,
  getPlatformSyncStatuses,
  markPlatformSyncFailed,
  markPlatformSyncSuccess,
} from "@/services/syncStatus";
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight } from "@/utils/haptics";

const heatRadarIcon = require("@/assets/brand/heatradar-icon.png");

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const artistIdentity = useArtistIdentity();
  const [audiusConnection, setAudiusConnection] = useState<AudiusConnection | null>(null);
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [syncStatuses, setSyncStatuses] = useState<Partial<Record<PlatformId, PlatformSyncStatus>>>({});
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const { refresh, refreshing } = useMockRefresh(900);
  const topAudiusTrack = audiusTracks[0];
  const topSpotifyTrack = spotifyConnection?.topTracks[0];
  const heatScoreRead = useMemo(
    () =>
      calculateHeatScore({
        audiusTracks,
        spotifyConnection,
        youtubeConnection,
      }),
    [audiusTracks, spotifyConnection, youtubeConnection],
  );

  const loadAudiusSignal = useCallback(async () => {
    const connection = await getAudiusConnection();
    setAudiusConnection(connection);

    if (!connection) {
      setAudiusTracks([]);
      return;
    }

    try {
      const tracks = await getAudiusTracksByHandle(connection.handle);
      setAudiusTracks(tracks);
      await markPlatformSyncSuccess("audius", "Audius checked.");
      setSyncStatuses(await getPlatformSyncStatuses());
    } catch {
      setAudiusTracks([]);
      await markPlatformSyncFailed("audius", "Audius could not refresh.");
      setSyncStatuses(await getPlatformSyncStatuses());
    }
  }, []);

  const loadYouTubeSignal = useCallback(async () => {
    const connection = await getYouTubeConnection();
    setYouTubeConnection(connection);
  }, []);

  const loadSpotifySignal = useCallback(async () => {
    const connection = await getSpotifyConnection();
    setSpotifyConnection(connection);
  }, []);

  const loadSyncStatuses = useCallback(async () => {
    setSyncStatuses(await getPlatformSyncStatuses());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAudiusSignal();
      loadSpotifySignal();
      loadSyncStatuses();
      loadYouTubeSignal();
    }, [loadAudiusSignal, loadSpotifySignal, loadSyncStatuses, loadYouTubeSignal]),
  );

  function openAlert() {
    impactLight();
    setAlertOpen(true);
  }

  function refreshHome() {
    refresh();
    loadAudiusSignal();
    loadSpotifySignal();
    loadSyncStatuses();
    loadYouTubeSignal();
  }

  if (dashboard.isLoading) {
    return (
      <ScreenContainer>
        <NavigationHeader label={loadingCopy.dashboard} actionIcon="notifications" />
        <LoadingSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={refreshHome} refreshing={refreshing}>
      <NavigationHeader
        label={`${artistIdentity.handle} / getting heat this week`}
        badge
        actionIcon="notifications"
        onActionPress={() => {
          impactLight();
          navigation.navigate("Notifications");
        }}
      />
      <View style={styles.brandStrip}>
        <Image source={heatRadarIcon} style={styles.brandIcon} />
        <View style={styles.copy}>
          <AppText variant="h3">{"Today's heat read"}</AppText>
          <AppText muted>
            Your audience is warmer today. YouTube engagement and Spotify saves are
            carrying most of the lift.
          </AppText>
        </View>
      </View>
      <SectionHeader title={heatScoreRead.headline} />
      <AnimatedView>
        <Card elevated>
          <View style={styles.scoreRow}>
            <View>
              <AppText variant="tiny" muted>
                Heat Score
              </AppText>
              <AppText variant="title">{heatScoreRead.score}</AppText>
            </View>
            <View style={styles.pill}>
              <AppText variant="small" style={styles.pillText}>
                {heatScoreRead.weeklyChange}
              </AppText>
            </View>
          </View>
          <MiniBarChart data={heatScoreRead.sparkline} />
          <View style={styles.explainStack}>
            <AppText>{heatScoreRead.explanation}</AppText>
            <AppText muted>{heatScoreRead.scoreBoost}</AppText>
            <AppText muted>{heatScoreRead.action}</AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("HeatScoreEducation")}
            >
              <AppText variant="small" style={styles.linkText}>
                How Heat Score works
              </AppText>
            </Pressable>
          </View>
        </Card>
      </AnimatedView>
      <AnimatedView delay={80}>
        <Card elevated>
          <View style={styles.pressableCopy}>
            <TractionAlert title="Best next move" body={heatScoreRead.action} />
            <Pressable accessibilityRole="button" onPress={openAlert}>
              <AppText variant="small" style={styles.linkText}>
                View why this matters
              </AppText>
            </Pressable>
          </View>
        </Card>
      </AnimatedView>
      <SectionHeader title="Since your last alert" />
      <View style={styles.stats}>
        {retentionHighlights.map((item, index) => (
          <AnimatedView key={item.label} delay={index * 80} style={styles.statItem}>
            <StatCard label={item.label} value={item.value} />
          </AnimatedView>
        ))}
      </View>
      <SectionHeader title="What's driving it" />
      {heatScoreRead.contributors.length > 0 ? (
        <View style={styles.stats}>
          {heatScoreRead.contributors.map((item, index) => (
            <AnimatedView key={item.label} delay={index * 80} style={styles.statItem}>
              <StatCard {...item} />
            </AnimatedView>
          ))}
        </View>
      ) : (
        <EmptyState icon="flame" {...emptyStates.traction} />
      )}
      {audiusConnection ? (
        <AnimatedView delay={160}>
          <Card elevated>
            <View style={styles.signalHeader}>
              <View style={styles.signalIcon}>
                <AppText variant="h3" style={styles.signalIconText}>
                  A
                </AppText>
              </View>
              <View style={styles.signalCopy}>
                <View style={styles.signalTitleRow}>
                  <AppText variant="h3">Audius is moving</AppText>
                  <View style={styles.realSignalPill}>
                    <AppText variant="tiny" style={styles.realSignalText}>
                      Real signal
                    </AppText>
                  </View>
                </View>
                <AppText muted>@{audiusConnection.handle}</AppText>
              </View>
            </View>
            {topAudiusTrack ? (
              <>
                <AppText variant="h2" style={styles.trackTitle}>
                  {topAudiusTrack.title}
                </AppText>
                <AppText muted>
                  {topAudiusTrack.title} is your top public Audius track right now.
                </AppText>
                <View style={styles.signalMetrics}>
                  <SignalMetric label="Plays" value={formatCompactNumber(topAudiusTrack.play_count)} />
                  <SignalMetric label="Favorites" value={formatCompactNumber(topAudiusTrack.favorite_count)} />
                  <SignalMetric label="Reposts" value={formatCompactNumber(topAudiusTrack.repost_count)} />
                </View>
                <AppText style={styles.signalRead}>
                  {getAudiusSignalRead(topAudiusTrack)}
                </AppText>
              </>
            ) : (
              <AppText muted>
                Audius is connected. Track movement will show here once public tracks come back.
              </AppText>
            )}
          </Card>
        </AnimatedView>
      ) : null}
      {youtubeConnection ? (
        <AnimatedView delay={200}>
          <Card elevated>
            <View style={styles.signalHeader}>
              <View style={[styles.signalIcon, styles.youtubeIcon]}>
                <AppText variant="h3" style={styles.youtubeIconText}>
                  Y
                </AppText>
              </View>
              <View style={styles.signalCopy}>
                <View style={styles.signalTitleRow}>
                  <AppText variant="h3">YouTube is connected</AppText>
                  <View style={styles.youtubeSignalPill}>
                    <AppText variant="tiny" style={styles.youtubeSignalText}>
                      Video signal
                    </AppText>
                  </View>
                </View>
                <AppText muted>{youtubeConnection.title}</AppText>
              </View>
            </View>
            <View style={styles.signalMetrics}>
              <SignalMetric label="Views" value={formatCompactNumber(youtubeConnection.viewCount)} />
              <SignalMetric label="Subscribers" value={formatCompactNumber(youtubeConnection.subscriberCount)} />
              <SignalMetric label="Videos" value={formatCompactNumber(youtubeConnection.videoCount)} />
            </View>
            <AppText style={styles.signalRead}>
              {getYouTubeSignalRead(youtubeConnection)}
            </AppText>
          </Card>
        </AnimatedView>
      ) : null}
      {spotifyConnection ? (
        <AnimatedView delay={220}>
          <Card elevated>
            <View style={styles.signalHeader}>
              <View style={[styles.signalIcon, styles.spotifyIcon]}>
                <AppText variant="h3" style={styles.spotifyIconText}>
                  S
                </AppText>
              </View>
              <View style={styles.signalCopy}>
                <View style={styles.signalTitleRow}>
                  <AppText variant="h3">Spotify is connected</AppText>
                  <View style={styles.spotifySignalPill}>
                    <AppText variant="tiny" style={styles.spotifySignalText}>
                      Listener signal
                    </AppText>
                  </View>
                </View>
                <AppText muted>{spotifyConnection.displayName}</AppText>
              </View>
            </View>
            {topSpotifyTrack ? (
              <>
                <AppText variant="h2" style={styles.trackTitle}>
                  {topSpotifyTrack.name}
                </AppText>
                <AppText muted>
                  {topSpotifyTrack.name} by {topSpotifyTrack.artist} is your strongest recent Spotify listening signal.
                </AppText>
                <View style={styles.signalMetrics}>
                  <SignalMetric label="Followers" value={formatCompactNumber(spotifyConnection.followers)} />
                  <SignalMetric label="Top tracks" value={formatCompactNumber(spotifyConnection.topTracks.length)} />
                  <SignalMetric label="Popularity" value={`${topSpotifyTrack.popularity}/100`} />
                </View>
                <AppText style={styles.signalRead}>
                  {getSpotifySignalRead(spotifyConnection)}
                </AppText>
              </>
            ) : (
              <>
                <View style={styles.signalMetrics}>
                  <SignalMetric label="Followers" value={formatCompactNumber(spotifyConnection.followers)} />
                  <SignalMetric label="Top tracks" value="Waiting" />
                </View>
                <AppText muted>
                  Spotify is connected. Recent top-track movement will show here once there is enough listening history.
                </AppText>
              </>
            )}
          </Card>
        </AnimatedView>
      ) : null}
      <SectionHeader title="Share card previews" />
      <View style={styles.shareGrid}>
        {shareCards.map((card) => (
          <View key={card.title} style={styles.shareItem}>
            <ShareMilestoneCard {...card} />
          </View>
        ))}
      </View>
      <Card>
        <View style={styles.syncHeader}>
          <View style={styles.copy}>
            <AppText variant="h3">Sync check</AppText>
            <AppText muted>{getOverallSyncRead(syncStatuses)}</AppText>
          </View>
          {refreshing ? <AppText variant="small" style={styles.pillText}>Syncing...</AppText> : null}
        </View>
        <View style={styles.syncList}>
          <HomeSyncRow label="Audius" status={syncStatuses.audius} />
          <HomeSyncRow label="YouTube" status={syncStatuses.youtube} />
          <HomeSyncRow label="Spotify" status={syncStatuses.spotify} />
        </View>
      </Card>
      <BottomSheetModal
        visible={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Best next move"
      >
        <AppText muted>{heatScoreRead.action}</AppText>
        <AppText>
          This read is based on your clearest connected platform signal, then
          turned into one simple move that could keep the lift going.
        </AppText>
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  pillText: {
    color: colors.green,
  },
  brandStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,207,95,0.18)",
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  explainStack: {
    gap: spacing.xs,
  },
  pressableCopy: {
    gap: spacing.md,
  },
  linkText: {
    color: colors.green,
  },
  shareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  shareItem: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  signalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  signalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  signalIconText: {
    color: colors.black,
  },
  youtubeIcon: {
    backgroundColor: colors.red,
  },
  youtubeIconText: {
    color: colors.white,
  },
  spotifyIcon: {
    backgroundColor: "#1DB954",
  },
  spotifyIconText: {
    color: colors.black,
  },
  signalCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  signalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  realSignalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  realSignalText: {
    color: colors.green,
    fontWeight: "800",
  },
  youtubeSignalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(255,107,107,0.16)",
  },
  youtubeSignalText: {
    color: colors.red,
    fontWeight: "800",
  },
  spotifySignalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(29,185,84,0.16)",
  },
  spotifySignalText: {
    color: "#1DB954",
    fontWeight: "800",
  },
  trackTitle: {
    color: colors.white,
  },
  signalMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  signalMetric: {
    flexGrow: 1,
    flexBasis: "30%",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
  },
  signalRead: {
    color: colors.text,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  syncHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  syncList: {
    gap: spacing.sm,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  syncLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  syncDot: {
    width: 8,
    height: 8,
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

function SignalMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.signalMetric}>
      <AppText variant="tiny" muted>
        {label}
      </AppText>
      <AppText variant="h3">{value}</AppText>
    </View>
  );
}

function HomeSyncRow({
  label,
  status,
}: {
  label: string;
  status?: PlatformSyncStatus;
}) {
  const failed = status?.state === "failed";

  return (
    <View style={styles.syncRow}>
      <View style={styles.syncLeft}>
        <View
          style={[
            styles.syncDot,
            status?.state === "success" ? styles.syncDotSuccess : undefined,
            failed ? styles.syncDotFailed : undefined,
          ]}
        />
        <AppText variant="small">{label}</AppText>
      </View>
      <AppText
        variant="tiny"
        muted={!failed}
        style={failed ? styles.syncTextFailed : undefined}
      >
        {status ? formatRelativeSyncTime(status.checkedAt) : "Not connected"}
      </AppText>
    </View>
  );
}

function getOverallSyncRead(statuses: Partial<Record<PlatformId, PlatformSyncStatus>>) {
  const connectedStatuses = Object.values(statuses);

  if (connectedStatuses.length === 0) {
    return "Connect a platform and this will show when signals were last checked.";
  }

  if (connectedStatuses.some((status) => status.state === "failed")) {
    return "One platform needs another refresh before the score has a clean read.";
  }

  const latestStatus = connectedStatuses.sort(
    (first, second) =>
      new Date(second.checkedAt).getTime() - new Date(first.checkedAt).getTime(),
  )[0];

  return `Last checked ${formatRelativeSyncTime(latestStatus.checkedAt)}.`;
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function formatRelativeSyncTime(dateString: string) {
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

function getAudiusSignalRead(track: AudiusTrack) {
  if (track.repost_count > 0 && track.favorite_count > 0) {
    return "Favorites and reposts are giving this track a real early traction read.";
  }

  if (track.play_count > 0) {
    return "Plays are starting to give this track a first public movement signal.";
  }

  return "This track is being watched for the first signs of movement.";
}

function getYouTubeSignalRead(connection: YouTubeConnection) {
  if (connection.viewCount > 0 && connection.subscriberCount > 0) {
    return "Views and subscribers give a real video-side read on audience movement.";
  }

  if (connection.viewCount > 0) {
    return "YouTube views are giving a first video traction signal.";
  }

  return "YouTube movement will show here as new uploads start picking up.";
}

function getSpotifySignalRead(connection: SpotifyConnection) {
  const topTrack = connection.topTracks[0];

  if (topTrack && topTrack.popularity >= 50) {
    return "Spotify is showing a strong listener-side signal around your recent top track.";
  }

  if (topTrack) {
    return "Spotify is giving a clearer read on what listeners are returning to right now.";
  }

  if (connection.followers > 0) {
    return "Your Spotify profile is connected, so follower movement can start feeding the Heat Score.";
  }

  return "Spotify is ready. Listener movement will show here as your catalog gets more activity.";
}
