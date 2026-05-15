import { useState } from "react";
import { Pressable } from "react-native";
import { StyleSheet, View } from "react-native";

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
import { emptyStates, releases } from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import { colors, radii, spacing } from "@/theme";
import { clampPercentage } from "@/utils/format";
import { impactMedium } from "@/utils/haptics";

type Release = (typeof releases)[number];

export function ReleasesScreen() {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const { refresh, refreshing } = useMockRefresh();

  function openRelease(release: Release) {
    impactMedium();
    setSelectedRelease(release);
  }

  return (
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <NavigationHeader label="Catalog pulse" actionIcon="disc" />
      <SectionHeader
        title="Release health."
        body="A quick read on what needs lift, patience, or a sharper campaign beat."
      />
      {releases.length > 0 ? (
        <StaggeredList
          data={releases}
          keyExtractor={(release) => release.title}
          renderItem={(release) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => openRelease(release)}
              style={({ pressed }) => (pressed ? styles.pressed : undefined)}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.cover}>
                    <AppText variant="h3" style={styles.coverText}>
                      {release.score}
                    </AppText>
                  </View>
                  <View style={styles.copy}>
                    <AppText variant="h2">{release.title}</AppText>
                    <AppText muted>
                      {release.date} / {release.status}
                    </AppText>
                  </View>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${clampPercentage(release.score)}%` },
                    ]}
                  />
                </View>
              </Card>
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
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  coverText: {
    color: colors.black,
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
  detailScore: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
});
