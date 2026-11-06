import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Users,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Droplets,
  Route as RoadIcon,
  Trash2,
  Sprout,
  HeartPulse,
  Zap,
  Building,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import { api } from "../../lib/api";
import { CivicStore } from "../../lib/store";
import { useAuth } from "../../context/AuthContext";
import { DashboardNav } from "../../components/DashboardNav";
import { useLanguage } from "../../context/LanguageContext";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/dashboard/citizen")({
  component: CitizenDashboardPage,
});

interface ChallengeItem {
  challengeId: number;
  userId: number;
  title: string;
  description: string;
  domain: string;
  subDomain?: string;
  priorityScore: number;
  status: string;
  district: string;
  villageOrWard: string;
  reportedPopulation: number;
  createdAt: string;
  evidenceUrls?: string[];
}

const STEPS = [
  { key: "SUBMITTED", labelHi: "1. प्राप्त", labelEn: "1. Received" },
  { key: "AI_ANALYZED", labelHi: "2. जाँच में", labelEn: "2. Being checked" },
  { key: "MATCHED", labelHi: "3. कॉलेज को सौंपा", labelEn: "3. Given to college" },
  { key: "RESOLVED", labelHi: "4. हल हुआ", labelEn: "4. Solved" },
];

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0,
  AI_ANALYZED: 1,
  VALIDATED: 1,
  MATCHED: 2,
  IN_PROGRESS: 2,
  RESOLVED: 3,
};

const DOMAIN_ICONS: Record<string, any> = {
  WATER: Droplets,
  WATER_SANITATION: Droplets,
  ROAD_INFRASTRUCTURE: RoadIcon,
  SANITATION: Trash2,
  AGRICULTURE: Sprout,
  PUBLIC_HEALTH: HeartPulse,
  POWER: Zap,
  EDUCATION: Building,
};

const SEED_CITIZEN_CHALLENGES: ChallengeItem[] = [
  {
    challengeId: 1,
    userId: 1,
    title: "High Arsenic & Heavy Metal Contamination in Community Borewells",
    description: "Groundwater testing across Sanwer Ward 4 revealed severe arsenic concentrations of 0.08 mg/L.",
    domain: "WATER_SANITATION",
    subDomain: "Groundwater Bio-filtration",
    priorityScore: 88.5,
    status: "MATCHED",
    district: "Indore",
    villageOrWard: "Sanwer Ward 4",
    reportedPopulation: 3500,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    evidenceUrls: ["https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80"],
  },
  {
    challengeId: 5,
    userId: 1,
    title: "Severe Road Pothole and Drainage Inundation on Bypass Junction",
    description: "Over 500 meters of road surface eroded leading to daily water-logging and two-wheeler accidents.",
    domain: "ROAD_INFRASTRUCTURE",
    subDomain: "Stormwater Drainage & Road Repair",
    priorityScore: 76.2,
    status: "AI_ANALYZED",
    district: "Indore",
    villageOrWard: "Vijay Nagar Ward 12",
    reportedPopulation: 12000,
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    evidenceUrls: [],
  },
  {
    challengeId: 8,
    userId: 1,
    title: "Primary Health Center Cold Storage Solar Inverter Failure",
    description: "Solar battery bank degraded, risking spoilage of vital child vaccines during grid power cuts.",
    domain: "PUBLIC_HEALTH",
    subDomain: "Renewable Cold Chain Power",
    priorityScore: 82.0,
    status: "VALIDATED",
    district: "Dhar",
    villageOrWard: "Pithampur Sector 2",
    reportedPopulation: 8500,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    evidenceUrls: [],
  },
];

function CitizenDashboardPage() {
  const { user, role } = useAuth();
  const { lang, t, getStatusMeta } = useLanguage();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchChallenges() {
      const storeItems = CivicStore.getChallenges();
      try {
        const res = await api.get("/challenges");
        if (isMounted) {
          const items = res.data?.content || res.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setChallenges(items);
          } else {
            setChallenges(storeItems.length > 0 ? storeItems : SEED_CITIZEN_CHALLENGES);
          }
        }
      } catch (err) {
        if (isMounted) {
          setChallenges(storeItems.length > 0 ? storeItems : SEED_CITIZEN_CHALLENGES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChallenges();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase()) ||
        c.villageOrWard.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === "ALL") return true;
      if (filter === "ACTIVE") return c.status !== "RESOLVED" && c.status !== "REJECTED";
      if (filter === "RESOLVED") return c.status === "RESOLVED";
      if (filter === "MATCHED") return c.status === "MATCHED";
      return true;
    });
  }, [challenges, filter, search]);

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
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span>Citizen civic tracker</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                  My Reported Community Challenges
                </h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Track real-time status progression from intake and checking to college project deployment.
                </p>
              </div>

              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-xs sm:text-sm shadow-xs transition shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                Report new challenge
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8">
          {(role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY") && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎓</span>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">
                    Active Session: Student / University Researcher ({user?.name || "Academic Account"})
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    This dashboard tracks grassroots problems reported by citizens. To manage student projects and claim matched challenges, visit your project workspace.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/university"
                className="inline-flex items-center justify-center px-3.5 py-1.5 bg-[#2d5a43] hover:bg-[#234735] text-white rounded-lg text-xs font-medium shrink-0 transition"
              >
                Open University Lab →
              </Link>
            </div>
          )}

          {/* Controls Bar: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, district or ward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs font-medium">
              {["ALL", "ACTIVE", "MATCHED", "RESOLVED"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-3 py-1.5 rounded-md transition ${
                    filter === item ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {item === "ALL" ? "All Submissions" : item.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Cards List */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-emerald-800 animate-spin mx-auto" />
              <p className="text-sm text-zinc-500 font-medium">Fetching citizen submissions...</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-2xs">
              <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-900">No challenges found</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-6">
                You haven't reported any community challenges matching this filter yet.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d5a43] hover:bg-[#234735] text-white rounded-lg text-xs font-medium transition"
              >
                Report a Problem Now
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredChallenges.map((item) => {
                const currentStepIdx = STATUS_ORDER[item.status] ?? 1;
                const DomainIcon = DOMAIN_ICONS[item.domain] || Droplets;

                return (
                  <div
                    key={item.challengeId}
                    className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs hover:border-zinc-300 transition space-y-5"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            <DomainIcon className="w-3.5 h-3.5 text-emerald-800" />
                            {item.domain.replace("_", " ")}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-normal bg-zinc-50 text-zinc-600 border border-zinc-200">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {item.villageOrWard}, {item.district}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-normal bg-zinc-50 text-zinc-600 border border-zinc-200">
                            <Users className="w-3 h-3 text-zinc-500" />
                            {item.reportedPopulation.toLocaleString()} citizens
                          </span>

                          <span className="text-xs text-zinc-400 font-mono">
                            #{item.challengeId}
                          </span>
                        </div>

                        <h2 className="text-lg font-semibold text-zinc-950 leading-snug">
                          {item.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Priority & Details Link */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            Urgency score
                          </span>
                          <span className="text-xl font-semibold text-zinc-950 font-mono tabular-nums">
                            {item.priorityScore.toFixed(1)}
                            <span className="text-xs text-zinc-400 font-normal">/100</span>
                          </span>
                        </div>

                        <Link
                          to={`/challenges/${item.challengeId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-800 hover:bg-zinc-50 transition bg-white"
                        >
                          <span>View dossier</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </Link>
                      </div>
                    </div>

                    {/* VISUAL STATUS STEPPER */}
                    <div className="pt-4 border-t border-zinc-100">
                      <span className="text-[11px] font-mono text-zinc-500 block mb-3">
                        Status progression
                      </span>

                      <div className="relative">
                        {/* Background Track Line */}
                        <div className="absolute top-3.5 left-8 right-8 h-0.5 bg-zinc-200 -z-0" />

                        {/* Active Progress Line */}
                        <div
                          className="absolute top-3.5 left-8 h-0.5 bg-[#2d5a43] transition-all duration-500 -z-0"
                          style={{
                            width: `${(currentStepIdx / (STEPS.length - 1)) * 80}%`,
                          }}
                        />

                        {/* Stepper Circles */}
                        <div className="grid grid-cols-4 relative z-10">
                          {STEPS.map((step, idx) => {
                            const isCompleted = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={step.key} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs transition duration-300 border ${
                                    isCompleted
                                      ? "bg-[#2d5a43] border-[#2d5a43] text-white"
                                      : isCurrent
                                      ? "bg-white border-[#2d5a43] text-zinc-950 shadow-xs"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-400"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>
                                <span
                                  className={`text-xs mt-2 font-medium ${
                                    isCurrent
                                      ? "text-zinc-950 font-semibold"
                                      : isCompleted
                                      ? "text-zinc-700"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {lang === "hi" ? step.labelHi : step.labelEn}
                                </span>
                              </div>
                            );
                          })}
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
      <Footer />
    </div>
  );
}

export default CitizenDashboardPage;
