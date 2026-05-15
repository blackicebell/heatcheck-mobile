import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import { trialPlan } from "@/data/mockData";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "TrialPaywall">;

export function TrialPaywallScreen({ navigation }: Props) {
  function startTrial() {
    notifySuccess();
    navigation.goBack();
  }

  return (
    <ScreenContainer>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>
      <SectionHeader
        eyebrow={`${trialPlan.daysLeft}-day trial`}
        title={trialPlan.headline}
        body={trialPlan.body}
      />
      <Card elevated>
        <View style={styles.priceRow}>
          <View>
            <AppText variant="tiny" muted>
              After trial
            </AppText>
            <AppText variant="title">{trialPlan.price}</AppText>
          </View>
          <View style={styles.countdown}>
            <AppText variant="h2">{trialPlan.daysLeft}</AppText>
            <AppText variant="tiny" muted>
              days free
            </AppText>
          </View>
        </View>
        <Button onPress={startTrial}>Start free trial</Button>
      </Card>
      <SectionHeader title="Unlock more heat" />
      <StaggeredList
        data={trialPlan.lockedFeatures}
        keyExtractor={(feature) => feature}
        renderItem={(feature) => (
          <Card>
            <View style={styles.featureRow}>
              <Ionicons name="sparkles" size={20} color={colors.green} />
              <AppText>{feature}</AppText>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  countdown: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(68,240,138,0.12)",
    borderWidth: 1,
    borderColor: "rgba(68,240,138,0.28)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
