import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme";
import { impactLight } from "@/utils/haptics";

type ToggleRowProps = {
  body?: string;
  enabled: boolean;
  label: string;
  onChange: (enabled: boolean) => void;
};

export function ToggleRow({ body, enabled, label, onChange }: ToggleRowProps) {
  function toggle() {
    impactLight();
    onChange(!enabled);
  }

  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: enabled }} onPress={toggle} style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="h3">{label}</AppText>
        {body ? <AppText muted>{body}</AppText> : null}
      </View>
      <View style={[styles.switch, enabled ? styles.switchOn : undefined]}>
        <View style={[styles.knob, enabled ? styles.knobOn : undefined]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  switch: {
    width: 54,
    height: 32,
    borderRadius: 16,
    padding: 3,
    backgroundColor: colors.surfaceSoft,
  },
  switchOn: {
    backgroundColor: colors.green,
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.textMuted,
  },
  knobOn: {
    transform: [{ translateX: 22 }],
    backgroundColor: colors.black,
  },
});
