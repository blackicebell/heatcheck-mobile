import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

type NavigationHeaderProps = {
  badge?: boolean;
  label?: string;
  onActionPress?: () => void;
  onSecondaryActionPress?: () => void;
  secondaryActionIcon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
};

export function NavigationHeader({
  actionIcon,
  badge,
  label,
  onActionPress,
  onSecondaryActionPress,
  secondaryActionIcon,
  title,
}: NavigationHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        {label ? (
          <AppText variant="tiny" muted>
            {label}
          </AppText>
        ) : null}
        {title ? <AppText variant="h2">{title}</AppText> : null}
      </View>
      {actionIcon || secondaryActionIcon ? (
        <View style={styles.actions}>
          {actionIcon ? (
            <Pressable
              accessibilityRole="button"
              onPress={onActionPress}
              style={({ pressed }) => [styles.action, pressed ? styles.pressed : undefined]}
            >
              <Ionicons name={actionIcon} size={20} color={colors.text} />
              {badge ? <View style={styles.badge} /> : null}
            </Pressable>
          ) : null}
          {secondaryActionIcon ? (
            <Pressable
              accessibilityRole="button"
              onPress={onSecondaryActionPress}
              style={({ pressed }) => [styles.action, pressed ? styles.pressed : undefined]}
            >
              <Ionicons name={secondaryActionIcon} size={20} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  action: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.97 }],
  },
  badge: {
    position: "absolute",
    right: 10,
    top: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
});
