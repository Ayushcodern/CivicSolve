import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Mic,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  GraduationCap,
  Users,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, CATEGORIES, STATUS_MAP } from "../context/LanguageContext";
import { DashboardNav } from "../components/DashboardNav";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicSolve मध्य प्रदेश — जन समस्या समाधान मंच" },
      {
        name: "description",
        content:
          "मध्य प्रदेश के गाँवों व कस्बों की समस्याओं को सीधे इंजीनियरिंग कॉलेज के छात्रों और ज़िला अधिकारियों तक पहुँचाएँ ताकि पक्का समाधान निकल सके।",
      },
    ],
  }),
  component: IndexPage,
});

// Community problems formatted with bilingual spoken terms & calm data
const NEARBY_PROBLEMS = [
  {
    id: "MP-CIVIC-2611",
    numericId: 1,
    titleHi: "बारिश के बाद हैंडपंप का मटमैला व दूषित पानी",
    titleEn: "Handpump yields turbid muddy water after monsoon",
    placeHi: "सांवेर, इंदौर",
    placeEn: "Sanwer, Indore",
    categoryKey: "WATER",
    statusKey: "VALIDATED",
    urgency: 82,
    beneficiaries: "3,500 लोग",
    collegeHi: "एसजीएसआईटीएस कॉलेज (जल प्रयोगशाला)",
    collegeEn: "SGSITS Indore (Water Lab)",
  },
  {
    id: "MP-CIVIC-2598",
    numericId: 2,
    titleHi: "गाँव की मुख्य सड़क की पुलिया हर बारिश में बह जाती है",
    titleEn: "Village approach road culvert washes out every monsoon",
    placeHi: "बदनावर, धार",
    placeEn: "Badnawar, Dhar",
    categoryKey: "ROAD_INFRASTRUCTURE",
    statusKey: "MATCHED",
    urgency: 76,
    beneficiaries: "2,200 लोग",
    collegeHi: "आईआईटी इंदौर (सिविल इंजीनियरिंग)",
    collegeEn: "IIT Indore (Civil Dept)",
  },
  {
    id: "MP-CIVIC-2544",
    numericId: 3,
    titleHi: "साप्ताहिक हाट बाज़ार के पास कचरा ढेर व बदबू",
    titleEn: "Unsegregated organic waste dump near weekly market",
    placeHi: "महू, इंदौर",
    placeEn: "Mhow, Indore",
    categoryKey: "SANITATION",
    statusKey: "IN_PROGRESS",
    urgency: 64,
    beneficiaries: "1,800 लोग",
    collegeHi: "डीएवीवी ऊर्जा अध्ययन संस्थान",
    collegeEn: "DAVV School of Energy",
  },
  {
    id: "MP-CIVIC-2490",
    numericId: 4,
    titleHi: "सोयाबीन फ़सल में अचानक कीट प्रकोप से नुकसान",
    titleEn: "Soybean crop losses from unexpected pest outbreak",
    placeHi: "आष्टा, सीहोर",
    placeEn: "Ashta, Sehore",
    categoryKey: "AGRICULTURE",
    statusKey: "MATCHED",
    urgency: 88,
    beneficiaries: "4,100 किसान",
    collegeHi: "आरवीएसकेवीवी कृषि शोध केंद्र",
    collegeEn: "RVSKVV Agriculture Center",
  },
  {
    id: "MP-CIVIC-2433",
    numericId: 5,
    titleHi: "प्राथमिक स्वास्थ्य केंद्र में टीके रखने हेतु सोलर फ्रिज की आवश्यकता",
    titleEn: "Primary health clinic needs solar refrigeration for vaccines",
    placeHi: "पाटी, बड़वानी",
    placeEn: "Pati, Barwani",
    categoryKey: "PUBLIC_HEALTH",
    statusKey: "RESOLVED",
    urgency: 91,
    beneficiaries: "5,800 ग्रामीण",
    collegeHi: "मैनिट भोपाल (सौर ऊर्जा लैब)",
    collegeEn: "MANIT Bhopal (Solar Lab)",
  },
  {
    id: "MP-CIVIC-2401",
    numericId: 6,
    titleHi: "प्राथमिक स्कूल की पानी की टंकी की पाइपलाइन टूटी",
    titleEn: "Primary school overhead drinking water pipe leaking",
    placeHi: "बागली, देवास",
    placeEn: "Bagli, Dewas",
    categoryKey: "WATER",
    statusKey: "RESOLVED",
    urgency: 58,
    beneficiaries: "450 स्कूली बच्चे",
    collegeHi: "शासकीय इंजीनियरिंग कॉलेज उज्जैन",
    collegeEn: "Govt Engineering College Ujjain",
  },
];

const PARTNER_COLLEGES = [
  {
    nameHi: "आईआईटी इंदौर (IIT Indore)",
    nameEn: "IIT Indore",
    cityHi: "इंदौर",
    cityEn: "Indore",
    focusHi: "ग्रामीण जल शोधन एवं सेंसर",
    focusEn: "Rural Water Purification & IoT",
  },
  {
    nameHi: "एसजीएसआईटीएस इंदौर (SGSITS)",
    nameEn: "SGSITS Indore",
    cityHi: "इंदौर",
    cityEn: "Indore",
    focusHi: "कच्ची सड़कें, पुलिया व ढांचागत निर्माण",
    focusEn: "Road Infrastructure & Culvert Design",
  },
  {
    nameHi: "मैनिट भोपाल (MANIT Bhopal)",
    nameEn: "MANIT Bhopal",
    cityHi: "भोपाल",
    cityEn: "Bhopal",
    focusHi: "सौर ऊर्जा एवं कोल्ड-चेन स्टोरेज",
    focusEn: "Solar Cold-Storage & Renewable Energy",
  },
  {
    nameHi: "आरवीएसकेवीवी ग्वालियर (RVSKVV)",
    nameEn: "RVSKVV Gwalior",
    cityHi: "ग्वालियर / सीहोर",
    cityEn: "Gwalior / Sehore",
    focusHi: "फ़सल सुरक्षा एवं कृषि यंत्रीकरण",
    focusEn: "Crop Disease & Smart Irrigation",
  },
];

function IndexPage() {
  const { lang, t, getStatusMeta, getCategoryMeta } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/challenges",
        search: { q: searchQuery.trim() } as any,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-950 font-sans antialiased flex flex-col">
      {/* Universal Top Navigation */}
      <DashboardNav />

      <main className="flex-1">
        {/* ====================================================================
            1. TOP HERO: Headline + Voice intake + Report CTA
            ==================================================================== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-zinc-200/70 bg-white">
          <div className="max-w-4xl space-y-6">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 leading-[1.18]">
              {t.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-3xl">
              {t.heroSubhead}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-850 hover:bg-emerald-900 text-white text-sm sm:text-base font-medium shadow-xs transition-colors cursor-pointer min-h-[48px]"
                style={{ backgroundColor: "#2d5a43" }}
              >
                <Mic className="w-4.5 h-4.5 text-emerald-100" />
                <span>{t.heroPrimaryBtn}</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </Link>

              <Link
                to="/challenges"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-sm sm:text-base font-medium shadow-2xs transition-colors cursor-pointer min-h-[48px]"
              >
                <span>{lang === "hi" ? "दर्ज समस्याएँ देखें" : "Browse Problems"}</span>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
              <div className="p-1.5 bg-white rounded-xl border border-zinc-300 shadow-2xs flex items-center gap-2 focus-within:border-zinc-400">
                <Search className="w-4.5 h-4.5 text-zinc-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.heroSearchPlaceholder}
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 outline-none font-normal py-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium shrink-0 transition-colors cursor-pointer min-h-[40px]"
                >
                  {lang === "hi" ? "खोजें" : "Search"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ====================================================================
            2. CATEGORIES: 5 Large Icon Tiles
               (पानी, सड़क, सफ़ाई, खेती, स्वास्थ्य)
            ==================================================================== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 border-b border-zinc-200/70 bg-[#fbfbfa]">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight">
              {t.catTitle}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              {t.catSub}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.key}
                  to="/submit"
                  className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col justify-between min-h-[132px] group shadow-2xs hover:shadow-xs cursor-pointer ${cat.colorClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-zinc-700" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                  </div>

                  <div className="mt-4">
                    <div className="text-base sm:text-lg font-semibold text-zinc-950 leading-tight">
                      {lang === "hi" ? cat.nameHi : cat.nameEn}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-1 font-normal">
                      {lang === "hi" ? cat.subHi : cat.subEn}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            3. PROBLEMS NEAR YOU: Simple, Clear Cards
            ==================================================================== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 border-b border-zinc-200/70 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight">
                {t.nearTitle}
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
                {t.nearSub}
              </p>
            </div>
            <Link
              to="/challenges"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-900 hover:underline transition-colors"
            >
              <span>{t.viewAllProblems}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {NEARBY_PROBLEMS.map((item) => {
              const status = getStatusMeta(item.statusKey);
              const StatusIcon = status.icon;

              return (
                <Link
                  key={item.id}
                  to={`/challenges/${item.numericId}`}
                  className="rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 p-5 shadow-2xs hover:shadow-xs transition-colors flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Ref number & Status Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs font-semibold text-zinc-600">
                        #{item.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${status.badgeClass}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 text-zinc-600" />
                        <span>{lang === "hi" ? status.labelHi : status.labelEn}</span>
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h3 className="text-base font-semibold text-zinc-950 leading-snug group-hover:text-emerald-900 transition-colors">
                      {lang === "hi" ? item.titleHi : item.titleEn}
                    </h3>

                    {/* Location & Beneficiaries */}
                    <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
                      <div className="flex items-center gap-1 font-medium text-zinc-800">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{lang === "hi" ? item.placeHi : item.placeEn}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 font-normal">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.beneficiaries}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Urgency & College Partner */}
                  <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                    {/* Urgency Progress */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-normal">
                        {lang === "hi" ? "ज़रूरत स्तर:" : "Urgency level:"}
                      </span>
                      <span className="font-medium text-zinc-900 font-mono tabular-nums">
                        {item.urgency}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-700"
                        style={{ width: `${item.urgency}%` }}
                      />
                    </div>

                    {/* Assigned College */}
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-md font-normal truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">
                        {lang === "hi" ? item.collegeHi : item.collegeEn}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            4. 3-STEP EXPLAINER: बताइए -> जाँच -> समाधान
            ==================================================================== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 border-b border-zinc-200/70 bg-[#fbfbfa]">
          <div className="max-w-2xl mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight">
              {t.howTitle}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              {t.howSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1: बताइए */}
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center font-mono font-medium text-sm">
                  1
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {t.step1Title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {t.step1Desc}
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-xs font-medium text-zinc-600 flex items-center gap-1">
                <span>बोलकर या लिखकर समस्या दर्ज करें</span>
              </div>
            </div>

            {/* Step 2: जाँच */}
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center font-mono font-medium text-sm">
                  2
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {t.step2Title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {t.step2Desc}
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-xs font-medium text-zinc-600 flex items-center gap-1">
                <span>अधिकारियों द्वारा सत्यापन</span>
              </div>
            </div>

            {/* Step 3: समाधान */}
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center font-mono font-medium text-sm">
                  3
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {t.step3Title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {t.step3Desc}
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-xs font-medium text-zinc-600 flex items-center gap-1">
                <span>कॉलेज टीम द्वारा ज़मीनी हल</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. STATISTICS & PARTNER COLLEGES
            ==================================================================== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 bg-white">
          {/* Key Platform Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { num: 12480, label: t.statCitizens, sub: "55 ज़िलों में" },
              { num: 48, label: t.statColleges, sub: "सहयोगी कॉलेज लैब" },
              { num: 342, label: t.statProjects, sub: "छात्र शोध प्रोजेक्ट" },
              { num: 118, label: t.statResolved, sub: "ज़मीन पर लागू समाधान" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 shadow-2xs space-y-1"
              >
                <div className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-950 tabular-nums">
                  <AnimatedCounter to={stat.num} />+
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-900">
                  {stat.label}
                </div>
                <div className="text-xs text-zinc-500 font-normal">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Partner Colleges Strip */}
          <div className="p-6 sm:p-8 rounded-xl bg-zinc-50/60 border border-zinc-200/80 shadow-2xs">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-950">
                {t.partnerTitle}
              </h3>
              <p className="text-sm text-zinc-600 mt-0.5">
                {t.partnerSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PARTNER_COLLEGES.map((college, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-white border border-zinc-200 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="font-medium text-sm text-zinc-950 truncate">
                      {lang === "hi" ? college.nameHi : college.nameEn}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 line-clamp-2">
                    {lang === "hi" ? college.focusHi : college.focusEn}
                  </div>
                  <div className="text-xs font-medium text-zinc-600 pt-1">
                    {lang === "hi" ? college.cityHi : college.cityEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Universal 4-link Footer */}
      <Footer />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Animated Counter Component
// ----------------------------------------------------------------------------
function AnimatedCounter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();

      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / 1000);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(to * ease));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toLocaleString("en-IN")}</span>;
}

export default IndexPage;
