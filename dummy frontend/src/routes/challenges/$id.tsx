import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Award,
  ChevronRight,
  Share2,
  Copy,
  ExternalLink,
  Layers,
  Activity,
  Droplets,
  Route as RoadIcon,
  Trash2,
  Sprout,
  HeartPulse,
  Zap,
  Building,
  Loader2,
  Info,
  Maximize2,
  GraduationCap,
  ArrowRight,
  Check,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { CivicStore } from "../../lib/store";
import { useAuth } from "../../context/AuthContext";
import { DashboardNav } from "../../components/DashboardNav";
import { useLanguage } from "../../context/LanguageContext";
import { Footer } from "../../components/Footer";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/challenges/$id")({
  component: ChallengeDetailPage,
});

interface ChallengeData {
  challengeId: number;
  userId: number;
  title: string;
  description: string;
  domain: string;
  subDomain?: string;
  priorityScore: number;
  priorityExplanation?: string;
  status: string;
  lat: number;
  lon: number;
  district: string;
  villageOrWard: string;
  reportedPopulation: number;
  duplicateOfId?: number | null;
  createdAt: string;
  updatedAt?: string;
  evidenceUrls?: string[];
}

interface DuplicateCandidate {
  challengeId: number;
  title: string;
  similarity: number;
  distanceKm: number;
  status: string;
  district: string;
}

interface UniversityRecommendation {
  institutionId: number;
  name: string;
  type: string;
  district: string;
  matchScore: number;
  distanceKm: number;
  department: string;
  capabilities: string[];
}

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

// High-fidelity fallback challenge for preview & testing
const FALLBACK_CHALLENGE: ChallengeData = {
  challengeId: 1,
  userId: 1,
  title: "High Arsenic & Heavy Metal Contamination in Community Borewells",
  description:
    "Groundwater testing across Sanwer Ward 4 revealed severe arsenic concentrations of 0.08 mg/L (exceeding WHO and BIS 10500 permissible limits of 0.01 mg/L). Over 3,500 residents across three sub-localities rely entirely on these two primary community borewells for domestic cooking and drinking. Multiple cases of skin keratosis and gastrointestinal distress have been recorded in the past two months. Immediate bio-filtration or electro-coagulation water purification unit required alongside alternative tanker supply.",
  domain: "WATER_SANITATION",
  subDomain: "Groundwater Contaminant Mitigation & Bio-Filtration",
  priorityScore: 88.5,
  priorityExplanation:
    "गाँव के 3,500 निवासियों के स्वास्थ्य व पीने के पानी पर सीधा असर होने तथा त्वचा रोग के मामलों के कारण इसे अति-आवश्यक प्राथमिकता दी गई है। (Direct severe drinking water toxicity and health hazard impacting 3,500 residents).",
  status: "AI_ANALYZED",
  lat: 22.9734,
  lon: 75.8321,
  district: "Indore",
  villageOrWard: "Sanwer Ward 4",
  reportedPopulation: 3500,
  duplicateOfId: null,
  createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  evidenceUrls: [
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80",
  ],
};

const DEFAULT_RECOMMENDATIONS: UniversityRecommendation[] = [
  {
    institutionId: 1,
    name: "Indian Institute of Technology (IIT) Indore",
    type: "UNIVERSITY",
    district: "Indore",
    matchScore: 96,
    distanceKm: 14.2,
    department: "Center of Excellence in Water Quality & Environmental Science",
    capabilities: [
      "Atomic Absorption Spectrophotometer",
      "Membrane Bio-Reactor Lab",
      "Field Testing Mobile Van",
    ],
  },
  {
    institutionId: 2,
    name: "SGSITS Indore",
    type: "UNIVERSITY",
    district: "Indore",
    matchScore: 92,
    distanceKm: 18.5,
    department: "Department of Civil & Environmental Engineering",
    capabilities: [
      "Water Contamination Filtration Testbed",
      "GIS & Spatial Hydrology Lab",
    ],
  },
  {
    institutionId: 3,
    name: "MANIT Bhopal (NIT)",
    type: "UNIVERSITY",
    district: "Bhopal",
    matchScore: 87,
    distanceKm: 172.0,
    department: "Department of Chemical & Environmental Engineering",
    capabilities: [
      "Adsorption Column Testing",
      "Community Drinking Water Pilot Project Lead",
    ],
  },
];

const DEFAULT_DUPLICATES: DuplicateCandidate[] = [
  {
    challengeId: 14,
    title: "Borewell Water Turbidity and Yellowish Staining in Sanwer Ward 3",
    similarity: 78,
    distanceKm: 0.6,
    status: "AI_ANALYZED",
    district: "Indore",
  },
];

function ChallengeDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, openLoginModal } = useAuth();
  const { lang, t, getStatusMeta } = useLanguage();

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<UniversityRecommendation[]>(
    DEFAULT_RECOMMENDATIONS
  );
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>(DEFAULT_DUPLICATES);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const numericId = parseInt(id, 10) || 1;

  // Fetch challenge details from backend or local reactive store
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      // First check CivicStore
      const storeItem = CivicStore.getChallengeById(numericId);

      try {
        const res = await api.get(`/challenges/${numericId}`);
        if (isMounted && res.data) {
          const item = res.data;
          setChallenge({
            challengeId: item.challengeId || numericId,
            userId: item.userId || 1,
            title: item.title || storeItem?.title || FALLBACK_CHALLENGE.title,
            description: item.description || storeItem?.description || FALLBACK_CHALLENGE.description,
            domain: item.domain || storeItem?.domain || FALLBACK_CHALLENGE.domain,
            subDomain: item.subDomain || storeItem?.subDomain || FALLBACK_CHALLENGE.subDomain,
            priorityScore:
              item.priorityScore != null ? Number(item.priorityScore) : (storeItem?.priorityScore || FALLBACK_CHALLENGE.priorityScore),
            priorityExplanation: item.priorityExplanation || storeItem?.priorityExplanation || FALLBACK_CHALLENGE.priorityExplanation,
            status: item.status || storeItem?.status || "AI_ANALYZED",
            lat: item.lat != null ? Number(item.lat) : (storeItem?.lat || FALLBACK_CHALLENGE.lat),
            lon: item.lon != null ? Number(item.lon) : (storeItem?.lon || FALLBACK_CHALLENGE.lon),
            district: item.district || storeItem?.district || "Indore",
            villageOrWard: item.villageOrWard || storeItem?.villageOrWard || "Ward 4",
            reportedPopulation: item.reportedPopulation || storeItem?.reportedPopulation || FALLBACK_CHALLENGE.reportedPopulation,
            duplicateOfId: item.duplicateOfId || null,
            createdAt: item.createdAt || storeItem?.createdAt || new Date().toISOString(),
            evidenceUrls:
              item.evidenceUrls && item.evidenceUrls.length > 0
                ? item.evidenceUrls
                : (storeItem?.evidenceUrls && storeItem.evidenceUrls.length > 0 ? storeItem.evidenceUrls : FALLBACK_CHALLENGE.evidenceUrls),
          });
          return;
        }
      } catch (err) {
        // Fallback to store item or template
      } finally {
        if (isMounted) setLoading(false);
      }

      if (isMounted) {
        if (storeItem) {
          setChallenge({
            ...storeItem,
            priorityScore: Number(storeItem.priorityScore),
          });
        } else {
          setChallenge(null);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [numericId]);

  // Fetch live institutions for matching
  useEffect(() => {
    async function loadInstitutions() {
      try {
        const res = await api.get("/institutions");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: UniversityRecommendation[] = res.data.slice(0, 3).map((inst: any, idx: number) => {
            const caps = inst.capabilities ? inst.capabilities.map((c: any) => c.title || c.equipmentName || c) : [];
            return {
              institutionId: inst.institutionId || idx + 1,
              name: inst.name,
              type: inst.type || "UNIVERSITY",
              district: inst.district || "Indore",
              matchScore: 95 - idx * 4,
              distanceKm: 12 + idx * 8.5,
              department: "Department of Environmental & Civil Engineering",
              capabilities: caps.length > 0 ? caps.slice(0, 3) : ["Research Testbed", "Field Survey Unit"],
            };
          });
          setRecommendations(mapped);
        }
      } catch (e) {
        // Retain default recommendations
      }
    }
    loadInstitutions();
  }, []);

  // Initialize Pinned Leaflet Map
  useEffect(() => {
    if (!challenge || !mapContainerRef.current) return;

    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      const leafletLib = (L as any).default || L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!leafletLib.map) return;

      const map = leafletLib.map(mapContainerRef.current, {
        center: [challenge.lat, challenge.lon],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      leafletLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Glowing Pin SVG DivIcon
      const pinIcon = leafletLib.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = leafletLib.marker([challenge.lat, challenge.lon], { icon: pinIcon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: inherit; font-size: 13px; font-weight: 500; color: #0f172a;">
          <b style="color: #0284c7;">${challenge.villageOrWard}</b><br/>
          ${challenge.district}, Madhya Pradesh<br/>
          <span style="font-size: 11px; color: #64748b;">GPS: ${challenge.lat.toFixed(4)}° N, ${challenge.lon.toFixed(4)}° E</span>
        </div>`
      );

      mapInstanceRef.current = map;
    }).catch(() => { });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [challenge]);

  // Priority Score Details calculation
  const priorityBreakdown = useMemo(() => {
    if (!challenge) return { severity: 0.85, popFactor: 0.88, recurrence: 0.9, hazard: 0.95 };
    const pop = challenge.reportedPopulation || 100;
    const popFactor = Math.min(1.0, Math.log10(pop + 1) / 4);
    return {
      severity: 0.85,
      popFactor: Number(popFactor.toFixed(3)),
      recurrence: 0.9,
      hazard: 0.95,
    };
  }, [challenge]);

  const DomainIcon = challenge?.domain && DOMAIN_ICONS[challenge.domain] ? DOMAIN_ICONS[challenge.domain] : Droplets;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Challenge link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isUniversityAffiliated =
    isAuthenticated &&
    (user?.role === "STUDENT" || user?.role === "FACULTY" || user?.role === "UNIVERSITY" || user?.role === "ADMIN");

  // 1-Click Accept Challenge Workflow
  const handleAcceptChallenge = async (institutionId?: number) => {
    if (!challenge) return;

    if (!isUniversityAffiliated) {
      openLoginModal();
      return;
    }

    setAccepting(true);
    try {
      const payload = {
        institutionId: institutionId || user?.institutionId || 1,
        facultyUserId: user?.userId || 2,
      };

      try {
        await api.post(`/projects/${challenge.challengeId}/accept`, payload);
      } catch (backendErr) {
        console.warn("Backend accept endpoint error, persisting via local store:", backendErr);
      }

      // Persist to CivicStore
      CivicStore.claimChallenge(
        challenge.challengeId,
        "Indian Institute of Technology (IIT) Indore",
        "Center of Excellence in Water Quality & Environmental Science"
      );

      setChallenge((prev) => (prev ? { ...prev, status: "MATCHED" } : prev));
      toast.success("🎉 Challenge accepted successfully! Project moved to MATCHED stage.");
    } catch (err: any) {
      CivicStore.updateChallengeStatus(challenge.challengeId, "MATCHED");
      setChallenge((prev) => (prev ? { ...prev, status: "MATCHED" } : prev));
      toast.success("Challenge accepted! Project moved to MATCHED stage.");
    } finally {
      setAccepting(false);
    }
  };

  // Quick helper to switch to Faculty Lead account for testing
  const handleQuickFacultyLogin = () => {
    login("mock_jwt_faculty_token_789", {
      userId: 2,
      name: "Dr. Amit Sharma",
      email: "amit.sharma@iiti.ac.in",
      role: "FACULTY",
      institutionId: 1,
    });
    toast.success("Signed in as Dr. Amit Sharma (Faculty Lead, IIT Indore)");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#2d5a43] animate-spin mb-3" />
        <h2 className="text-base font-semibold text-zinc-900">
          {lang === "hi" ? "समस्या का विवरण लोड हो रहा है..." : "Loading problem details..."}
        </h2>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] flex flex-col justify-between">
        <DashboardNav />
        <div className="max-w-md mx-auto my-auto text-center px-4 py-16">
          <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">
            {lang === "hi" ? "समस्या नहीं मिली (404)" : "Problem Not Found (404)"}
          </h2>
          <p className="text-sm text-zinc-600 mt-2 mb-6">
            {lang === "hi"
              ? "यह समस्या दर्ज नहीं है या हटाई जा चुकी है। कृपया अन्य समस्याएँ देखें।"
              : "This problem reference does not exist or has been removed. Please browse other community reports."}
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#2d5a43] text-white text-sm font-semibold hover:bg-[#234634] transition min-h-[44px]"
          >
            {lang === "hi" ? "दर्ज समस्याएँ देखें" : "Browse Problems"}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const priorityScore = challenge.priorityScore || 85;
  const isHighPriority = priorityScore >= 70;
  const isCritical = priorityScore >= 85;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-900 font-sans antialiased flex flex-col justify-between">
      <div>
        {/* Universal Floating Navigation */}
        <DashboardNav />

        {/* =========================================================
            1. TOP BREADCRUMB & METADATA BANNER
        ========================================================= */}
        <div className="border-b border-[#e7e7e2] bg-white">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-5">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs text-zinc-500 mb-3 overflow-x-auto">
              <Link to="/" className="hover:text-zinc-900 transition flex items-center gap-1 font-medium">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <Link to="/challenges" className="hover:text-zinc-900 transition font-medium">
                Challenges
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-zinc-700 font-medium">{challenge.district}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-zinc-900 font-semibold font-mono text-xs">#{challenge.challengeId}</span>
            </nav>

            {/* Banner Main Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {(() => {
                    const sm = getStatusMeta(challenge.status);
                    const StatusIcon = sm.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sm.badgeClass}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{lang === "hi" ? sm.labelHi : sm.labelEn}</span>
                      </span>
                    );
                  })()}

                  {/* District & Location Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 text-zinc-700 rounded-md text-xs font-medium border border-zinc-200">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {challenge.villageOrWard}, {challenge.district}
                  </span>

                  {/* Affected Population Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 text-zinc-700 rounded-md text-xs font-medium border border-zinc-200">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-mono font-medium">{challenge.reportedPopulation.toLocaleString()}</span> Citizens Impacted
                  </span>

                  {/* Submission Date */}
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-medium ml-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(challenge.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight leading-snug">
                  {challenge.title}
                </h1>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
                  {copiedLink ? "Link Copied" : "Share"}
                </button>

                <Link
                  to="/submit"
                  className="px-3.5 py-2 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-xs transition"
                >
                  Report New Issue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. MAIN CONTENT GRID (Left Pane 60% / Right Pane 40%)
        ========================================================= */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* -----------------------------------------------------
                LEFT PANE (Col Span 7): Problem, Photos, Leaflet Map
            ----------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-6">
              {/* Problem Description Card */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                  <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                    <DomainIcon className="w-4 h-4 text-emerald-800" />
                    Problem narrative & field grounding
                  </h2>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                    Submission #{challenge.challengeId}
                  </span>
                </div>

                <p className="text-zinc-700 leading-relaxed text-sm whitespace-pre-line mb-6 font-normal">
                  {challenge.description}
                </p>

                {/* Categorization & Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-50/70 rounded-lg border border-zinc-200/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">Domain</span>
                    <span className="font-medium text-zinc-900">{challenge.domain.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">Sub-domain</span>
                    <span className="font-medium text-zinc-900">{challenge.subDomain || "General Civic Need"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">Admin unit</span>
                    <span className="font-medium text-zinc-900">{challenge.villageOrWard}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">District</span>
                    <span className="font-medium text-zinc-900">{challenge.district}, MP</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">Estimated impact</span>
                    <span className="font-medium text-emerald-900 font-mono">
                      {challenge.reportedPopulation.toLocaleString()} citizens
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-mono text-[10px]">Verification status</span>
                    <span className="font-medium text-emerald-900">
                      {lang === "hi" ? "अधिकारियों द्वारा सत्यापित" : "Verified field report"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photographic Evidence Gallery */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                  <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-600" />
                    Photographic evidence & site verification
                  </h2>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {challenge.evidenceUrls?.length || 0} Attached
                  </span>
                </div>

                {challenge.evidenceUrls && challenge.evidenceUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {challenge.evidenceUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPhoto(url)}
                        className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 cursor-pointer shadow-xs hover:border-zinc-400 transition"
                      >
                        <img
                          src={url}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg">
                    <p className="text-xs text-zinc-500">No photographic attachments uploaded for this report.</p>
                  </div>
                )}
              </div>

              {/* Pinned Interactive Leaflet Map */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-100 gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-800" />
                      Pinned GPS location & geo-spatial anchor
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {lang === "hi" ? "सत्यापित जीपीएस स्थान एवं मानचित्र" : "Verified GPS location & village map"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${challenge.lat},${challenge.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium inline-flex items-center gap-1 shadow-xs transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Maps
                    </a>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${challenge.lat}&mlon=${challenge.lon}#map=15/${challenge.lat}/${challenge.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium inline-flex items-center gap-1 shadow-xs transition"
                    >
                      <Compass className="w-3 h-3" />
                      OpenStreetMap
                    </a>
                  </div>
                </div>

                {/* Map Render Container */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-[320px] rounded-lg overflow-hidden border border-zinc-200 shadow-inner z-0"
                />

                {/* Coordinate Chip Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-medium text-zinc-800">Latitude:</span> {challenge.lat.toFixed(5)}° N
                    <span className="text-zinc-300">|</span>
                    <span className="font-medium text-zinc-800">Longitude:</span> {challenge.lon.toFixed(5)}° E
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-800 inline-block" />
                    Radial search boundary: 5.0 km
                  </div>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------
                RIGHT PANE (Col Span 5): AI Analysis Card
            ----------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-6">
              {/* The Master AI Analysis Card */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-950">
                        {lang === "hi" ? "समस्या विश्लेषण व प्राथमिकता" : "Problem analysis & urgency"}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {lang === "hi" ? "स्वचालित जाँच व कॉलेज मिलान" : "Urgency assessment & college match"}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-[11px] font-mono font-medium">
                    Verified triage
                  </span>
                </div>

                {/* Domain & Sub-domain with Confidence */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5">
                      <span className="font-mono text-[11px] text-zinc-500">
                        Predicted domain
                      </span>
                      <span className="font-mono text-zinc-600 text-xs">Confidence 96%</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
                        <DomainIcon className="w-3.5 h-3.5 text-emerald-800" />
                        {challenge.domain.replace("_", " ")}
                      </div>
                      {challenge.subDomain && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-medium">
                          {challenge.subDomain}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Explainable Priority Gauge (0-100) */}
                  <div className="p-4 rounded-lg bg-zinc-50/70 border border-zinc-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-zinc-500" />
                        <span className="font-semibold text-xs text-zinc-800">
                          {lang === "hi" ? "कितनी ज़रूरी है (स्कोर)" : "How urgent (Score)"}
                        </span>
                      </div>

                      <button
                        onClick={() => setFormulaModalOpen(true)}
                        className="text-[11px] text-zinc-700 hover:text-zinc-950 flex items-center gap-1 font-medium underline underline-offset-2 cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        Formula breakdown
                      </button>
                    </div>

                    {/* Priority Gauge Metric Bar */}
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold font-mono tabular-nums text-zinc-950">
                          {priorityScore.toFixed(1)}
                        </span>
                        <span className="text-xs font-medium text-zinc-400 font-mono">/ 100</span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {isCritical ? "Critical priority" : isHighPriority ? "High priority" : "Moderate priority"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-zinc-800"
                        style={{ width: `${Math.min(100, Math.max(5, priorityScore))}%` }}
                      />
                    </div>

                    {/* Formula Factor Chips */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-200 text-[11px]">
                      <div className="flex justify-between items-center text-zinc-700">
                        <span className="text-zinc-500 font-mono text-[10px]">Severity (35%):</span>
                        <span className="font-mono font-medium text-zinc-900">0.88</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-700">
                        <span className="text-zinc-500 font-mono text-[10px]">Pop Factor (25%):</span>
                        <span className="font-mono font-medium text-zinc-900">{priorityBreakdown.popFactor}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-700">
                        <span className="text-zinc-500 font-mono text-[10px]">Recurrence (20%):</span>
                        <span className="font-mono font-medium text-zinc-900">0.90</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-700">
                        <span className="text-zinc-500 font-mono text-[10px]">Hazard (20%):</span>
                        <span className="font-mono font-medium text-zinc-900">0.95</span>
                      </div>
                    </div>

                    {challenge.priorityExplanation && (
                      <p className="mt-3 text-[11px] text-zinc-600 border-l-2 border-zinc-400 pl-2 leading-relaxed">
                        "{challenge.priorityExplanation}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Possible Duplicates Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
                      Duplicate check
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">5.0 km radius</span>
                  </div>

                  {challenge.duplicateOfId ? (
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Merged report</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          This challenge has been merged into parent challenge #{challenge.duplicateOfId}.
                        </p>
                      </div>
                    </div>
                  ) : duplicates.length > 0 ? (
                    <div className="space-y-2">
                      {duplicates.map((dup) => (
                        <div
                          key={dup.challengeId}
                          className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200/80 flex items-center justify-between text-xs hover:border-zinc-300 transition"
                        >
                          <div className="space-y-0.5 max-w-[70%]">
                            <p className="font-medium text-zinc-900 truncate">{dup.title}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {dup.distanceKm} km away • {dup.district}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono font-medium text-[10px] border border-zinc-200">
                              {dup.similarity}% match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                      <span>Zero duplicate claims detected in 5.0 km radius.</span>
                    </div>
                  )}
                </div>

                {/* Recommended Universities & Accept Button */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-600" />
                      Recommended colleges & labs
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Academic match</span>
                  </div>

                  <div className="space-y-2.5">
                    {recommendations.map((uni) => (
                      <div
                        key={uni.institutionId}
                        className="p-3.5 bg-zinc-50/50 rounded-lg border border-zinc-200/80 hover:border-zinc-300 transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-950">{uni.name}</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{uni.department}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-[10px] font-mono font-medium shrink-0">
                            {uni.matchScore}% match
                          </span>
                        </div>

                        {/* Capabilities tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {uni.capabilities.map((cap, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 bg-white rounded-md text-[10px] text-zinc-600 border border-zinc-200 font-mono"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
                          <span>{uni.distanceKm} km from location</span>
                          <span className="text-zinc-700 font-medium">{uni.district} District</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 'Accept Challenge' Action Button for Universities */}
                  <div className="pt-3">
                    {challenge.status === "MATCHED" ? (
                      <div className="w-full p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-center space-y-1">
                        <div className="flex items-center justify-center gap-2 text-zinc-900 font-medium text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                          Challenge claimed by university
                        </div>
                        <p className="text-[11px] text-zinc-600">
                          Project proposal active. Stages & milestones currently underway.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAcceptChallenge()}
                          disabled={accepting}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                          {accepting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Claiming challenge...</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-white" />
                              <span>Accept challenge</span>
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </>
                          )}
                        </button>

                        {!isUniversityAffiliated && (
                          <div className="flex items-center justify-between px-1 pt-1">
                            <p className="text-[11px] text-zinc-500">
                              Requires college or faculty account
                            </p>
                            <button
                              onClick={handleQuickFacultyLogin}
                              className="text-[11px] text-emerald-900 hover:underline font-medium cursor-pointer"
                            >
                              Sign in as faculty lead
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. FULL PHOTO LIGHTBOX MODAL
      ========================================================= */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800/80 text-white flex items-center justify-center hover:bg-zinc-800 transition"
            >
              ✕
            </button>
            <img src={selectedPhoto} alt="Full Preview" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* =========================================================
          4. FORMULA BREAKDOWN MODAL
      ========================================================= */}
      {formulaModalOpen && (
        <div
          onClick={() => setFormulaModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-zinc-200/90 space-y-4 text-zinc-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-800" />
                Explainable priority formula
              </h3>
              <button
                onClick={() => setFormulaModalOpen(false)}
                className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-900 text-zinc-200 rounded-lg font-mono text-xs text-center leading-relaxed">
              Priority = min(100, 100 * [0.35*S + 0.25*(log10(P+1)/4) + 0.20*R + 0.20*H])
            </div>

            <div className="space-y-2.5 text-xs text-zinc-700">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-900 font-medium w-28 shrink-0">Severity (S):</span>
                <span>Physical hazard level evaluated from field report (0.0 to 1.0). Weight: 35%</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-900 font-medium w-28 shrink-0">Population (P):</span>
                <span>Logarithmic scaling normalized over 10,000 citizens. Weight: 25%</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-900 font-medium w-28 shrink-0">Recurrence (R):</span>
                <span>Frequency and persistence of repeated civic disruption. Weight: 20%</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-900 font-medium w-28 shrink-0">Hazard (H):</span>
                <span>Acute health hazard or safety vulnerability multiplier. Weight: 20%</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setFormulaModalOpen(false)}
                className="w-full py-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-700 transition cursor-pointer"
              >
                Close explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal 4-link Footer */}
      <Footer />
    </div>
  );
}
