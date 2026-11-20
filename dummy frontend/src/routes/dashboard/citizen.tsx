import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Users,
  ChevronRight,
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
import { ProtectedRoute } from "../../components/ProtectedRoute";

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
  { key: "SUBMITTED",   labelHi: "1. प्राप्त",          labelEn: "1. Received" },
  { key: "AI_ANALYZED", labelHi: "2. जाँच में",         labelEn: "2. Being checked" },
  { key: "MATCHED",     labelHi: "3. कॉलेज को सौंपा", labelEn: "3. Given to college" },
  { key: "RESOLVED",    labelHi: "4. हल हुआ",         labelEn: "4. Solved" },
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
  return (
    <ProtectedRoute>
      <CitizenDashboardContent />
    </ProtectedRoute>
  );
}

function CitizenDashboardContent() {
  const { user, role, openLoginModal } = useAuth();
  const { lang, t, getStatusMeta } = useLanguage();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  // Redirect / prompt login if not authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);

    async function fetchChallenges() {
      try {
        // Try fetching user-specific challenges from API
        const res = await api.get(`/challenges?userId=${user!.userId}`);
        if (isMounted) {
          const items = res.data?.content || res.data || [];
          if (Array.isArray(items) && items.length > 0) {
            // Filter to only this user's reports
            const mine = items.filter((c: ChallengeItem) => c.userId === user!.userId);
            setChallenges(mine);
          } else {
            // Try the store (locally submitted reports)
            const storeItems = CivicStore.getChallenges().filter(
              (c) => c.userId === user!.userId
            );
            setChallenges(storeItems);
          }
        }
      } catch {
        if (isMounted) {
          // Fall back to store
          const storeItems = CivicStore.getChallenges().filter(
            (c) => c.userId === user!.userId
          );
          setChallenges(storeItems);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChallenges();
    return () => { isMounted = false; };
  }, [user]);

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 text-zinc-900 font-sans antialiased pb-24 flex flex-col">
      <DashboardNav />

      {/* Page Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot inline-block" />
                  {lang === "hi" ? "लाइव ट्रैकर" : "Live tracker"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                {lang === "hi" ? "मेरी शिकायतें" : "My Complaints"}
              </h1>
              <p className="text-sm text-zinc-500">
                {lang === "hi"
                  ? `नमस्ते ${user?.name?.split(" ")[0] || ""}! आपकी दर्ज समस्याओं की स्थिति देखें।`
                  : `Hello ${user?.name?.split(" ")[0] || "there"}! Track all your reported problems here.`}
              </p>
            </div>

            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2d5a43] hover:bg-[#234735] text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              {lang === "hi" ? "नई समस्या दर्ज करें" : "Report new problem"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-7 flex-1">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === "hi" ? "शीर्षक, जिला या वार्ड से खोजें..." : "Search complaints..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2d5a43]/20 focus:border-[#2d5a43] transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl text-xs font-medium border border-zinc-200/60">
            {["ALL", "ACTIVE", "MATCHED", "RESOLVED"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-2 rounded-lg transition-all duration-150 ${
                  filter === item
                    ? "bg-white text-zinc-950 shadow-sm font-semibold ring-1 ring-zinc-200/80"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-white/60"
                }`}
              >
                {lang === "hi"
                  ? item === "ALL" ? "सभी" : item === "ACTIVE" ? "चल रही" : item === "MATCHED" ? "सौंपी" : "हल हुई"
                  : item === "ALL" ? "All" : item === "ACTIVE" ? "Active" : item === "MATCHED" ? "Matched" : "Resolved"}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 text-[#2d5a43] animate-spin" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">
              {lang === "hi" ? "आपकी शिकायतें लोड हो रही हैं..." : "Loading your complaints..."}
            </p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                {lang === "hi" ? "अभी तक कोई शिकायत नहीं" : "No complaints yet"}
              </h3>
              <p className="text-sm text-zinc-500 mt-1.5">
                {lang === "hi"
                  ? "आपने अभी तक कोई समस्या दर्ज नहीं की है।"
                  : "You haven't reported any problems yet. File your first one now."}
              </p>
            </div>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5a43] hover:bg-[#234735] text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {lang === "hi" ? "अभी समस्या दर्ज करें" : "Report a Problem"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {filteredChallenges.map((item) => {
              const currentStepIdx = STATUS_ORDER[item.status] ?? 0;
              const DomainIcon = DOMAIN_ICONS[item.domain] || Droplets;

              const statusColors: Record<string, string> = {
                SUBMITTED:   "bg-sky-50 border-sky-200 text-sky-700",
                AI_ANALYZED: "bg-amber-50 border-amber-200 text-amber-700",
                VALIDATED:   "bg-amber-50 border-amber-200 text-amber-700",
                MATCHED:     "bg-emerald-50 border-emerald-200 text-emerald-700",
                IN_PROGRESS: "bg-blue-50 border-blue-200 text-blue-700",
                RESOLVED:    "bg-green-50 border-green-200 text-green-800",
                REJECTED:    "bg-red-50 border-red-200 text-red-700",
              };
              const statusLabel: Record<string, { hi: string; en: string }> = {
                SUBMITTED:   { hi: "प्राप्त", en: "Received" },
                AI_ANALYZED: { hi: "जाँच में", en: "Under Review" },
                VALIDATED:   { hi: "सत्यापित", en: "Validated" },
                MATCHED:     { hi: "कॉलेज को सौंपा", en: "Matched" },
                IN_PROGRESS: { hi: "काम जारी", en: "In Progress" },
                RESOLVED:    { hi: "हल हुआ ✓", en: "Resolved ✓" },
                REJECTED:    { hi: "अस्वीकृत", en: "Rejected" },
              };

              return (
                <div
                  key={item.challengeId}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200 overflow-hidden"
                >
                  {/* Card top accent bar based on status */}
                  <div className={`h-1 w-full ${item.status === "RESOLVED" ? "bg-emerald-500" : item.status === "MATCHED" ? "bg-emerald-400" : item.status === "REJECTED" ? "bg-red-400" : "bg-amber-400"}`} />

                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            <DomainIcon className="w-3.5 h-3.5 text-[#2d5a43]" />
                            {item.domain.replace(/_/g, " ")}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-500 bg-zinc-50 border border-zinc-200">
                            <MapPin className="w-3 h-3" />
                            {item.villageOrWard}, {item.district}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                            #{item.challengeId}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-lg font-semibold text-zinc-950 leading-snug">
                          {item.title}
                        </h2>
                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Right: status + urgency */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[item.status] || "bg-zinc-50 border-zinc-200 text-zinc-600"}`}>
                          {lang === "hi"
                            ? statusLabel[item.status]?.hi || item.status
                            : statusLabel[item.status]?.en || item.status}
                        </span>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">Urgency</div>
                          <div className="text-xl font-bold text-zinc-900 font-mono tabular-nums leading-none">
                            {item.priorityScore.toFixed(0)}
                            <span className="text-xs font-normal text-zinc-400">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STATUS STEPPER */}
                    <div className="pt-4 border-t border-zinc-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-zinc-500">
                          {lang === "hi" ? "स्थिति प्रगति" : "Status progress"}
                        </span>
                        <Link
                          to={`/challenges/${item.challengeId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#2d5a43] hover:underline"
                        >
                          {lang === "hi" ? "विवरण देखें" : "View details"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="relative">
                        {/* track */}
                        <div className="absolute top-3 left-3 right-3 h-0.5 bg-zinc-100 rounded-full" />
                        {/* progress */}
                        <div
                          className="absolute top-3 left-3 h-0.5 rounded-full bg-gradient-to-r from-[#2d5a43] to-emerald-400 transition-all duration-700"
                          style={{
                            width:
                              currentStepIdx === 0
                                ? "0%"
                                : `calc(${(currentStepIdx / (STEPS.length - 1)) * 100}% - 1.5rem)`,
                            maxWidth: "calc(100% - 1.5rem)",
                          }}
                        />
                        <div className="grid grid-cols-4 relative z-10">
                          {STEPS.map((step, idx) => {
                            const isCompleted = idx < currentStepIdx;
                            const isCurrent   = idx === currentStepIdx;
                            return (
                              <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ring-2 ${
                                  isCompleted
                                    ? "bg-[#2d5a43] ring-[#2d5a43]/20 text-white"
                                    : isCurrent
                                    ? "bg-white ring-[#2d5a43] text-[#2d5a43] shadow-sm"
                                    : "bg-zinc-100 ring-zinc-200/80 text-zinc-400"
                                }`}>
                                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-medium leading-tight ${
                                  isCurrent ? "text-zinc-900 font-semibold" : isCompleted ? "text-zinc-600" : "text-zinc-400"
                                }`}>
                                  {lang === "hi" ? step.labelHi.replace(/^\d+\. /, "") : step.labelEn.replace(/^\d+\. /, "")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}


export default CitizenDashboardPage;
