import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  Users,
  GraduationCap,
} from "lucide-react";
import { CivicStore, Challenge } from "../../lib/store";
import { useLanguage, CATEGORIES } from "../../context/LanguageContext";
import { DashboardNav } from "../../components/DashboardNav";
import { Footer } from "../../components/Footer";

export const Route = createFileRoute("/challenges/")({
  head: () => ({
    meta: [
      { title: "समस्याएँ व समाधान — CivicSolve मध्य प्रदेश" },
      {
        name: "description",
        content:
          "मध्य प्रदेश के गाँवों से आई जन समस्याएँ, उनकी तात्कालिकता व कॉलेज छात्रों द्वारा बनाए जा रहे समाधान।",
      },
    ],
  }),
  component: ChallengesExplorerPage,
});

function ChallengesExplorerPage() {
  const { lang, t, getStatusMeta } = useLanguage();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [sortBy, setSortBy] = useState<"urgent" | "recent">("urgent");

  useEffect(() => {
    setChallenges(CivicStore.getChallenges());
  }, []);

  const districts = useMemo(() => {
    const list = Array.from(new Set(challenges.map((c) => c.district))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    return challenges
      .filter((c) => {
        const query = search.toLowerCase();
        const matchesSearch =
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.district.toLowerCase().includes(query) ||
          c.villageOrWard.toLowerCase().includes(query);

        const matchesCategory =
          selectedCategory === "ALL" ||
          c.domain === selectedCategory ||
          (selectedCategory === "WATER" && c.domain === "WATER_SANITATION");

        const matchesStatus =
          selectedStatus === "ALL" || c.status === selectedStatus;

        const matchesDistrict =
          selectedDistrict === "ALL" || c.district === selectedDistrict;

        return matchesSearch && matchesCategory && matchesStatus && matchesDistrict;
      })
      .sort((a, b) => {
        if (sortBy === "urgent") return b.priorityScore - a.priorityScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [challenges, search, selectedCategory, selectedStatus, selectedDistrict, sortBy]);

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-950 font-sans antialiased flex flex-col">
      <DashboardNav />

      <main className="flex-1">
        {/* Page Header */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-10 border-b border-zinc-200/70 bg-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
                {lang === "hi" ? "गाँवों से दर्ज समस्याएँ" : "Reported Community Problems"}
              </h1>
              <p className="text-sm text-zinc-600">
                {lang === "hi"
                  ? "मध्य प्रदेश के विभिन्न ज़िलों से नागरिकों द्वारा बताई गई समस्याएँ। इन पर कॉलेज छात्रों व अधिकारियों द्वारा काम किया जा रहा है।"
                  : "Community problems logged by citizens across Madhya Pradesh, assigned to college labs for engineered solutions."}
              </p>
            </div>

            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm shadow-2xs transition-colors min-h-[44px] cursor-pointer shrink-0"
              style={{ backgroundColor: "#2d5a43" }}
            >
              <span>+ {t.heroPrimaryBtn}</span>
            </Link>
          </div>

          {/* Search and Filters Bar */}
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-6 relative flex items-center">
                <Search className="absolute left-3.5 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    lang === "hi"
                      ? "गाँव, ज़िला या समस्या खोजें..."
                      : "Search by village, district, or problem..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-zinc-300 text-sm text-zinc-950 focus:border-zinc-400 outline-none shadow-2xs"
                />
              </div>

              {/* District Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2.5 min-h-[44px] rounded-xl border border-zinc-300 text-sm text-zinc-900 bg-white font-normal focus:border-zinc-400 outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">
                    {lang === "hi" ? "सभी ज़िले (All districts)" : "All districts"}
                  </option>
                  {districts
                    .filter((d) => d !== "ALL")
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 min-h-[44px] rounded-xl border border-zinc-300 text-sm text-zinc-900 bg-white font-normal focus:border-zinc-400 outline-none cursor-pointer shadow-2xs"
                >
                  <option value="urgent">
                    {lang === "hi" ? "सबसे ज़रूरी पहले (Most urgent)" : "Most urgent"}
                  </option>
                  <option value="recent">
                    {lang === "hi" ? "ताज़ा समस्याएँ (Most recent)" : "Most recent"}
                  </option>
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors min-h-[36px] cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-zinc-900 text-white shadow-2xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                {lang === "hi" ? "सभी विषय (All)" : "All Topics"}
              </button>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors min-h-[36px] cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-2xs"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{lang === "hi" ? cat.nameHi : cat.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Chips: Received -> Being checked -> Given to college -> Solved */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-medium text-zinc-500 mr-1 shrink-0">
                {lang === "hi" ? "स्थिति:" : "Status:"}
              </span>
              {[
                { key: "ALL", labelHi: "सभी", labelEn: "All" },
                { key: "SUBMITTED", labelHi: "प्राप्त (Received)", labelEn: "Received" },
                { key: "AI_ANALYZED", labelHi: "जाँच में (Checking)", labelEn: "Being checked" },
                { key: "MATCHED", labelHi: "कॉलेज को सौंपा", labelEn: "Given to college" },
                { key: "RESOLVED", labelHi: "हल हुआ (Solved)", labelEn: "Solved" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setSelectedStatus(st.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 transition-colors cursor-pointer min-h-[32px] ${
                    selectedStatus === st.key
                      ? "bg-zinc-900 text-white shadow-2xs"
                      : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {lang === "hi" ? st.labelHi : st.labelEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Challenge Cards Grid */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10">
          <div className="flex items-center justify-between mb-6 text-xs text-zinc-500 font-mono">
            <span>
              {lang === "hi"
                ? `${filteredChallenges.length} समस्याएँ दिखाई जा रही हैं`
                : `Showing ${filteredChallenges.length} of ${challenges.length} problems`}
            </span>
            {(selectedCategory !== "ALL" ||
              selectedStatus !== "ALL" ||
              selectedDistrict !== "ALL" ||
              search !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedStatus("ALL");
                  setSelectedDistrict("ALL");
                  setSearch("");
                }}
                className="text-zinc-700 hover:text-zinc-950 underline font-medium cursor-pointer"
              >
                {lang === "hi" ? "फ़िल्टर हटाएं" : "Reset filters"}
              </button>
            )}
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-2xs max-w-md mx-auto space-y-2">
              <Search className="h-6 w-6 text-zinc-400 mx-auto" />
              <h3 className="text-base font-semibold text-zinc-950">
                {lang === "hi" ? "कोई समस्या नहीं मिली" : "No matching problems found"}
              </h3>
              <p className="text-xs text-zinc-500">
                {lang === "hi"
                  ? "कृपया अलग शब्द लिखकर खोजें या फ़िल्टर हटाएँ।"
                  : "Try a different search term or reset filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChallenges.map((item) => {
                const statusMeta = getStatusMeta(item.status);
                const StatusIcon = statusMeta.icon;

                return (
                  <Link
                    key={item.challengeId}
                    to={`/challenges/${item.challengeId}`}
                    className="rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 p-5 shadow-2xs hover:shadow-xs flex flex-col justify-between transition-colors cursor-pointer group"
                  >
                    <div className="space-y-2.5">
                      {/* Top: Complaint ID and Status */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-xs font-semibold text-zinc-600">
                          #MP-CIVIC-{String(item.challengeId).padStart(4, "0")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${statusMeta.badgeClass}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{lang === "hi" ? statusMeta.labelHi : statusMeta.labelEn}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-zinc-950 leading-snug group-hover:text-emerald-900 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-zinc-600 line-clamp-3 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-zinc-100 space-y-3">
                      {/* Village and Population */}
                      <div className="flex items-center justify-between text-xs text-zinc-600">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-800 truncate max-w-[65%]">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            {item.villageOrWard}, {item.district}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 font-normal">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{item.reportedPopulation.toLocaleString("en-IN")} लोग</span>
                        </div>
                      </div>

                      {/* How Urgent (Urgency Index) */}
                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-normal">
                            {lang === "hi" ? "ज़रूरत स्तर:" : "Urgency level:"}
                          </span>
                          <span className="font-mono font-medium text-zinc-900 tabular-nums">
                            {item.priorityScore.toFixed(0)}/100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-800"
                            style={{ width: `${item.priorityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Assigned Student Project / College */}
                      {item.matchedUniversity && (
                        <div className="text-xs text-zinc-700 bg-zinc-50 border border-zinc-200/80 rounded-md px-2.5 py-1 flex items-center gap-1.5 font-normal truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">
                            {lang === "hi" ? "छात्र प्रोजेक्ट:" : "Student project:"} <b className="font-medium text-zinc-900">{item.matchedUniversity.name}</b>
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ChallengesExplorerPage;
