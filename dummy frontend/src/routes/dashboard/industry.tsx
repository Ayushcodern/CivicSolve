import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  ShieldCheck,
  ArrowRight,
  Handshake,
  Cpu,
  Mail,
  CheckCircle2,
  Users,
} from "lucide-react";
import { DashboardNav } from "../../components/DashboardNav";
import { Footer } from "../../components/Footer";
import { useLanguage } from "../../context/LanguageContext";

export const Route = createFileRoute("/dashboard/industry")({
  head: () => ({
    meta: [
      { title: "उद्योग व सीएसआर सहयोग — CivicSolve मध्य प्रदेश" },
      { name: "description", content: "मध्य प्रदेश के जनहित समाधानों में उद्योग व सीएसआर सहभागिता।" },
    ],
  }),
  component: IndustryDashboardPage,
});

function IndustryDashboardPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-950 font-sans antialiased flex flex-col justify-between">
      <div>
        <DashboardNav />

        {/* State Banner */}
        <div className="border-b border-zinc-200/80 bg-white">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-2 flex items-center justify-between text-xs text-zinc-600">
            <span className="font-medium text-zinc-700">
              {lang === "hi"
                ? "मध्य प्रदेश शासन · उद्योग एवं सीएसआर सहभागिता केंद्र"
                : "Government of Madhya Pradesh · Industry & CSR Partnership Hub"}
            </span>
            <Link to="/impact" className="text-zinc-600 hover:text-zinc-950 font-medium transition">
              {lang === "hi" ? "असर बही →" : "Impact Ledger →"}
            </Link>
          </div>
        </div>

        <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10">
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-zinc-700" />
              <span>{lang === "hi" ? "उद्योग व सीएसआर साझेदारी" : "Industry CSR & Innovation"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
              {lang === "hi"
                ? "गाँवों के ज़मीनी प्रोजेक्ट्स में तकनीकी व आर्थिक सहयोग"
                : "Scale Verified Rural Engineering Solutions"}
            </h1>
            <p className="text-base text-zinc-600 leading-relaxed font-normal">
              {lang === "hi"
                ? "इंजीनियरिंग कॉलेजों द्वारा तैयार किए गए सफल प्रोटोटाइप्स को उद्योगों के सीएसआर और विनिर्माण सहयोग से पूरे मध्य प्रदेश के गाँवों में पहुँचाया जाता है।"
                : "Partner with premier MP university engineering labs to manufacture, scale, and deploy audited community engineering pilots across rural districts."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
              <div className="text-xs text-zinc-500 font-medium">
                {lang === "hi" ? "सक्रिय सीएसआर साझेदार" : "Active CSR Partners"}
              </div>
              <div className="text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">12</div>
              <p className="text-xs text-zinc-500 mt-1">
                {lang === "hi" ? "प्रमुख औद्योगिक प्रतिष्ठान" : "Registered enterprise contributors"}
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
              <div className="text-xs text-zinc-500 font-medium">
                {lang === "hi" ? "सहयोग प्राप्त छात्र प्रोजेक्ट्स" : "Funded Prototypes"}
              </div>
              <div className="text-3xl font-semibold font-mono tabular-nums text-zinc-950 mt-1">19</div>
              <p className="text-xs text-zinc-500 mt-1">
                {lang === "hi" ? "जल, कृषि व ऊर्जा क्षेत्र में" : "Water, solar and agro pilots"}
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
              <div className="text-xs text-zinc-500 font-medium">
                {lang === "hi" ? "कुल लाभान्वित नागरिक" : "Verified Beneficiaries"}
              </div>
              <div className="text-3xl font-semibold font-mono tabular-nums text-[#2d5a43] mt-1">38,000+</div>
              <p className="text-xs text-zinc-500 mt-1">
                {lang === "hi" ? "14 ज़िलों के गाँवों में" : "Across 14 priority districts"}
              </p>
            </div>
          </div>

          {/* Co-funding Opportunities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-950">
              {lang === "hi" ? "सहयोग हेतु तैयार प्रमुख प्रोजेक्ट्स" : "Active Co-Deployment Opportunities"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {lang === "hi" ? "जल शोधन" : "Water Purification"}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">IIT Indore Lab Match</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {lang === "hi"
                    ? "सांवेर आर्सेनिक बायो-फ़िल्ट्रेशन यूनिट का विनिर्माण"
                    : "Modular Electro-Coagulation Filter Fabrication"}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {lang === "hi"
                    ? "3,500 ग्रामीणों के लिए पीने के पानी से आर्सेनिक हटाने हेतु आईआईटी इंदौर के सहयोग से तैयार फ़िल्टर का निर्माण।"
                    : "Low-cost community water filtration unit removing heavy arsenic from 2 high-capacity rural borewells."}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                  <span className="text-xs text-zinc-600 font-medium">
                    {lang === "hi" ? "अनुमानित सहयोग राशि: ₹4.8 लाख" : "Est. Prototype Co-fund: ₹4.8L"}
                  </span>
                  <Link
                    to="/challenges/1"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d5a43] hover:underline"
                  >
                    <span>{lang === "hi" ? "विवरण देखें" : "View Dossier"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                    {lang === "hi" ? "सौर ऊर्जा" : "Solar Cold-Chain"}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">MANIT Bhopal Lab Match</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {lang === "hi"
                    ? "आदिवासी स्वास्थ्य केंद्र हेतु सोलर रेफ्रिजरेशन"
                    : "Tribal PHC Solar Hybrid Cold-Chain Storage"}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {lang === "hi"
                    ? "बड़वानी के प्राथमिक स्वास्थ्य केंद्र में टीकों को सुरक्षित रखने हेतु 2.4 kWp सोलर हाइब्रिड बैकअप।"
                    : "Critical vaccine cold-storage retrofit with IoT temperature alarms protecting biologics during power cuts."}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                  <span className="text-xs text-zinc-600 font-medium">
                    {lang === "hi" ? "अनुमानित सहयोग राशि: ₹3.6 लाख" : "Est. Prototype Co-fund: ₹3.6L"}
                  </span>
                  <Link
                    to="/challenges/5"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d5a43] hover:underline"
                  >
                    <span>{lang === "hi" ? "विवरण देखें" : "View Dossier"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

