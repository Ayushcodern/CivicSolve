import React, { createContext, useContext, useEffect, useState } from "react";
import { Droplets, Route as RoadIcon, Trash2, Sprout, HeartPulse, CheckCircle2, Clock, Inbox, GraduationCap } from "lucide-react";

export type Lang = "hi" | "en";

export interface StatusMeta {
  key: string;
  labelHi: string;
  labelEn: string;
  badgeClass: string;
  icon: any;
}

export interface CategoryMeta {
  key: string;
  nameHi: string;
  nameEn: string;
  subHi: string;
  subEn: string;
  icon: any;
  colorClass: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "WATER",
    nameHi: "पानी",
    nameEn: "Water",
    subHi: "हैंडपंप, नल-जल, गंदा पानी",
    subEn: "Handpump, pipeline, water quality",
    icon: Droplets,
    colorClass: "bg-white/90 text-zinc-900 border-zinc-200 hover:border-emerald-700/60 hover:bg-zinc-50/80",
  },
  {
    key: "ROAD_INFRASTRUCTURE",
    nameHi: "सड़क",
    nameEn: "Roads",
    subHi: "कच्ची सड़क, गड्ढे, पुलिया",
    subEn: "Potholes, damaged culvert, mud",
    icon: RoadIcon,
    colorClass: "bg-white/90 text-zinc-900 border-zinc-200 hover:border-emerald-700/60 hover:bg-zinc-50/80",
  },
  {
    key: "SANITATION",
    nameHi: "सफ़ाई",
    nameEn: "Sanitation",
    subHi: "कचरा ढेर, नाली जाम",
    subEn: "Garbage dump, clogged drains",
    icon: Trash2,
    colorClass: "bg-white/90 text-zinc-900 border-zinc-200 hover:border-emerald-700/60 hover:bg-zinc-50/80",
  },
  {
    key: "AGRICULTURE",
    nameHi: "खेती",
    nameEn: "Farming",
    subHi: "फ़सल बीमारी, कीट, सिंचाई",
    subEn: "Crop disease, pests, irrigation",
    icon: Sprout,
    colorClass: "bg-white/90 text-zinc-900 border-zinc-200 hover:border-emerald-700/60 hover:bg-zinc-50/80",
  },
  {
    key: "PUBLIC_HEALTH",
    nameHi: "स्वास्थ्य",
    nameEn: "Health",
    subHi: "अस्पताल, दवाई, टीका",
    subEn: "Clinic, medicines, vaccines",
    icon: HeartPulse,
    colorClass: "bg-white/90 text-zinc-900 border-zinc-200 hover:border-emerald-700/60 hover:bg-zinc-50/80",
  },
];

export const STATUS_MAP: Record<string, StatusMeta> = {
  SUBMITTED: {
    key: "SUBMITTED",
    labelHi: "प्राप्त",
    labelEn: "Received",
    badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: Inbox,
  },
  AI_ANALYZED: {
    key: "AI_ANALYZED",
    labelHi: "जाँच में",
    labelEn: "Being checked",
    badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: Clock,
  },
  VALIDATED: {
    key: "VALIDATED",
    labelHi: "सत्यापित",
    labelEn: "Verified",
    badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: Clock,
  },
  MATCHED: {
    key: "MATCHED",
    labelHi: "कॉलेज को सौंपा",
    labelEn: "Given to college",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: GraduationCap,
  },
  IN_PROGRESS: {
    key: "IN_PROGRESS",
    labelHi: "काम चालू",
    labelEn: "In progress",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: GraduationCap,
  },
  RESOLVED: {
    key: "RESOLVED",
    labelHi: "हल हुआ",
    labelEn: "Solved",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: CheckCircle2,
  },
};

export const TRANSLATIONS = {
  hi: {
    // Nav
    appName: "CivicSolve मध्य प्रदेश",
    navProblems: "समस्याएँ",
    navMyReports: "मेरी शिकायतें",
    navImpact: "असर",
    navReportBtn: "समस्या बताएँ",
    navSignIn: "लॉग इन",
    navSignOut: "लॉग आउट",
    navMore: "और",
    navHome: "होम",
    govBadge: "मध्य प्रदेश सरकार · जन समस्या समाधान",

    // Home Hero
    heroHeadline: "अपने गाँव की समस्या बताइए",
    heroSubhead: "बोलकर या लिखकर बताएं। आपकी बात सीधे कॉलेज के छात्रों और अधिकारियों तक पहुंचेगी ताकि समस्या का पक्का हल निकले।",
    heroPrimaryBtn: "समस्या दर्ज करें",
    heroVoiceTag: "🎤 बोलकर 2 मिनट में शिकायत दर्ज करें",
    heroSearchPlaceholder: "गाँव, वार्ड या समस्या खोजें...",

    // Categories Section
    catTitle: "किस बारे में समस्या है?",
    catSub: "नीचे किसी भी विषय पर दबाकर समस्या देखें या नई समस्या दर्ज करें",

    // Problems Near You
    nearTitle: "आपके पास की समस्याएँ",
    nearSub: "मध्य प्रदेश के गाँवों व वार्डों से आई ताज़ा शिकायतें",
    viewAllProblems: "सभी समस्याएँ देखें →",
    urgentTag: "अति आवश्यक",
    normalTag: "सामान्य",

    // 3-step Explainer
    howTitle: "समाधान कैसे होता है?",
    howSub: "आपकी शिकायत से लेकर पक्के समाधान तक के 3 आसान कदम",
    step1Title: "1. बताइए",
    step1Desc: "फ़ोन पर बोलकर या लिखकर समस्या दर्ज करें। यदि संभव हो तो फ़ोटो जोड़ें।",
    step2Title: "2. जाँच",
    step2Desc: "सिस्टम और अधिकारी समस्या की जाँच करके तय करते हैं कि यह कितनी ज़रूरी है।",
    step3Title: "3. समाधान",
    step3Desc: "इंजीनियरिंग कॉलेज के छात्र व प्रोफ़ेसर इस समस्या पर काम करके हल तैयार करते हैं।",

    // Stats
    statCitizens: "गाँव वाले लाभान्वित",
    statColleges: "सहयोगी कॉलेज व लैब",
    statProjects: "छात्र प्रोजेक्ट जारी",
    statResolved: "समस्याएँ हल हुईं",
    statDistricts: "मध्य प्रदेश के ज़िले",

    // Partners
    partnerTitle: "हमारे सहयोगी शिक्षण संस्थान",
    partnerSub: "आईआईटी इंदौर, एसजीएसआईटीएस, मैनिट भोपाल सहित मध्य प्रदेश के प्रमुख तकनीकी संस्थान",

    // Submit Form
    submitTitle: "समस्या दर्ज करें",
    submitSub: "आसान 5 कदम · आवाज़ या लिखाई से अपनी समस्या बताएं",
    stepCat: "1. विषय",
    stepDesc: "2. समस्या",
    stepPhoto: "3. फ़ोटो",
    stepLoc: "4. जगह",
    stepConfirm: "5. पुष्टि",
    btnNext: "आगे बढ़ें →",
    btnBack: "← पीछे जाएं",
    btnSubmitFinal: "✅ समस्या दर्ज करें",
    btnVoiceMic: "बोलकर बताएं (यहाँ दबाएँ)",
    btnVoiceListening: "सुन रहे हैं... बोलिए",
    btnVoiceSample: "📢 उदाहरण भरें",
    photoOptionalNote: "फ़ोटो जोड़ना ज़रूरी नहीं है, आप इसे छोड़ सकते हैं",
    photoSkipBtn: "फ़ोटो नहीं है, आगे बढ़ें →",
    btnTakeLocation: "📍 मेरी अभी की जगह चुनें (GPS)",
    locationSelected: "जगह चुन ली गई",
    districtLabel: "ज़िला चुनें",
    villageLabel: "गाँव या वार्ड का नाम",

    // Footer
    footerGov: "मध्य प्रदेश शासन · विज्ञान एवं प्रौद्योगिकी विभाग",
    footerProblems: "समस्याएँ",
    footerReport: "समस्या दर्ज करें",
    footerMyReports: "मेरी शिकायतें",
    footerImpact: "असर",
    footerHelpline: "📞 मुख्यमंत्री हेल्पलाइन: 181",
  },
  en: {
    // Nav
    appName: "CivicSolve Madhya Pradesh",
    navProblems: "Problems",
    navMyReports: "My Reports",
    navImpact: "Impact",
    navReportBtn: "Report Problem",
    navSignIn: "Sign In",
    navSignOut: "Sign Out",
    navMore: "More",
    navHome: "Home",
    govBadge: "Government of Madhya Pradesh · Community Solution Exchange",

    // Home Hero
    heroHeadline: "Report a Problem in Your Village",
    heroSubhead: "Speak or write your issue. It connects directly to engineering students and district officers for a real solution.",
    heroPrimaryBtn: "Report a Problem",
    heroVoiceTag: "🎤 File by voice or text in 2 minutes",
    heroSearchPlaceholder: "Search by village, ward, or problem...",

    // Categories Section
    catTitle: "What is the problem about?",
    catSub: "Select a category below to browse or submit an issue",

    // Problems Near You
    nearTitle: "Problems Near You",
    nearSub: "Recent community reports logged across Madhya Pradesh",
    viewAllProblems: "View all problems →",
    urgentTag: "High Urgency",
    normalTag: "Normal",

    // 3-step Explainer
    howTitle: "How Does It Work?",
    howSub: "3 simple steps from your report to an engineered solution",
    step1Title: "1. Tell Us",
    step1Desc: "Describe the problem by voice or text. Add an optional photo.",
    step2Title: "2. Checking",
    step2Desc: "Officers and system check urgency and eliminate duplicates.",
    step3Title: "3. Solution",
    step3Desc: "College engineering students and faculty mentors build a real solution.",

    // Stats
    statCitizens: "Citizens Benefited",
    statColleges: "Partner College Labs",
    statProjects: "Active Student Projects",
    statResolved: "Problems Solved",
    statDistricts: "MP Districts Covered",

    // Partners
    partnerTitle: "Partner Academic Institutions",
    partnerSub: "Leading engineering institutes across MP including IIT Indore, SGSITS, MANIT Bhopal",

    // Submit Form
    submitTitle: "Report a Problem",
    submitSub: "5 simple steps · Use voice dictation or typing",
    stepCat: "1. Topic",
    stepDesc: "2. Details",
    stepPhoto: "3. Photo",
    stepLoc: "4. Place",
    stepConfirm: "5. Submit",
    btnNext: "Next Step →",
    btnBack: "← Go Back",
    btnSubmitFinal: "✅ Submit Problem",
    btnVoiceMic: "Speak in Hindi / English (Tap here)",
    btnVoiceListening: "Listening... speak now",
    btnVoiceSample: "📢 Load Sample",
    photoOptionalNote: "Adding a photo is optional. You can skip this step.",
    photoSkipBtn: "No photo, proceed →",
    btnTakeLocation: "📍 Use My Current Location (GPS)",
    locationSelected: "Location recorded",
    districtLabel: "Select District",
    villageLabel: "Village or Ward Name",

    // Footer
    footerGov: "Government of Madhya Pradesh · Department of Science & Technology",
    footerProblems: "Problems",
    footerReport: "Report Problem",
    footerMyReports: "My Reports",
    footerImpact: "Impact",
    footerHelpline: "📞 CM Helpline: 181",
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof TRANSLATIONS.hi;
  getStatusMeta: (statusKey?: string) => StatusMeta;
  getCategoryMeta: (catKey?: string) => CategoryMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = "civicsolve_lang";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return "hi"; // Default Hindi
    }
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === "hi" || saved === "en") return saved;
      return "hi"; // Default Hindi as requested
    } catch {
      return "hi";
    }
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const getStatusMeta = (statusKey?: string): StatusMeta => {
    if (!statusKey) return STATUS_MAP.SUBMITTED;
    const upper = statusKey.toUpperCase();
    return STATUS_MAP[upper] || STATUS_MAP.SUBMITTED;
  };

  const getCategoryMeta = (catKey?: string): CategoryMeta => {
    if (!catKey) return CATEGORIES[0];
    const upper = catKey.toUpperCase();
    if (upper.includes("WATER")) return CATEGORIES[0];
    if (upper.includes("ROAD") || upper.includes("INFRASTRUCTURE")) return CATEGORIES[1];
    if (upper.includes("SANITATION") || upper.includes("WASTE")) return CATEGORIES[2];
    if (upper.includes("AGRI") || upper.includes("CROP") || upper.includes("FARM")) return CATEGORIES[3];
    if (upper.includes("HEALTH") || upper.includes("MEDICAL")) return CATEGORIES[4];
    return CATEGORIES[0];
  };

  const value: LanguageContextType = {
    lang,
    setLang,
    t: TRANSLATIONS[lang],
    getStatusMeta,
    getCategoryMeta,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

/**
 * Large, high-contrast, always-visible Hindi / English toggle switch
 * Designed for 48px touch targets on mobile & desktop
 */
export const LanguageSwitch: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-lg p-1 bg-zinc-100 border border-zinc-300 shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("hi")}
        className={`px-3 py-1.5 min-h-[40px] rounded-md font-medium text-xs sm:text-sm transition-all cursor-pointer ${
          lang === "hi"
            ? "bg-zinc-950 text-white shadow-xs font-bold"
            : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60"
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 min-h-[40px] rounded-md font-medium text-xs sm:text-sm transition-all cursor-pointer ${
          lang === "en"
            ? "bg-zinc-950 text-white shadow-xs font-bold"
            : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60"
        }`}
      >
        English
      </button>
    </div>
  );
};

