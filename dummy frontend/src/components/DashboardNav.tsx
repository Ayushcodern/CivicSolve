import React, { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  PlusCircle,
  FileText,
  MoreHorizontal,
  PhoneCall,
  LogIn,
  LogOut,
  Sparkles,
  Award,
  Users,
  ShieldCheck,
  GraduationCap,
  Landmark,
  X,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, LanguageSwitch } from "../context/LanguageContext";

export const DashboardNav: React.FC = () => {
  const { user, role, logout, openLoginModal } = useAuth();
  const { t, lang } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  let currentPath = "";
  try {
    const loc = typeof useLocation === "function" ? useLocation() : null;
    currentPath = loc?.pathname || "";
  } catch {
    currentPath = "";
  }

  const isStudent = role === "STUDENT" || role === "FACULTY" || role === "UNIVERSITY";
  const isCitizen = role === "CITIZEN";
  const isModerator = role === "MODERATOR";
  const isAdmin = role === "ADMIN" || role === "GOVT";

  return (
    <>
      {/* ====================================================================
          DESKTOP & MOBILE TOP HEADER
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 text-zinc-900 shadow-2xs">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2d5a43] text-white font-mono font-bold text-sm shadow-xs group-hover:bg-[#234634] transition">
                  C
                </span>
                <div>
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 block leading-tight">
                    CivicSolve
                  </span>
                  <span className="text-xs text-zinc-500 font-medium hidden sm:block">
                    {t.govBadge}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation: Strictly max 3 links + Role Dashboard if logged in */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/challenges"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] inline-flex items-center gap-1.5 ${
                  currentPath.startsWith("/challenges")
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>{t.navProblems}</span>
              </Link>

              <Link
                to="/dashboard/citizen"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] inline-flex items-center gap-1.5 ${
                  currentPath.startsWith("/dashboard/citizen")
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>{t.navMyReports}</span>
              </Link>

              <Link
                to="/impact"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] inline-flex items-center gap-1.5 ${
                  currentPath.startsWith("/impact")
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <Award className="w-4 h-4 text-zinc-500" />
                <span>{t.navImpact}</span>
              </Link>

              {/* Only show specialist dashboard links to logged-in users with that role */}
              {isStudent && (
                <Link
                  to="/dashboard/university"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200/70 transition-colors inline-flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "कॉलेज लैब" : "College Lab"}</span>
                </Link>
              )}
              {isModerator && (
                <Link
                  to="/dashboard/moderator"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200/70 transition-colors inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "समीक्षा सूची" : "Review Queue"}</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/dashboard/government"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200/70 transition-colors inline-flex items-center gap-1.5"
                >
                  <Landmark className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "शासन नियंत्रण" : "Command Center"}</span>
                </Link>
              )}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Always-visible Language Switcher */}
              <LanguageSwitch />

              {/* Prominent Report Button (Desktop & Tablet) */}
              <Link
                to="/submit"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white hover:bg-emerald-800 text-sm font-bold shadow-sm transition min-h-[44px] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.navReportBtn}</span>
              </Link>

              {/* User Account / Sign In */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-left">
                    <div className="text-xs font-bold text-zinc-950 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium">
                      {role === "CITIZEN"
                        ? lang === "hi" ? "नागरिक / किसान" : "Citizen"
                        : role === "STUDENT"
                        ? lang === "hi" ? "छात्र शोधकर्ता" : "Student"
                        : role === "FACULTY"
                        ? lang === "hi" ? "कॉलेज प्रोफ़ेसर" : "Faculty"
                        : role === "MODERATOR"
                        ? lang === "hi" ? "समीक्षा अधिकारी" : "Moderator"
                        : lang === "hi" ? "ज़िला प्रशासन" : "Admin"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                    title={t.navSignOut}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 text-xs sm:text-sm font-bold transition cursor-pointer min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-zinc-600" />
                  <span>{t.navSignIn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MOBILE FIXED BOTTOM TAB BAR (Strict 4 items)
          1. Home (होम)
          2. Report (समस्या बताएँ, large centre button)
          3. My Reports (मेरी शिकायतें)
          4. More (और)
          ==================================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-xl px-2 py-1.5"
      >
        <div className="grid grid-cols-4 items-center max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-lg transition ${
              currentPath === "/"
                ? "text-emerald-800 font-bold"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">{t.navHome}</span>
          </Link>

          {/* 2. Report (Large Elevated Centre Button) */}
          <Link
            to="/submit"
            className="flex flex-col items-center justify-center -mt-4 py-1 group"
          >
            <div className="w-13 h-13 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-all border-4 border-white">
              <PlusCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-[11px] font-bold text-emerald-900 leading-tight mt-0.5">
              {t.navReportBtn}
            </span>
          </Link>

          {/* 3. My Reports */}
          <Link
            to="/dashboard/citizen"
            className={`flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-lg transition ${
              currentPath.startsWith("/dashboard/citizen")
                ? "text-emerald-800 font-bold"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">{t.navMyReports}</span>
          </Link>

          {/* 4. More */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-lg text-zinc-600 hover:text-zinc-950 cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">{t.navMore}</span>
          </button>
        </div>
      </nav>

      {/* ====================================================================
          "MORE" BOTTOM SHEET DRAWER (Mobile)
          ==================================================================== */}
      {isMoreOpen && (
        <div
          onClick={() => setIsMoreOpen(false)}
          className="md:hidden fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl border-t border-zinc-200 p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
          >
            {/* Sheet Handle & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="font-bold text-base text-zinc-950">
                {lang === "hi" ? "अन्य सुविधाएँ व भाषा" : "More Options & Language"}
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switch */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  {lang === "hi" ? "भाषा बदलें" : "Switch Language"}
                </div>
                <div className="text-[11px] text-zinc-500">हिन्दी या अंग्रेजी चुनें</div>
              </div>
              <LanguageSwitch />
            </div>

            {/* CM Helpline 181 */}
            <a
              href="tel:181"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold text-sm min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 text-emerald-700" />
                <span>{t.footerHelpline}</span>
              </div>
              <span className="text-xs text-emerald-700 font-bold">कॉल करें →</span>
            </a>

            {/* Impact Ledger Link */}
            <Link
              to="/impact"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 font-semibold text-sm min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-600" />
                <span>{lang === "hi" ? "सत्यापित समाधान व असर" : "Verified Impact Ledger"}</span>
              </div>
              <span className="text-xs text-zinc-400">→</span>
            </Link>

            {/* Specialist Role Dashboards (Only if logged in with that role) */}
            {isStudent && (
              <Link
                to="/dashboard/university"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-sm min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-zinc-600" />
                  <span>{lang === "hi" ? "कॉलेज छात्र प्रोजेक्ट लैब" : "University Lab"}</span>
                </div>
                <span className="text-xs text-zinc-400">→</span>
              </Link>
            )}
            {isModerator && (
              <Link
                to="/dashboard/moderator"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-sm min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-zinc-600" />
                  <span>{lang === "hi" ? "समीक्षा सूची" : "Review Queue"}</span>
                </div>
                <span className="text-xs text-zinc-400">→</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/dashboard/government"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-sm min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-5 h-5 text-zinc-600" />
                  <span>{lang === "hi" ? "ज़िला प्रशासन पोर्टल" : "Command Center"}</span>
                </div>
                <span className="text-xs text-zinc-400">→</span>
              </Link>
            )}

            {/* User Account / Sign In */}
            {user ? (
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-900">{user.name}</div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    {role === "CITIZEN"
                      ? lang === "hi" ? "नागरिक / किसान" : "Citizen"
                      : role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logout();
                    window.location.href = "/";
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-800 text-xs font-bold hover:bg-zinc-100 transition min-h-[44px]"
                >
                  {t.navSignOut}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  openLoginModal();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 text-white font-bold text-sm hover:bg-emerald-800 transition min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.navSignIn}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNav;
