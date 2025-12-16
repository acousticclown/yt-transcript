"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type UserContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for demo
const mockUser: User = {
  id: "1",
  name: "Demo User",
  email: "demo@example.com",
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    // Mock login - just set the user
    setUser({ ...mockUser, email });
  };

  const signup = (name: string, email: string, _password: string) => {
    // Mock signup - create user
    setUser({ ...mockUser, name, email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
      }}
    >
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

