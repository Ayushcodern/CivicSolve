import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Search,
  Download,
  Building2,
  Droplets,
  Route as RoadIcon,
  HeartPulse,
  Sprout,
  Trash2,
  Zap,
} from "lucide-react";
import { CivicStore, ImpactLedgerEntry } from "../lib/store";
import { toast } from "sonner";
import { DashboardNav } from "../components/DashboardNav";
import { useLanguage } from "../context/LanguageContext";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Public Impact Ledger — CivicSolve" },
      {
        name: "description",
        content:
          "Publicly verifiable audit ledger of completed university and industry engineering interventions across Madhya Pradesh.",
      },
    ],
  }),
  component: ImpactLedgerPage,
});

const DOMAIN_ICONS: Record<string, any> = {
  WATER: Droplets,
  ROAD_INFRASTRUCTURE: RoadIcon,
  SANITATION: Trash2,
  AGRICULTURE: Sprout,
  PUBLIC_HEALTH: HeartPulse,
  POWER: Zap,
};

function ImpactLedgerPage() {
  const { lang } = useLanguage();
  const [entries, setEntries] = useState<ImpactLedgerEntry[]>(CivicStore.getImpactLedger());
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  const districts = useMemo(() => {
    const list = Array.from(new Set(entries.map((e) => e.district))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesDomain = selectedDomain === "ALL" || e.domain === selectedDomain;
      const matchesDistrict = selectedDistrict === "ALL" || e.district === selectedDistrict;
      const query = search.toLowerCase().trim();
      const matchesQuery =
        query === "" ||
        e.title.toLowerCase().includes(query) ||
        e.partnerUniversity.toLowerCase().includes(query) ||
        e.verifiedBy.toLowerCase().includes(query) ||
        e.district.toLowerCase().includes(query);
      return matchesDomain && matchesDistrict && matchesQuery;
    });
  }, [entries, selectedDomain, selectedDistrict, search]);

  const totalBeneficiaries = useMemo(() => {
    return entries.reduce((acc, curr) => acc + (curr.beneficiaries || 0), 0);
  }, [entries]);

  const handleExportCSV = () => {
    const headers = "ID,ChallengeID,Title,District,Domain,University,Baseline,Outcome,Beneficiaries,VerifiedBy,Date\n";
    const rows = entries
      .map(
        (e) =>
          `"${e.id}","${e.challengeId}","${e.title}","${e.district}","${e.domain}","${e.partnerUniversity}","${e.baselineMetric}","${e.outcomeMetric}","${e.beneficiaries}","${e.verifiedBy}","${e.verificationDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CivicSolve_Impact_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Impact ledger exported as CSV");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-900 font-sans antialiased flex flex-col">
      {/* Global Navigation */}
      <DashboardNav />

      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-zinc-200/80 bg-white py-12">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "सत्यापित ज़मीनी समाधान" : "Field-audited deployments"}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
                  {lang === "hi" ? "सत्यापित समाधान व असर बही" : "Verified Societal Impact Ledger"}
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
                  {lang === "hi"
                    ? "कॉलेज इंजीनियरिंग टीमों द्वारा पूरे किए गए ज़मीनी समाधान। प्रत्येक कार्य का गाँव में भौतिक परीक्षण व अधिकारियों द्वारा सत्यापन किया गया है।"
                    : "Publicly recorded engineering deployments. Every intervention undergoes physical field testing, community verification, and audit by district engineers."}
                </p>
              </div>

              {/* Metrics Counter Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs text-left">
                  <div className="text-xs text-zinc-500 font-medium">
                    {lang === "hi" ? "सत्यापित कार्य" : "Interventions"}
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">
                    {entries.length}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs text-left">
                  <div className="text-xs text-zinc-500 font-medium">
                    {lang === "hi" ? "लाभान्वित नागरिक" : "Beneficiaries"}
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">
                    {totalBeneficiaries.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs text-left">
                  <div className="text-xs text-zinc-500 font-medium">
                    {lang === "hi" ? "भौतिक सत्यापन" : "Field Verified"}
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[#2d5a43] mt-1">
                    100%
                  </div>
                </div>
              </div>
            </div>

            {/* Search, Filter & Export Toolbar */}
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    lang === "hi"
                      ? "शीर्षक, कॉलेज, ज़िला या सत्यापन अधिकारी खोजें..."
                      : "Search ledger by title, university, district, or verifying officer..."
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 shadow-2xs font-medium cursor-pointer"
                >
                  <option value="ALL">All districts</option>
                  {districts
                    .filter((d) => d !== "ALL")
                    .map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition cursor-pointer shadow-2xs shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Entries List */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-6">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Displaying {filteredEntries.length} verified audit records</span>
            <span>Recorded in Madhya Pradesh Public Ledger</span>
          </div>

          <div className="space-y-6">
            {filteredEntries.map((item) => {
              const DomainIcon = DOMAIN_ICONS[item.domain] || Droplets;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-400 transition-colors space-y-5"
                >
                  {/* Top Row: Meta info & Verification Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                        <DomainIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-[11px] font-medium text-zinc-500">
                            Record #{item.id}
                          </span>
                          <span className="text-zinc-300">·</span>
                          <span className="text-zinc-700 font-medium">
                            {item.district} District
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-950 mt-1 leading-snug">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Audited & certified</span>
                      </span>
                      <Link
                        to={`/challenges/${item.challengeId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 border border-zinc-200 rounded-md px-2.5 py-1 transition-colors bg-white hover:bg-zinc-50"
                      >
                        <span>Case dossier</span>
                        <ExternalLink className="h-3 w-3 text-zinc-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Quantitative Baseline vs Outcome Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 space-y-1">
                      <span className="font-mono text-[10px] text-zinc-500 block">
                        Baseline problem condition (pre-intervention)
                      </span>
                      <p className="text-xs sm:text-sm font-normal text-zinc-800 leading-relaxed">
                        {item.baselineMetric}
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-200/90 bg-emerald-50/30 p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-600 font-medium">
                          Measured field outcome (post-deployment)
                        </span>
                        <span className="font-mono text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {item.improvementPercentage}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-zinc-950 leading-relaxed">
                        {item.outcomeMetric}
                      </p>
                    </div>
                  </div>

                  {/* Evidence Photos (if provided) */}
                  {(item.photoBefore || item.photoAfter) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {item.photoBefore && (
                        <div className="rounded-lg overflow-hidden border border-zinc-200 relative aspect-video bg-zinc-100">
                          <img
                            src={item.photoBefore}
                            alt="Pre-intervention condition"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 bg-zinc-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                            Baseline condition
                          </span>
                        </div>
                      )}
                      {item.photoAfter && (
                        <div className="rounded-lg overflow-hidden border border-zinc-200 relative aspect-video bg-zinc-100">
                          <img
                            src={item.photoAfter}
                            alt="Deployed solution in field"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 bg-zinc-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                            Deployed solution in field
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Notes */}
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    <strong className="text-zinc-900 font-medium">Audit notes:</strong> {item.notes}
                  </p>

                  {/* Footer Metadata */}
                  <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-500 block">
                        Lead university lab
                      </span>
                      <span className="font-medium text-zinc-900">
                        {item.partnerUniversity}
                      </span>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-zinc-500 block">
                        Certified by
                      </span>
                      <span className="font-medium text-zinc-900">
                        {item.verifiedBy}
                      </span>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-zinc-500 block">
                        Verified beneficiaries
                      </span>
                      <span className="font-medium text-zinc-900 tabular-nums font-mono">
                        {item.verificationDate} · {item.beneficiaries.toLocaleString("en-IN")} citizens
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Universal 4-link Footer */}
      <Footer />
    </div>
  );
}
