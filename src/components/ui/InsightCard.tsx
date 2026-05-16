import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

const toneMap = {
  green: {
    accent: colors.green,
    glow: "rgba(68,240,138,0.18)",
  },
  blue: {
    accent: colors.blue,
    glow: "rgba(114,167,255,0.18)",
  },
  pink: {
    accent: colors.pink,
    glow: "rgba(255,104,179,0.18)",
  },
};

const sourceIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  Audius: "musical-notes",
  Spotify: "headset",
  YouTube: "play",
  HeatRadar: "trending-up",
};

type InsightCardProps = {
  title: string;
  body: string;
  source?: string;
  tone: keyof typeof toneMap;
};

export function InsightCard({ title, body, source = "Signal", tone }: InsightCardProps) {
  const toneColor = toneMap[tone];

  return (
    <LinearGradient
      colors={[toneColor.glow, "rgba(25,28,34,0.98)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: toneColor.accent }]}>
          <Ionicons
            name={sourceIconMap[source] ?? "pulse"}
            size={19}
            color={colors.black}
          />
        </View>
        <View style={[styles.sourcePill, { borderColor: toneColor.accent }]}>
          <AppText variant="tiny" style={[styles.sourceText, { color: toneColor.accent }]}>
            {source}
          </AppText>
        </View>
      </View>
      <AppText variant="h2">{title}</AppText>
      <AppText muted>{body}</AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sourcePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(5,6,8,0.28)",
  },
  sourceText: {
    fontWeight: "900",
  },
});
