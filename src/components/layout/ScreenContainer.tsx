import { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, layout, spacing } from "@/theme";
import { getResponsiveHorizontalPadding } from "@/utils/responsive";

type ScreenContainerProps = {
  bottomPadding?: number;
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
};

export function ScreenContainer({
  bottomPadding,
  children,
  onRefresh,
  refreshing = false,
  scroll = true,
}: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getResponsiveHorizontalPadding(width);
  const content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: horizontalPadding,
          paddingLeft: horizontalPadding + insets.left,
          paddingRight: horizontalPadding + insets.right,
        },
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding ?? getBottomContentPadding(insets.bottom) },
          ]}
          contentInsetAdjustmentBehavior="automatic"
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
        <View style={{ flex: 1, paddingBottom: bottomPadding ?? getBottomContentPadding(insets.bottom) }}>
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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

function getBottomContentPadding(bottomInset: number) {
  return 138 + Math.max(bottomInset, 12);
}
