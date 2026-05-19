import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  BottomSheetModal,
  EmptyState,
  InsightCard,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import { emptyStates } from "@/data/productContent";
import { useRefreshFeedback } from "@/hooks/useRefreshFeedback";
import {
  AudiusTrack,
  getAudiusConnection,
  getAudiusTracksByHandle,
} from "@/services/audius";
import { AudienceSignal, buildAudienceSignals } from "@/services/audienceSignals";
import { buildSignalInsights, SignalInsight } from "@/services/signalInsights";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, radii, spacing } from "@/theme";
import { impactMedium } from "@/utils/haptics";

export function InsightsScreen() {
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<SignalInsight | null>(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const { refresh, refreshing } = useRefreshFeedback();
  const signalInsights = useMemo(
    () =>
      buildSignalInsights({
        audiusTracks,
        spotifyConnection,
        youtubeConnection,
      }),
    [audiusTracks, spotifyConnection, youtubeConnection],
  );
  const audienceSignals = useMemo(
    () =>
      buildAudienceSignals({
        audiusTracks,
        spotifyConnection,
        youtubeConnection,
      }),
    [audiusTracks, spotifyConnection, youtubeConnection],
  );

  const loadInsightSignals = useCallback(async () => {
    const [savedAudiusConnection, savedSpotifyConnection, savedYouTubeConnection] = await Promise.all([
      getAudiusConnection(),
      getSpotifyConnection(),
      getYouTubeConnection(),
    ]);

    setSpotifyConnection(savedSpotifyConnection);
    setYouTubeConnection(savedYouTubeConnection);

    if (!savedAudiusConnection) {
      setAudiusTracks([]);
      return;
    }

    try {
      setAudiusTracks(await getAudiusTracksByHandle(savedAudiusConnection.handle));
    } catch {
      setAudiusTracks([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInsightSignals();
    }, [loadInsightSignals]),
  );

  function refreshInsights() {
    refresh();
    loadInsightSignals();
  }

  function openInsight(insight: SignalInsight) {
    impactMedium();
    setSelectedInsight(insight);
  }

  return (
    <ScreenContainer onRefresh={refreshInsights} refreshing={refreshing}>
      <NavigationHeader label="Daily read" />
      <SectionHeader
        title="Signal Reads"
        body="Plain-language reads from the platforms already feeding your Heat Score."
      />
      {signalInsights.length > 0 || audienceSignals.length > 0 ? (
        <>
          {signalInsights.length > 0 ? (
            <StaggeredList
              data={signalInsights}
              keyExtractor={(item) => item.title}
              renderItem={(item) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openInsight(item)}
                  style={({ pressed }) => (pressed ? styles.pressed : undefined)}
                >
                  <InsightCard {...item} />
                </Pressable>
              )}
            />
          ) : null}
          {audienceSignals.length > 0 ? (
            <>
              <SectionHeader
                title="Audience Signals"
                body="Public reach and listener-action signals from the services you connected."
              />
              <StaggeredList
                data={audienceSignals}
                keyExtractor={(item) => `${item.source}-${item.label}`}
                renderItem={(item) => <AudienceSignalCard signal={item} />}
              />
            </>
          ) : null}
        </>
      ) : (
        <EmptyState icon="analytics" {...emptyStates.insights} />
      )}
      <BottomSheetModal
        visible={Boolean(selectedInsight)}
        onClose={() => setSelectedInsight(null)}
        title={selectedInsight?.title ?? "Insight"}
      >
        {selectedInsight ? (
          <>
            <View style={styles.sourceBadge}>
              <AppText variant="tiny" style={styles.sourceBadgeText}>
                {selectedInsight.source}
              </AppText>
            </View>
            <AppText muted>{selectedInsight.body}</AppText>
            <AppText>{selectedInsight.detail}</AppText>
          </>
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  sourceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  sourceBadgeText: {
    color: colors.green,
    fontWeight: "800",
  },
  audienceCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    backgroundColor: "rgba(25,28,34,0.92)",
  },
  audienceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceLabel: {
    fontWeight: "900",
  },
  audienceScoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  audienceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});

function AudienceSignalCard({ signal }: { signal: AudienceSignal }) {
  return (
    <View style={[styles.audienceCard, { borderColor: `${signal.color}44` }]}>
      <View style={styles.audienceTopRow}>
        <View style={[styles.sourceDot, { backgroundColor: signal.color }]} />
        <AppText variant="tiny" style={[styles.sourceLabel, { color: signal.color }]}>
          {signal.source.toUpperCase()}
        </AppText>
      </View>
      <View style={styles.audienceScoreRow}>
        <View style={styles.audienceCopy}>
          <AppText variant="h3">{signal.label}</AppText>
          <AppText muted>{signal.body}</AppText>
        </View>
        <AppText variant="h2" style={{ color: signal.color }}>
          {signal.value}
        </AppText>
      </View>
    </View>
  );
}
