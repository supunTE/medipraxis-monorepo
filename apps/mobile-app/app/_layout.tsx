import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/components/useColorScheme";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

import { mmkvClientStorage } from "@/lib/mmkv";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { AuthProvider, useAuth } from "../auth/AuthContext";

// Sync online/offline state with React Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h — keep cached data on disk
      staleTime: 1000 * 60 * 5, // 5 min — avoid unnecessary refetches
      retry: 2,
      networkMode: "offlineFirst",
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: mmkvClientStorage,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <AuthWrapper>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister,
                maxAge: 1000 * 60 * 60 * 24,
                dehydrateOptions: {
                  shouldDehydrateQuery: (query) =>
                    query.state.status === "success" &&
                    query.meta?.persist === true,
                },
              }}
            >
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="auth/login"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="auth/register"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="auth/key-reveal"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
              </Stack>
            </PersistQueryClientProvider>
          </ThemeProvider>
        </AuthWrapper>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      void SplashScreen.hideAsync();
    }
  }, [authLoading]);

  return <>{children}</>;
}
