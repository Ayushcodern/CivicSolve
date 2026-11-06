import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  Landmark,
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Download,
  AlertTriangle,
  Building,
} from "lucide-react";

export const Route = createFileRoute("/roles/government")({
  component: GovernmentRolePortal,
});

function GovernmentRolePortal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="border-b bg-primary text-primary-foreground py-2 text-xs">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          <span className="opacity-90 font-medium">
            State Command & Control Intelligence · Government of Madhya Pradesh
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">
              ← Main Portal
            </Link>
            <Link to="/impact" className="hover:underline">
              Public Impact Ledger
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
                Government & Administration Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/moderator"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Moderation Queue
            </Link>
            <Link
              to="/dashboard/government"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <Landmark className="h-4 w-4" />
              <span>Govt KPI Intelligence</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-radial from-card via-background to-background py-16 px-6">
        <div className="w-full px-6 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 mb-4">
              <Landmark className="h-4 w-4" />
              District Administration & State Department Leadership
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display leading-[1.1]">
              Data-Driven Governance. Verified District Outcomes.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Equip District Magistrates, Commissioners, and department engineers with automated
              PostGIS spatial clustering, AI-ranked priority metrics, and an auditable public ledger
              for transparent societal problem resolution.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard/government"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <span>Launch District Heatmap Intelligence</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/moderator"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>Open State Moderation Triage</span>
              </Link>
            </div>
          </div>

          {/* Cards for Administrative Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">PostGIS Spatial Heatmaps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visualize multi-district clustering of water quality failures, road washouts, and healthcare shortages using interactive OpenStreetMap layers.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">ML Priority Ranking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Objective 0-100 mathematical scoring combining severity, affected population, environmental recurrence, and public health hazard indicators.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Audit-Grade Accountability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ensure state funds and CSR allocations are disbursed only after physical engineering inspection certificates are recorded on the public ledger.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">One-Click Executive Export</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export comprehensive CSV and PDF dossier briefs for legislative inquiries, departmental reviews, and district planning committee meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Administrative KPIs */}
      <section className="py-16 px-6 lg:px-12 xl:px-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-3">
          Cross-Departmental Governance Modules
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Unified command tools for state officers, district collectors, and technical evaluators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-3">
                Command Module 1
              </span>
              <h3 className="font-bold text-lg text-foreground mb-2">District Heatmap & KPIs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track district-by-district demand indicators across Indore, Bhopal, Dhar, Barwani, and Ujjain with live PostGIS geographic clustering.
              </p>
            </div>
            <Link
              to="/dashboard/government"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Launch Govt Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md inline-block mb-3">
                Command Module 2
              </span>
              <h3 className="font-bold text-lg text-foreground mb-2">State Moderation Triage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Examine incoming field reports, verify AI classifications, merge geographic duplicates via side-by-side comparison, and approve for university matching.
              </p>
            </div>
            <Link
              to="/dashboard/moderator"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-3">
                Command Module 3
              </span>
              <h3 className="font-bold text-lg text-foreground mb-2">Public Verified Impact Ledger</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Official certification registry logging quantitative before-and-after benchmarks, engineering signoffs, and beneficiary headcounts.
              </p>
            </div>
            <Link
              to="/impact"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Inspect Public Ledger</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-6 text-xs text-muted-foreground text-center">
        <p>© 2026 CivicSolve · District Administration & Governance Portal · Government of Madhya Pradesh</p>
      </footer>
    </div>
  );
}

export default GovernmentRolePortal;
