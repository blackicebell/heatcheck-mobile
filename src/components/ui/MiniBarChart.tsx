import { StyleSheet, View } from "react-native";

import { colors, radii } from "@/theme";

type MiniBarChartProps = {
  data: number[];
};

export function MiniBarChart({ data }: MiniBarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.chart} accessibilityLabel="Heat trend chart">
      {data.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={[
            styles.bar,
            {
              height: `${Math.max((value / max) * 100, 16)}%`,
              opacity: 0.45 + index / (data.length * 1.7),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    height: 128,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bar: {
    flex: 1,
    borderRadius: radii.sm,
    backgroundColor: colors.green,
  },
});
