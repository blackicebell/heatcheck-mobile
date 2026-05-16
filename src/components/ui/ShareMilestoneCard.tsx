import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

type ShareMilestoneCardProps = {
  accent: string;
  body: string;
  category?: string;
  onPress?: () => void;
  title: string;
  value: string;
};

export function ShareMilestoneCard({
  accent,
  body,
  category = "TRACTION",
  onPress,
  title,
  value,
}: ShareMilestoneCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Share ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : undefined]}
    >
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
          <View style={[styles.shareButton, { borderColor: `${accent}55` }]}>
            <Ionicons name="share-social" size={15} color={colors.white} />
          </View>
        </View>
        <View style={styles.valueBlock}>
          <AppText variant="title" style={{ color: accent }}>
            {value}
          </AppText>
          <AppText variant="h3">{title}</AppText>
        </View>
        <AppText muted>{body}</AppText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
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
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,6,8,0.42)",
    borderWidth: 1,
  },
  valueBlock: {
    gap: spacing.xs,
  },
});
