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
  Sparkles,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/roles/industry")({
  component: IndustryRolePortal,
});

function IndustryRolePortal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="border-b bg-primary text-primary-foreground py-2 text-xs">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          <span className="opacity-90 font-medium">
            Industry Collaboration & CSR Technology Partnership · Government of Madhya Pradesh
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">
              ← Main Portal
            </Link>
            <Link to="/impact" className="hover:underline">
              Impact Ledger
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
                Industry Mentors Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/challenges"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Browse Challenges
            </Link>
            <Link
              to="/impact"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>View Audited Impact Ledger</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-radial from-card via-background to-background py-16 px-6">
        <div className="w-full px-6 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 mb-4">
              <Briefcase className="h-4 w-4" />
              Corporate CSR & Technological Co-Piloting
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display leading-[1.1]">
              Mentor Student Innovators. Scale Proven Field Solutions.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              CivicSolve enables manufacturing enterprises, civil contractors, and tech companies to
              co-pilot societal interventions with IIT Indore, SGSITS, and MANIT Bhopal. Convert your
              CSR budget into measurable, audit-verified community outcomes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/impact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <span>Inspect Audited Field Deployments</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>Explore Open Engineering Challenges</span>
              </Link>
            </div>
          </div>

          {/* Cards for Industry Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Auditable CSR Compliance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Meet statutory CSR benchmarks with transparent, verifiable before-and-after baseline metrics signed off by district engineers.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Real-World Tech Validation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Validate low-cost filtration membranes, solar telemetry modules, and agricultural pest sensors in actual harsh field environments.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Talent Pipeline Access</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Identify and recruit high-performing engineering students and faculty researchers who demonstrate hands-on hardware problem-solving.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                <Handshake className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Joint IP & Licensing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Co-own patent applications and commercial licensing rights for frugal innovations developed with academic research institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Case Studies */}
      <section className="py-16 px-6 lg:px-12 xl:px-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-3">
          Proven Industry–University Collaborations
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Demonstrated outcomes from corporate co-pilots in Madhya Pradesh districts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              Water Technology
            </span>
            <h3 className="font-bold text-base">Eureka Forbes × IIT Indore</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Co-designed low-voltage electro-coagulation filtration cartridges for arsenic removal in Sanwer. Scaled unit treats 5,000 liters/hour at 1/4th traditional cost.
            </p>
            <div className="pt-2 text-xs font-semibold text-leaf flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              95% Arsenic Drop (0.08 → 0.004 mg/L)
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-2 py-0.5 rounded">
              Renewable Energy
            </span>
            <h3 className="font-bold text-base">Vikram Solar × MANIT Bhopal</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrated hybrid rooftop solar PV with lithium-ferro-phosphate backup and GSM IoT telemetry for primary healthcare vaccine storage in Pati tribal block.
            </p>
            <div className="pt-2 text-xs font-semibold text-leaf flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              100% Zero-Loss Vaccine Compliance
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">
              Infrastructure
            </span>
            <h3 className="font-bold text-base">L&T Infrastructure × SGSITS</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pre-cast reinforced dual-box culvert with geotextile stream stabilization at Gram Badnawar causeway, eliminating monsoon washout transit detours.
            </p>
            <div className="pt-2 text-xs font-semibold text-leaf flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Transit Time: 45 min → 8 min
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-6 text-xs text-muted-foreground text-center">
        <p>© 2026 CivicSolve · Industry Partnership & Mentorship Network · Government of Madhya Pradesh</p>
      </footer>
    </div>
  );
}

export default IndustryRolePortal;
