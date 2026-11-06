import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole =
  | "CITIZEN"
  | "UNIVERSITY"
  | "FACULTY"
  | "STUDENT"
  | "INDUSTRY"
  | "GOVT"
  | "MODERATOR"
  | "ADMIN";

export interface User {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: number | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "civicsolve_token";
const USER_KEY = "civicsolve_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // SSR-safe state initialization: start with null on server
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }
    try {
      return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token") || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }
    try {
      const stored =
        localStorage.getItem(USER_KEY) || localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Client-side hydration sync
  useEffect(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      const storedToken =
        localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
      const storedUser =
        localStorage.getItem(USER_KEY) || localStorage.getItem("user");

      if (storedToken && !token) setToken(storedToken);
      if (storedUser && !user) setUser(JSON.parse(storedUser));
    } catch {
      // Ignore parse/access errors during hydration
    }
  }, [token, user]);

  const role = user?.role || null;
  const isAuthenticated = Boolean(token && user);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem("token", newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        localStorage.setItem("user", JSON.stringify(newUser));
      } catch {}
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("token");
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("user");
      } catch {}
    }
  };

  // Sync token across tabs (only on client)
  useEffect(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === "token") {
        setToken(e.newValue);
      }
      if (e.key === USER_KEY || e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
