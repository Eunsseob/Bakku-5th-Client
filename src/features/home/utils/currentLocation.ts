import * as Location from 'expo-location';

let cached: Location.LocationObject | null = null;
let pending: Promise<Location.LocationObject> | null = null;

function refreshLocation() {
  if (!pending) {
    pending = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    })
      .then((position) => {
        cached = position;
        return position;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

// Called after foreground permission is granted. Never persist location to disk.
export async function getQuickCurrentLocation(): Promise<Location.LocationObject> {
  const acceptable = (position: Location.LocationObject | null) =>
    position !== null &&
    Date.now() - position.timestamp <= 30_000 &&
    position.coords.accuracy !== null &&
    position.coords.accuracy <= 100;
  if (acceptable(cached)) return cached!;
  const recent = await Location.getLastKnownPositionAsync({
    maxAge: 30_000,
    requiredAccuracy: 100,
  }).catch(() => null);
  if (acceptable(recent)) {
    cached = recent;
    // Refresh the cache without moving the map after the user starts selecting.
    void refreshLocation().catch(() => undefined);
    return recent!;
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      refreshLocation(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(Object.assign(new Error('Location timeout'), { code: 'LOCATION_TIMEOUT' })),
          12_000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
