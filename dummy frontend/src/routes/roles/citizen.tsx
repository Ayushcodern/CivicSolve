import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  Users,
  MapPin,
  Camera,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Building,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

export const Route = createFileRoute("/roles/citizen")({
  component: CitizenRolePortal,
});

function CitizenRolePortal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="border-b bg-primary text-primary-foreground py-2 text-xs">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          <span className="opacity-90 font-medium">
            Digital Public Platform · Government of Madhya Pradesh · Citizen & PRI Portal
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">
              ← Main Portal
            </Link>
            <Link to="/challenges" className="hover:underline">
              Challenge Explorer
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-primary font-display block leading-none">
                CivicSolve
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Citizens & PRIs Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/citizen"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              My Ward Tracker
            </Link>
            <Link
              to="/submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report a Problem</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-radial from-card via-background to-background py-16 px-6">
        <div className="w-full px-6 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 mb-4">
              <Users className="h-4 w-4" />
              Grassroots Empowerment · Gram Panchayats & Wards
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display leading-[1.1]">
              Every Community Problem Deserves an Engineering Solution.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              CivicSolve connects local residents, Sarpanches, and ward representatives directly to
              premier engineering universities like IIT Indore and SGSITS. Report broken water pumps,
              washed out culverts, crop diseases, or sanitation dumps with exact GPS proof.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <span>Report a Problem with GPS & Photo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/citizen"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>Track Status of My Ward Reports</span>
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Exact GPS Coordinates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pinpoint the exact location on our OpenStreetMap interface so university engineering survey vans navigate directly to the site.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/10 text-saffron">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Voice Input in हिन्दी</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Speak directly into your phone microphone in Hindi or English. Built-in speech recognition transcribes your problem instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Photographic Evidence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attach geo-tagged photographs showing the water discoloration, structural crack, or crop infestation.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Audited Public Ledger</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When the university tests and deploys the solution, the before/after results are signed off by the District Collector on the public ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Progression */}
      <section className="py-16 px-6 lg:px-12 xl:px-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-3">
          How Your Complaint Becomes a Working Reality
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Transparent, auditable tracking at every stage of the societal challenge lifecycle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "You Report",
              desc: "Provide GPS pin, affected resident count, and photos via the citizen intake portal in English or Hindi.",
            },
            {
              step: "02",
              title: "AI & State Verification",
              desc: "Machine learning models classify the engineering domain and calculate priority. State moderators confirm authenticity.",
            },
            {
              step: "03",
              title: "University Adoption",
              desc: "IITs and engineering colleges match the problem to specialized labs and assign student capstone teams.",
            },
            {
              step: "04",
              title: "Field Deployment & Audit",
              desc: "Prototype tested on site, solution commissioned, and water/structural metrics validated on the Public Impact Ledger.",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block mb-3">
                  STAGE {item.step}
                </span>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-muted/20 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-center mb-8">
            Frequently Asked Questions by Citizens & Gram Panchayats
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                Is there any fee or cost for villagers or Panchayats to submit a problem?
              </h4>
              <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">
                No. CivicSolve is an official digital public platform sponsored by the Government of Madhya Pradesh and the Department of Higher Education. R&D and prototype deployments are funded through academic grants and CSR partnerships.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                How do I know when action has been taken on my report?
              </h4>
              <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">
                You can enter your reference ID anytime in the Citizen Tracker to view the live status stepper, see which university claimed your challenge, and read uploaded field milestone test reports.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                What types of problems should be submitted?
              </h4>
              <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">
                CivicSolve specializes in technical bottlenecks requiring engineering, scientific, or technological intervention — such as heavy metal water contamination, washed out culverts, crop pest outbreaks, vaccine cold-chain outages, and waste segregation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-6 text-xs text-muted-foreground text-center">
        <p>© 2026 CivicSolve · Citizens & Panchayati Raj Institutions Gateway · Government of Madhya Pradesh</p>
      </footer>
    </div>
  );
}

export default CitizenRolePortal;
