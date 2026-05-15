import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
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
  artist,
  dashboard,
  emptyStates,
  loadingCopy,
  retentionHighlights,
  shareCards,
} from "@/data/mockData";
import { useMockRefresh } from "@/hooks/useMockRefresh";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight } from "@/utils/haptics";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [alertOpen, setAlertOpen] = useState(false);
  const { refresh, refreshing } = useMockRefresh(900);

  function openAlert() {
    impactLight();
    setAlertOpen(true);
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
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <NavigationHeader
        label={`${artist.handle} / getting heat this week`}
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
});
