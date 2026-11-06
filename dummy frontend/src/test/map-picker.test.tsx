import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MapPicker } from "../components/MapPicker";

describe("MapPicker Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders map container, location button, and default coordinates", () => {
    render(<MapPicker initialLat={22.9734} initialLon={75.8321} />);

    expect(screen.getByText("Use My Current Location")).toBeInTheDocument();
    expect(screen.getByText(/22.9734°N, 75.8321°E/)).toBeInTheDocument();
    expect(screen.getByText("District:")).toBeInTheDocument();
    expect(screen.getByText("Ward/Tehsil:")).toBeInTheDocument();
  });

  it("handles geolocation button click", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 22.7196,
            longitude: 75.8577,
          },
        })
      ),
    };

    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;

    const handleChange = vi.fn();
    render(<MapPicker onChange={handleChange} />);

    const locateBtn = screen.getByText("Use My Current Location");
    fireEvent.click(locateBtn);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it("displays error message when geolocation fails", () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) =>
        error({
          code: 1, // PERMISSION_DENIED
        })
      ),
    };

    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;

    render(<MapPicker />);

    const locateBtn = screen.getByText("Use My Current Location");
    fireEvent.click(locateBtn);

    expect(screen.getByText(/Location permission denied/)).toBeInTheDocument();
  });
});
