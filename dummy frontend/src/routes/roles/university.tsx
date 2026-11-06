import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  GraduationCap,
  FlaskConical,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Building,
  Briefcase,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/roles/university")({
  component: UniversityRolePortal,
});

function UniversityRolePortal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="border-b bg-primary text-primary-foreground py-2 text-xs">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          <span className="opacity-90 font-medium">
            Higher Education Department & DST Madhya Pradesh · Academic Innovation Gateway
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">
              ← Main Portal
            </Link>
            <Link to="/institutions" className="hover:underline">
              Institutions Directory
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
                Universities & Students Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/challenges"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Explore Challenges
            </Link>
            <Link
              to="/dashboard/university"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>University Lab Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-radial from-card via-background to-background py-16 px-6">
        <div className="w-full px-6 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 mb-4">
              <GraduationCap className="h-4 w-4" />
              Academic Research & Capstone Innovation Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display leading-[1.1]">
              Solve Real Societal Bottlenecks. Earn Academic Credit.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Stop building toy projects. CivicSolve delivers AI-matched, verified citizen problems
              from Madhya Pradesh districts straight to your university engineering departments,
              accompanied by research testbeds, field mentorship, and state funding.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/challenges"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <span>Browse Matched Challenges</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/university"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>Enter University Project Lab</span>
              </Link>
            </div>
          </div>

          {/* Cards for Academic Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Accredited Capstone Credits</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eligible under AICTE and university curricula for final-year major projects, B.Tech/M.Tech thesis dissertations, and Ph.D. fieldwork.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Pilot Seed Grants</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive prototype fabrication grants up to ₹2.5 Lakhs per validated societal challenge from DST Madhya Pradesh and CSR industry partners.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/10 text-saffron">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Industry Mentor Network</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Collaborate directly with corporate R&D leaders, manufacturing mentors, and civil engineering consultants to co-design solutions.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Inter-Lab Resource Sharing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access advanced spectroscopy, soil microbiome sequencing, and spatial hydrology rigs across participating partner universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University Build Lifecycle */}
      <section className="py-16 px-6 lg:px-12 xl:px-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-3">
          The 4-Stage University Solution Pipeline
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-12">
          From problem discovery to certified field deployment and peer-reviewed impact.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "Phase 1",
              title: "Discover & Claim",
              desc: "Department algorithm ranks societal challenges matching your lab's faculty expertise and specialized equipment. Claim in 1 click.",
            },
            {
              step: "Phase 2",
              title: "Lab Simulation & CAD",
              desc: "Formulate low-cost prototypes, conduct chemical spectrometry, bench-scale assays, and upload CAD schematics.",
            },
            {
              step: "Phase 3",
              title: "Field Deployment Pilot",
              desc: "Deploy pilot cart or modular filtration rig directly in the affected Gram Panchayat with local Sarpanch support.",
            },
            {
              step: "Phase 4",
              title: "Impact Audit & Signoff",
              desc: "District Magistrate engineers audit measured output (NTU, yield %, transit). Result published to Public Impact Ledger.",
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-md inline-block mb-3">
                  {item.step}
                </span>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-6 text-xs text-muted-foreground text-center">
        <p>© 2026 CivicSolve · Higher Education & Research Gateway · Government of Madhya Pradesh</p>
      </footer>
    </div>
  );
}

export default UniversityRolePortal;
