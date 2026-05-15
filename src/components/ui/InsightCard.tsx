import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { colors, spacing } from "@/theme";

const toneMap = {
  green: colors.green,
  blue: colors.blue,
  pink: colors.pink,
};

type InsightCardProps = {
  title: string;
  body: string;
  tone: keyof typeof toneMap;
};

export function InsightCard({ title, body, tone }: InsightCardProps) {
  return (
    <Card>
      <View style={[styles.accent, { backgroundColor: toneMap[tone] }]} />
      <AppText variant="h2">{title}</AppText>
      <AppText muted>{body}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  accent: {
    width: 42,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
});
