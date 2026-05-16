import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AnimatedView,
  AppText,
  BottomSheetModal,
  Card,
  EmptyState,
  LoadingSkeleton,
  LockedFeatureCard,
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
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight } from "@/utils/haptics";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const artistIdentity = useArtistIdentity();
  const [audiusConnection, setAudiusConnection] = useState<AudiusConnection | null>(null);
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const { refresh, refreshing } = useMockRefresh(900);
  const topAudiusTrack = audiusTracks[0];

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
    } catch {
      setAudiusTracks([]);
    }
  }, []);

  const loadYouTubeSignal = useCallback(async () => {
    const connection = await getYouTubeConnection();
    setYouTubeConnection(connection);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAudiusSignal();
      loadYouTubeSignal();
    }, [loadAudiusSignal, loadYouTubeSignal]),
  );

  function openAlert() {
    impactLight();
    setAlertOpen(true);
  }

  function refreshHome() {
    refresh();
    loadAudiusSignal();
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
      <SectionHeader title={dashboard.headline} />
      <AnimatedView>
        <Card elevated>
          <View style={styles.scoreRow}>
            <View>
              <AppText variant="tiny" muted>
                Heat Score
              </AppText>
              <AppText variant="title">{dashboard.heatScore}</AppText>
            </View>
            <View style={styles.pill}>
              <AppText variant="small" style={styles.pillText}>
                {dashboard.weeklyChange}
              </AppText>
            </View>
          </View>
          <MiniBarChart data={dashboard.sparkline} />
          <View style={styles.explainStack}>
            <AppText>{dashboard.scoreExplanation}</AppText>
            <AppText muted>{dashboard.scoreBoost}</AppText>
            <AppText muted>{dashboard.scoreAction}</AppText>
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
      <SectionHeader title="What's driving it" />
      {dashboard.contributors.length > 0 ? (
        <View style={styles.stats}>
          {dashboard.contributors.map((item, index) => (
            <AnimatedView key={item.label} delay={index * 80} style={styles.statItem}>
              <StatCard {...item} />
            </AnimatedView>
          ))}
        </View>
      ) : (
        <EmptyState icon="flame" {...emptyStates.traction} />
      )}
      <Card>
        <AppText variant="h3">Sync check</AppText>
        {loadingCopy.syncMessages.map((message) => (
          <AppText key={message} muted>
            {message}
          </AppText>
        ))}
      </Card>
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
                Audius is connected. HeatRadar will surface track movement here once public tracks come back.
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
      <SectionHeader title="Since your last alert" />
      <View style={styles.stats}>
        {retentionHighlights.map((item, index) => (
          <AnimatedView key={item.label} delay={index * 80} style={styles.statItem}>
            <StatCard label={item.label} value={item.value} />
          </AnimatedView>
        ))}
      </View>
      <AnimatedView delay={240}>
        <LockedFeatureCard
          title="Share your heat"
          body="Turn big moments into premium milestone cards for fans and collaborators. Native sharing comes later."
          onPress={() => navigation.navigate("TrialPaywall")}
        />
      </AnimatedView>
      <SectionHeader title="Share card previews" />
      <View style={styles.shareGrid}>
        {shareCards.map((card) => (
          <View key={card.title} style={styles.shareItem}>
            <ShareMilestoneCard {...card} />
          </View>
        ))}
      </View>
      <AnimatedView delay={280}>
        <Card>
          <View style={styles.pressableCopy}>
            <TractionAlert title="Best next move" body={dashboard.nextMove} />
            <Pressable accessibilityRole="button" onPress={openAlert}>
              <AppText variant="small" style={styles.linkText}>
                View why this matters
              </AppText>
            </Pressable>
          </View>
        </Card>
      </AnimatedView>
      <BottomSheetModal
        visible={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Best next move"
      >
        <AppText muted>{dashboard.nextMove}</AppText>
        <AppText>
          This is a fake but realistic read: HeatRadar is showing the clearest
          growth signal behind your Heat Score, then turning it into one move
          that could keep the lift going.
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

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function getAudiusSignalRead(track: AudiusTrack) {
  if (track.repost_count > 0 && track.favorite_count > 0) {
    return "Favorites and reposts are giving this track a real early traction read.";
  }

  if (track.play_count > 0) {
    return "Plays are starting to give HeatRadar a first public movement signal.";
  }

  return "HeatRadar is watching this track for the first signs of movement.";
}

function getYouTubeSignalRead(connection: YouTubeConnection) {
  if (connection.viewCount > 0 && connection.subscriberCount > 0) {
    return "Views and subscribers give HeatRadar a real video-side read on audience movement.";
  }

  if (connection.viewCount > 0) {
    return "YouTube views are giving HeatRadar a first video traction signal.";
  }

  return "HeatRadar is ready to watch YouTube movement as new uploads start picking up.";
}
