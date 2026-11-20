/**
 * ProtectedRoute
 *
 * Wraps any page that requires login.
 * If the user is NOT authenticated, shows a full-screen login prompt
 * with a "Login" button that opens the auth modal.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <YourPage />
 *   </ProtectedRoute>
 */

import React from "react";
import { Link } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { DashboardNav } from "./DashboardNav";
import { Footer } from "./Footer";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, openLoginModal } = useAuth();
  const { lang } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 flex flex-col relative overflow-hidden">
        {/* Decorative top-right blurred circle */}
        <div className="w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl absolute top-0 right-0 -z-10 pointer-events-none" />

        <DashboardNav />

        <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20 relative z-10">
          <div className="text-center max-w-sm w-full space-y-6 bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-zinc-200/70 shadow-sm">
            {/* Large 80px Lock Icon Circle */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-9 h-9 text-[#2d5a43]" />
            </div>

            {/* Headline & Subtitle */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 leading-tight">
                {lang === "hi" ? "पहले लॉगिन करें" : "Login Required"}
              </h2>
              <p className="text-sm text-zinc-500/90 mt-2.5 leading-relaxed font-normal">
                {lang === "hi"
                  ? "इस सुविधा का उपयोग करने के लिए आपको पहले अपने खाते में लॉगिन करना होगा।"
                  : "You need to be logged in to access this feature. Please sign in to continue."}
              </p>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2d5a43] hover:bg-[#234735] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-emerald-950/15 active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === "hi" ? "लॉगिन करें" : "Sign In"}</span>
            </button>

            {/* Subtle Back Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors font-medium hover:underline underline-offset-4"
            >
              <span>←</span>
              <span>{lang === "hi" ? "होम पेज पर वापस जाएँ" : "Back to Home"}</span>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
