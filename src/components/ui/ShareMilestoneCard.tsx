import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

type ShareMilestoneCardProps = {
  accent: string;
  body: string;
  title: string;
  value: string;
};

export function ShareMilestoneCard({
  accent,
  body,
  title,
  value,
}: ShareMilestoneCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <AppText variant="tiny" muted>
        HeatCheck
      </AppText>
      <AppText variant="h2">{title}</AppText>
      <AppText variant="title" style={{ color: accent }}>
        {value}
      </AppText>
      <AppText muted>{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 190,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: "space-between",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    gap: spacing.sm,
  },
});
