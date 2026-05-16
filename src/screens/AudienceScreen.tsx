import { useState } from "react";
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
import { audienceSegments, emptyStates } from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import { colors, radii, spacing } from "@/theme";
import { clampPercentage } from "@/utils/format";
import { impactMedium } from "@/utils/haptics";

type AudienceSegment = (typeof audienceSegments)[number];

export function AudienceScreen() {
  const [selectedSegment, setSelectedSegment] = useState<AudienceSegment | null>(null);
  const { refresh, refreshing } = useMockRefresh();

  function openSegment(segment: AudienceSegment) {
    impactMedium();
    setSelectedSegment(segment);
  }

  return (
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <NavigationHeader label="Listener intent" actionIcon="people" />
      <SectionHeader
        title="Audience shape."
        body="Understand who is leaning in, not just how many people showed up."
      />
      {audienceSegments.length > 0 ? (
        <>
          <Card elevated>
            <View style={styles.intentCard}>
              <View style={styles.intentIcon}>
                <Ionicons name="radio" size={24} color={colors.black} />
              </View>
              <View style={styles.intentCopy}>
                <AppText variant="title">73%</AppText>
                <AppText variant="h3">Active listener intent</AppText>
                <AppText muted>
                  Your most useful audience read is coming from listeners who are leaning in.
                </AppText>
              </View>
            </View>
          </Card>
          <StaggeredList
            data={audienceSegments}
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
                      <Ionicons name={getAudienceIcon(segment.label)} size={18} color={colors.black} />
                    </View>
                    <View style={[styles.categoryPill, { borderColor: segment.color }]}>
                      <AppText variant="tiny" style={[styles.categoryText, { color: segment.color }]}>
                        {getAudienceCategory(segment.label)}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.segmentHeader}>
                    <AppText variant="h3">{segment.label}</AppText>
                    <AppText variant="h3">{segment.value}%</AppText>
                  </View>
                  <AppText muted>{getAudienceRead(segment.label)}</AppText>
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
              This fake segment shows how much of your current audience behavior
              is coming from {selectedSegment.label.toLowerCase()}. Use it to
              decide whether to reward loyal fans or open the door wider for new
              listeners.
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

function getAudienceCategory(label: string) {
  if (label.includes("Day-one")) {
    return "CORE FANS";
  }

  if (label.includes("Playlist")) {
    return "DISCOVERY";
  }

  if (label.includes("Social")) {
    return "SOCIAL LIFT";
  }

  return "RE-ENGAGE";
}

function getAudienceIcon(label: string): keyof typeof Ionicons.glyphMap {
  if (label.includes("Day-one")) {
    return "heart";
  }

  if (label.includes("Playlist")) {
    return "sparkles";
  }

  if (label.includes("Social")) {
    return "share-social";
  }

  return "refresh";
}

function getAudienceRead(label: string) {
  if (label.includes("Day-one")) {
    return "Your loyal listeners are still carrying meaningful signal.";
  }

  if (label.includes("Playlist")) {
    return "Discovery listeners are finding their way into the catalog.";
  }

  if (label.includes("Social")) {
    return "Short-form attention is turning into audience movement.";
  }

  return "This group may need a fresh moment to come back in.";
}
