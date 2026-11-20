import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useRef } from "react";
import {
  MapPin,
  Mic,
  MicOff,
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Volume2,
  FileText,
  Clock,
  Inbox,
  GraduationCap,
  Sparkles,
  PhoneCall,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { CivicStore } from "../lib/store";
import { useLanguage, CATEGORIES } from "../context/LanguageContext";
import { DashboardNav } from "../components/DashboardNav";
import { Footer } from "../components/Footer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "समस्या दर्ज करें — CivicSolve मध्य प्रदेश" },
      {
        name: "description",
        content:
          "आसान 5 कदम · बोलकर या लिखकर अपने गाँव की समस्या दर्ज करें। सीधे कॉलेज लैब व अधिकारियों से समाधान पाएँ।",
      },
    ],
  }),
  component: SubmitWizardPage,
});

const MP_DISTRICTS = [
  "Indore (इंदौर)",
  "Bhopal (भोपाल)",
  "Dhar (धार)",
  "Sehore (सीहोर)",
  "Barwani (बड़वानी)",
  "Dewas (देवास)",
  "Ujjain (उज्जैन)",
  "Khargone (खरगोन)",
  "Jhabua (झाबुआ)",
  "Gwalior (ग्वालियर)",
  "Jabalpur (जबलपुर)",
  "Rewa (रीवा)",
  "Sagar (सागर)",
];

function SubmitWizardPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Gate: show login prompt if not authenticated
  if (!user) {
    return (
      <ProtectedRoute>
        <></>
      </ProtectedRoute>
    );
  }

  // 1 question per screen: 1=Category, 2=Description, 3=Photo, 4=Location, 5=Confirm
  const [step, setStep] = useState<number>(1);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>("WATER");
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("Indore (इंदौर)");
  const [villageName, setVillageName] = useState<string>("");
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success Screen State
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [complaintId, setComplaintId] = useState<number>(2612);

  // Web Speech API
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Hindi Voice Dictation (Web Speech API, hi-IN default)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        lang === "hi"
          ? "इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया लिखकर बताएं या 'उदाहरण भरें' दबाएँ।"
          : "Web Speech API is not supported in this browser. Please type or tap 'Load Sample'."
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(
          lang === "hi"
            ? "माइक्रोफ़ोन चालू है... अपनी समस्या बोलिए"
            : "Microphone active... please describe your problem"
        );
      };

      recognition.onresult = (event: any) => {
        let chunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            chunk += " " + event.results[i][0].transcript;
          }
        }
        if (chunk.trim()) {
          setDescription((prev) => {
            const base = prev.trim();
            return base ? base + " " + chunk.trim() : chunk.trim();
          });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      toast.error(
        lang === "hi" ? "माइक शुरू नहीं हो सका" : "Could not activate microphone"
      );
    }
  };

  // Sample quick complaint
  const handleLoadSample = () => {
    const samples = [
      {
        cat: "WATER",
        title: lang === "hi" ? "हैंडपंप का गंदा मटमैला पानी" : "Handpump yields muddy water",
        desc:
          lang === "hi"
            ? "हमारे गाँव के मेन चौराहे का हैंडपंप पिछले एक हफ़्ते से बहुत गंदा पानी दे रहा है। बच्चे बीमार पड़ रहे हैं। नल-जल योजना की लाइन भी टूटी पड़ी है।"
            : "The main village handpump has been giving contaminated turbid water for a week. School children are falling sick.",
        village: lang === "hi" ? "सांवेर वार्ड 4" : "Sanwer Ward 4",
      },
      {
        cat: "ROAD_INFRASTRUCTURE",
        title: lang === "hi" ? "गाँव की मुख्य सड़क की पुलिया टूटी" : "Approach road culvert broken",
        desc:
          lang === "hi"
            ? "गाँव से मुख्य सड़क को जोड़ने वाली पुलिया धंस गई है। ट्रैक्टर व एम्बुलेंस नहीं आ पा रहे हैं।"
            : "The small bridge connecting our village to the main road has collapsed. Ambulances cannot enter.",
        village: lang === "hi" ? "बदनावर" : "Badnawar",
      },
      {
        cat: "AGRICULTURE",
        title: lang === "hi" ? "सोयाबीन की फ़सल में कीड़े लगना" : "Severe pest attack on soybean crop",
        desc:
          lang === "hi"
            ? "हमारे खेतों में सोयाबीन की पत्तियों पर अज्ञात कीट लग गया है जिससे 20 से अधिक किसानों की फ़सल सूख रही है। कृषि विशेषज्ञ की सलाह चाहिए।"
            : "Pest attack on soybean crops across 20+ farms. Leaves are yellowing rapidly. Need agricultural advice.",
        village: lang === "hi" ? "आष्टा गाँव" : "Ashta Village",
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setSelectedCategory(pick.cat);
    setTitle(pick.title);
    setDescription(pick.desc);
    setVillageName(pick.village);
    toast.success(
      lang === "hi" ? "नमूना शिकायत भर दी गई है" : "Sample complaint loaded"
    );
  };

  // GPS Location handler
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      toast.error(
        lang === "hi"
          ? "इस फ़ोन में जीपीएस उपलब्ध नहीं है। कृपया नीचे गाँव का नाम लिखें।"
          : "Geolocation not supported. Please type your village name below."
      );
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGps(false);
        setGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
        });
        toast.success(
          lang === "hi"
            ? `स्थान दर्ज: ${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`
            : "GPS location recorded successfully"
        );
      },
      () => {
        setIsGettingGps(false);
        // Fallback default coordinates
        setGpsLocation({ lat: 22.9734, lon: 75.8322 });
        toast.info(
          lang === "hi"
            ? "मध्य प्रदेश अनुमानित स्थान दर्ज किया गया"
            : "Estimated location set"
        );
      },
      { timeout: 7000 }
    );
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).slice(0, 3);
    setPhotos(filesArray);
    const previews = filesArray.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const cleanTitle =
      title.trim() ||
      (description.trim().slice(0, 40) + "...") ||
      (lang === "hi" ? "ग्रामीण जन समस्या" : "Community Problem");

    try {
      const newRef = Math.floor(Math.random() * 800) + 2620;
      CivicStore.addChallenge({
        challengeId: newRef,
        title: cleanTitle,
        description: description.trim(),
        lat: gpsLocation?.lat || 22.9734,
        lon: gpsLocation?.lon || 75.8322,
        district: district.split(" ")[0],
        villageOrWard: villageName.trim() || (lang === "hi" ? "ग्राम पंचायत क्षेत्र" : "Gram Panchayat"),
        reportedPopulation: 1500,
        domain: selectedCategory,
        subDomain: "Community Problem",
        priorityScore: 78,
        priorityExplanation: "नागरिक द्वारा सीधे दर्ज की गई शिकायत",
        evidenceUrls:
          photoPreviews.length > 0
            ? photoPreviews
            : [
                "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80",
              ],
      });

      setComplaintId(newRef);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(
        lang === "hi"
          ? `शिकायत #MP-CIVIC-${newRef} सफलतापूर्वक दर्ज हुई`
          : `Problem #MP-CIVIC-${newRef} registered successfully`
      );
    } catch {
      toast.error(
        lang === "hi" ? "दर्ज करने में समस्या आई" : "Submission failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCatMeta = CATEGORIES.find((c) => c.key === selectedCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-zinc-900 font-sans antialiased flex flex-col">
      <DashboardNav />

      {/* Official Government Pilot Context Bar */}
      <div className="border-b border-zinc-200/80 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-2 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold text-zinc-800">
              {t.govBadge}
            </span>
          </div>
          <Link to="/" className="text-zinc-600 hover:text-zinc-950 font-bold transition">
            ← {t.navHome}
          </Link>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ====================================================================
            SUCCESS SCREEN WITH 4-STEP TRACKER
            ==================================================================== */}
        {isSuccess ? (
          <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-300">
            {/* Top Success Badge */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-semibold text-zinc-950">
                {lang === "hi" ? "आपकी समस्या दर्ज हो गई है!" : "Your problem has been logged!"}
              </h1>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                {lang === "hi"
                  ? "आपकी शिकायत सीधे संबंधित इंजीनियरिंग कॉलेज और ज़िला अधिकारियों तक भेज दी गई है।"
                  : "Your report has been forwarded to partner engineering colleges and district officers."}
              </p>
            </div>

            {/* Complaint Number Card */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center space-y-1">
              <span className="text-[11px] font-mono text-zinc-500">
                {lang === "hi" ? "शिकायत संदर्भ संख्या (Complaint Number)" : "Complaint reference number"}
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                #MP-CIVIC-{complaintId}
              </div>
              <p className="text-xs text-zinc-500">
                {lang === "hi"
                  ? "कृपया इस नंबर को नोट कर लें या स्क्रीनशॉट ले लें"
                  : "Please note down or screenshot this reference number"}
              </p>
            </div>

            {/* 4-Step Status Tracker */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-950">
                {lang === "hi" ? "स्थिति ट्रैकर (Status Tracker)" : "Live status tracker"}
              </h3>

              <div className="space-y-2.5">
                {/* Step 1: Received */}
                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 font-medium text-xs">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs sm:text-sm text-emerald-950">
                      {lang === "hi" ? "1. प्राप्त (Received)" : "1. Received"}
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      {lang === "hi" ? "शिकायत पोर्टल पर दर्ज हो चुकी है" : "Problem recorded on the platform"}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-800">पूर्ण</span>
                </div>

                {/* Step 2: Being Checked */}
                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 font-medium text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs sm:text-sm text-zinc-900">
                      {lang === "hi" ? "2. जाँच में (Being checked)" : "2. Being checked"}
                    </div>
                    <div className="text-[11px] text-zinc-600">
                      {lang === "hi" ? "अधिकारी और सिस्टम समस्या की ज़रूरत परख रहे हैं" : "Checking urgency and duplicate reports"}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-600">प्रक्रिया में</span>
                </div>

                {/* Step 3: Given to College */}
                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 opacity-70">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 font-medium text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs sm:text-sm text-zinc-700">
                      {lang === "hi" ? "3. कॉलेज को सौंपा (Given to college)" : "3. Given to college"}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {lang === "hi" ? "इंजीनियरिंग छात्र प्रोजेक्ट शुरू होगा" : "Assigned to engineering student project"}
                    </div>
                  </div>
                </div>

                {/* Step 4: Solved */}
                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 opacity-70">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 font-medium text-xs">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs sm:text-sm text-zinc-700">
                      {lang === "hi" ? "4. हल हुआ (Solved)" : "4. Solved"}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {lang === "hi" ? "ज़मीनी काम पूरा व असर दर्ज" : "Solution built and verified on field"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to={`/challenges/${complaintId}`}
                className="w-full py-2.5 px-4 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-sm text-center transition min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{lang === "hi" ? "शिकायत की पूरी फ़ाइल देखें" : "View problem details"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  setDescription("");
                  setTitle("");
                  setPhotos([]);
                  setPhotoPreviews([]);
                  setVillageName("");
                }}
                className="w-full py-2.5 px-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm transition min-h-[48px]"
              >
                {lang === "hi" ? "+ एक और समस्या बताएँ" : "+ Report another problem"}
              </button>
            </div>
          </div>
        ) : (
          /* ====================================================================
              5-STEP WIZARD (1 QUESTION PER SCREEN)
              ==================================================================== */
          <div className="space-y-6">
            {/* Wizard Header & Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-500 mb-2">
                <span>
                  {lang === "hi" ? `कदम ${step} का 5` : `Step ${step} of 5`}
                </span>
                <span className="text-zinc-800 font-medium">
                  {step === 1 && t.stepCat}
                  {step === 2 && t.stepDesc}
                  {step === 3 && t.stepPhoto}
                  {step === 4 && t.stepLoc}
                  {step === 5 && t.stepConfirm}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-800 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* SCREEN 1: CATEGORY SELECTION */}
            {step === 1 && (
              <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-950">
                    {lang === "hi" ? "किस बारे में समस्या है?" : "What is the problem about?"}
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    {lang === "hi"
                      ? "नीचे किसी एक विषय पर दबाकर चुनें"
                      : "Tap a category below to select"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer min-h-[64px] flex items-center justify-between ${
                          isSelected
                            ? "border-emerald-800 bg-emerald-50/50 shadow-2xs"
                            : "border-zinc-200 bg-white hover:bg-zinc-50/80 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-emerald-800 text-white"
                                : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-zinc-950 leading-tight">
                              {lang === "hi" ? cat.nameHi : cat.nameEn}
                            </div>
                            <div className="text-xs text-zinc-500 font-normal mt-0.5">
                              {lang === "hi" ? cat.subHi : cat.subEn}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-medium shrink-0">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-5 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-sm transition cursor-pointer min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>{t.btnNext}</span>
                </button>
              </div>
            )}

            {/* SCREEN 2: DESCRIBE BY VOICE OR TEXT */}
            {step === 2 && (
              <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-950">
                    {lang === "hi" ? "समस्या विस्तार से बताएं" : "Describe the problem"}
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    {lang === "hi"
                      ? "आप बोलकर भी दर्ज कर सकते हैं या नीचे लिख सकते हैं"
                      : "You can speak using the mic or type your issue below"}
                  </p>
                </div>

                {/* Voice Mic Button */}
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center space-y-2.5">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-5 py-3 rounded-lg font-medium text-sm transition cursor-pointer min-h-[48px] inline-flex items-center gap-2.5 shadow-xs ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-[#2d5a43] text-white hover:bg-[#234735]"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>{t.btnVoiceListening}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>{t.btnVoiceMic}</span>
                      </>
                    )}
                  </button>
                  <div className="text-xs text-zinc-500 font-normal">
                    {isListening
                      ? lang === "hi"
                        ? "माइक्रोफ़ोन चालू है। बोलने के बाद फिर दबाएं।"
                        : "Recording... tap again to stop"
                      : lang === "hi"
                      ? "हिंदी में बोलने के लिए ऊपर हरे बटन को दबाएँ"
                      : "Tap the green button above to dictate in Hindi / English"}
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-medium text-zinc-900">
                      {lang === "hi" ? "समस्या का विवरण (बोलें या लिखें)" : "Problem description"}
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="text-xs font-medium text-emerald-900 hover:underline cursor-pointer"
                    >
                      {t.btnVoiceSample}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      lang === "hi"
                        ? "उदाहरण: हमारे गाँव का हैंडपंप पिछले एक हफ़्ते से बहुत गंदा पानी दे रहा है, पीने योग्य नहीं है..."
                        : "Example: Handpump is leaking dirty water for over a week..."
                    }
                    className="w-full p-3.5 rounded-lg border border-zinc-300 text-sm sm:text-base text-zinc-950 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 outline-none leading-relaxed"
                  />
                </div>

                {/* Optional Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-900 mb-1">
                    {lang === "hi" ? "समस्या का छोटा नाम (वैकल्पिक)" : "Short title (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      lang === "hi"
                        ? "हैंडपंप का गंदा पानी"
                        : "Handpump muddy water"
                    }
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-950 focus:border-zinc-500 outline-none"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm min-h-[48px]"
                  >
                    {t.btnBack}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!description.trim()) {
                        toast.error(
                          lang === "hi"
                            ? "कृपया समस्या के बारे में बोलें या लिखें"
                            : "Please speak or write about the problem"
                        );
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex-1 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition cursor-pointer min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{t.btnNext}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: PHOTO (OPTIONAL WITH CLEAR SKIP) */}
            {step === 3 && (
              <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-950">
                    {lang === "hi" ? "फ़ोटो जोड़ें (यदि संभव हो)" : "Add a photo (Optional)"}
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    {t.photoOptionalNote}
                  </p>
                </div>

                {/* Photo Previews or Upload Dropzone */}
                {photoPreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photoPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                          <img src={src} alt="Uploaded evidence" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/80 text-white hover:bg-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <label className="p-8 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/70 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[150px]">
                    <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="font-medium text-sm sm:text-base text-zinc-900">
                      {lang === "hi" ? "कैमरा खोलें या गैलरी से फ़ोटो चुनें" : "Take photo or upload from gallery"}
                    </span>
                    <span className="text-xs text-zinc-500 mt-1 font-mono">
                      {lang === "hi" ? "अधिकतम 3 फ़ोटो (3G पर भी तेज़)" : "Up to 3 photos (Fast on 3G)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Navigation Buttons + Clear Skip Option */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-2.5 px-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm min-h-[48px]"
                    >
                      {t.btnBack}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition cursor-pointer min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>{t.btnNext}</span>
                    </button>
                  </div>

                  {photoPreviews.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="w-full py-2 text-center text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 transition"
                    >
                      {t.photoSkipBtn}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SCREEN 4: LOCATION (GPS OR VILLAGE PICK) */}
            {step === 4 && (
              <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-950">
                    {lang === "hi" ? "समस्या किस जगह की है?" : "Where is the problem located?"}
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    {lang === "hi"
                      ? "जीपीएस से सीधे जगह चुनें या अपने गाँव का नाम लिखें"
                      : "Use current GPS location or type your village name"}
                  </p>
                </div>

                {/* GPS Button */}
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={isGettingGps}
                    className="w-full py-3 px-4 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-sm transition cursor-pointer min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isGettingGps ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{t.btnTakeLocation}</span>
                      </>
                    )}
                  </button>

                  {gpsLocation && (
                    <div className="text-xs text-zinc-700 font-mono text-center">
                      ✓ {t.locationSelected} ({gpsLocation.lat}°N, {gpsLocation.lon}°E)
                    </div>
                  )}
                </div>

                {/* District and Village selection */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-900 mb-1">
                      {t.districtLabel}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-950 bg-white font-normal focus:border-zinc-500 outline-none min-h-[48px]"
                    >
                      {MP_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-900 mb-1">
                      {t.villageLabel}
                    </label>
                    <input
                      type="text"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      placeholder={
                        lang === "hi"
                          ? "जैसे: सांवेर, धरमपुरी, वार्ड 5"
                          : "e.g. Sanwer, Ward 4"
                      }
                      className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-950 focus:border-zinc-500 outline-none min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-2.5 px-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm min-h-[48px]"
                  >
                    {t.btnBack}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex-1 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition cursor-pointer min-h-[48px] flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{t.btnNext}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 5: CONFIRM & SUBMIT */}
            {step === 5 && (
              <div className="rounded-xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-950">
                    {lang === "hi" ? "दर्ज करने से पहले जाँच लें" : "Review and confirm"}
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    {lang === "hi"
                      ? "नीचे दी गई जानकारी सही है तो हरा बटन दबाएँ"
                      : "If the details below are correct, tap the green button"}
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                  {/* Category */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium">{t.stepCat}</span>
                    <span className="font-semibold text-zinc-950">
                      {lang === "hi" ? currentCatMeta.nameHi : currentCatMeta.nameEn}
                    </span>
                  </div>

                  {/* Problem Description */}
                  <div className="pb-2.5 border-b border-zinc-200 space-y-1">
                    <span className="text-xs text-zinc-500 font-medium">{t.stepDesc}</span>
                    <p className="text-sm font-normal text-zinc-900 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium">{t.stepLoc}</span>
                    <span className="font-medium text-zinc-950">
                      {villageName ? `${villageName}, ` : ""}{district}
                    </span>
                  </div>

                  {/* Photos count */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium">{t.stepPhoto}</span>
                    <span className="font-normal text-zinc-700">
                      {photoPreviews.length > 0
                        ? `${photoPreviews.length} ${lang === "hi" ? "फ़ोटो संलग्न" : "photos attached"}`
                        : lang === "hi" ? "कोई फ़ोटो नहीं (वैकल्पिक)" : "No photo (optional)"}
                    </span>
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="w-full py-3.5 px-6 rounded-lg bg-[#2d5a43] hover:bg-[#234735] text-white font-medium text-base transition cursor-pointer min-h-[50px] flex items-center justify-center gap-2.5 shadow-xs"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        <span>{t.btnSubmitFinal}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-full py-2 text-center text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    {t.btnBack}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SubmitWizardPage;
