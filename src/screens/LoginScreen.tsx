import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { StyleSheet, View } from "react-native";

import {
  AnimatedView,
  AppText,
  Button,
  Card,
  ScreenContainer,
  SectionHeader,
} from "@/components";
import { artist } from "@/data/mockData";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  function enterDemo() {
    impactLight();
    setLoading(true);

    setTimeout(() => {
      notifySuccess();
      navigation.replace("AppTabs");
    }, 850);
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.content}>
        <AnimatedView delay={80}>
          <SectionHeader
            title="Welcome back."
            body="This mock preview opens into HeatCheck without real authentication."
          />
        </AnimatedView>
        <AnimatedView delay={180}>
          <Card elevated>
            <View style={styles.avatar}>
              <AppText variant="h2" style={styles.avatarText}>
                {artist.initials}
              </AppText>
            </View>
            <AppText variant="h2">{artist.name}</AppText>
            <AppText muted>{artist.focus}</AppText>
          </Card>
        </AnimatedView>
      </View>
      <View style={styles.actions}>
        <Button onPress={enterDemo}>
          {loading ? <ActivityIndicator color={colors.black} /> : "Enter demo"}
        </Button>
        <Button variant="secondary" onPress={() => navigation.goBack()}>
          Review onboarding
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.black,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
