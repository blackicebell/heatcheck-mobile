import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

import { animation, colors, radii, spacing } from "@/theme";

type SkeletonBlockProps = {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
};

function SkeletonBlock({ height, width = "100%", radius = radii.md, style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.72,
          duration: animation.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: animation.slow,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        { height, width, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <View style={styles.wrapper}>
      <SkeletonBlock height={28} width="68%" />
      <SkeletonBlock height={18} width="88%" />
      <SkeletonBlock height={210} radius={radii.lg} />
      <View style={styles.row}>
        <SkeletonBlock height={96} style={styles.flex} />
        <SkeletonBlock height={96} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  block: {
    backgroundColor: colors.surfaceSoft,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
