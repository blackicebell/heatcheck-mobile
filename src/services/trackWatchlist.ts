import AsyncStorage from "@react-native-async-storage/async-storage";

const trackWatchlistStorageKey = "heatradar.track-watchlist";

export type WatchedTrack = {
  addedAt: string;
  id: string;
  source: "Audius" | "Spotify";
  title: string;
};

export async function getTrackWatchlist() {
  const rawWatchlist = await AsyncStorage.getItem(trackWatchlistStorageKey);

  if (!rawWatchlist) {
    return [];
  }

  try {
    return JSON.parse(rawWatchlist) as WatchedTrack[];
  } catch {
    return [];
  }
}

export async function toggleWatchedTrack(track: Omit<WatchedTrack, "addedAt">) {
  const currentWatchlist = await getTrackWatchlist();
  const isAlreadyWatching = currentWatchlist.some((item) => item.id === track.id);
  const nextWatchlist = isAlreadyWatching
    ? currentWatchlist.filter((item) => item.id !== track.id)
    : [
        {
          ...track,
          addedAt: new Date().toISOString(),
        },
        ...currentWatchlist,
      ].slice(0, 8);

  await AsyncStorage.setItem(trackWatchlistStorageKey, JSON.stringify(nextWatchlist));

  return nextWatchlist;
}

export function isTrackWatched(watchlist: WatchedTrack[], trackId: string) {
  return watchlist.some((item) => item.id === trackId);
}
