import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
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
import { emptyStates } from "@/data/productContent";
import { useRefreshFeedback } from "@/hooks/useRefreshFeedback";
import {
  AudiusTrack,
  getAudiusConnection,
  getAudiusTracksByHandle,
} from "@/services/audius";
import { buildReleaseRadar, ReleaseRadarItem } from "@/services/releaseRadar";
import { SpotifyConnection, getSpotifyConnection } from "@/services/spotify";
import { colors, radii, spacing } from "@/theme";
import { clampPercentage } from "@/utils/format";
import { impactMedium } from "@/utils/haptics";

export function ReleasesScreen() {
  const [audiusTracks, setAudiusTracks] = useState<AudiusTrack[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseRadarItem | null>(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection | null>(null);
  const { refresh, refreshing } = useRefreshFeedback();
  const releaseRadar = useMemo(
    () =>
      buildReleaseRadar({
        audiusTracks,
        spotifyConnection,
      }),
    [audiusTracks, spotifyConnection],
  );

  const loadReleaseSignals = useCallback(async () => {
    const [savedAudiusConnection, savedSpotifyConnection] = await Promise.all([
      getAudiusConnection(),
      getSpotifyConnection(),
    ]);

    setSpotifyConnection(savedSpotifyConnection);

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
      loadReleaseSignals();
    }, [loadReleaseSignals]),
  );

  function refreshReleases() {
    refresh();
    loadReleaseSignals();
  }

  function openRelease(release: ReleaseRadarItem) {
    impactMedium();
    setSelectedRelease(release);
  }

  return (
    <ScreenContainer onRefresh={refreshReleases} refreshing={refreshing}>
      <NavigationHeader label="Release pulse" />
      <SectionHeader
        title="Release Radar"
      body="Track-level reads from Audius and Spotify signals that can actually point to a song."
      />
      {releaseRadar.length > 0 ? (
        <StaggeredList
          data={releaseRadar}
          keyExtractor={(release) => release.title}
          renderItem={(release) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => openRelease(release)}
              style={({ pressed }) => (pressed ? styles.pressed : undefined)}
            >
              <LinearGradient
                colors={getReleaseGradient(release.platform)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.releaseCard}
              >
                <View style={styles.row}>
                  <View style={[styles.cover, getReleaseCoverStyle(release.platform)]}>
                    <AppText variant="h3" style={styles.coverText}>
                      {release.score}
                    </AppText>
                    <AppText variant="tiny" style={styles.coverLabel}>
                      HEAT
                    </AppText>
                  </View>
                  <View style={styles.copy}>
                    <View style={styles.badgeRow}>
                      <SignalBadge label={release.platform} />
                      <SignalBadge label={release.confidence} quiet />
                    </View>
                    <AppText variant="h2">{release.title}</AppText>
                    <AppText muted>
                      {release.date} / {release.status}
                    </AppText>
                  </View>
                </View>
                <AppText muted>{release.action}</AppText>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${clampPercentage(release.score)}%` },
                    ]}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          )}
        />
      ) : (
        <EmptyState icon="disc" {...emptyStates.releases} />
      )}
      <BottomSheetModal
        visible={Boolean(selectedRelease)}
        onClose={() => setSelectedRelease(null)}
        title={selectedRelease?.title ?? "Release detail"}
      >
        {selectedRelease ? (
          <>
            <View style={styles.detailScore}>
              <AppText variant="title">{selectedRelease.score}</AppText>
              <AppText muted>Release heat</AppText>
            </View>
            <AppText muted>{selectedRelease.detail}</AppText>
            <View style={styles.driverGrid}>
              {selectedRelease.drivers.map((driver) => (
                <View key={driver.label} style={styles.driverCard}>
                  <AppText variant="tiny" muted>
                    {driver.label}
                  </AppText>
                  <AppText variant="h3">{driver.value}</AppText>
                </View>
              ))}
            </View>
            <Card>
              <AppText variant="h3">Best next move</AppText>
              <AppText muted>{selectedRelease.action}</AppText>
            </Card>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${clampPercentage(selectedRelease.score)}%` },
                ]}
              />
            </View>
          </>
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cover: {
    width: 68,
    height: 68,
    borderRadius: radii.lg,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  coverText: {
    color: colors.black,
  },
  coverLabel: {
    color: colors.black,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  releaseCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  detailScore: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  badgeQuiet: {
    backgroundColor: colors.surfaceSoft,
  },
  badgeText: {
    color: colors.green,
    fontWeight: "800",
  },
  badgeTextQuiet: {
    color: colors.textMuted,
  },
  driverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  driverCard: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
  },
});

function getReleaseGradient(platform: ReleaseRadarItem["platform"]): [string, string] {
  switch (platform) {
    case "Spotify":
      return ["rgba(29,185,84,0.22)", "rgba(25,28,34,0.98)"];
    case "Audius":
      return ["rgba(114,167,255,0.22)", "rgba(25,28,34,0.98)"];
  }
}

function getReleaseCoverStyle(platform: ReleaseRadarItem["platform"]) {
  switch (platform) {
    case "Spotify":
      return { backgroundColor: "#1DB954" };
    case "Audius":
      return { backgroundColor: colors.blue };
  }
}

function SignalBadge({ label, quiet }: { label: string; quiet?: boolean }) {
  return (
    <View style={[styles.badge, quiet ? styles.badgeQuiet : undefined]}>
      <AppText
        variant="tiny"
        style={[styles.badgeText, quiet ? styles.badgeTextQuiet : undefined]}
      >
        {label}
      </AppText>
    </View>
  );
}
