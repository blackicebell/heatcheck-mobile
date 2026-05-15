import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AnimatedView,
  AppText,
  BottomSheetModal,
  Card,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  StatCard,
} from "@/components";
import {
  notificationCooldown,
  notificationGroups,
  notifications,
  emptyStates,
  retentionHighlights,
} from "@/data/mockData";
import { colors, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "Notifications">;
type HeatNotification = (typeof notifications)[number];

const categoryColors: Record<string, string> = {
  "Heat Movement": colors.green,
  "Engagement Spikes": colors.blue,
  "Release Momentum": colors.pink,
  Milestones: colors.amber,
  Comeback: colors.mint,
};

export function NotificationsScreen({ navigation }: Props) {
  const [items, setItems] = useState(notifications);
  const [selected, setSelected] = useState<HeatNotification | null>(null);
  const unreadCount = items.filter((item) => item.unread).length;

  const grouped = useMemo(
    () =>
      notificationGroups
        .map((group) => ({
          group,
          items: items.filter((item) => item.category === group),
        }))
        .filter((group) => group.items.length > 0),
    [items],
  );

  function openNotification(item: HeatNotification) {
    impactLight();
    setSelected(item);
    setItems((current) =>
      current.map((notification) =>
        notification.id === item.id ? { ...notification, unread: false } : notification,
      ),
    );
  }

  function markAllRead() {
    notifySuccess();
    setItems((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={markAllRead}>
          <AppText variant="small" style={styles.markRead}>
            Mark read
          </AppText>
        </Pressable>
      </View>

      <SectionHeader
        eyebrow={`${unreadCount} unread`}
        title="Something might be moving."
        body="A calm feed of the moments worth opening the app for."
      />

      <View style={styles.highlightRow}>
        {retentionHighlights.map((item, index) => (
          <AnimatedView key={item.label} delay={index * 80} style={styles.highlight}>
            <StatCard label={item.label} value={item.value} />
          </AnimatedView>
        ))}
      </View>

      <Card>
        <View style={styles.cooldownHeader}>
          <Ionicons name="timer" size={20} color={colors.green} />
          <AppText variant="h3">Smart cooldown</AppText>
        </View>
        <AppText>{notificationCooldown.summary}</AppText>
        <AppText muted>{notificationCooldown.detail}</AppText>
      </Card>

      {grouped.length > 0 ? (
        grouped.map((group, groupIndex) => (
          <AnimatedView key={group.group} delay={groupIndex * 100}>
            <View style={styles.group}>
              <SectionHeader title={group.group} />
              {group.items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => openNotification(item)}
                  style={({ pressed }) => (pressed ? styles.pressed : undefined)}
                >
                  <Card style={item.unread ? styles.unreadCard : undefined}>
                    <View style={styles.notificationRow}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: categoryColors[item.category] },
                        ]}
                      />
                      <View style={styles.notificationCopy}>
                        <View style={styles.titleRow}>
                          <AppText variant="h3">{item.title}</AppText>
                          {item.unread ? <View style={styles.unreadDot} /> : null}
                        </View>
                        <AppText muted>{item.body}</AppText>
                        <View style={styles.metaRow}>
                          <AppText variant="tiny" muted>
                            {item.timestamp}
                          </AppText>
                          <AppText variant="tiny" style={styles.reward}>
                            {item.reward}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          </AnimatedView>
        ))
      ) : (
        <EmptyState icon="notifications" {...emptyStates.notifications} />
      )}

      <BottomSheetModal
        visible={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.category ?? "Heat alert"}
      >
        {selected ? (
          <>
            <AppText variant="h2">{selected.title}</AppText>
            <AppText muted>{selected.body}</AppText>
            <Card>
              <AppText variant="tiny" muted>
                Reward signal
              </AppText>
              <AppText variant="h2">{selected.reward}</AppText>
              <AppText muted>{selected.cooldown}</AppText>
            </Card>
          </>
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  markRead: {
    color: colors.green,
  },
  highlightRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  highlight: {
    flex: 1,
  },
  cooldownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  group: {
    gap: spacing.md,
  },
  notificationRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 7,
  },
  notificationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  unreadCard: {
    borderColor: "rgba(68,240,138,0.32)",
    backgroundColor: "rgba(68,240,138,0.08)",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  reward: {
    color: colors.green,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
