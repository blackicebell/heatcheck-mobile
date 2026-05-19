import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { artist as fallbackArtist } from "@/data/productContent";
import { getLocalArtistProfile } from "@/services/artistProfile";
import { auth } from "@/services/firebase";

type ArtistIdentity = {
  email: string;
  handle: string;
  initials: string;
  name: string;
  provider: string;
};

export function useArtistIdentity() {
  const [identity, setIdentity] = useState<ArtistIdentity>(() =>
    buildArtistIdentity(auth.currentUser?.displayName),
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadIdentity() {
        const localProfile = await getLocalArtistProfile();
        const profileName =
          localProfile?.userId === auth.currentUser?.uid
            ? localProfile?.artistName
            : auth.currentUser?.displayName;

        if (active) {
          setIdentity(buildArtistIdentity(profileName));
        }
      }

      loadIdentity();

      return () => {
        active = false;
      };
    }, []),
  );

  return identity;
}

function buildArtistIdentity(name?: string | null): ArtistIdentity {
  const artistName = name?.trim() || fallbackArtist.name;

  return {
    email: auth.currentUser?.email ?? "No email saved",
    handle: toHandle(artistName),
    initials: toInitials(artistName),
    name: artistName,
    provider: getProviderLabel(),
  };
}

function getProviderLabel() {
  const providerId = auth.currentUser?.providerData[0]?.providerId;

  if (providerId === "google.com") {
    return "Google";
  }

  if (providerId === "password") {
    return "Email";
  }

  return "Firebase";
}

function toHandle(name: string) {
  const handle = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "");

  return handle ? `@${handle}` : fallbackArtist.handle;
}

function toInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return fallbackArtist.initials;
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
