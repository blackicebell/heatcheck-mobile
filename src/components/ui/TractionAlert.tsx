import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

type TractionAlertProps = {
  title: string;
  body: string;
};

export function TractionAlert({ title, body }: TractionAlertProps) {
  return (
    <View style={styles.alert}>
      <View style={styles.icon}>
        <Ionicons name="sparkles" size={18} color={colors.black} />
      </View>
      <View style={styles.copy}>
        <AppText variant="h3">{title}</AppText>
        <AppText muted>{body}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(68,240,138,0.12)",
    borderWidth: 1,
    borderColor: "rgba(68,240,138,0.24)",
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
