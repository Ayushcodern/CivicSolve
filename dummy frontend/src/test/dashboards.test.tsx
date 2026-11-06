import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import CitizenDashboardPage from "../routes/dashboard/citizen";
import ModeratorDashboardPage from "../routes/dashboard/moderator";
import UniversityDashboardPage from "../routes/dashboard/university";
import GovernmentDashboardPage from "../routes/dashboard/government";
import { api } from "../lib/api";
import { AuthProvider } from "../context/AuthContext";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: any) => config,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/dashboard/citizen" }),
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
  circleMarker: () => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    on: vi.fn(),
  }),
  divIcon: () => ({}),
};

vi.mock("leaflet", () => ({
  ...mockLeaflet,
  default: mockLeaflet,
}));

describe("Multi-Role Dashboards (Phase 5.4.1)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // 1. Citizen Dashboard
  it("renders Citizen Dashboard with submitted challenges and visual status stepper", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: [
        {
          challengeId: 1,
          title: "High Arsenic Contamination in Borewells",
          description: "Groundwater testing revealed severe arsenic.",
          domain: "WATER_SANITATION",
          priorityScore: 88.5,
          status: "MATCHED",
          district: "Indore",
          villageOrWard: "Sanwer Ward 4",
          reportedPopulation: 3500,
          createdAt: new Date().toISOString(),
          evidenceUrls: [],
        },
      ],
    });

    render(
      <AuthProvider>
        <CitizenDashboardPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("High Arsenic Contamination in Borewells")
      ).toBeInTheDocument();
    });

    // Check visual status stepper elements
    expect(screen.getByText("Lifecycle Progression Stepper")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("AI Analyzed")).toBeInTheDocument();
    expect(screen.getByText("Matched")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  // 2. Moderator Dashboard & Side-by-Side Duplicate Merger
  it("renders Moderator Review Queue and opens Side-by-Side Duplicate Merger modal", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        content: [
          {
            challengeId: 14,
            title: "Borewell Water Turbidity in Sanwer Ward 3",
            description: "Yellow sedimentation observed in handpump.",
            domain: "WATER_SANITATION",
            priorityScore: 78.4,
            status: "AI_ANALYZED",
            district: "Indore",
            villageOrWard: "Sanwer Ward 3",
            reportedPopulation: 2200,
            createdAt: new Date().toISOString(),
            similarityScore: 84.5,
            candidateParentId: 1,
          },
        ],
      },
    });

    render(
      <AuthProvider>
        <ModeratorDashboardPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Moderator Review Queue")).toBeInTheDocument();
    });

    expect(screen.getByText(/84.5% Duplicate Match/)).toBeInTheDocument();

    // Click Compare & Merge button to open side-by-side merger
    const compareBtn = screen.getByText("Compare & Merge");
    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Side-by-Side Duplicate Merger")
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Parent Challenge \(Anchor #1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Duplicate Candidate \(#14\)/)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Merge into Parent #1/)).toBeInTheDocument();
  });

  // 3. University Dashboard
  it("renders University Lab Workspace, active project milestones, and stage advancement", async () => {
    render(
      <AuthProvider>
        <UniversityDashboardPage />
      </AuthProvider>
    );

    expect(
      screen.getByText(/Arsenic Bio-Filtration & Mobile Purification Unit/)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Project Progression Stage")
    ).toBeInTheDocument();

    expect(screen.getByText("Current: PROTOTYPE")).toBeInTheDocument();
    expect(
      screen.getByText("Aquifer Baseline Water Sampling & Heavy Metal Spectrometry")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Advance to Next Stage/i })
    ).toBeInTheDocument();
  });

  // 4. Government Dashboard
  it("renders Government Dashboard with KPI counters, heatmap, and CSV export", async () => {
    vi.spyOn(api, "get").mockImplementation((url: string) => {
      if (url.includes("/summary")) {
        return Promise.resolve({
          data: {
            totalChallenges: 142,
            activeProjects: 38,
            deployedSolutions: 19,
            districts: 14,
            timestamp: new Date().toISOString(),
          },
        });
      }
      if (url.includes("/district-distribution")) {
        return Promise.resolve({
          data: [
            {
              district: "Indore",
              challengeCount: 42,
              avgPriorityScore: 84.2,
              centerLat: 22.7196,
              centerLon: 75.8577,
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <AuthProvider>
        <GovernmentDashboardPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Government Intelligence & Analytics")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Total Challenges Reported")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("Active University Projects")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("Export Analytics CSV")).toBeInTheDocument();
  });
});
