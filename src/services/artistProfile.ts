import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";

const artistProfileStorageKey = "heatradar.artistProfile";

export type LocalArtistProfile = {
  artistName: string;
  email: string | null;
  userId: string;
};

export async function saveLocalArtistProfile(profile: LocalArtistProfile) {
  await AsyncStorage.setItem(artistProfileStorageKey, JSON.stringify(profile));
}

export async function clearLocalArtistProfile() {
  await AsyncStorage.removeItem(artistProfileStorageKey);
}

export async function needsArtistSetup(userId: string) {
  const localProfile = await getLocalArtistProfile();

  if (localProfile?.userId === userId && hasValidArtistName(localProfile.artistName)) {
    return false;
  }

  const authDisplayName = auth.currentUser?.uid === userId ? auth.currentUser.displayName : null;

  if (hasValidArtistName(authDisplayName)) {
    const savedAuthDisplayName = typeof authDisplayName === "string" ? authDisplayName.trim() : "";

    await saveLocalArtistProfile({
      artistName: savedAuthDisplayName,
      email: auth.currentUser?.email ?? null,
      userId,
    });

    return false;
  }

  try {
    const snapshot = await withTimeout(getDoc(doc(db, "users", userId)), 8000);
    const artistName = snapshot.exists() ? snapshot.data().artistName : undefined;

    if (hasValidArtistName(artistName)) {
      const savedArtistName = typeof artistName === "string" ? artistName.trim() : "";

      await saveLocalArtistProfile({
        artistName: savedArtistName,
        email: auth.currentUser?.email ?? null,
        userId,
      });

      return false;
    }

    return !hasValidArtistName(artistName);
  } catch {
    return true;
  }
}

export async function getLocalArtistProfile() {
  const rawProfile = await AsyncStorage.getItem(artistProfileStorageKey);

  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile) as LocalArtistProfile;
  } catch {
    return null;
  }
}

function hasValidArtistName(value: unknown) {
  return typeof value === "string" && value.trim().length >= 2;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error("artist-profile-timeout"));
      }, timeoutMs);
    }),
  ]);
}
