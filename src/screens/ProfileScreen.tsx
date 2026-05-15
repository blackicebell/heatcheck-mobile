import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Card,
  EmptyState,
  LockedFeatureCard,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import {
  accountSettings,
  artist,
  dashboard,
  emptyStates,
  platformConnections,
  settings,
} from "@/data/mockData";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const connectedAccounts = platformConnections.filter(
    (platform) => platform.status === "Connected",
  );
  const enabledNotifications = settings.filter((setting) => setting.enabled);

  return (
    <ScreenContainer>
      <NavigationHeader label="Artist profile" actionIcon="person-circle" />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <AppText variant="h1" style={styles.avatarText}>
            {artist.initials}
          </AppText>
        </View>
        <View style={styles.profileCopy}>
          <AppText variant="h1">{artist.name}</AppText>
          <AppText muted>
            {artist.handle} / {artist.city}
          </AppText>
        </View>
      </View>

      <Card elevated>
        <View style={styles.scoreRow}>
          <View>
            <AppText variant="tiny" muted>
              Heat Score
            </AppText>
            <AppText variant="title">{dashboard.heatScore}</AppText>
          </View>
          <View style={styles.heatPill}>
            <AppText variant="small" style={styles.heatPillText}>
              {dashboard.weeklyChange}
            </AppText>
          </View>
        </View>
        <AppText>{dashboard.scoreExplanation}</AppText>
        <AppText muted>{dashboard.scoreBoost}</AppText>
      </Card>

      <SectionHeader title="Connected accounts" />
      {connectedAccounts.length > 0 ? (
        <StaggeredList
          data={connectedAccounts}
          keyExtractor={(account) => account.id}
          renderItem={(account) => (
            <Card>
              <View style={styles.row}>
                <Ionicons name="checkmark-circle" size={24} color={colors.green} />
                <View style={styles.copy}>
                  <AppText variant="h3">{account.name}</AppText>
                  <AppText muted>{account.detail}</AppText>
                </View>
              </View>
            </Card>
          )}
        />
      ) : (
        <EmptyState icon="link" {...emptyStates.connectedAccounts} />
      )}

      <SectionHeader title="Notification settings" />
      <StaggeredList
        data={enabledNotifications}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <View style={styles.row}>
              <Ionicons name="notifications" size={22} color={colors.blue} />
              <View style={styles.copy}>
                <AppText variant="h3">{setting.label}</AppText>
                <AppText muted>{setting.body}</AppText>
              </View>
            </View>
          </Card>
        )}
      />

      <SectionHeader title="Account" />
      <LockedFeatureCard
        title="HeatCheck Pro"
        body="Unlock deeper score explanations, weekly heat recaps, and shareable milestone cards after the free trial."
        onPress={() => navigation.navigate("TrialPaywall")}
      />
      <StaggeredList
        data={accountSettings}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <View style={styles.accountRow}>
              <AppText variant="h3">{setting.label}</AppText>
              <AppText muted>{setting.value}</AppText>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.black,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heatPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "rgba(68,240,138,0.14)",
  },
  heatPillText: {
    color: colors.green,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  accountRow: {
    gap: spacing.xs,
  },
});
