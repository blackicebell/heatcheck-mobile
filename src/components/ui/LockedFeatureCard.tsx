import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, spacing } from "@/theme";

type LockedFeatureCardProps = {
  body: string;
  cta?: string;
  onPress?: () => void;
  title: string;
};

export function LockedFeatureCard({
  body,
  cta = "Start free trial",
  onPress,
  title,
}: LockedFeatureCardProps) {
  return (
    <Card elevated>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="lock-closed" size={18} color={colors.black} />
        </View>
        <AppText variant="h2">{title}</AppText>
      </View>
      <AppText muted>{body}</AppText>
      <Button onPress={onPress}>{cta}</Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
  },
});
