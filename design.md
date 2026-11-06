# CivicSolve — Design System & UI/UX Specifications (`design.md`)

## 1. Executive Summary & Design Philosophy
**CivicSolve** is an AI-enabled civic innovation exchange that transforms unstructured citizen problems into structured, validated societal challenges, routing them to capability-matched universities and industry mentors.

Unlike bureaucratic grievance portals (e.g., CPGRAMS) that terminate at administrative transfers, CivicSolve emphasizes **civic empowerment, algorithmic transparency, and tangible solution delivery**. The interface is designed to evoke civic trust, institutional authority, and community enthusiasm through a clean, modern aesthetic inspired by digital public goods.

---

## 2. Design Tokens & Styling Foundation

The visual identity is derived directly from the `dummy frontend` configuration in `src/styles.css`, adhering to Tailwind CSS v4 and standard OKLCH color spaces.

### 2.1 Color Palette (OKLCH Specification)
| Token Name | Light Mode Value | Dark Mode Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--saffron` | `oklch(0.72 0.17 55)` | `oklch(0.72 0.17 55)` | Action highlight, high-priority indicators, focus accents |
| `--leaf` | `oklch(0.52 0.12 150)` | `oklch(0.696 0.17 162.48)` | Success states, verified status, impact metrics |
| `--primary` | `oklch(0.28 0.09 262)` | `oklch(0.929 0.013 255.508)` | Civic Navy brand headers, primary action buttons, institutional cards |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.208 0.042 265.755)` | Text on primary brand backgrounds |
| `--background` | `oklch(1 0 0)` | `oklch(0.129 0.042 264.695)` | Page canvas background |
| `--foreground` | `oklch(0.18 0.04 260)` | `oklch(0.984 0.003 247.858)` | High contrast body and heading typography |
| `--card` | `oklch(1 0 0)` | `oklch(0.208 0.042 265.755)` | Elevation surface for cards and drawers |
| `--card-foreground` | `oklch(0.129 0.042 264.695)` | `oklch(0.984 0.003 247.858)` | Primary text inside card components |
| `--muted` | `oklch(0.968 0.007 247.896)` | `oklch(0.279 0.041 260.031)` | Neutral backgrounds, pills, inactive tabs |
| `--muted-foreground` | `oklch(0.554 0.046 257.417)` | `oklch(0.704 0.04 256.788)` | Secondary captions, timestamps, placeholder text |
| `--border` | `oklch(0.929 0.013 255.508)` | `oklch(1 0 0 / 10%)` | Crisp structural partition lines |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Critical errors, merge rejects, high hazard alerts |

### 2.2 Typography
The typographic hierarchy merges bold display typography for key metrics and headlines with ultra-legible body fonts supporting bilingual Indian scripts:
- **Headings & Brand Title**: `Sora`, `Segoe UI`, system-ui, sans-serif
- **Body & Interface**: `Manrope`, `Segoe UI`, system-ui, sans-serif
- **Devanagari / Hindi Script**: `Noto Sans Devanagari`, `Manrope`, sans-serif
- **Data Tables & Identifiers**: `JetBrains Mono` / system monospace (e.g., `CS-2611`, GPS coordinates `22.97°N, 75.83°E`)

### 2.3 Elevation & Borders
- **Border Radii**: Modular scale based on `--radius: 0.25rem;` (4px crisp corners, civic standard).
- **Shadow Signature**: Distinct neo-civic hard shadow for interactive transformation cards: `shadow-[8px_8px_0_0_var(--color-saffron)]`.
- **Card Framing**: Crisp `border border-border` or `border-2 border-foreground/80` for high-salience inputs.

### 2.4 Accessibility & Localization
- **Dynamic Text Scaling**: Interactive toolbar supporting `A-`, `A`, `A+` modifying `--base-size` from 14px to 20px dynamically.
- **Language Toggle**: One-click bilingual switch (`English` / `हिन्दी`) with complete layout re-indexing for Devanagari vertical metrics.
- **WCAG Compliance**: High contrast ratios (>7:1 on primary elements, >4.5:1 on muted elements).
- **Skip Navigation**: Accessible `<a href="#main">Skip to content</a>` link at the root of the view hierarchy.

---

## 3. Component Architecture & UI Building Blocks

Using the Radix-based UI system already configured in `dummy frontend/src/components/ui`:

```
dummy frontend/src/components/ui/
├── accordion.tsx        # Expandable AI match explanations & FAQ
├── alert-dialog.tsx     # Merge confirmation & deletion modals
├── badge.tsx            # Domain, priority & status indicators
├── button.tsx           # Primary, secondary, outline, civic action buttons
├── card.tsx             # Structured Challenge Genome & project cards
├── command.tsx          # Universal quick-search dialog
├── dialog.tsx           # Submission & evidence inspection modals
├── progress.tsx         # Priority score bars & project stage progress
├── select.tsx           # Role selector, district filter, domain switcher
├── table.tsx            # High-density admin & project tables
└── tabs.tsx             # Role navigation & stage-gate switchers
```

---

## 4. Screen-by-Screen Detailed Wireframes

### 4.1 Screen 1: Public Landing Page (`/`)
- **Utility Bar**: Government pilot attribution, accessibility text-resizer (`A-`, `A`, `A+`), and `EN / HI` toggle.
- **Header**: CivicSolve roundel emblem, navigation anchors (`How it works`, `Challenges`, `Impact Ledger`), role tabs (`Citizens & PRIs`, `Universities`, `Industry`, `Government`), and `Sign In` modal trigger.
- **Hero Grid (Two-column)**:
  - *Left Column*: Dynamic role headline (`"Every community problem deserves a solution team."`), contextual subtext, live search bar with district/village autocompletion, primary CTA (`Report a Challenge`), secondary CTA (`Track Solution`).
  - *Right Column*: **Interactive Transformation Card (3-Stage Carousel)**:
    - *Step 1 (Raw Report)*: Raw citizen input in Hindi/English with uploaded photo thumbnail and GPS pill (`22.97°N, 75.83°E`).
    - *Step 2 (AI Analysis)*: Thematic domain badge, extracted keywords, estimated affected population, and an explainable Priority Gauge (`82/100`) showing formula components (Severity 0.9, Population 0.7, Recurrence 0.8).
    - *Step 3 (Matched)*: Recommended HEI departments and industry mentors with match compatibility % and geographic proximity distance.
- **Pipeline Section (`#how`)**: 3-step numbered workflow cards (`01. Citizen reports`, `02. AI classifies & scores`, `03. Universities & industry build`).
- **Live Metrics Ledger (`#metrics`)**: Real-time counter components tracking `Challenges Logged`, `Active University Projects`, `Deployed Solutions`, and `Districts Covered`.
- **Challenge Explorer (`#explore`)**: Quick-filter domain pills (`All`, `Water Supply`, `Rural Infrastructure`, `Sanitation`, `Agriculture`, `Public Health`) and responsive grid of Challenge Genome cards.

### 4.2 Screen 2: Challenge Submission Portal (`/submit`)
- **Header**: Step breadcrumb (`1. Location & Photos` -> `2. Problem Description` -> `3. Community Impact` -> `4. AI Instant Review`).
- **Form Controls**:
  - **Leaflet Map Picker**: Interactive OpenStreetMap layer allowing draggable marker or automatic GPS capture with reverse geocoding to State, District, Tehsil, and Ward/Village.
  - **Evidence Media Uploader**: Drag-and-drop zone supporting up to 5 geotagged photos/videos with automated EXIF location validation.
  - **Bilingual Problem Statement Input**: Rich text input with voice-to-text option for citizen convenience.
  - **Affected Population Estimator**: Intuitive slider input (`< 100`, `100 - 500`, `500 - 2000`, `2000+`).
  - **Urgency Indicator**: Radio selection (`Normal`, `Seasonal`, `Emergency/Health hazard`).
- **Real-Time AI Preview Drawer**:
  - Live domain suggestion chips (`Suggested: Water Supply · 94% confidence`).
  - Live duplicate warning banner if input closely matches existing neighborhood reports.

### 4.3 Screen 3: Challenge Details & AI Genome Dossier (`/challenges/:id`)
- **Overview Banner**: Challenge ID (`CS-2611`), submission timestamp, citizen anonymity toggle, current workflow status badge (`AI Verified`, `Matched to HEI`, `In Pilot`, `Impact Recorded`).
- **Two-Column Layout**:
  - *Left Pane*: Full challenge text, high-resolution evidence carousel, verified GPS map with pinpoint and radius of impact, and community verification timeline.
  - *Right Pane (The AI Analysis Card - Figure 5 in Synopsis)*:
    - **Domain Classification Badge**: e.g., `Urban Drainage & Infrastructure` (`Beta` tag, `94% confidence`).
    - **Explainable Priority Score**: Gauge metric (e.g., `8.4 / 10` or `84%`) with explicit justification (`High priority due to repeat impact, risk to public health & safety, and proximity to school`).
    - **Possible Duplicates Accordion**: List of similar nearby issues with semantic similarity percentage (e.g., `Monsoon Drainage Backup · 92% similarity`) and option to upvote/merge.
    - **Recommended Universities & Industry Partners**: Ranked cards with capability match percentage (e.g., `IISc Bengaluru · 95% match`, `RV College of Engineering · 88% match`), department tag, distance in km, and direct `Accept Challenge` button for authenticated HEIs.

### 4.4 Screen 4: Moderator Review & Validation Console (`/moderator`)
- **Queue Table**: Incoming challenges flagged as `AI_ANALYZED` or flagged with duplicate similarity `> 75%`.
- **Side-by-Side Duplicate Merge Comparator**:
  - Displays original report alongside proposed duplicate report.
  - Differences in location, date, and citizen photographic evidence highlighted.
  - Action buttons: `Merge into Primary Challenge`, `Keep Separate`, `Reject as Invalid/Spam`.
- **Reason Logging Modal**: Mandatory input field recording reasons for overrides or validations for the audit ledger.

### 4.5 Screen 5: University & Student Solution Workspace (`/workspace/:projectId`)
- **Team Formation Panel**: Assigned Faculty Lead, Student Team Members (CS, Civil, Environmental), Industry Co-Mentor.
- **Stage-Gate Stepper**:
  1. `Proposal`: Problem breakdown, technical feasibility, budget & resource requirements.
  2. `Prototype`: Engineering design, CAD/code repository link, lab test data.
  3. `Field Test`: On-site trial in target village/ward with citizen feedback surveys.
  4. `Pilot Deployment`: Full operational rollout with local panchayat or municipal sign-off.
- **Milestone Checklist**: Due dates, deliverable uploads, faculty sign-off checkmarks.
- **Before-and-After Impact Ledger Entry Form**: Quantitative metric inputs (e.g., *Water turbidity: 85 NTU before -> 4 NTU after*; *Affected population relieved: 1,200*).

### 4.6 Screen 6: Government District Analytics & Heatmap (`/analytics`)
- **Statewide Overview Cards**: Total challenges submitted, resolution rate, top problematic domains, average days to university assignment.
- **Choropleth Heatmap**: GeoJSON map of Madhya Pradesh / Target state color-coded by challenge density and unaddressed priority index.
- **Export Facility**: One-click download of district-level executive reports in PDF/Excel for District Collectors and PRI heads.
