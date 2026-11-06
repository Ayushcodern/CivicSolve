import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Landmark,
  Download,
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { DashboardNav } from "../../components/DashboardNav";
import { useAuth } from "../../context/AuthContext";
import { Footer } from "../../components/Footer";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/dashboard/government")({
  component: GovernmentDashboardPage,
});

interface SummaryData {
  totalChallenges: number;
  activeProjects: number;
  deployedSolutions: number;
  districts: number;
  timestamp: string;
}

interface DistrictHeatmapItem {
  district: string;
  challengeCount: number;
  avgPriorityScore: number;
  centerLat: number;
  centerLon: number;
}

interface DomainBreakdownItem {
  domain: string;
  count: number;
  percentage: number;
}

const SEED_SUMMARY: SummaryData = {
  totalChallenges: 142,
  activeProjects: 38,
  deployedSolutions: 19,
  districts: 14,
  timestamp: new Date().toISOString(),
};

const SEED_DISTRICTS: DistrictHeatmapItem[] = [
  { district: "Indore", challengeCount: 42, avgPriorityScore: 84.2, centerLat: 22.7196, centerLon: 75.8577 },
  { district: "Bhopal", challengeCount: 31, avgPriorityScore: 78.6, centerLat: 23.2599, centerLon: 77.4126 },
  { district: "Ujjain", challengeCount: 19, avgPriorityScore: 72.1, centerLat: 23.1765, centerLon: 75.7885 },
  { district: "Dhar", challengeCount: 15, avgPriorityScore: 81.3, centerLat: 22.5986, centerLon: 75.2952 },
  { district: "Jabalpur", challengeCount: 14, avgPriorityScore: 69.4, centerLat: 23.1815, centerLon: 79.9864 },
  { district: "Gwalior", challengeCount: 12, avgPriorityScore: 75.0, centerLat: 26.2183, centerLon: 78.1828 },
  { district: "Khargone", challengeCount: 9, avgPriorityScore: 82.8, centerLat: 21.8236, centerLon: 75.6128 },
];

const SEED_DOMAINS: DomainBreakdownItem[] = [
  { domain: "WATER_SANITATION", count: 52, percentage: 36.6 },
  { domain: "ROAD_INFRASTRUCTURE", count: 38, percentage: 26.8 },
  { domain: "PUBLIC_HEALTH", count: 22, percentage: 15.5 },
  { domain: "AGRICULTURE", count: 18, percentage: 12.7 },
  { domain: "POWER", count: 12, percentage: 8.4 },
];

function GovernmentDashboardPage() {
  const { user, login } = useAuth();
  const role = user?.role || "ADMIN";
  const [summary, setSummary] = useState<SummaryData>(SEED_SUMMARY);
  const [districts, setDistricts] = useState<DistrictHeatmapItem[]>(SEED_DISTRICTS);
  const [domains, setDomains] = useState<DomainBreakdownItem[]>(SEED_DOMAINS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictHeatmapItem | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchAnalytics() {
      try {
        const [sumRes, distRes, domRes] = await Promise.all([
          api.get("/analytics/summary").catch(() => ({ data: SEED_SUMMARY })),
          api.get("/analytics/district-distribution").catch(() => ({ data: SEED_DISTRICTS })),
          api.get("/analytics/domain-breakdown").catch(() => ({ data: SEED_DOMAINS })),
        ]);

        if (isMounted) {
          if (sumRes.data) setSummary(sumRes.data);
          if (Array.isArray(distRes.data) && distRes.data.length > 0) setDistricts(distRes.data);
          if (Array.isArray(domRes.data) && domRes.data.length > 0) setDomains(domRes.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize District Choropleth / Bubble Heatmap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      const leafletLib = (L as any).default || L;
      if (!leafletLib.map) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Centered on Madhya Pradesh geographic heartland
      const map = leafletLib.map(mapContainerRef.current, {
        center: [23.2599, 76.85],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      leafletLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Render District Heat Circles
      districts.forEach((d) => {
        const isHighRisk = d.avgPriorityScore >= 80;
        const color = isHighRisk ? "#ef4444" : d.avgPriorityScore >= 70 ? "#f59e0b" : "#10b981";
        const radius = Math.max(16, Math.min(36, d.challengeCount * 1.2));

        const circle = leafletLib.circleMarker([d.centerLat, d.centerLon], {
          radius: radius,
          fillColor: color,
          color: "#ffffff",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.7,
        }).addTo(map);

        circle.bindPopup(
          `<div style="font-family: inherit; font-size: 13px; font-weight: 500; color: #0f172a;">
            <b style="font-size: 14px; color: ${color};">${d.district} District</b><br/>
            <span>Reported Issues: <b>${d.challengeCount}</b></span><br/>
            <span>Avg Priority Score: <b>${d.avgPriorityScore.toFixed(1)} / 100</b></span>
          </div>`
        );

        circle.on("click", () => {
          setSelectedDistrict(d);
        });
      });

      mapInstanceRef.current = map;
    }).catch(() => {});

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [districts]);

  // Export Executive Analytics CSV
  const handleExportCSV = () => {
    try {
      const headers = "District,Challenge Count,Average Priority Score,Latitude,Longitude\n";
      const rows = districts
        .map((d) => `"${d.district}",${d.challengeCount},${d.avgPriorityScore},${d.centerLat},${d.centerLon}`)
        .join("\n");

      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `civicsolve-district-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Executive district analytics exported to CSV successfully!");
    } catch (e) {
      toast.error("Failed to generate export file.");
    }
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
                  <Landmark className="w-4 h-4 text-zinc-500" />
                  <span>State executive dashboard</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                  Government Intelligence & Analytics
                </h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Spatial district distribution, priority triage metrics, and university project deployment tracking.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-xs sm:text-sm shadow-xs transition shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export analytics CSV
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 space-y-8">
          {role === "CITIZEN" || role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY" ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center max-w-lg mx-auto shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 grid place-items-center mx-auto">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-950">
                District administration clearance required
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your active session is signed in as <b>{role === "STUDENT" ? "Student Researcher" : role === "FACULTY" ? "Academic Researcher" : "Citizen"}</b>. Executive spatial heatmaps, priority triage counters, and district project deployment tracking are restricted to District Magistrates and State Government Officers.
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
          ) : (
            <>
              {/* =========================================================
                  1. KPI COUNTERS GRID
              ========================================================= */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 block">
                    Total challenges reported
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-mono tabular-nums">
                      {summary.totalChallenges}
                    </span>
                    <span className="text-xs font-medium text-emerald-800">+14% this month</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Crowdsourced via citizen intake</p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 block">
                    Active university projects
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-mono tabular-nums">
                      {summary.activeProjects}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Across 8 colleges</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">In prototype, lab testing & pilot</p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 block">
                    Deployed solutions
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-mono tabular-nums">
                      {summary.deployedSolutions}
                    </span>
                    <span className="text-xs font-mono text-emerald-800">Field verified</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Permanently solving ground issues</p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 block">
                    Districts covered
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-mono tabular-nums">
                      {summary.districts}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">of 55 in MP</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">District geographic coverage</p>
                </div>
              </div>

              {/* =========================================================
                  2. INTERACTIVE DISTRICT HEATMAP
              ========================================================= */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-800" />
                      Madhya Pradesh district distribution map
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Circle sizes reflect problem concentration; color markers denote urgency priority score.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical (&gt;80)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> High (70-79)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Moderate (&lt;70)
                    </span>
                  </div>
                </div>

                <div
                  ref={mapContainerRef}
                  className="w-full h-[400px] rounded-lg overflow-hidden border border-zinc-200 shadow-inner z-0"
                />

                {selectedDistrict && (
                  <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-sm text-zinc-950">{selectedDistrict.district} District</span>
                      <p className="text-zinc-600 font-normal">
                        {selectedDistrict.challengeCount} reported issues • Average priority: {selectedDistrict.avgPriorityScore.toFixed(1)}/100
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-white rounded-md border border-zinc-200 font-mono text-zinc-700">
                      Anchor: {selectedDistrict.centerLat.toFixed(2)}°N, {selectedDistrict.centerLon.toFixed(2)}°E
                    </span>
                  </div>
                )}
              </div>

              {/* =========================================================
                  3. DOMAIN BREAKDOWN & CATEGORICAL PERCENTAGES
              ========================================================= */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-zinc-600" />
                      Categorical domain breakdown
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Proportionate distribution of community challenges by domain.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {domains.map((dom) => (
                    <div key={dom.domain} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-900 font-medium">{dom.domain.replace("_", " ")}</span>
                        <span className="font-mono text-zinc-600">
                          {dom.count} reports ({dom.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-zinc-800 rounded-full transition-all duration-500"
                          style={{ width: `${dom.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default GovernmentDashboardPage;
