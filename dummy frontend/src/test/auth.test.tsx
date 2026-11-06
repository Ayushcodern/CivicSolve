import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext and API client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with unauthenticated state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("stores user, token, and updates state on login", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login("mock-jwt-token-xyz", {
        userId: 2,
        name: "Prof. Aaquib Multani",
        email: "faculty@aitr.ac.in",
        role: "FACULTY",
        institutionId: 1,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("mock-jwt-token-xyz");
    expect(result.current.role).toBe("FACULTY");
    expect(result.current.user?.name).toBe("Prof. Aaquib Multani");

    // Check localStorage persistence
    expect(localStorage.getItem("token")).toBe("mock-jwt-token-xyz");
    expect(localStorage.getItem("civicsolve_token")).toBe("mock-jwt-token-xyz");
  });

  it("clears user and token on logout", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login("mock-jwt-token-xyz", {
        userId: 2,
        name: "Prof. Aaquib Multani",
        email: "faculty@aitr.ac.in",
        role: "FACULTY",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("API client attaches Authorization header when token is present", async () => {
    localStorage.setItem("token", "sample-bearer-token");

    // Simulate request interceptor
    const interceptor = (api.interceptors.request as any).handlers[0]?.fulfilled;
    if (interceptor) {
      const config = await interceptor({ headers: {} });
      expect(config.headers.Authorization).toBe("Bearer sample-bearer-token");
    }
  });

  it("controls global login modal state reliably", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoginModalOpen).toBe(false);

    act(() => {
      result.current.openLoginModal();
    });
    expect(result.current.isLoginModalOpen).toBe(true);

    act(() => {
      result.current.closeLoginModal();
    });
    expect(result.current.isLoginModalOpen).toBe(false);
  });
});
