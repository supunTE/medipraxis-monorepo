import { Platform } from "react-native";

interface MMKVStorage {
  set(key: string, value: string): void;
  getString(key: string): string | undefined;
  delete(key: string): void;
}

let mmkvStorage: MMKVStorage | null = null;

if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require("react-native-mmkv") as {
      MMKV: new () => MMKVStorage;
    };
    mmkvStorage = new MMKV();
  } catch {
    console.warn(
      "MMKV not available — offline persistence disabled (Expo Go)"
    );
  }
}

// Adapter for @tanstack/query-async-storage-persister
// Uses MMKV on native, falls back to localStorage on web
export const mmkvClientStorage = {
  setItem: (key: string, value: string) => {
    if (mmkvStorage) mmkvStorage.set(key, value);
    else if (Platform.OS === "web") localStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    if (mmkvStorage) return mmkvStorage.getString(key) ?? null;
    if (Platform.OS === "web") return localStorage.getItem(key);
    return null;
  },
  removeItem: (key: string) => {
    if (mmkvStorage) mmkvStorage.delete(key);
    else if (Platform.OS === "web") localStorage.removeItem(key);
  },
};
