import React, { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  PlusCircle,
  Plus,
  FileText,
  MoreHorizontal,
  PhoneCall,
  LogIn,
  LogOut,
  Award,
  ShieldCheck,
  GraduationCap,
  Landmark,
  X,
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

  const getRoleLabel = () => {
    if (role === "CITIZEN") return lang === "hi" ? "नागरिक / किसान" : "Citizen";
    if (role === "STUDENT") return lang === "hi" ? "छात्र शोधकर्ता" : "Student";
    if (role === "FACULTY") return lang === "hi" ? "कॉलेज प्रोफ़ेसर" : "Faculty";
    if (role === "MODERATOR") return lang === "hi" ? "समीक्षा अधिकारी" : "Moderator";
    if (role === "ADMIN" || role === "GOVT") return lang === "hi" ? "ज़िला प्रशासन" : "Admin";
    return role || "";
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* ====================================================================
          DESKTOP & MOBILE TOP HEADER
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 text-zinc-900 shadow-xs transition-all">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2d5a43] text-white font-mono font-bold text-base shadow-sm ring-1 ring-emerald-900/10 group-hover:bg-[#234634] group-hover:shadow transition duration-200">
                  C
                </span>
                <div>
                  <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 block leading-tight">
                    CivicSolve
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium hidden sm:block leading-none mt-1">
                    {t.govBadge}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation: 3 items for citizen / guest. Staff links only after login */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition min-h-[42px] inline-flex items-center gap-2 border-l-2 ${
                  currentPath === "/"
                    ? "bg-zinc-100 text-zinc-950 font-semibold border-[#2d5a43] shadow-2xs"
                    : "border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <Home className="w-4 h-4 text-zinc-500" />
                <span>{lang === "hi" ? "होम" : "Home"}</span>
              </Link>

              <Link
                to="/submit"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition min-h-[42px] inline-flex items-center gap-2 border-l-2 ${
                  currentPath.startsWith("/submit")
                    ? "bg-zinc-100 text-zinc-950 font-semibold border-[#2d5a43] shadow-2xs"
                    : "border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-zinc-500" />
                <span>{lang === "hi" ? "समस्या बताएँ" : "Report a Problem"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
              </Link>

              <Link
                to="/dashboard/citizen"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition min-h-[42px] inline-flex items-center gap-2 border-l-2 ${
                  currentPath.startsWith("/dashboard/citizen")
                    ? "bg-zinc-100 text-zinc-950 font-semibold border-[#2d5a43] shadow-2xs"
                    : "border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>{lang === "hi" ? "मेरी शिकायतें" : "My Complaints"}</span>
              </Link>

              {/* Staff-only links — only visible after login with the right role */}
              {isStudent && (
                <Link
                  to="/dashboard/university"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                    currentPath.startsWith("/dashboard/university")
                      ? "bg-emerald-50 text-[#2d5a43] border-emerald-200 font-semibold shadow-2xs"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "कॉलेज लैब" : "College Lab"}</span>
                </Link>
              )}
              {isModerator && (
                <Link
                  to="/dashboard/moderator"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                    currentPath.startsWith("/dashboard/moderator")
                      ? "bg-emerald-50 text-[#2d5a43] border-emerald-200 font-semibold shadow-2xs"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "समीक्षा सूची" : "Review Queue"}</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/dashboard/government"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                    currentPath.startsWith("/dashboard/government")
                      ? "bg-emerald-50 text-[#2d5a43] border-emerald-200 font-semibold shadow-2xs"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{lang === "hi" ? "शासन नियंत्रण" : "Command Center"}</span>
                </Link>
              )}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Always-visible Language Switcher */}
              <LanguageSwitch />

              {/* Prominent Report Button (Desktop & Tablet) */}
              <Link
                to="/submit"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2d5a43] to-[#244835] hover:from-[#234634] hover:to-[#1a3527] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] min-h-[44px] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.navReportBtn}</span>
              </Link>

              {/* User Account / Sign In */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#2d5a43] border border-emerald-200 flex items-center justify-center text-xs font-bold font-mono tracking-tight shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left pr-1">
                      <div className="text-xs font-semibold text-zinc-950 leading-tight max-w-[120px] truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">
                        {getRoleLabel()}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                    title={t.navSignOut}
                    className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-red-600 hover:bg-red-50/60 hover:border-red-200 transition-colors shadow-2xs cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
      >
        <div className="grid grid-cols-4 items-end max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              currentPath === "/"
                ? "text-[#2d5a43] font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mb-1 transition-all ${
                currentPath === "/" ? "bg-[#2d5a43] opacity-100" : "bg-transparent opacity-0"
              }`}
            />
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-medium">{t.navHome}</span>
          </Link>

          {/* 2. Report (Large Elevated Centre Button) */}
          <Link
            to="/submit"
            className="flex flex-col items-center justify-center -mt-5 group"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2d5a43] to-[#386b51] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 ring-4 ring-white group-active:scale-95 transition-all">
              <Plus className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-[#2d5a43] leading-tight mt-1">
              {t.navReportBtn}
            </span>
          </Link>

          {/* 3. My Reports */}
          <Link
            to="/dashboard/citizen"
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              currentPath.startsWith("/dashboard/citizen")
                ? "text-[#2d5a43] font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mb-1 transition-all ${
                currentPath.startsWith("/dashboard/citizen")
                  ? "bg-[#2d5a43] opacity-100"
                  : "bg-transparent opacity-0"
              }`}
            />
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-medium">{t.navMyReports}</span>
          </Link>

          {/* 4. More */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full mb-1 bg-transparent opacity-0" />
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-medium">{t.navMore}</span>
          </button>
        </div>
      </nav>

      {/* ====================================================================
          "MORE" BOTTOM SHEET DRAWER (Mobile)
          ==================================================================== */}
      {isMoreOpen && (
        <div
          onClick={() => setIsMoreOpen(false)}
          className="md:hidden fixed inset-0 z-[100] bg-zinc-950/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-md rounded-t-[28px] border-t border-zinc-200/80 p-5 pb-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
          >
            {/* Drawer Handle */}
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto -mt-1 mb-1" />

            {/* Sheet Handle & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="font-bold text-base text-zinc-950">
                {lang === "hi" ? "अन्य सुविधाएँ व भाषा" : "More Options & Language"}
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switch */}
            <div className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex items-center justify-between">
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
              className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 font-semibold text-sm min-h-[48px] hover:bg-emerald-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span>{t.footerHelpline}</span>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                {lang === "hi" ? "कॉल करें →" : "Call →"}
              </span>
            </a>

            {/* Impact Ledger Link */}
            <Link
              to="/impact"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 text-zinc-900 font-semibold text-sm min-h-[48px] hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
                <span>{lang === "hi" ? "सत्यापित समाधान व असर" : "Verified Impact Ledger"}</span>
              </div>
              <span className="text-xs text-zinc-400 font-semibold">→</span>
            </Link>

            {/* Specialist Role Dashboards (Only if logged in with that role) */}
            {isStudent && (
              <Link
                to="/dashboard/university"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 text-zinc-900 font-medium text-sm min-h-[48px] hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span>{lang === "hi" ? "कॉलेज छात्र प्रोजेक्ट लैब" : "University Lab"}</span>
                </div>
                <span className="text-xs text-zinc-400 font-semibold">→</span>
              </Link>
            )}
            {isModerator && (
              <Link
                to="/dashboard/moderator"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 text-zinc-900 font-medium text-sm min-h-[48px] hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{lang === "hi" ? "समीक्षा सूची" : "Review Queue"}</span>
                </div>
                <span className="text-xs text-zinc-400 font-semibold">→</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/dashboard/government"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 text-zinc-900 font-medium text-sm min-h-[48px] hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span>{lang === "hi" ? "ज़िला प्रशासन पोर्टल" : "Command Center"}</span>
                </div>
                <span className="text-xs text-zinc-400 font-semibold">→</span>
              </Link>
            )}

            {/* User Account / Sign In */}
            {user ? (
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#2d5a43] border border-emerald-200 flex items-center justify-center text-xs font-bold font-mono">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 leading-tight">{user.name}</div>
                    <div className="text-[11px] text-zinc-500 font-medium leading-tight">
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logout();
                    window.location.href = "/";
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition min-h-[44px] cursor-pointer"
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
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2d5a43] to-[#244835] text-white font-semibold text-sm hover:from-[#234634] hover:to-[#1a3527] transition min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
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
