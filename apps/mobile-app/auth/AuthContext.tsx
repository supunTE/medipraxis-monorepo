import { Href, useRouter, useSegments } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, User } from "../services/auth";
import { authStorage } from "../utils/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (
    phoneNumber: string,
    countryCode: string,
    password: string
  ) => Promise<void>;
  signUp: (
    phoneNumber: string,
    countryCode: string,
    password: string,
    username: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = (segments[0] as string) === "auth";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace("/auth/login" as Href);
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [user, segments]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt refresh on load if token exists
    const checkAuth = async () => {
      try {
        const token = await authStorage.getAccessToken();
        if (token) {
          // Try to refresh to verify and get fresh tokens
          const newToken = await authService.refresh();
          if (newToken) {
            // We have a valid fresh token! Decode it to get the user ID natively.
            const decoded = jwtDecode<{ sub: string; mobile_number?: string }>(
              newToken
            );

            // Reconstruct a basic user locally, or merge with storage
            const storedUser = await authStorage.getUser();
            setUser({
              ...storedUser,
              user_id: decoded.sub,
            });
          } else {
            setUser(null);
          }
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useProtectedRoute(user);

  const signIn = async (
    phoneNumber: string,
    countryCode: string,
    password: string
  ) => {
    try {
      const user = await authService.login(phoneNumber, countryCode, password);
      // Store user
      await authStorage.setUser(user);
      setUser(user);
    } catch (e) {
      throw e;
    }
  };

  const signUp = async (
    phoneNumber: string,
    countryCode: string,
    password: string,
    username: string,
    _title?: string
  ) => {
    try {
      await authService.register(phoneNumber, countryCode, password, username);
      // Registration successful, but we don't log them in automatically.
      // The user will be redirected manually from the Register screen.
    } catch (e) {
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      await authStorage.deleteUser(); // Need to implement
      setUser(null);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
