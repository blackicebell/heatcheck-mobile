import { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, spacing } from "@/theme";
import { getResponsiveHorizontalPadding } from "@/utils/responsive";

type ScreenContainerProps = {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
};

export function ScreenContainer({
  children,
  onRefresh,
  refreshing = false,
  scroll = true,
}: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = getResponsiveHorizontalPadding(width);
  const content = (
    <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.green}
                colors={[colors.green]}
                progressBackgroundColor={colors.surfaceRaised}
              />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 148,
  },
  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingTop: spacing.md,
  },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    gap: spacing.lg,
  },
});
