import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedView, AppText, Button } from "@/components";
import heatRadarIcon from "@/assets/brand/heatradar-icon.png";
import { needsArtistSetup } from "@/services/artistProfile";
import { auth } from "@/services/firebase";
import { colors, gradients, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) {
        return;
      }

      if (!user) {
        setCheckingSession(false);
        return;
      }

      const route = (await needsArtistSetup(user.uid)) ? "ArtistSetup" : "AppTabs";

      if (active) {
        navigation.replace(route);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigation]);

  return (
    <LinearGradient colors={gradients.quiet} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.hero}>
          <AnimatedView delay={80}>
            <View style={styles.mark}>
              <Image source={heatRadarIcon} style={styles.icon} />
            </View>
          </AnimatedView>
          <AnimatedView delay={150} style={styles.signalCard}>
            <View style={styles.signalTopRow}>
              <View style={styles.signalPill}>
                <AppText variant="tiny" style={styles.signalPillText}>
                  HEAT SIGNAL
                </AppText>
              </View>
              <Ionicons name="pulse" size={22} color={colors.green} />
            </View>
            <View style={styles.waveform}>
              {[28, 56, 36, 86, 48, 68, 30].map((height, index) => (
                <View
                  key={`${height}-${index}`}
                  style={[
                    styles.waveformTick,
                    {
                      height,
                      backgroundColor: index === 3 || index === 5 ? colors.green : "rgba(255,255,255,0.18)",
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.signalBottomRow}>
              <AppText variant="h3">Audience warming up</AppText>
              <AppText variant="small" style={styles.signalLift}>
                +12%
              </AppText>
            </View>
          </AnimatedView>
          <AnimatedView delay={220} style={styles.copy}>
            <AppText variant="title">HeatRadar</AppText>
            <AppText muted>
              The app artists open to see if they&apos;re getting heat.
            </AppText>
          </AnimatedView>
        </View>
        <AnimatedView delay={300} style={styles.actions}>
          <Button
            disabled={checkingSession}
            loading={checkingSession}
            onPress={() => navigation.replace("Onboarding")}
          >
            {checkingSession ? "Checking session" : "Get started"}
          </Button>
        </AnimatedView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + 72,
    justifyContent: "space-between",
    gap: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  mark: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,207,95,0.22)",
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },
  copy: {
    gap: spacing.sm,
  },
  signalCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: "rgba(17,19,24,0.86)",
    borderWidth: 1,
    borderColor: "rgba(68,240,138,0.2)",
  },
  signalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  signalPillText: {
    color: colors.green,
    fontWeight: "900",
  },
  waveform: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  waveformTick: {
    flex: 1,
    borderRadius: 999,
  },
  signalBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  signalLift: {
    color: colors.green,
    fontWeight: "900",
  },
  actions: {
    paddingBottom: 0,
  },
});
