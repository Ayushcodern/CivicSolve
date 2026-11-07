import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  Mail,
  ArrowRight,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import { INSTITUTIONS_DATA, Institution } from "../../lib/store";
import { DashboardNav } from "../../components/DashboardNav";
import { useLanguage } from "../../context/LanguageContext";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/institutions/")({
  head: () => ({
    meta: [
      { title: "Partner Universities & Research Labs — CivicSolve" },
      {
        name: "description",
        content:
          "Directory of accredited university departments, research labs, and faculty mentors across Madhya Pradesh adopting civic challenges.",
      },
    ],
  }),
  component: InstitutionsPage,
});

const TYPE_LABELS: Record<string, string> = {
  CENTRAL_INSTITUTE: "National Institute",
  STATE_AUTONOMOUS: "State Autonomous Institute",
  CENTRAL_NIT: "NIT / Central University",
  STATE_UNIVERSITY: "State Multidisciplinary University",
  STATE_TECHNICAL_UNIVERSITY: "State Technical University",
  STATE_AGRICULTURAL_UNIVERSITY: "Agricultural University",
};

function InstitutionsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");

  const cities = useMemo(() => {
    const list = Array.from(new Set(INSTITUTIONS_DATA.map((i) => i.district))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, []);

  const filteredInstitutions = useMemo(() => {
    return INSTITUTIONS_DATA.filter((item) => {
      const matchesType = selectedType === "ALL" || item.type === selectedType;
      const matchesCity = selectedCity === "ALL" || item.district === selectedCity;
      const query = search.toLowerCase().trim();
      const matchesQuery =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.shortName.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.departments.some((d) => d.toLowerCase().includes(query)) ||
        item.capabilities.some((c) => c.toLowerCase().includes(query));
      return matchesType && matchesCity && matchesQuery;
    });
  }, [search, selectedType, selectedCity]);

  const totalProjects = useMemo(() => {
    return INSTITUTIONS_DATA.reduce((sum, item) => sum + item.activeProjects, 0);
  }, []);

  const totalCompleted = useMemo(() => {
    return INSTITUTIONS_DATA.reduce((sum, item) => sum + item.completedProjects, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-900 font-sans antialiased flex flex-col">
      {/* Global Navigation */}
      <DashboardNav />

      {/* Official Government Pilot Context Bar */}
      <div className="border-b border-zinc-200/80 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-2 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="font-mono text-[11px] text-zinc-700">
              Government of Madhya Pradesh · Department of Higher Education & Science & Tech
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-zinc-600 hover:text-zinc-950 font-medium transition">
              ← Home
            </Link>
            <Link to="/challenges" className="text-zinc-600 hover:text-zinc-950 font-medium transition">
              Challenge registry
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-zinc-200/80 bg-white py-12">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="font-mono text-[11px]">Academic Solution Network</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
                  Partner Universities & Research Labs
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
                  Accredited engineering departments, analytical laboratories, and faculty mentors across Madhya Pradesh participating in student capstone problem-solving.
                </p>
              </div>

              {/* Metrics Counter Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-2xs text-left">
                  <div className="font-mono text-[11px] text-zinc-500">
                    Institutions
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">
                    {INSTITUTIONS_DATA.length}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-2xs text-left">
                  <div className="font-mono text-[11px] text-zinc-500">
                    Active pilots
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-emerald-800 mt-1">
                    {totalProjects}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-2xs text-left">
                  <div className="font-mono text-[11px] text-zinc-500">
                    Completed
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">
                    {totalCompleted}
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Region Filter Controls */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by institute name, department, or capability (e.g., Water Quality, GIS, IoT)..."
                  className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-500 shadow-2xs font-medium cursor-pointer"
                >
                  <option value="ALL">All regions</option>
                  {cities
                    .filter((c) => c !== "ALL")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c} District
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Cards Grid */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 font-mono">
            <span>Showing {filteredInstitutions.length} accredited laboratories</span>
            <span>Statewide coverage</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInstitutions.map((inst) => {
              return (
                <div
                  key={inst.institutionId}
                  className="rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 shadow-2xs transition-colors p-6 flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                      <div>
                        <span className="text-xs font-semibold text-zinc-600 block mb-1">
                          {TYPE_LABELS[inst.type] || inst.type}
                        </span>
                        <h3 className="text-lg font-semibold text-zinc-950 leading-snug">
                          {inst.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span>{inst.city}, Madhya Pradesh</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-2xl font-semibold font-mono tabular-nums text-zinc-950">
                          {inst.activeProjects}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Active pilots
                        </div>
                      </div>
                    </div>

                    {/* Departments Section */}
                    <div className="pt-4 space-y-3">
                      <div>
                        <h4 className="text-xs text-zinc-800 font-semibold mb-2 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Engaged departments</span>
                        </h4>
                        <ul className="space-y-1">
                          {inst.departments.map((dept, idx) => (
                            <li key={idx} className="text-xs text-zinc-700 flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 shrink-0" />
                              <span>{dept}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Capabilities Section */}
                      <div className="pt-2">
                        <h4 className="text-xs text-zinc-800 font-semibold mb-2 flex items-center gap-1.5">
                          <FlaskConical className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Specialized lab capabilities</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {inst.capabilities.map((cap, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-zinc-50 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-md"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-6 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <a
                      href={`mailto:${inst.contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-mono">{inst.contactEmail}</span>
                    </a>

                    <Link
                      to="/challenges"
                      className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:text-emerald-800 transition-colors"
                    >
                      <span>Assigned challenges</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
