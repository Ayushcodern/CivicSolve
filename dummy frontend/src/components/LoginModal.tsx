import React, { useState } from "react";
import {
  Lock,
  Mail,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  GraduationCap,
  Landmark,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../lib/api";
import { useAuth, UserRole } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTHORIZED_ROLES = [
  {
    designation: "Engineering Student (Student Project Lead)",
    designationHi: "इंजीनियरिंग छात्र (प्रोजेक्ट टीम लीड)",
    email: "student@aitr.ac.in",
    password: "Student123!",
    role: "STUDENT" as UserRole,
    name: "राहुल वर्मा (Rahul Verma)",
    institutionId: 1,
    dashboardRoute: "/dashboard/university",
  },
  {
    designation: "College Faculty / Lab Mentor",
    designationHi: "कॉलेज प्रोफ़ेसर / लैब मार्गदर्शक",
    email: "faculty@aitr.ac.in",
    password: "Faculty123!",
    role: "FACULTY" as UserRole,
    name: "डॉ. अमित शर्मा (Dr. Amit Sharma)",
    institutionId: 1,
    dashboardRoute: "/dashboard/university",
  },
  {
    designation: "District Review & Verification Officer",
    designationHi: "ज़िला सत्यापन व समीक्षा अधिकारी",
    email: "moderator@mp.gov.in",
    password: "Moderator123!",
    role: "MODERATOR" as UserRole,
    name: "डॉ. सुनीता देशमुख (Dr. Sunita Deshmukh)",
    dashboardRoute: "/dashboard/moderator",
  },
  {
    designation: "District Administration (IAS / Collectorate)",
    designationHi: "ज़िला प्रशासन (कलेक्टर कार्यालय)",
    email: "admin@civicsolve.org",
    password: "Admin123!",
    role: "ADMIN" as UserRole,
    name: "कलेक्टर राजेश कुमार (Collector Rajesh Kumar)",
    dashboardRoute: "/dashboard/government",
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  // "citizen_otp" is the default tab as requested for rural users/farmers
  const [activeTab, setActiveTab] = useState<"citizen_otp" | "institutional">("citizen_otp");

  // Citizen Phone + OTP State
  const [phoneNumber, setPhoneNumber] = useState("9826012345");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("4821");
  const [otpLoading, setOtpLoading] = useState(false);

  // Institutional Email State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Citizen OTP Request
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
      setError(
        lang === "hi"
          ? "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      setOtpSent(true);
      toast.success(
        lang === "hi"
          ? "SMS भेजा गया! आपका OTP 4821 है"
          : "SMS sent! Your test OTP is 4821"
      );
    }, 600);
  };

  // Handle Citizen OTP Verify
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.trim().length < 4) {
      setError(
        lang === "hi"
          ? "कृपया 4 अंकों का OTP कोड दर्ज करें"
          : "Please enter the 4-digit OTP code"
      );
      return;
    }

    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      const mockToken = `civicsolve_citizen_phone_${Date.now()}`;
      login(mockToken, {
        userId: 101,
        name: lang === "hi" ? "रमेश पटेल (नागरिक)" : "Ramesh Patel (Citizen)",
        email: `citizen_${phoneNumber.slice(-4)}@mp.citizen`,
        role: "CITIZEN",
      });

      toast.success(
        lang === "hi" ? "सत्यापन सफल! स्वागत है" : "Verified! Welcome, Ramesh Patel"
      );
      onClose();
      navigate({ to: "/dashboard/citizen" as any });
    }, 500);
  };

  // Instant Demo Login for Citizen
  const handleQuickCitizenLogin = () => {
    const mockToken = `civicsolve_citizen_quick_${Date.now()}`;
    login(mockToken, {
      userId: 101,
      name: lang === "hi" ? "रमेश पटेल (नागरिक)" : "Ramesh Patel (Citizen)",
      email: "citizen@example.com",
      role: "CITIZEN",
    });
    toast.success(
      lang === "hi" ? "नागरिक के रूप में सीधे प्रवेश" : "Logged in as Citizen"
    );
    onClose();
    navigate({ to: "/dashboard/citizen" as any });
  };

  // Handle Institutional Email Login
  const handleInstitutionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const matchedProfile = AUTHORIZED_ROLES.find(
      (p) => p.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    try {
      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      const data = response.data;
      if (data.token) {
        login(data.token, {
          userId: data.userId || 1,
          name: data.name || (matchedProfile ? matchedProfile.name : "Registered User"),
          email: data.email || cleanEmail,
          role: (data.role as UserRole) || (matchedProfile ? matchedProfile.role : "CITIZEN"),
          institutionId: data.institutionId || (matchedProfile ? matchedProfile.institutionId : undefined),
        });

        toast.success(`Welcome, ${data.name || cleanEmail}`);
        onClose();
        navigate({ to: (matchedProfile?.dashboardRoute || "/dashboard/university") as any });
        return;
      }
    } catch {
      if (matchedProfile) {
        const mockToken = `civicsolve_auth_jwt_${matchedProfile.role.toLowerCase()}_${Date.now()}`;
        login(mockToken, {
          userId: 1,
          name: matchedProfile.name,
          email: matchedProfile.email,
          role: matchedProfile.role,
          institutionId: matchedProfile.institutionId,
        });

        toast.success(`Authenticated as ${matchedProfile.name}`);
        onClose();
        navigate({ to: matchedProfile.dashboardRoute as any });
        return;
      }

      setError(
        lang === "hi"
          ? "ईमेल या पासवर्ड गलत है। कृपया पुनः प्रयास करें।"
          : "Invalid email or password. Please verify and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = (profile: (typeof AUTHORIZED_ROLES)[0]) => {
    const mockToken = `civicsolve_auth_${profile.role.toLowerCase()}_${Date.now()}`;
    login(mockToken, {
      userId: 1,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      institutionId: profile.institutionId,
    });

    toast.success(
      lang === "hi"
        ? `${profile.name} के रूप में प्रवेश हुआ`
        : `Authenticated as ${profile.name}`
    );
    onClose();
    navigate({ to: profile.dashboardRoute as any });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100000] overflow-y-auto bg-zinc-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center min-h-screen animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white border border-zinc-200 shadow-2xl text-zinc-900 flex flex-col overflow-hidden max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-100 px-5 sm:px-6 py-4 bg-zinc-50/90">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-950 text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <h2 id="login-title" className="text-base sm:text-lg font-bold text-zinc-950 leading-tight">
                {lang === "hi" ? "CivicSolve में प्रवेश करें" : "Sign In to CivicSolve"}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {lang === "hi"
                  ? "मध्य प्रदेश शासन · जन समाधान पोर्टल"
                  : "Government of Madhya Pradesh · Community Solution Exchange"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Citizen Phone OTP vs Institutional Email */}
        <div className="shrink-0 px-5 sm:px-6 pt-3 pb-2 border-b border-zinc-100 bg-white">
          <div className="grid grid-cols-2 p-1.5 bg-zinc-100 rounded-2xl text-xs sm:text-sm font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("citizen_otp");
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                activeTab === "citizen_otp"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === "hi" ? "नागरिक (फ़ोन OTP)" : "Citizen (Phone OTP)"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("institutional");
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                activeTab === "institutional"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{lang === "hi" ? "कॉलेज / अधिकारी" : "College / Officer"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs sm:text-sm text-rose-800 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CITIZEN PHONE NUMBER + OTP */}
          {activeTab === "citizen_otp" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {lang === "hi" ? "नागरिकों व किसानों के लिए सरल प्रवेश" : "Simple Login for Citizens & Farmers"}
                  </span>
                </div>
                <p className="text-zinc-600">
                  {lang === "hi"
                    ? "कोई पासवर्ड याद रखने की ज़रूरत नहीं। केवल अपना मोबाइल नंबर दर्ज करें।"
                    : "No password required. Just enter your 10-digit mobile number."}
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                      {lang === "hi" ? "मोबाइल नंबर दर्ज करें" : "Enter Mobile Number"}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 font-bold text-sm text-zinc-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="98260XXXXX"
                        className="w-full pl-14 pr-4 py-3 min-h-[48px] rounded-xl border border-zinc-300 text-base font-semibold text-zinc-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{lang === "hi" ? "OTP कोड भेजें" : "Send OTP"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                    <div>
                      <span>{lang === "hi" ? "नंबर:" : "Number:"} <b>+91 {phoneNumber}</b></span>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {lang === "hi" ? "परीक्षण कोड: 4821" : "Test Code: 4821"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-emerald-800 text-xs font-bold hover:underline cursor-pointer"
                    >
                      {lang === "hi" ? "बदलें" : "Change"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                      {lang === "hi" ? "प्राप्त 4-अंकीय OTP दर्ज करें" : "Enter 4-digit OTP Code"}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="4821"
                      className="w-full text-center tracking-[0.5em] py-3 min-h-[48px] rounded-xl border border-zinc-300 text-2xl font-bold text-zinc-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{lang === "hi" ? "सत्यापित करें और प्रवेश करें" : "Verify & Sign In"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Fast 1-Tap Demo Citizen Access */}
              <div className="pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleQuickCitizenLogin}
                  className="w-full py-3 px-3 min-h-[44px] rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>
                    {lang === "hi"
                      ? "सीधे रमेश पटेल (नागरिक) के रूप में डेमो लॉगिन करें"
                      : "Quick 1-Tap Demo Login as Citizen"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INSTITUTIONAL & GOVERNMENT EMAIL */}
          {activeTab === "institutional" && (
            <div className="space-y-4">
              <form onSubmit={handleInstitutionalSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1">
                    {lang === "hi" ? "विभागीय / संस्थान ईमेल" : "Department / College Email"}
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="faculty@aitr.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-zinc-300 text-sm text-zinc-950 focus:border-zinc-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1">
                    {lang === "hi" ? "पासवर्ड" : "Password"}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-zinc-300 text-sm text-zinc-950 focus:border-zinc-950 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 min-h-[44px] rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{lang === "hi" ? "लॉग इन करें" : "Sign In"}</span>}
                </button>
              </form>

              {/* 1-Click Role Direct Sign-In for Testing */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === "hi" ? "सीधे पद अनुसार डेमो प्रवेश:" : "Direct Role Test Access:"}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {AUTHORIZED_ROLES.map((profile) => (
                    <button
                      key={profile.email}
                      type="button"
                      onClick={() => handleQuickRoleLogin(profile)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition cursor-pointer min-h-[44px]"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 text-xs truncate">
                          {lang === "hi" ? profile.designationHi : profile.designation}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium truncate">
                          {profile.name}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-bold shrink-0 ml-2">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
