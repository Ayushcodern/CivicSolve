import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SubmitChallengePage } from "../routes/submit";
import { api } from "../lib/api";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: any) => config,
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock Leaflet
vi.mock("leaflet", () => ({
  default: {
    map: () => ({
      setView: vi.fn(),
      flyTo: vi.fn(),
      on: vi.fn(),
      remove: vi.fn(),
    }),
    control: { zoom: () => ({ addTo: vi.fn() }) },
    tileLayer: () => ({ addTo: vi.fn() }),
    marker: () => ({
      addTo: vi.fn(),
      on: vi.fn(),
      setLatLng: vi.fn(),
      getLatLng: () => ({ lat: 22.9734, lng: 75.8321 }),
    }),
    divIcon: () => ({}),
  },
}));

describe("SubmitChallengePage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Step 1 with location picker and population slider", () => {
    render(<SubmitChallengePage />);

    expect(screen.getByText("Step 1: Tag Exact GPS Location")).toBeInTheDocument();
    expect(screen.getByText(/Estimated Affected Population/)).toBeInTheDocument();
    expect(screen.getByText("Continue to Details")).toBeInTheDocument();
  });

  it("navigates through multi-step form to Step 2, 3, and 4", async () => {
    render(<SubmitChallengePage />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText("Continue to Details"));
    expect(
      screen.getByText("Step 2: Describe the Community Problem")
    ).toBeInTheDocument();

    // Fill Title and Description in Step 2
    const titleInput = screen.getByLabelText(/Problem Summary \/ Title/i);
    const descInput = screen.getByLabelText(/Detailed Explanation/i);

    fireEvent.change(titleInput, {
      target: { value: "Handpump water is turbid and dirty" },
    });
    fireEvent.change(descInput, {
      target: {
        value:
          "High turbidity above 85 NTU after heavy monsoon rain in Sanwer village.",
      },
    });

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText("Continue to Photos"));
    expect(
      screen.getByText("Step 3: Upload Photographic Evidence")
    ).toBeInTheDocument();

    // Step 3 -> Step 4
    fireEvent.click(screen.getByText("Continue to AI Preview"));
    expect(
      screen.getByText("Step 4: Real-Time AI Analysis & Review")
    ).toBeInTheDocument();

    // Verify AI preview dynamically recognized WATER
    expect(screen.getByText("WATER")).toBeInTheDocument();
    expect(screen.getByText("Submit Challenge to Exchange")).toBeInTheDocument();
  });

  it("submits multipart form data to /challenges", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        challengeId: 101,
        title: "Handpump water is turbid",
        status: "SUBMITTED",
      },
    });

    render(<SubmitChallengePage />);

    // Advance to Step 2
    fireEvent.click(screen.getByText("Continue to Details"));

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Problem Summary \/ Title/i), {
      target: { value: "Handpump water is turbid" },
    });
    fireEvent.change(screen.getByLabelText(/Detailed Explanation/i), {
      target: { value: "Village handpump water contaminated after rainfall." },
    });

    // Advance to Step 3 then 4
    fireEvent.click(screen.getByText("Continue to Photos"));
    fireEvent.click(screen.getByText("Continue to AI Preview"));

    // Submit form
    const submitBtn = screen.getByText("Submit Challenge to Exchange");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/challenges",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });
  });
});
