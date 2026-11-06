import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ChallengeDetailPage from "../routes/challenges/$id";
import { api } from "../lib/api";
import { AuthProvider } from "../context/AuthContext";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: any) => ({
    ...config,
    useParams: () => ({ id: "1" }),
  }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/challenges/1" }),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock Leaflet
const mockLeaflet = {
  map: () => ({
    setView: vi.fn(),
    remove: vi.fn(),
  }),
  tileLayer: () => ({ addTo: vi.fn() }),
  marker: () => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
  }),
  divIcon: () => ({}),
};

vi.mock("leaflet", () => ({
  ...mockLeaflet,
  default: mockLeaflet,
}));

describe("ChallengeDetailPage Component (Figure 5)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders Banner with title, district breadcrumb, and affected population badge", async () => {
    vi.spyOn(api, "get").mockImplementation((url: string) => {
      if (url.includes("/challenges/")) {
        return Promise.resolve({
          data: {
            challengeId: 1,
            title: "Severe Borewell Contamination in Sanwer Ward 4",
            description: "High arsenic levels detected.",
            domain: "WATER_SANITATION",
            subDomain: "Groundwater Bio-filtration",
            priorityScore: 88.5,
            priorityExplanation: "High toxic metal exposure.",
            status: "AI_ANALYZED",
            lat: 22.9734,
            lon: 75.8321,
            district: "Indore",
            villageOrWard: "Sanwer Ward 4",
            reportedPopulation: 3500,
            evidenceUrls: [],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <AuthProvider>
        <ChallengeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Severe Borewell Contamination in Sanwer Ward 4")
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/3,500 Citizens Impacted/)).toBeInTheDocument();
    expect(screen.getByText(/Sanwer Ward 4, Indore/)).toBeInTheDocument();
    expect(screen.getByText(/Status: AI ANALYZED/)).toBeInTheDocument();
  });

  it("renders AI Analysis Card with domain badge, explainable priority score, and duplicates list", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        challengeId: 1,
        title: "Severe Borewell Contamination",
        description: "Contaminated water issue",
        domain: "WATER_SANITATION",
        priorityScore: 88.5,
        status: "AI_ANALYZED",
        lat: 22.9734,
        lon: 75.8321,
        district: "Indore",
        villageOrWard: "Sanwer Ward 4",
        reportedPopulation: 3500,
        evidenceUrls: [],
      },
    });

    render(
      <AuthProvider>
        <ChallengeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("AI Analysis Card")).toBeInTheDocument();
    });

    expect(screen.getByText("96.4% Confidence")).toBeInTheDocument();
    expect(screen.getByText("88.5")).toBeInTheDocument();
    expect(screen.getByText("Critical Priority")).toBeInTheDocument();
    expect(screen.getByText("Duplicate Detection")).toBeInTheDocument();
  });

  it("allows university accounts to click 'Accept Challenge' and transitions to MATCHED", async () => {
    // Set authenticated Faculty Lead in localStorage
    localStorage.setItem("civicsolve_token", "valid_jwt_token");
    localStorage.setItem(
      "civicsolve_user",
      JSON.stringify({
        userId: 2,
        name: "Dr. Amit Sharma",
        email: "amit.sharma@iiti.ac.in",
        role: "FACULTY",
        institutionId: 1,
      })
    );

    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        challengeId: 1,
        title: "Severe Borewell Contamination",
        description: "Contaminated water issue",
        domain: "WATER_SANITATION",
        priorityScore: 88.5,
        status: "AI_ANALYZED",
        lat: 22.9734,
        lon: 75.8321,
        district: "Indore",
        villageOrWard: "Sanwer Ward 4",
        reportedPopulation: 3500,
        evidenceUrls: [],
      },
    });

    const postSpy = vi.spyOn(api, "post").mockResolvedValue({
      data: {
        projectId: 101,
        challengeId: 1,
        stage: "PROPOSAL",
      },
    });

    render(
      <AuthProvider>
        <ChallengeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Accept Challenge/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Accept Challenge/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/projects/1/accept", {
        institutionId: 1,
        facultyUserId: 2,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Challenge Claimed by University")
      ).toBeInTheDocument();
    });
  });
});
