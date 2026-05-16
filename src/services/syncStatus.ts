import AsyncStorage from "@react-native-async-storage/async-storage";

export type PlatformId = "audius" | "spotify" | "youtube";

export type PlatformSyncStatus = {
  checkedAt: string;
  message: string;
  platformId: PlatformId;
  state: "success" | "failed";
};

const syncStatusStorageKey = "heatradar.platform.sync-status";

export async function getPlatformSyncStatuses() {
  const rawStatuses = await AsyncStorage.getItem(syncStatusStorageKey);

  if (!rawStatuses) {
    return {};
  }

  try {
    return JSON.parse(rawStatuses) as Partial<Record<PlatformId, PlatformSyncStatus>>;
  } catch {
    return {};
  }
}

export async function markPlatformSyncSuccess(platformId: PlatformId, message: string) {
  await savePlatformSyncStatus({
    checkedAt: new Date().toISOString(),
    message,
    platformId,
    state: "success",
  });
}

export async function markPlatformSyncFailed(platformId: PlatformId, message: string) {
  await savePlatformSyncStatus({
    checkedAt: new Date().toISOString(),
    message,
    platformId,
    state: "failed",
  });
}

export async function clearPlatformSyncStatus(platformId: PlatformId) {
  const statuses = await getPlatformSyncStatuses();
  delete statuses[platformId];

  await AsyncStorage.setItem(syncStatusStorageKey, JSON.stringify(statuses));
}

async function savePlatformSyncStatus(status: PlatformSyncStatus) {
  const statuses = await getPlatformSyncStatuses();

  await AsyncStorage.setItem(
    syncStatusStorageKey,
    JSON.stringify({
      ...statuses,
      [status.platformId]: status,
    }),
  );
}
