import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radii, shadows, spacing } from "@/theme";

type CardProps = {
  children: ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
};

export function Card({ children, elevated, style }: CardProps) {
  return (
    <View style={[styles.card, elevated ? styles.elevated : undefined, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  elevated: {
    backgroundColor: colors.surfaceRaised,
    ...shadows.soft,
  },
});
