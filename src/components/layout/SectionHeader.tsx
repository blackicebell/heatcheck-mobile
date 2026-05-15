import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { spacing } from "@/theme";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  body?: string;
};

export function SectionHeader({ eyebrow, title, body }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      {eyebrow ? (
        <AppText variant="tiny" muted>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant="h1">{title}</AppText>
      {body ? <AppText muted>{body}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
});
