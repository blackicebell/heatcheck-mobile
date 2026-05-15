import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { AnimatedView, AppText, Button } from "@/components";
import { colors, gradients, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  return (
    <LinearGradient colors={gradients.quiet} style={styles.container}>
      <AnimatedView delay={80}>
        <View style={styles.mark}>
          <View style={styles.innerMark} />
        </View>
      </AnimatedView>
      <AnimatedView delay={180} style={styles.copy}>
        <AppText variant="title">HeatCheck</AppText>
        <AppText muted>
          The app artists open to see if they&apos;re getting heat.
        </AppText>
      </AnimatedView>
      <AnimatedView delay={280}>
        <Button onPress={() => navigation.replace("Onboarding")}>
          Check the heat
        </Button>
      </AnimatedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "flex-end",
    gap: spacing.xl,
    backgroundColor: colors.background,
  },
  mark: {
    width: 112,
    height: 112,
    borderRadius: radii.xl,
    backgroundColor: "rgba(68,240,138,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(68,240,138,0.32)",
  },
  innerMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.green,
  },
  copy: {
    gap: spacing.sm,
  },
});
