import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";
import { SubmitChallengePage, SubmitWizardPage } from "../routes/submit";
import { api } from "../lib/api";
import { CivicStore } from "../lib/store";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: any) => config,
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
}));

// Helper to render component wrapped in required context providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AuthProvider>
  );
}

describe("Problem Reporting Wizard (SubmitWizardPage / SubmitChallengePage)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Step 1 with low-literacy category selection and progress bar", () => {
    renderWithProviders(<SubmitChallengePage />);

    // Step 1 Header and step counter
    expect(screen.getByText(/किस बारे में समस्या है\?|What is the problem about\?/i)).toBeInTheDocument();
    expect(screen.getByText(/कदम 1 का 5|Step 1 of 5/i)).toBeInTheDocument();

    // Verify key categories are available
    expect(screen.getAllByText(/पानी|Water/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/सड़क|Roads/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/खेती|Farming/i).length).toBeGreaterThan(0);

    // Next step button is rendered
    expect(screen.getByRole("button", { name: /आगे बढ़ें|Next/i })).toBeInTheDocument();
  });

  it("navigates through wizard steps 1 to 4 using voice/sample description", async () => {
    renderWithProviders(<SubmitWizardPage />);

    // Select Farming / खेती category
    const farmingButtons = screen.getAllByRole("button");
    const farmButton = farmingButtons.find((btn) => btn.textContent?.includes("खेती") || btn.textContent?.includes("Farming"));
    if (farmButton) {
      fireEvent.click(farmButton);
    }

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Step 2: Description screen
    expect(screen.getByText(/समस्या विस्तार से बताएं|Describe the problem/i)).toBeInTheDocument();

    // Load sample complaint
    const sampleBtn = screen.getByText(/उदाहरण भरें|Load Sample/i);
    fireEvent.click(sampleBtn);

    // Verify textarea has content loaded
    const textarea = screen.getByPlaceholderText(/उदाहरण:|Example:/i);
    expect((textarea as HTMLTextAreaElement).value.length).toBeGreaterThan(10);

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Step 3: Photo screen
    expect(screen.getByText(/फ़ोटो जोड़ें|Add a photo/i)).toBeInTheDocument();

    // Step 3 -> Step 4 (skip photo or click next)
    const nextBtn = screen.getByRole("button", { name: /^आगे बढ़ें|^Next/i });
    fireEvent.click(nextBtn);

    // Step 4: Location screen
    expect(screen.getByText(/समस्या किस जगह की है\?|Where is the problem located\?/i)).toBeInTheDocument();
  });

  it("completes Step 5 review, submits challenge, and displays status tracker", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        challengeId: 3001,
        title: "हैंडपंप का गंदा पानी",
        status: "SUBMITTED",
      },
    });

    const addChallengeSpy = vi.spyOn(CivicStore, "addChallenge");

    renderWithProviders(<SubmitChallengePage />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Step 2: Type problem description
    const descInput = screen.getByPlaceholderText(/उदाहरण:|Example:/i);
    fireEvent.change(descInput, {
      target: {
        value: "गाँव के मुख्य कुएं का पानी दूषित हो गया है, तुरंत पाइपलाइन मरम्मत की आवश्यकता है।",
      },
    });

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Step 3 -> Step 4
    const step3Next = screen.getByRole("button", { name: /^आगे बढ़ें|^Next/i });
    fireEvent.click(step3Next);

    // Step 4: Fill village name and advance to Step 5
    const villageInput = screen.getByPlaceholderText(/जैसे: सांवेर|e\.g\. Sanwer/i);
    fireEvent.change(villageInput, { target: { value: "धरमपुरी वार्ड 3" } });

    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Step 5: Review & Confirm
    expect(screen.getByText(/दर्ज करने से पहले जाँच लें|Review and confirm/i)).toBeInTheDocument();
    expect(
      screen.getByText(/गाँव के मुख्य कुएं का पानी दूषित हो गया है/)
    ).toBeInTheDocument();

    // Final submit
    const finalSubmitBtn = screen.getByRole("button", {
      name: /समस्या दर्ज करें|Submit problem/i,
    });
    fireEvent.click(finalSubmitBtn);

    // Verify submission to CivicStore
    await waitFor(() => {
      expect(addChallengeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: "WATER",
          villageOrWard: "धरमपुरी वार्ड 3",
          description: expect.stringContaining("गाँव के मुख्य कुएं"),
        })
      );
    });

    // Verify API intake call
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/challenges",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });

    // Verify Success Screen is displayed with Complaint Number and 4-step Tracker
    await waitFor(() => {
      expect(
        screen.getByText(/आपकी समस्या दर्ज हो गई है!|Your problem has been logged!/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/#MP-CIVIC-/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. प्राप्त \(Received\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. जाँच में \(Being checked\)/i)).toBeInTheDocument();
    });
  });

  it("activates microphone, captures interim speech, and flushes speech to description on stop", async () => {
    class MockSpeechRecognition {
      lang = "hi-IN";
      continuous = true;
      interimResults = true;
      onstart: any = null;
      onresult: any = null;
      onerror: any = null;
      onend: any = null;
      static current: MockSpeechRecognition | null = null;

      constructor() {
        MockSpeechRecognition.current = this;
      }

      start() {
        if (this.onstart) this.onstart();
      }

      stop() {
        if (this.onend) this.onend();
      }

      abort() {
        if (this.onend) this.onend();
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;

    renderWithProviders(<SubmitWizardPage />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole("button", { name: /आगे बढ़ें|Next/i }));

    // Switch speech language to English
    const enLangBtn = screen.getByText(/English \(en-IN\)/i);
    fireEvent.click(enLangBtn);

    // Tap mic button to start recording
    const micBtn = screen.getByRole("button", { name: /बोलकर बताएं|Dictate/i });
    fireEvent.click(micBtn);

    expect(MockSpeechRecognition.current).not.toBeNull();
    expect(MockSpeechRecognition.current?.lang).toBe("en-IN");

    // Simulate speech stream generating interim result inside act()
    act(() => {
      MockSpeechRecognition.current?.onresult({
        resultIndex: 0,
        results: [
          {
            isFinal: false,
            0: { transcript: "Drinking water pipe has leaked near the primary school" },
          },
        ],
      });
    });

    // Verify live interim badge is displayed while speaking
    expect(
      screen.getByText(/Drinking water pipe has leaked/i)
    ).toBeInTheDocument();

    // Now simulate user tapping the mic button to finish speaking
    const activeMicBtn = screen.getByRole("button", { name: /सुन रहे हैं|Listening/i });
    fireEvent.click(activeMicBtn);

    // Verify interim text was NOT erased, but flushed directly into the description textarea!
    const textarea = screen.getByPlaceholderText(/उदाहरण:|Example:/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain(
      "Drinking water pipe has leaked near the primary school"
    );
  });
});
