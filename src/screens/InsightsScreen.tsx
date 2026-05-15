import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

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
import { emptyStates, insights } from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import { impactMedium } from "@/utils/haptics";

type Insight = (typeof insights)[number];

export function InsightsScreen() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const { refresh, refreshing } = useMockRefresh();

  function openInsight(insight: Insight) {
    impactMedium();
    setSelectedInsight(insight);
  }

  return (
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <NavigationHeader label="Daily read" actionIcon="flash" />
      <SectionHeader
        title="Signals worth acting on."
        body="Small, clear reads designed to help you decide what to do next."
      />
      {insights.length > 0 ? (
        <StaggeredList
          data={insights}
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
});
