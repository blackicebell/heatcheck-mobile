import { ReactNode, isValidElement } from "react";
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/ui/AppText";
import { colors, gradients, radii, spacing } from "@/theme";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  disabled,
  loading,
  onPress,
  style,
  variant = "primary",
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        !isPrimary ? styles.secondary : undefined,
        variant === "ghost" ? styles.ghost : undefined,
        disabled ? styles.disabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient colors={gradients.primary} style={styles.fill}>
          {loading ? <ActivityIndicator color={colors.black} /> : <ButtonLabel>{children}</ButtonLabel>}
        </LinearGradient>
      ) : (
        <>
          {loading ? <ActivityIndicator color={colors.text} /> : <ButtonLabel>{children}</ButtonLabel>}
        </>
      )}
    </Pressable>
  );
}

function ButtonLabel({ children }: { children: ReactNode }) {
  if (isValidElement(children)) {
    return children;
  }

  return (
    <AppText variant="body" style={styles.label}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  fill: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondary: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  label: {
    color: colors.white,
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
