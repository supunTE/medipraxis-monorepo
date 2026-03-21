let mmkvStorage: import("react-native-mmkv").MMKV | null = null;

try {
  const { MMKV } = require("react-native-mmkv");
  mmkvStorage = new MMKV();
} catch {
  console.warn("MMKV not available — offline persistence disabled (Expo Go)");
}

// Adapter for @tanstack/query-async-storage-persister
// Falls back to no-op when MMKV isn't available (Expo Go)
export const mmkvClientStorage = {
  setItem: (key: string, value: string) => {
    mmkvStorage?.set(key, value);
  },
  getItem: (key: string) => mmkvStorage?.getString(key) ?? null,
  removeItem: (key: string) => {
    mmkvStorage?.delete(key);
  },
};
