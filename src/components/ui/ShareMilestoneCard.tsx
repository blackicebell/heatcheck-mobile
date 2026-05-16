import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/ui/AppText";
import { radii, spacing } from "@/theme";

type ShareMilestoneCardProps = {
  accent: string;
  body: string;
  category?: string;
  title: string;
  value: string;
};

export function ShareMilestoneCard({
  accent,
  body,
  category = "TRACTION",
  title,
  value,
}: ShareMilestoneCardProps) {
  return (
    <LinearGradient
      colors={[`${accent}24`, "rgba(25,28,34,0.98)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: `${accent}55` }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.categoryPill, { borderColor: accent }]}>
          <AppText variant="tiny" style={[styles.categoryText, { color: accent }]}>
            {category}
          </AppText>
        </View>
        <View style={[styles.spark, { backgroundColor: accent }]} />
      </View>
      <View style={styles.valueBlock}>
        <AppText variant="title" style={{ color: accent }}>
          {value}
        </AppText>
        <AppText variant="h3">{title}</AppText>
      </View>
      <AppText muted>{body}</AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 210,
    borderRadius: radii.lg,
    padding: spacing.lg,
    justifyContent: "space-between",
    borderWidth: 1,
    gap: spacing.sm,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
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
  spark: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  valueBlock: {
    gap: spacing.xs,
  },
});
