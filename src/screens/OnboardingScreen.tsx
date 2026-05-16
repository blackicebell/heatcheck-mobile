import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AnimatedView, AppText, Button, ScreenContainer } from "@/components";
import { onboardingSlides } from "@/data/mockData";
import { colors, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = onboardingSlides[index];
  const isLast = index === onboardingSlides.length - 1;

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
    <ScreenContainer scroll={false}>
      <View style={styles.stage}>
        <AnimatedView delay={80}>
          <View style={[styles.orbit, { borderColor: slide.accent }]}>
            <View style={[styles.orbitCore, { backgroundColor: slide.accent }]} />
          </View>
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
    justifyContent: "center",
    gap: spacing.xxl,
  },
  orbit: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 330,
    borderRadius: radii.xl,
    borderWidth: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitCore: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  copy: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
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
