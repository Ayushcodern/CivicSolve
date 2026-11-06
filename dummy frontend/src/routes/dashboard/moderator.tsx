import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GitMerge,
  AlertTriangle,
  Loader2,
  MapPin,
  Users,
  Search,
  Filter,
  Eye,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { CivicStore } from "../../lib/store";
import { useAuth } from "../../context/AuthContext";
import { DashboardNav } from "../../components/DashboardNav";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/dashboard/moderator")({
  component: ModeratorDashboardPage,
});

interface QueueItem {
  challengeId: number;
  userId: number;
  title: string;
  description: string;
  domain: string;
  subDomain?: string;
  priorityScore: number;
  priorityExplanation?: string;
  status: string;
  district: string;
  villageOrWard: string;
  reportedPopulation: number;
  duplicateOfId?: number | null;
  createdAt: string;
  evidenceUrls?: string[];
  similarityScore?: number;
  candidateParentId?: number;
}

const SEED_MODERATOR_QUEUE: QueueItem[] = [
  {
    challengeId: 14,
    userId: 8,
    title: "Borewell Water Turbidity and Yellowish Staining in Sanwer Ward 3",
    description:
      "Water pumped from community handpump #2 shows yellow sedimentation and leaves sulfur smell. Residents experiencing stomach cramps.",
    domain: "WATER_SANITATION",
    subDomain: "Groundwater Heavy Metal Contamination",
    priorityScore: 78.4,
    status: "AI_ANALYZED",
    district: "Indore",
    villageOrWard: "Sanwer Ward 3",
    reportedPopulation: 2200,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    evidenceUrls: ["https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80"],
    similarityScore: 84.5,
    candidateParentId: 1,
  },
  {
    challengeId: 18,
    userId: 12,
    title: "Uncovered High-Tension Transformer in Primary School Playground",
    description:
      "11kV transformer fencing was damaged in recent monsoon storm. Live exposed terminal located 4 meters from children recreation zone.",
    domain: "POWER",
    subDomain: "High-Voltage Grid Public Safety",
    priorityScore: 92.0,
    status: "AI_ANALYZED",
    district: "Bhopal",
    villageOrWard: "Kolar Road Ward 80",
    reportedPopulation: 1400,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    evidenceUrls: [],
  },
  {
    challengeId: 21,
    userId: 15,
    title: "Collapsed Culvert Causing Overflow Across Agricultural Haul Road",
    description:
      "Concrete pipe culvert fractured under heavy tractor load. Runoff flooded 25 acres of standing soybean crop.",
    domain: "AGRICULTURE",
    subDomain: "Rural Drainage & Haulage Infrastructure",
    priorityScore: 81.5,
    status: "AI_ANALYZED",
    district: "Ujjain",
    villageOrWard: "Tarana Tehsil",
    reportedPopulation: 4500,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    evidenceUrls: [],
  },
];

const PARENT_CHALLENGE_MAP: Record<number, QueueItem> = {
  1: {
    challengeId: 1,
    userId: 1,
    title: "High Arsenic & Heavy Metal Contamination in Community Borewells",
    description:
      "Groundwater testing across Sanwer Ward 4 revealed severe arsenic concentrations of 0.08 mg/L. Over 3,500 residents rely on these two primary community borewells for domestic cooking and drinking.",
    domain: "WATER_SANITATION",
    subDomain: "Groundwater Bio-filtration",
    priorityScore: 88.5,
    status: "AI_ANALYZED",
    district: "Indore",
    villageOrWard: "Sanwer Ward 4",
    reportedPopulation: 3500,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    evidenceUrls: ["https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80"],
  },
};

function ModeratorDashboardPage() {
  const { role, login } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Side-by-side merger modal state
  const [mergeModalOpen, setMergeModalOpen] = useState<boolean>(false);
  const [activeDuplicate, setActiveDuplicate] = useState<QueueItem | null>(null);
  const [activeParent, setActiveParent] = useState<QueueItem | null>(null);
  const [mergeReason, setMergeReason] = useState<string>(
    "Verified as duplicate incident within 1.2km radius referencing the same underlying aquifer contamination."
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchQueue() {
      const allChallenges = CivicStore.getChallenges();
      const pendingItems = allChallenges
        .filter((c) => ["SUBMITTED", "AI_ANALYZED"].includes(c.status))
        .map((c) => ({
          ...c,
          status: c.status as any,
          evidenceUrls: c.evidenceUrls || [],
          candidateParentId: c.challengeId === 14 ? 1 : undefined,
          duplicateSimilarity: c.challengeId === 14 ? 0.78 : undefined,
        }));

      try {
        const res = await api.get("/moderator/queue");
        if (isMounted) {
          const items = res.data?.content || res.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setQueue(items);
          } else {
            setQueue(pendingItems.length > 0 ? pendingItems : SEED_MODERATOR_QUEUE);
          }
        }
      } catch (e) {
        if (isMounted) {
          setQueue(pendingItems.length > 0 ? pendingItems : SEED_MODERATOR_QUEUE);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQueue();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleValidate = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.post(`/moderator/${id}/validate`, {
        reason: "Field report verified by state moderation team.",
      });
    } catch (e: any) {
      // Backend offline fallback
    }

    CivicStore.updateChallengeStatus(id, "VALIDATED");
    setQueue((prev) => prev.filter((item) => item.challengeId !== id));
    toast.success(`Challenge #${id} approved and moved to VALIDATED state.`);
    setActionLoadingId(null);
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Reason for rejection:", "Insufficient field evidence or non-civic matter.");
    if (!reason) return;

    setActionLoadingId(id);
    try {
      await api.post(`/moderator/${id}/reject`, { reason });
    } catch (e: any) {
      // Backend offline fallback
    }

    CivicStore.updateChallengeStatus(id, "REJECTED");
    setQueue((prev) => prev.filter((item) => item.challengeId !== id));
    toast.error(`Challenge #${id} rejected.`);
    setActionLoadingId(null);
  };

  const openMergeModal = (duplicateItem: QueueItem) => {
    setActiveDuplicate(duplicateItem);
    const parentId = duplicateItem.candidateParentId || 1;
    setActiveParent(PARENT_CHALLENGE_MAP[parentId] || PARENT_CHALLENGE_MAP[1]);
    setMergeModalOpen(true);
  };

  const confirmMerge = async () => {
    if (!activeDuplicate || !activeParent) return;

    setActionLoadingId(activeDuplicate.challengeId);
    try {
      await api.post(`/moderator/${activeDuplicate.challengeId}/merge`, {
        parentChallengeId: activeParent.challengeId,
        reason: mergeReason,
      });
    } catch (e: any) {
      // Backend offline fallback
    }

    CivicStore.updateChallengeStatus(activeDuplicate.challengeId, "MERGED", {
      duplicateOfId: activeParent.challengeId,
    });
    setQueue((prev) => prev.filter((item) => item.challengeId !== activeDuplicate.challengeId));
    setMergeModalOpen(false);
    toast.success(
      `Merged Challenge #${activeDuplicate.challengeId} into Parent Challenge #${activeParent.challengeId}. Report counts aggregated.`
    );
    setActionLoadingId(null);
  };

  const isModerator = role === "MODERATOR" || role === "ADMIN";

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
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <span>State triage & quality assurance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                  Moderator Review Queue
                </h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Review priority scores, check duplicate reports via side-by-side comparison, and approve challenges for university intake.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-medium border border-zinc-200">
                  {queue.length} pending review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Content */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8">
          {role === "CITIZEN" || role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY" ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center max-w-lg mx-auto shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 grid place-items-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-950">
                State moderator clearance required
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your active session is signed in as <b>{role === "STUDENT" ? "Student Researcher" : role === "FACULTY" ? "Academic Faculty" : "Citizen"}</b>. The state moderator review queue is restricted to certified verification officers.
              </p>
              <div className="pt-2 flex justify-center">
                <Link
                  to={role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY" ? "/dashboard/university" : "/dashboard/citizen"}
                  className="inline-flex items-center justify-center rounded-lg bg-[#2d5a43] px-4 py-2 text-xs font-medium text-white hover:bg-[#234735] transition shadow-xs"
                >
                  <span>{role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY" ? "Return to university project lab" : "Return to citizen tracker"}</span>
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-emerald-800 animate-spin mx-auto" />
              <p className="text-sm text-zinc-500 font-medium">Loading moderation review queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-900">Queue is clear</h3>
              <p className="text-xs text-zinc-500 mt-1">
                All submitted challenges have been triaged, validated, or merged into parent clusters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => {
                const hasDuplicateCandidate = Boolean(item.similarityScore && item.similarityScore >= 75);

                return (
                  <div
                    key={item.challengeId}
                    className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs hover:border-zinc-300 transition space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Item Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-medium text-zinc-400">
                            #{item.challengeId}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {item.domain.replace("_", " ")}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-zinc-600 font-normal">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {item.villageOrWard}, {item.district}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-zinc-600 font-normal">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            {item.reportedPopulation.toLocaleString()} citizens
                          </span>

                          {hasDuplicateCandidate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                              <AlertTriangle className="w-3 h-3 text-zinc-600" />
                              {item.similarityScore}% match
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-zinc-950">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* AI Score & Actions Bar */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100">
                        <div className="text-left lg:text-right pr-2">
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            Urgency score
                          </span>
                          <span className="text-xl font-semibold text-zinc-950 font-mono tabular-nums">
                            {item.priorityScore.toFixed(1)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Side-by-Side Merge Button (if duplicate flagged) */}
                          {hasDuplicateCandidate && (
                            <button
                              onClick={() => openMergeModal(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs transition cursor-pointer"
                            >
                              <GitMerge className="w-3.5 h-3.5" />
                              Compare & merge
                            </button>
                          )}

                          {/* Approve Button */}
                          <button
                            onClick={() => handleValidate(item.challengeId)}
                            disabled={actionLoadingId === item.challengeId}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2d5a43] text-white font-medium text-xs hover:bg-[#234735] shadow-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Validate
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleReject(item.challengeId)}
                            disabled={actionLoadingId === item.challengeId}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          SIDE-BY-SIDE DUPLICATE MERGER MODAL
      ========================================================= */}
      {mergeModalOpen && activeDuplicate && activeParent && (
        <div
          onClick={() => setMergeModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col my-8 max-h-[90vh] text-zinc-900"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-zinc-800 text-white flex items-center justify-center">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Side-by-side duplicate comparison
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Compare duplicate incident report with parent cluster anchor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs">
                  {activeDuplicate.similarityScore}% match
                </span>
                <button
                  onClick={() => setMergeModalOpen(false)}
                  className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 bg-zinc-50/50">
              {/* SIDE A: Existing Parent Challenge */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Parent challenge (#{activeParent.challengeId})
                  </span>
                  <span className="text-xs font-normal text-zinc-500 font-mono">
                    Status: {activeParent.status}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-zinc-950">
                  {activeParent.title}
                </h4>

                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line font-normal">
                  {activeParent.description}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-lg text-xs border border-zinc-200">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Location</span>
                    <span className="font-medium text-zinc-900">
                      {activeParent.villageOrWard}, {activeParent.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Citizens affected</span>
                    <span className="font-medium text-zinc-900 font-mono">
                      {activeParent.reportedPopulation.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Urgency score</span>
                    <span className="font-medium text-zinc-900 font-mono">
                      {activeParent.priorityScore.toFixed(1)} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Domain</span>
                    <span className="font-medium text-zinc-900">
                      {activeParent.domain}
                    </span>
                  </div>
                </div>

                {activeParent.evidenceUrls && activeParent.evidenceUrls.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1.5">
                      Attached evidence
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeParent.evidenceUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Parent evidence"
                          className="w-full h-24 object-cover rounded-md border border-zinc-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SIDE B: Candidate Duplicate Challenge */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Duplicate candidate (#{activeDuplicate.challengeId})
                  </span>
                  <span className="text-xs font-mono text-zinc-700">
                    {activeDuplicate.similarityScore}% match
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-zinc-950">
                  {activeDuplicate.title}
                </h4>

                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line font-normal">
                  {activeDuplicate.description}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-lg text-xs border border-zinc-200">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Location</span>
                    <span className="font-medium text-zinc-900">
                      {activeDuplicate.villageOrWard}, {activeDuplicate.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Citizens affected</span>
                    <span className="font-medium text-zinc-900 font-mono">
                      {activeDuplicate.reportedPopulation.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Urgency score</span>
                    <span className="font-medium text-zinc-900 font-mono">
                      {activeDuplicate.priorityScore.toFixed(1)} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono">Domain</span>
                    <span className="font-medium text-zinc-900">
                      {activeDuplicate.domain}
                    </span>
                  </div>
                </div>

                {activeDuplicate.evidenceUrls && activeDuplicate.evidenceUrls.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1.5">
                      Attached evidence
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeDuplicate.evidenceUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Duplicate evidence"
                          className="w-full h-24 object-cover rounded-md border border-zinc-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Reason & Merge Action Footer */}
            <div className="p-6 bg-white border-t border-zinc-200 space-y-3 shrink-0">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Moderator merge audit justification:
                </label>
                <input
                  type="text"
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-zinc-500">
                  Merging aggregates the reported population counts and links this record under Parent #{activeParent.challengeId}.
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleValidate(activeDuplicate.challengeId)}
                    className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition bg-white cursor-pointer"
                  >
                    Keep as distinct problem
                  </button>

                  <button
                    onClick={confirmMerge}
                    disabled={actionLoadingId === activeDuplicate.challengeId}
                    className="px-4 py-2 rounded-lg bg-[#2d5a43] text-white font-medium text-xs hover:bg-[#234735] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    Confirm merge into #{activeParent.challengeId}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default ModeratorDashboardPage;
