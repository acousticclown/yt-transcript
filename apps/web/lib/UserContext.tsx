"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type User } from "./api";

type AuthState = "loading" | "authenticated" | "unauthenticated";

type UserContextType = {
  user: User | null;
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("notely-token");
    if (!token) {
      setAuthState("unauthenticated");
      return;
    }

    // Verify token
    authApi.me()
      .then(({ user }) => {
        setUser(user);
        setAuthState("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("notely-token");
        setAuthState("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem("notely-token", token);
    setUser(user);
    setAuthState("authenticated");
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { token, user } = await authApi.signup(email, password, name);
    localStorage.setItem("notely-token", token);
    setUser(user);
    setAuthState("authenticated");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("notely-token");
    setUser(null);
    setAuthState("unauthenticated");
  }, []);

  return (
    <UserContext.Provider value={{ user, authState, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
