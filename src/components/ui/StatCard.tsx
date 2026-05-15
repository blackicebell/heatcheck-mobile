import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
};

export function StatCard({ label, value, change }: StatCardProps) {
  return (
    <View style={styles.card}>
      <AppText variant="tiny" muted>
        {label}
      </AppText>
      <AppText variant="h2">{value}</AppText>
      {change ? (
        <AppText variant="small" style={styles.change}>
          {change}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 94,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  change: {
    color: colors.green,
  },
});
