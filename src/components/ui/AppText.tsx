import { ReactNode } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { colors, typography } from "@/theme";

type AppTextProps = TextProps & {
  children: ReactNode;
  muted?: boolean;
  subtle?: boolean;
  variant?: "title" | "h1" | "h2" | "h3" | "body" | "small" | "tiny";
};

export function AppText({
  children,
  muted,
  subtle,
  variant = "body",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles.base,
        styles[variant],
        muted ? styles.muted : undefined,
        subtle ? styles.subtle : undefined,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    letterSpacing: 0,
  },
  title: {
    fontSize: typography.title,
    lineHeight: 39,
    fontWeight: "800",
  },
  h1: {
    fontSize: typography.h1,
    lineHeight: 34,
    fontWeight: "800",
  },
  h2: {
    fontSize: typography.h2,
    lineHeight: 28,
    fontWeight: "700",
  },
  h3: {
    fontSize: typography.h3,
    lineHeight: 24,
    fontWeight: "700",
  },
  body: {
    fontSize: typography.body,
    lineHeight: 23,
    fontWeight: "500",
  },
  small: {
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: "600",
  },
  tiny: {
    fontSize: typography.tiny,
    lineHeight: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  muted: {
    color: colors.textMuted,
  },
  subtle: {
    color: colors.textSubtle,
  },
});
