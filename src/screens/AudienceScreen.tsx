import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  BottomSheetModal,
  Card,
  EmptyState,
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
import { AudienceSignal, buildAudienceSignals } from "@/services/audienceSignals";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import { YouTubeConnection, getYouTubeConnection } from "@/services/youtube";
import { colors, radii, spacing } from "@/theme";
import { clampPercentage } from "@/utils/format";
import { impactMedium } from "@/utils/haptics";

export function AudienceScreen() {
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<AudienceSignal | null>(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const [youtubeConnection, setYouTubeConnection] = useState<YouTubeConnection | null>(null);
  const { refresh, refreshing } = useMockRefresh();
  const audienceSignals = useMemo(
    () =>
      buildAudienceSignals({
        audiusTracks,
        spotifyConnection,
        youtubeConnection,
      }),
    [audiusTracks, spotifyConnection, youtubeConnection],
  );

  const loadAudienceSignals = useCallback(async () => {
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
      loadAudienceSignals();
    }, [loadAudienceSignals]),
  );

  function refreshAudience() {
    refresh();
    loadAudienceSignals();
  }

  function openSegment(segment: AudienceSignal) {
    impactMedium();
    setSelectedSegment(segment);
  }

  return (
    <ScreenContainer onRefresh={refreshAudience} refreshing={refreshing}>
      <NavigationHeader label="Listener intent" />
      <SectionHeader
        title="Audience Shape"
        body="Understand who is leaning in, not just how many people showed up."
      />
      {audienceSignals.length > 0 ? (
        <>
          <Card elevated>
            <View style={styles.intentCard}>
              <View style={styles.intentIcon}>
                <Ionicons name="radio" size={24} color={colors.black} />
              </View>
              <View style={styles.intentCopy}>
                <AppText variant="title">{audienceSignals[0].value}%</AppText>
                <AppText variant="h3">{audienceSignals[0].label}</AppText>
                <AppText muted>
                  Your strongest audience read is coming from {audienceSignals[0].source}.
                </AppText>
              </View>
            </View>
          </Card>
          <StaggeredList
            data={audienceSignals}
            keyExtractor={(segment) => segment.label}
            renderItem={(segment) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => openSegment(segment)}
                style={({ pressed }) => (pressed ? styles.pressed : undefined)}
              >
                <LinearGradient
                  colors={[`${segment.color}24`, "rgba(25,28,34,0.98)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.segmentCard, { borderColor: `${segment.color}55` }]}
                >
                  <View style={styles.segmentTopRow}>
                    <View style={[styles.segmentIcon, { backgroundColor: segment.color }]}>
                      <Ionicons name={getAudienceIcon(segment.source)} size={18} color={colors.black} />
                    </View>
                    <View style={[styles.categoryPill, { borderColor: segment.color }]}>
                      <AppText variant="tiny" style={[styles.categoryText, { color: segment.color }]}>
                        {segment.source.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.segmentHeader}>
                    <AppText variant="h3">{segment.label}</AppText>
                    <AppText variant="h3">{segment.value}%</AppText>
                  </View>
                  <AppText muted>{segment.body}</AppText>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${clampPercentage(segment.value)}%`,
                          backgroundColor: segment.color,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          />
        </>
      ) : (
        <>
          <EmptyState icon="people" {...emptyStates.audienceGrowth} />
          <EmptyState icon="radio" {...emptyStates.audience} />
        </>
      )}
      <BottomSheetModal
        visible={Boolean(selectedSegment)}
        onClose={() => setSelectedSegment(null)}
        title={selectedSegment?.label ?? "Audience insight"}
      >
        {selectedSegment ? (
          <>
            <AppText variant="title">{selectedSegment.value}%</AppText>
            <AppText muted>
              This read is based on the connected {selectedSegment.source} signal
              available to HeatRadar right now. It will get sharper as more
              platform data is connected.
            </AppText>
          </>
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  intentIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  intentCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  segmentCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  segmentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  segmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(5,6,8,0.24)",
  },
  categoryText: {
    fontWeight: "900",
  },
  segmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  track: {
    height: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.sm,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});

function getAudienceIcon(source: AudienceSignal["source"]): keyof typeof Ionicons.glyphMap {
  if (source === "YouTube") {
    return "logo-youtube";
  }

  if (source === "Spotify") {
    return "radio";
  }

  return "pulse";
}
