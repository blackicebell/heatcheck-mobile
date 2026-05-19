import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedView, AppText, Button, ScreenContainer } from "@/components";
import { onboardingSlides } from "@/data/productContent";
import { colors, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slide = onboardingSlides[index];
  const isLast = index === onboardingSlides.length - 1;
  const compact = height < 820;
  const bottomOffset = getOnboardingBottomOffset(insets.bottom);

  function continueFlow() {
    impactLight();

    if (isLast) {
      notifySuccess();
      navigation.replace("Login");
      return;
    }

    setIndex((value) => value + 1);
  }

  return (
    <ScreenContainer bottomPadding={bottomOffset} scroll={false}>
      <View style={[styles.stage, compact ? styles.stageCompact : undefined]}>
        <AnimatedView delay={80}>
          <OnboardingVisual compact={compact} index={index} accent={slide.accent} />
        </AnimatedView>
        <AnimatedView delay={180} style={styles.copy}>
          <AppText variant="h1">{slide.title}</AppText>
          <AppText muted>{slide.body}</AppText>
        </AnimatedView>
      </View>
      <View style={styles.footer}>
        <AppText variant="tiny" muted>
          Step {index + 1} of {onboardingSlides.length}
        </AppText>
        <View style={styles.dots}>
          {onboardingSlides.map((item, dotIndex) => (
            <View
              key={item.title}
              style={[
                styles.dot,
                dotIndex === index ? styles.activeDot : undefined,
              ]}
            />
          ))}
        </View>
        <Button
          onPress={continueFlow}
        >
          {isLast ? "Create your account" : "Next"}
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: "flex-start",
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  stageCompact: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  visualCard: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 292,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderColor: "rgba(255,255,255,0.1)",
  },
  visualCardCompact: {
    maxHeight: 262,
    padding: spacing.md,
  },
  visualContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  visualTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visualBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  visualBadgeText: {
    color: colors.white,
    fontWeight: "900",
  },
  visualIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  radarStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingLarge: {
    width: 178,
    height: 178,
    borderRadius: 89,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  radarRingMedium: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  radarCore: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  signalDot: {
    position: "absolute",
    right: 38,
    top: 70,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
  },
  barStage: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  signalBar: {
    flex: 1,
    minHeight: 42,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  waveformStage: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  waveformTick: {
    width: 9,
    borderRadius: 6,
  },
  liftCard: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: "rgba(5,6,8,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  liftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liftPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  copy: {
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceSoft,
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.green,
  },
});

function OnboardingVisual({
  accent,
  compact,
  index,
}: {
  accent: string;
  compact: boolean;
  index: number;
}) {
  const gradients = getVisualGradient(index);

  return (
    <LinearGradient
      colors={gradients}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.visualCard,
        compact ? styles.visualCardCompact : undefined,
        { borderColor: `${accent}55` },
      ]}
    >
      <View style={styles.visualContent}>
        <View style={styles.visualTopRow}>
          <View style={styles.visualBadge}>
            <AppText variant="tiny" style={styles.visualBadgeText}>
              {getVisualLabel(index)}
            </AppText>
          </View>
          <View style={styles.visualIcon}>
            <Ionicons name={getVisualIcon(index)} size={21} color={accent} />
          </View>
        </View>
        {index === 0 ? <RadarVisual accent={accent} /> : null}
        {index === 1 ? <SignalBarsVisual accent={accent} /> : null}
        {index === 2 ? <LiftVisual accent={accent} /> : null}
      </View>
    </LinearGradient>
  );
}

function RadarVisual({ accent }: { accent: string }) {
  return (
    <View style={styles.radarStage}>
      <View style={[styles.radarRingLarge, { borderColor: `${accent}35` }]}>
        <View style={[styles.radarRingMedium, { borderColor: `${accent}55` }]}>
          <View style={[styles.radarCore, { backgroundColor: accent }]}>
            <Ionicons name="radio" size={30} color={colors.black} />
          </View>
        </View>
      </View>
      <View style={[styles.signalDot, { backgroundColor: accent }]} />
    </View>
  );
}

function SignalBarsVisual({ accent }: { accent: string }) {
  const heights = [58, 108, 86, 142, 122];

  return (
    <View style={styles.barStage}>
      {heights.map((height, barIndex) => (
        <View
          key={height}
          style={[
            styles.signalBar,
            {
              height,
              backgroundColor: barIndex === 3 ? accent : "rgba(255,255,255,0.16)",
            },
          ]}
        />
      ))}
    </View>
  );
}

function LiftVisual({ accent }: { accent: string }) {
  const waveform = [20, 50, 32, 76, 40, 58, 28, 46, 24];

  return (
    <View style={styles.waveformStage}>
      <View style={styles.waveformRow}>
        {waveform.map((height, waveIndex) => (
          <View
            key={`${height}-${waveIndex}`}
            style={[
              styles.waveformTick,
              {
                height,
                backgroundColor: waveIndex === 3 || waveIndex === 5 ? accent : "rgba(255,255,255,0.22)",
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.liftCard}>
        <View style={styles.liftRow}>
          <AppText variant="h3">Heat lift</AppText>
          <View style={styles.liftPill}>
            <AppText variant="tiny" style={{ color: colors.green }}>
              +18%
            </AppText>
          </View>
        </View>
        <AppText muted>Signals are moving in the right direction.</AppText>
      </View>
    </View>
  );
}

function getVisualGradient(index: number): [string, string] {
  if (index === 1) {
    return ["rgba(114,167,255,0.32)", "rgba(17,19,24,0.98)"];
  }

  if (index === 2) {
    return ["rgba(255,104,179,0.3)", "rgba(17,19,24,0.98)"];
  }

  return ["rgba(68,240,138,0.3)", "rgba(17,19,24,0.98)"];
}

function getVisualLabel(index: number) {
  if (index === 1) {
    return "WHY IT MOVED";
  }

  if (index === 2) {
    return "FEEL THE LIFT";
  }

  return "SIGNAL RADAR";
}

function getVisualIcon(index: number): keyof typeof Ionicons.glyphMap {
  if (index === 1) {
    return "analytics";
  }

  if (index === 2) {
    return "trending-up";
  }

  return "pulse";
}

function getOnboardingBottomOffset(bottomInset: number) {
  const androidGestureClearance = Platform.OS === "android" ? 86 : 64;

  return Math.max(androidGestureClearance, bottomInset + spacing.xxl);
}
