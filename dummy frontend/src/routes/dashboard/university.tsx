import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  Users,
  Award,
  Layers,
  Sparkles,
  Loader2,
  FileText,
  Building,
  PlusCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { CivicStore } from "../../lib/store";
import { useAuth } from "../../context/AuthContext";
import { DashboardNav } from "../../components/DashboardNav";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/dashboard/university")({
  component: UniversityDashboardPage,
});

interface ProjectData {
  projectId: number;
  challengeId: number;
  title: string;
  domain: string;
  stage: string;
  institutionName: string;
  leadFaculty: string;
  startDate: string;
  milestones: MilestoneItem[];
  teamMembers: string[];
}

interface MilestoneItem {
  milestoneId: number;
  title: string;
  description?: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  deliverableUrl?: string;
}

interface MatchedChallengeItem {
  challengeId: number;
  title: string;
  domain: string;
  district: string;
  priorityScore: number;
  matchScore: number;
  distanceKm: number;
  status: string;
}

const STAGES = [
  "PROPOSAL",
  "PROTOTYPE",
  "FIELD_TEST",
  "PILOT",
  "DEPLOYED",
  "COMPLETED",
];

const SEED_ACTIVE_PROJECT: ProjectData = {
  projectId: 101,
  challengeId: 1,
  title: "Sanwer Ward 4 Arsenic Bio-Filtration & Mobile Purification Unit",
  domain: "WATER_SANITATION",
  stage: "PROTOTYPE",
  institutionName: "IIT Indore - Environmental Quality Lab",
  leadFaculty: "Dr. Amit Sharma",
  startDate: "2026-10-15",
  teamMembers: [
    "Dr. Amit Sharma (Faculty Lead)",
    "Priya Verma (Student Researcher)",
    "Rahul Soni (Student Researcher)",
    "Er. Alok Jain (Industry Mentor - Eureka Forbes)",
  ],
  milestones: [
    {
      milestoneId: 1,
      title: "Aquifer Baseline Water Sampling & Heavy Metal Spectrometry",
      description: "Tested arsenic and fluoride concentration across 12 borewell sites.",
      dueDate: "2026-10-20",
      status: "APPROVED",
      deliverableUrl: "https://zenodo.org/record/civicsolve-sanwer-water-lab-report-01.pdf",
    },
    {
      milestoneId: 2,
      title: "Graphene-Oxide Adsorption Membrane Prototype Assembly",
      description: "Fabrication of 250 L/hr modular filtration chamber.",
      dueDate: "2026-11-05",
      status: "SUBMITTED",
      deliverableUrl: "https://github.com/civicsolve/prototype-filtration-cad-v2",
    },
    {
      milestoneId: 3,
      title: "On-Site Community Field Pilot and Turbidity Testing",
      description: "Deploy pilot cart at Sanwer Ward 4 main well for 14-day continuous operation.",
      dueDate: "2026-11-25",
      status: "PENDING",
    },
  ],
};

const SEED_INBOX: MatchedChallengeItem[] = [
  {
    challengeId: 8,
    title: "Primary Health Center Cold Storage Solar Inverter Degradation",
    domain: "PUBLIC_HEALTH",
    district: "Dhar",
    priorityScore: 82.0,
    matchScore: 94,
    distanceKm: 28.4,
    status: "VALIDATED",
  },
  {
    challengeId: 12,
    title: "Eutrophication & Bio-waste Discharge in Municipal Retention Lake",
    domain: "WATER_SANITATION",
    district: "Indore",
    priorityScore: 79.5,
    matchScore: 91,
    distanceKm: 8.5,
    status: "VALIDATED",
  },
];

function UniversityDashboardPage() {
  const { user, role } = useAuth();
  const [project, setProject] = useState<ProjectData>(SEED_ACTIVE_PROJECT);
  const [inbox, setInbox] = useState<MatchedChallengeItem[]>(SEED_INBOX);
  const [advancingStage, setAdvancingStage] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [viewProofMilestone, setViewProofMilestone] = useState<MilestoneItem | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState<string>("");
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const stageIdx = STAGES.indexOf(project.stage);

  // Claim a new challenge
  const handleClaimChallenge = async (ch: MatchedChallengeItem) => {
    setClaimingId(ch.challengeId);
    try {
      await api.post(`/projects/${ch.challengeId}/accept`, {
        institutionId: user?.institutionId || 1,
        facultyUserId: user?.userId || 2,
      });
    } catch (e: any) {
      // Backend offline fallback
    }

    CivicStore.claimChallenge(
      ch.challengeId,
      "Indian Institute of Technology (IIT) Indore",
      "Center of Excellence in Water Quality"
    );
    setInbox((prev) => prev.filter((item) => item.challengeId !== ch.challengeId));
    toast.success(`Challenge #${ch.challengeId} claimed. Project workspace initiated.`);
    setClaimingId(null);
  };

  // Submit Milestone Proof
  const handleSubmitDeliverable = async () => {
    if (!selectedMilestone || !deliverableUrl) {
      toast.error("Please enter a deliverable URL or document proof link.");
      return;
    }

    try {
      await api.post(`/projects/${project.projectId}/milestones/${selectedMilestone.milestoneId}/submit`, {
        deliverableUrl,
      });
    } catch (e) {}

    CivicStore.addProjectDeliverable(project.projectId, selectedMilestone.title + "_Report.pdf");

    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.milestoneId === selectedMilestone.milestoneId
          ? { ...m, status: "SUBMITTED", deliverableUrl }
          : m
      ),
    }));

    setUploadModalOpen(false);
    setDeliverableUrl("");
    toast.success(`Deliverable submitted for "${selectedMilestone.title}". Pending review.`);
  };

  // Advance Stage
  const handleAdvanceStage = async () => {
    if (stageIdx >= STAGES.length - 1) return;

    setAdvancingStage(true);
    const nextStage = STAGES[stageIdx + 1];
    try {
      await api.post(`/projects/${project.projectId}/advance-stage`);
    } catch (e: any) {}

    CivicStore.advanceProjectStage(project.projectId, nextStage as any);
    setProject((prev) => ({ ...prev, stage: nextStage }));
    toast.success(`Stage advanced to: ${nextStage}.`);
    setAdvancingStage(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-900 font-sans antialiased pb-20 flex flex-col justify-between">
      <div>
        <DashboardNav />

        {/* Header Banner */}
        <div className="bg-white border-b border-zinc-200/80">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 mb-1">
                  <GraduationCap className="w-4 h-4 text-zinc-500" />
                  <span>University & research innovation lab</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                  {project.institutionName}
                </h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Manage claimed R&D challenges, verify team milestones, and advance prototypes to field pilot deployment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                  1 active project
                </span>
                <span className="px-3 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                  {inbox.length} in inbox
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 space-y-8">
          {role === "CITIZEN" ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center max-w-lg mx-auto shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 grid place-items-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-950">
                University researcher clearance required
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your active session is signed in as <b>Citizen</b>. The project workspace and milestone deliverable uploader are restricted to accredited university faculty and student researchers.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    login("civicsolve_faculty_jwt_token", {
                      userId: 2,
                      name: "Dr. Amit Sharma",
                      email: "faculty@aitr.ac.in",
                      role: "FACULTY",
                      institutionId: 1,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2d5a43] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#234735] transition cursor-pointer shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Switch to university researcher</span>
                </button>
                <Link
                  to="/dashboard/citizen"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition bg-white"
                >
                  <span>Return to citizen tracker</span>
                </Link>
              </div>
            </div>
          ) : (
          <>
            {/* =========================================================
                ACTIVE PROJECT WORKSPACE
            ========================================================= */}
            <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                      Project #{project.projectId}
                    </span>
                    <span className="text-xs font-normal text-zinc-500 font-mono">
                      Linked challenge #{project.challengeId}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-950 tracking-tight">
                    {project.title}
                  </h2>
                </div>

                {/* Advance Stage Button */}
                <button
                  onClick={handleAdvanceStage}
                  disabled={advancingStage || stageIdx >= STAGES.length - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-xs shadow-xs transition disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {advancingStage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  Advance to next stage
                </button>
              </div>

              {/* 6-STAGE PROGRESSION TRACKER */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                  <span>Project progression stage</span>
                  <span className="text-zinc-900 font-mono">Current: {project.stage}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {STAGES.map((s, idx) => {
                    const isCompleted = idx < stageIdx;
                    const isCurrent = idx === stageIdx;

                    return (
                      <div
                        key={s}
                        className={`p-2.5 rounded-lg border text-center transition ${
                          isCurrent
                            ? "bg-[#2d5a43] border-[#2d5a43] text-white shadow-xs font-medium"
                            : isCompleted
                            ? "bg-zinc-100 border-zinc-200 text-zinc-800 font-normal"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 font-normal"
                        }`}
                      >
                        <div className="text-[10px] font-mono block mb-0.5 opacity-80">
                          Stage {idx + 1}
                        </div>
                        <div className="text-xs truncate">{s.replace("_", " ")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TEAM MEMBERS GRID */}
              <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
                <span className="text-xs font-medium text-zinc-600 block">
                  Assigned project team
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.teamMembers.map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-zinc-200 rounded-md text-xs font-normal text-zinc-800 shadow-2xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* MILESTONE DELIVERABLES UPLOADER */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-zinc-600" />
                    Project milestones & deliverables
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    {project.milestones.filter((m) => m.status === "APPROVED").length} of {project.milestones.length} approved
                  </span>
                </div>

                <div className="space-y-2.5">
                  {project.milestones.map((m) => (
                    <div
                      key={m.milestoneId}
                      className="p-3.5 bg-zinc-50/60 rounded-lg border border-zinc-200 hover:border-zinc-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              m.status === "APPROVED"
                                ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                : m.status === "SUBMITTED"
                                ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                : "bg-white text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {m.status}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-950">{m.title}</h4>
                        </div>

                        {m.description && (
                          <p className="text-xs text-zinc-600">{m.description}</p>
                        )}

                        {m.deliverableUrl && (
                          <button
                            type="button"
                            onClick={() => setViewProofMilestone(m)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#2d5a43] hover:underline pt-0.5 font-medium cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View submitted deliverable proof
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-zinc-500 font-mono">
                          Due: {m.dueDate}
                        </span>

                        {m.status === "PENDING" && (
                          <button
                            onClick={() => {
                              setSelectedMilestone(m);
                              setUploadModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-xs transition cursor-pointer shadow-xs"
                          >
                            <Upload className="w-3 h-3" />
                            Upload proof
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* =========================================================
                MATCHED CHALLENGES INBOX
            ========================================================= */}
            <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-600" />
                    Matched challenges inbox
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Challenges validated by state moderation matching this university's departmental laboratory capabilities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {inbox.map((ch) => (
                  <div
                    key={ch.challengeId}
                    className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 text-zinc-800">
                          {ch.domain.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-semibold text-zinc-950 leading-snug">{ch.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-mono text-xs shrink-0 border border-zinc-200">
                        {ch.matchScore}% match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-0.5 font-mono">
                      <span>{ch.distanceKm} km from campus ({ch.district})</span>
                      <span className="text-zinc-800 font-medium">Priority: {ch.priorityScore}</span>
                    </div>

                    <button
                      onClick={() => handleClaimChallenge(ch)}
                      disabled={claimingId === ch.challengeId}
                      className="w-full py-2 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {claimingId === ch.challengeId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5" />
                      )}
                      Claim challenge & form project team
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* =========================================================
          MILIESTONE DELIVERABLE UPLOAD MODAL
      ========================================================= */}
      {uploadModalOpen && selectedMilestone && (
        <div
          onClick={() => setUploadModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-white rounded-xl p-6 shadow-xl border border-zinc-200 space-y-4 text-zinc-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-zinc-600" />
                Upload milestone proof
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-900">{selectedMilestone.title}</p>
              <p className="text-[11px] text-zinc-500">{selectedMilestone.description}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">
                Deliverable URL (GitHub / Drive / Government Archive Link):
              </label>
              <input
                type="url"
                placeholder="https://github.com/civicsolve/... or cloud link"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDeliverable}
                className="px-4 py-1.5 bg-[#2d5a43] hover:bg-[#234735] text-white rounded-lg text-xs font-medium shadow-xs transition"
              >
                Submit deliverable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW AUDITED DELIVERABLE PROOF MODAL
      ========================================================= */}
      {viewProofMilestone && (
        <div
          onClick={() => setViewProofMilestone(null)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-white rounded-xl p-6 shadow-xl border border-zinc-200 space-y-4 text-zinc-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-semibold text-zinc-950">
                  Audited Laboratory Test Certificate
                </h3>
              </div>
              <button
                onClick={() => setViewProofMilestone(null)}
                className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 block uppercase">
                Milestone #{viewProofMilestone.milestoneId} · Status: {viewProofMilestone.status}
              </span>
              <h4 className="text-sm font-semibold text-zinc-900">{viewProofMilestone.title}</h4>
              <p className="text-xs text-zinc-600">{viewProofMilestone.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-zinc-800">Spectrometric Water Quality Test Results:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded border border-zinc-200 bg-white">
                  <div className="text-zinc-500 text-[11px]">Arsenic (As) Level:</div>
                  <div className="font-mono font-semibold text-emerald-800">0.004 mg/L (Safe)</div>
                  <div className="text-zinc-400 text-[10px]">WHO limit: 0.010 mg/L</div>
                </div>
                <div className="p-2.5 rounded border border-zinc-200 bg-white">
                  <div className="text-zinc-500 text-[11px]">Turbidity:</div>
                  <div className="font-mono font-semibold text-emerald-800">1.2 NTU (Clear)</div>
                  <div className="text-zinc-400 text-[10px]">Baseline was: 24.0 NTU</div>
                </div>
              </div>
              <p className="text-zinc-500 text-[11px] pt-1">
                Verified on 20 Oct 2026 by Dr. R. K. Verma (Chief Medical Officer) & SGSITS Environmental Water Testing Wing.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
              <span className="text-xs text-zinc-500 font-mono">Reference: MP-WATER-2611-L1</span>
              <button
                onClick={() => setViewProofMilestone(null)}
                className="px-4 py-1.5 bg-[#2d5a43] text-white rounded-lg text-xs font-semibold hover:bg-[#234634] transition cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}

export default UniversityDashboardPage;
