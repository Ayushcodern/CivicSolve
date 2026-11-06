import React from "react";
import { Link } from "@tanstack/react-router";
import { PhoneCall, ShieldCheck, HeartHandshake } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer: React.FC = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-zinc-200/90 bg-white text-zinc-700 pb-20 md:pb-8 pt-8">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          {/* Left: Brand & MP Govt badge */}
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white font-mono font-bold text-sm">
              C
            </div>
            <div>
              <div className="font-bold text-zinc-950 text-base leading-tight">CivicSolve</div>
              <div className="text-xs text-zinc-500 font-medium">{t.footerGov}</div>
            </div>
          </div>

          {/* Center: Max 4 simple navigation links */}
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-sm font-medium">
            <Link
              to="/challenges"
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition min-h-[44px] inline-flex items-center"
            >
              {t.footerProblems}
            </Link>
            <Link
              to="/submit"
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition min-h-[44px] inline-flex items-center font-bold text-emerald-800"
            >
              + {t.footerReport}
            </Link>
            <Link
              to="/dashboard/citizen"
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition min-h-[44px] inline-flex items-center"
            >
              {t.footerMyReports}
            </Link>
            <Link
              to="/impact"
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition min-h-[44px] inline-flex items-center"
            >
              {t.footerImpact}
            </Link>
          </nav>

          {/* Right: CM Helpline 181 quick contact */}
          <a
            href="tel:181"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition min-h-[44px]"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>{t.footerHelpline}</span>
          </a>
        </div>

        {/* Bottom copyright / note */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <p>
            {lang === "hi"
              ? "© 2026 मध्य प्रदेश जन समाधान मंच · सभी अधिकार सुरक्षित"
              : "© 2026 Madhya Pradesh Community Solution Exchange · All rights reserved"}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === "hi"
                ? "नागरिक डेटा सुरक्षा व जनहित गारंटी"
                : "Public Interest Guaranteed & Citizen Privacy Safeguarded"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

