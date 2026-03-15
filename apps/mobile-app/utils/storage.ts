import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "auth.access_token";
const REFRESH_TOKEN_KEY = "auth.refresh_token";
const USER_KEY = "auth.user";

// Helper to check if running on web (SecureStore doesn't work on web)
const isWeb = Platform.OS === "web";

export const saveToken = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getToken = async (key: string) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteToken = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const authStorage = {
  setAccessToken: (token: string) => saveToken(ACCESS_TOKEN_KEY, token),
  getAccessToken: () => getToken(ACCESS_TOKEN_KEY),
  deleteAccessToken: () => deleteToken(ACCESS_TOKEN_KEY),

  setRefreshToken: (token: string) => saveToken(REFRESH_TOKEN_KEY, token),
  getRefreshToken: () => getToken(REFRESH_TOKEN_KEY),
  deleteRefreshToken: () => deleteToken(REFRESH_TOKEN_KEY),

  setUser: (user: any) => saveToken(USER_KEY, JSON.stringify(user)),
  getUser: async () => {
    const user = await getToken(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  deleteUser: () => deleteToken(USER_KEY),

  clearAll: async () => {
    await deleteToken(ACCESS_TOKEN_KEY);
    await deleteToken(REFRESH_TOKEN_KEY);
    await deleteToken(USER_KEY);
  },
};
