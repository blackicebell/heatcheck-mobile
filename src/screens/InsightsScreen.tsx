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
import { emptyStates } from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import {
  AudiusTrack,
  getAudiusConnection,
  getAudiusTracksByHandle,
} from "@/services/audius";
import { buildSignalInsights, SignalInsight } from "@/services/signalInsights";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, spacing } from "@/theme";
import { impactMedium } from "@/utils/haptics";

export function InsightsScreen() {
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<SignalInsight | null>(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const { refresh, refreshing } = useMockRefresh();
  const signalInsights = useMemo(
    () =>
      buildSignalInsights({
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
});
