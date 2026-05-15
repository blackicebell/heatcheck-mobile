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
import { audienceSegments, emptyStates } from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import { colors, radii } from "@/theme";
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
            <View style={styles.ring}>
              <AppText variant="title">73%</AppText>
              <AppText variant="small" muted>
                active intent
              </AppText>
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
                <Card>
                  <View style={styles.segmentHeader}>
                    <AppText variant="h3">{segment.label}</AppText>
                    <AppText variant="h3">{segment.value}%</AppText>
                  </View>
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
                </Card>
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
  ring: {
    alignSelf: "center",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 18,
    borderColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
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
