import { useEffect, useState } from "react";

import { artist as mockArtist } from "@/data/mockData";
import { getLocalArtistProfile } from "@/services/artistProfile";
import { auth } from "@/services/firebase";

type ArtistIdentity = {
  city: string;
  handle: string;
  initials: string;
  name: string;
};

export function useArtistIdentity() {
  const [identity, setIdentity] = useState<ArtistIdentity>(() =>
    buildArtistIdentity(auth.currentUser?.displayName),
  );

  useEffect(() => {
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
  }, []);

  return identity;
}

function buildArtistIdentity(name?: string | null): ArtistIdentity {
  const artistName = name?.trim() || mockArtist.name;

  return {
    city: mockArtist.city,
    handle: toHandle(artistName),
    initials: toInitials(artistName),
    name: artistName,
  };
}

function toHandle(name: string) {
  const handle = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "");

  return handle ? `@${handle}` : mockArtist.handle;
}

function toInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return mockArtist.initials;
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
