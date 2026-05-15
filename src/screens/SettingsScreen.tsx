import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  BottomSheetModal,
  Card,
  NavigationHeader,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
  ToggleRow,
} from "@/components";
import { platformConnections, settings } from "@/data/mockData";
import { colors, spacing } from "@/theme";
import { impactLight, notifySuccess } from "@/utils/haptics";

type PlatformConnection = (typeof platformConnections)[number];
type ConnectionStatus = PlatformConnection["status"];

export function SettingsScreen() {
  const [connectionModal, setConnectionModal] = useState<PlatformConnection | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connections, setConnections] = useState(platformConnections);
  const [toggleStates, setToggleStates] = useState(() =>
    Object.fromEntries(settings.map((item) => [item.label, item.enabled])),
  );

  function connectPlatform(platform: PlatformConnection) {
    setConnectionModal(platform);
    setConnectingId(platform.id);

    setTimeout(() => {
      const connectedPlatform = { ...platform, status: "Connected" };
      setConnections((items) =>
        items.map((item) =>
          item.id === platform.id ? connectedPlatform : item,
        ),
      );
      setConnectionModal(connectedPlatform);
      setConnectingId(null);
      notifySuccess();
    }, 1200);
  }

  return (
    <ScreenContainer>
      <NavigationHeader label="Signal settings" actionIcon="shield-checkmark" />
      <SectionHeader
        title="Settings."
        body="Keep HeatRadar focused on the signals that tell you when listener movement is picking up."
      />
      <SectionHeader title="Platform connections" />
      <StaggeredList
        data={connections}
        keyExtractor={(platform) => platform.id}
        renderItem={(platform) => {
          const isConnecting = connectingId === platform.id;
          const connected = platform.status === "Connected";
          const failed = platform.status === "Failed";
          const reconnect = platform.status === "Reconnect";

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                impactLight();
                if (connected) {
                  setConnectionModal(platform);
                  return;
                }

                connectPlatform(platform);
              }}
              style={({ pressed }) => (pressed ? styles.pressed : undefined)}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.platformIcon}>
                    <Ionicons
                      name={getPlatformIcon(platform.id)}
                      size={22}
                      color={connected ? colors.green : failed ? colors.red : colors.textMuted}
                    />
                  </View>
                  <View style={styles.copy}>
                    <AppText variant="h3">{platform.name}</AppText>
                    <AppText muted>{platform.detail}</AppText>
                    <AppText variant="tiny" muted>
                      {platform.permission}
                    </AppText>
                  </View>
                  {isConnecting ? (
                    <ActivityIndicator color={colors.green} />
                  ) : (
                    <AppText
                      variant="small"
                      style={getConnectionStyle(platform.status)}
                    >
                      {connected
                        ? "Connected"
                        : failed
                          ? "Retry"
                          : reconnect
                            ? "Reconnect"
                            : "Connect"}
                    </AppText>
                  )}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <SectionHeader title="Notification settings" />
      <StaggeredList
        data={settings}
        keyExtractor={(setting) => setting.label}
        renderItem={(setting) => (
          <Card>
            <ToggleRow
              label={setting.label}
              body={setting.body}
              enabled={Boolean(toggleStates[setting.label])}
              onChange={(enabled) =>
                setToggleStates((state) => ({ ...state, [setting.label]: enabled }))
              }
            />
          </Card>
        )}
      />
      <Card>
        <AppText variant="h2">Privacy-first preview</AppText>
        <AppText muted>
          No Firebase, APIs, authentication, or backend systems are connected in
          this shell.
        </AppText>
      </Card>
      <BottomSheetModal
        visible={Boolean(connectionModal)}
        onClose={() => setConnectionModal(null)}
        title={connectionModal?.name ?? "Connection"}
      >
        {connectionModal ? (
          <>
            <AppText variant="h2">
              {connectingId === connectionModal.id
                ? "Connecting..."
                : connectionModal.status === "Failed"
                  ? "Connection needs another try"
                  : connectionModal.status === "Reconnect"
                    ? "Reconnect safely"
                    : "Ready to preview"}
            </AppText>
            <AppText muted>
              {connectionModal.permission}
            </AppText>
            <AppText muted>
              This stays mock-only. A real version would explain permissions
              before asking for access.
            </AppText>
          </>
        ) : null}
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  platformIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  connected: {
    color: colors.green,
  },
  failed: {
    color: colors.red,
  },
  connect: {
    color: colors.blue,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});

function getConnectionStyle(status: ConnectionStatus) {
  if (status === "Connected") {
    return styles.connected;
  }

  if (status === "Failed") {
    return styles.failed;
  }

  return styles.connect;
}

function getPlatformIcon(platformId: string): keyof typeof Ionicons.glyphMap {
  if (platformId === "spotify") {
    return "musical-notes";
  }

  if (platformId === "youtube") {
    return "logo-youtube";
  }

  if (platformId === "instagram") {
    return "logo-instagram";
  }

  return "cloud";
}
