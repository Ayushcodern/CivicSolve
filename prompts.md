# CivicSolve — 1-Click Copy-Paste Execution Prompts (`prompts.md`)

This guide is designed for **anyone** to build the entire CivicSolve project step-by-step. 

👉 **How it works**:
1. Choose a step below.
2. Click the **copy** button on the code box.
3. Paste it directly into your AI assistant and press Enter.
4. Mark the checkboxes `[x]` when done!

---

## 📋 Master Progress Checklist by Team Role

### 👑 Phase 1: Environment & Database (Owner: Team Leader)
- [ ] [Step 01: Project Folders & Gitignore](#step-01-project-folders--gitignore-phase-111) — *👑 Team Leader*
- [ ] [Step 02: Environment Configuration](#step-02-environment-configuration-phase-112) — *👑 Team Leader*
- [ ] [Step 03: Docker Compose Setup](#step-03-docker-compose-setup-phase-121) — *👑 Team Leader*
- [ ] [Step 04: Service Dockerfiles](#step-04-service-dockerfiles-phase-122) — *👑 Team Leader*
- [ ] [Step 05: PostGIS Database Schema](#step-05-postgis-database-schema-phase-131) — *👑 Team Leader*
- [ ] [Step 06: Realistic Seed Data](#step-06-realistic-seed-data-phase-132) — *👑 Team Leader*

### 🤖 Phase 2: Python / FastAPI AI Service (Owner: AI / Data Science Specialist)
- [ ] [Step 07: FastAPI Microservice Setup](#step-07-fastapi-microservice-setup-phase-211) — *🤖 AI/DS Specialist*
- [ ] [Step 08: AI Sentence Embedding Service](#step-08-ai-sentence-embedding-service-phase-212) — *🤖 AI/DS Specialist*
- [ ] [Step 09: Domain Classification API](#step-09-domain-classification-api-phase-221) — *🤖 AI/DS Specialist*
- [ ] [Step 10: Duplicate Detection Engine](#step-10-duplicate-detection-engine-phase-231) — *🤖 AI/DS Specialist*
- [ ] [Step 11: Priority Scoring Calculator](#step-11-priority-scoring-calculator-phase-241) — *🤖 AI/DS Specialist*
- [ ] [Step 12: University Capability Matcher](#step-12-university-capability-matcher-phase-242) — *🤖 AI/DS Specialist*

### ☕ Phase 3: Spring Boot 3 Core Backend (Owner: Leader & Java Specialist)
- [ ] [Step 13: Spring Boot Maven Setup](#step-13-spring-boot-maven-setup-phase-311) — *👑 Team Leader*
- [ ] [Step 14: JWT Security & Roles (RBAC)](#step-14-jwt-security--roles-rbac-phase-312) — *👑 Team Leader*
- [ ] [Step 15: Spatial Challenge Repository](#step-15-spatial-challenge-repository-phase-321) — *☕ Java Specialist*
- [ ] [Step 16: Challenge Submission API](#step-16-challenge-submission-api-phase-322) — *☕ Java Specialist*
- [ ] [Step 17: Async AI Gateway Client](#step-17-async-ai-gateway-client-phase-331) — *☕ Java Specialist*
- [ ] [Step 18: Institution & Capability APIs](#step-18-institution--capability-apis-phase-341) — *☕ Java Specialist*

### ☕ Phase 4: Moderation & Project Lifecycle (Owner: Java Backend Specialist)
- [ ] [Step 19: Moderator Review & Merging](#step-19-moderator-review--merging-phase-411) — *☕ Java Specialist*
- [ ] [Step 20: University Team Builder](#step-20-university-team-builder-phase-421) — *☕ Java Specialist*
- [ ] [Step 21: Stage Gates & Milestones](#step-21-stage-gates--milestones-phase-431) — *☕ Java Specialist*
- [ ] [Step 22: Public Impact Ledger](#step-22-public-impact-ledger-phase-441) — *☕ Java Specialist*
- [ ] [Step 23: District Analytics & Heatmaps](#step-23-district-analytics--heatmaps-phase-442) — *☕ Java Specialist*

### 🎨 Phase 5: React Frontend Integration (Owner: Frontend Specialist)
- [ ] [Step 24: Frontend API & Auth Context](#step-24-frontend-api--auth-context-phase-511) — *🎨 Frontend Specialist*
- [ ] [Step 25: Interactive GPS Map Picker](#step-25-interactive-gps-map-picker-phase-521) — *🎨 Frontend Specialist*
- [ ] [Step 26: Full Challenge Submission Form](#step-26-full-challenge-submission-form-phase-522) — *🎨 Frontend Specialist*
- [ ] [Step 27: Challenge Dossier & AI Card](#step-27-challenge-dossier--ai-card-phase-531) — *🎨 Frontend Specialist*
- [ ] [Step 28: Multi-Role Dashboards](#step-28-multi-role-dashboards-phase-541) — *🎨 Frontend Specialist*

### 🚀 Phase 6: Testing & Launch (Owner: Frontend & Team Leader)
- [ ] [Step 29: Automated Test Matrix (TC01-TC10)](#step-29-automated-test-matrix-tc01-tc10-phase-611) — *🎨 Frontend Specialist*
- [ ] [Step 30: Production Build & Smoke Test](#step-30-production-build--smoke-test-phase-621) — *👑 Team Leader*

---


## Phase 1: Environment & Database

### [x] Step 01: Project Folders & Gitignore (Phase 1.1.1)
> **Summary**: Creates clean folders for backend, AI service, database scripts, and docs while keeping `dummy frontend` safe.

**📋 Copy & Paste This Prompt:**
```text
Initialize the CivicSolve workspace structure:
1. Create the following directories in the project root:
   - backend/
   - ai-service/
   - db/migration/
   - db/seed/
   - docs/
2. Keep the existing 'dummy frontend' directory untouched.
3. Create a root .gitignore file that excludes node_modules/, target/, __pycache__/, .env, and *.pyc.
4. Update explain.md with what was done.
```

**✅ Done When:**
- [x] `backend/`, `ai-service/`, `db/migration/`, `db/seed/`, and `docs/` exist.
- [x] `.gitignore` is created in root.
- [x] `explain.md` is updated.

---

### [x] Step 02: Environment Configuration (Phase 1.1.2)
> **Summary**: Creates `.env.example` so everyone has working database, JWT, and service ports.

**📋 Copy & Paste This Prompt:**
```text
Create a complete .env.example file in the project root with default values for local development:
- POSTGRES_DB=civicsolve, POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_PORT=5432
- SERVER_PORT=8080, JWT_SECRET=civicsolve_super_secret_jwt_key_2026_at_least_256_bits_long, JWT_EXPIRATION_MS=86400000
- AI_SERVICE_URL=http://fastapi-ai:8000, AI_PORT=8000
- VITE_API_BASE_URL=http://localhost:8080/api/v1
Also create a copy named .env for immediate use. Update explain.md.
```

**✅ Done When:**
- [x] `.env.example` and `.env` exist.
- [x] All keys have clear explanations and local defaults.
- [x] `explain.md` is updated.

---

### [x] Step 03: Docker Compose Setup (Phase 1.2.1)
> **Summary**: Sets up `docker-compose.yml` to run PostgreSQL with PostGIS, FastAPI, Spring Boot, and React together.

**📋 Copy & Paste This Prompt:**
```text
Create docker-compose.yml in the project root with 4 services on a shared network named 'civicsolve-network':
1. 'postgres-postgis': image 'postgis/postgis:16-3.4', port 5432:5432, healthcheck using pg_isready, named volume 'pgdata'.
2. 'fastapi-ai': built from ./ai-service, port 8000:8000, depends on postgres-postgis.
3. 'spring-boot-api': built from ./backend, port 8080:8080, depends on postgres-postgis and fastapi-ai.
4. 'frontend': built from ./dummy frontend, port 5173:5173 with volume mount for hot reloading.
Ensure all environment variables are mapped from .env. Update explain.md.
```

**✅ Done When:**
- [x] `docker-compose.yml` is created.
- [x] `docker compose config` validates without errors.
- [x] `explain.md` is updated.

---

### [x] Step 04: Service Dockerfiles (Phase 1.2.2)
> **Summary**: Creates Dockerfiles to containerize FastAPI, Spring Boot, and React.

**📋 Copy & Paste This Prompt:**
```text
Create 3 production-ready Dockerfiles:
1. ai-service/Dockerfile: Python 3.11-slim, installs PyTorch CPU-only and sentence-transformers, runs uvicorn on port 8000.
2. backend/Dockerfile: Multi-stage build (eclipse-temurin:17-jdk for build, eclipse-temurin:17-jre for runtime), runs Spring Boot jar on port 8080.
3. dummy frontend/Dockerfile: Node 20-alpine running npm run dev on port 5173 with --host.
Update explain.md.
```

**✅ Done When:**
- [x] `ai-service/Dockerfile` exists.
- [x] `backend/Dockerfile` exists.
- [x] `dummy frontend/Dockerfile` exists.
- [x] `explain.md` is updated.

---

### [x] Step 05: PostGIS Database Schema (Phase 1.3.1)
> **Summary**: Writes the SQL migration script creating all 10 tables, spatial Point columns, and GiST indexes.

**📋 Copy & Paste This Prompt:**
```text
Create db/migration/V1__init_civicsolve_schema.sql matching dbrequirement.md:
1. Run CREATE EXTENSION IF NOT EXISTS postgis;
2. Create tables: institutions, capabilities, users, challenges, challenge_evidence, moderator_audits, projects, project_members, milestones, impact_metrics.
3. Set location column as GEOMETRY(Point, 4326) on both challenges and institutions.
4. Create GiST spatial indexes: idx_challenges_location and idx_institutions_location.
5. Add all foreign keys, unique email, role checks, and status checks.
Update explain.md.
```

**✅ Done When:**
- [x] `V1__init_civicsolve_schema.sql` is created.
- [x] Contains all 10 tables and spatial GiST indexes.
- [x] `explain.md` is updated.

---

### [x] Step 06: Realistic Seed Data (Phase 1.3.2)
> **Summary**: Populates authentic test institutions (AITR, SGSITS, IIT Indore), sample challenges, users, and impact data.

**📋 Copy & Paste This Prompt:**
```text
Create db/seed/V2__seed_civicsolve_data.sql matching dbrequirement.md:
1. Insert institutions: AITR Indore, SGSITS Indore, IIT Indore, AquaFilter Pvt. Ltd. with exact GPS points.
2. Insert departmental capabilities for Water Supply, Rural Roads, and Sanitation.
3. Insert 4 users: Citizen, Faculty (Prof. Aaquib Multani), Collector, and Moderator with BCrypt password hashes.
4. Insert 6 challenges matching the frontend mock (CS-2611, CS-2598, etc.).
5. Insert sample project, milestones, and impact metrics.
Update explain.md.
```

**✅ Done When:**
- [x] `V2__seed_civicsolve_data.sql` is created.
- [x] Contains realistic data for Madhya Pradesh districts.
- [x] `explain.md` is updated.

---

## Phase 2: Python / FastAPI AI Service

### [x] Step 07: FastAPI Microservice Setup (Phase 2.1.1)
> **Summary**: Sets up FastAPI with CORS, settings, and a `/health` check.

**📋 Copy & Paste This Prompt:**
```text
Setup the FastAPI AI microservice in ai-service/:
1. Create ai-service/requirements.txt with: fastapi, uvicorn[standard], pydantic, pydantic-settings, sentence-transformers, torch, scikit-learn, numpy, pandas, httpx, pytest.
2. Create ai-service/app/core/config.py with app settings and environment variable loading.
3. Create ai-service/app/main.py with FastAPI instance, CORS allowing all origins in dev, and a GET /health endpoint returning {"status": "healthy", "service": "CivicSolve-AI"}.
4. Update explain.md.
```

**✅ Done When:**
- [x] `ai-service/requirements.txt` exists.
- [x] `ai-service/app/main.py` has working `/health`.
- [x] `explain.md` is updated.

---

### [x] Step 08: AI Sentence Embedding Service (Phase 2.1.2)
> **Summary**: Loads the AI embedding model (`all-MiniLM-L6-v2`) once into memory to convert problem text into 384-dimensional vectors.

**📋 Copy & Paste This Prompt:**
```text
Create ai-service/app/core/nlp.py:
1. Implement a thread-safe singleton EmbeddingService class.
2. Load 'sentence-transformers/all-MiniLM-L6-v2' on app startup.
3. Add methods:
   - get_embedding(text: str) -> List[float] (384-length float vector)
   - compute_similarity(vec1: List[float], vec2: List[float]) -> float (cosine similarity between -1.0 and 1.0)
4. Hook model loading into FastAPI lifespan in main.py. Update explain.md.
```

**✅ Done When:**
- [x] `nlp.py` provides working `get_embedding` and `compute_similarity`.
- [x] Embeddings compute in milliseconds.
- [x] `explain.md` is updated.

---

### [x] Step 09: Domain Classification API (Phase 2.2.1)
> **Summary**: Builds the API endpoint that reads a problem description and predicts its domain (Water, Road, Sanitation, etc.) with a confidence score.

**📋 Copy & Paste This Prompt:**
```text
Create ai-service/app/api/classify.py and register it on /api/v1/ai/classify:
1. Accept POST request with JSON: { "title": str, "description": str }.
2. Predict domain (Water Supply, Rural Infrastructure, Sanitation, Agriculture, Public Health) and sub-domain using semantic centroid comparison.
3. Extract top 5 relevant keywords.
4. Return JSON: { "domain": str, "sub_domain": str, "confidence": float, "keywords": list[str] }.
5. Write a pytest in ai-service/tests/test_classify.py verifying "Handpump broken in school" returns "Water Supply". Update explain.md.
```

**✅ Done When:**
- [x] `POST /api/v1/ai/classify` returns domain and confidence score.
- [x] `test_classify.py` passes.
- [x] `explain.md` is updated.

---

### [x] Step 10: Duplicate Detection Engine (Phase 2.3.1)
> **Summary**: Builds the API endpoint that detects if a new citizen report is already reported nearby (similarity $\ge 0.75$).

**📋 Copy & Paste This Prompt:**
```text
Create ai-service/app/api/duplicate.py and register it on /api/v1/ai/duplicates:
1. Accept POST request with: { "new_challenge": { "id", "title", "description", "lat", "lon" }, "candidates": list of nearby challenges }.
2. Calculate cosine similarity between the new challenge vector and all candidate vectors.
3. Calculate distance in km between GPS coordinates.
4. Return matches with similarity >= 0.75 ranked from highest to lowest similarity.
5. Write pytest in ai-service/tests/test_duplicate.py. Update explain.md.
```

**✅ Done When:**
- [x] Flags matching reports with similarity $\ge 0.75$.
- [x] Returns similarity percentage and distance in km.
- [x] `explain.md` is updated.

---

### [x] Step 11: Priority Scoring Calculator (Phase 2.4.1)
> **Summary**: Calculates an explainable 0–100 priority score with a human-readable reason string based on severity, population, recurrence, and health risk.

**📋 Copy & Paste This Prompt:**
```text
Create ai-service/app/api/priority.py and register it on /api/v1/ai/priority:
1. Implement the mathematical priority formula:
   Priority = min(100, 100 * (0.35 * Severity + 0.25 * log10(Pop + 1)/4 + 0.20 * Recurrence + 0.20 * HealthHazard))
2. Accept POST with: { "severity": float, "population": int, "recurrence_count": int, "health_hazard": bool, "text": str }.
3. Return: { "priority_score": float, "explanation": str, "breakdown": { ... } }.
4. Ensure the explanation is clear and easy to read. Write pytest in ai-service/tests/test_priority.py. Update explain.md.
```

**✅ Done When:**
- [x] Score is bounded between 0 and 100.
- [x] Clear explanation string generated.
- [x] `explain.md` is updated.

---

### [x] Step 12: University Capability Matcher (Phase 2.4.2)
> **Summary**: Recommends the best university departments and industry mentors based on capability overlap, capacity, and distance in km.

**📋 Copy & Paste This Prompt:**
```text
Create ai-service/app/api/matching.py and register it on /api/v1/ai/match:
1. Implement the matching algorithm:
   Score = 0.55 * Similarity(domain, expertise) + 0.20 * Capacity + 0.25 * (1 / (1 + DistanceKm / 50))
2. Accept POST with: { "domain": str, "lat": float, "lon": float, "institutions": list of institutions with capabilities }.
3. Return ranked universities with match percentage, distance in km, and match reasons.
4. Write pytest in ai-service/tests/test_matching.py. Update explain.md.
```

**✅ Done When:**
- [x] Returns ranked universities with % match and distance.
- [x] Pytests pass.
- [x] `explain.md` is updated.

---

## Phase 3: Spring Boot 3 Core Backend

### [x] Step 13: Spring Boot Maven Setup (Phase 3.1.1)
> **Summary**: Scaffolds the Java 17 Spring Boot 3 modular monolith with JPA, PostgreSQL, Hibernate Spatial, and JJWT.

**📋 Copy & Paste This Prompt:**
```text
Create backend/pom.xml and backend/src/main/resources/application.yml:
1. Dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-validation, postgresql, hibernate-spatial, jjwt-api (0.12.x), lombok, spring-boot-starter-test.
2. application.yml: Configure datasource from env vars, hibernate ddl-auto=validate, spatial dialect, and JWT secret.
3. Create backend/src/main/java/org/civicsolve/Application.java with @SpringBootApplication, @EnableAsync.
4. Verify project compiles with 'mvn clean compile'. Update explain.md.
```

**✅ Done When:**
- [x] `mvn clean compile` succeeds.
- [x] Database connection settings match `.env`.
- [x] `explain.md` is updated.

---

### [x] Step 14: JWT Security & Roles (RBAC) (Phase 3.1.2)
> **Summary**: Implements user login, registration, password hashing (BCrypt), and role guards for Citizens, Universities, Government, and Moderators.

**📋 Copy & Paste This Prompt:**
```text
Implement authentication and security in backend/src/main/java/org/civicsolve/auth/:
1. JwtTokenProvider: generates and parses HMAC-SHA256 JWT tokens with role claims.
2. JwtAuthenticationFilter: validates Bearer token on incoming requests.
3. SecurityConfig: public access on /api/v1/auth/** and GET /api/v1/challenges/**; requires MODERATOR role on /api/v1/moderator/**.
4. AuthController:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login (returns JWT token and user info).
5. Update explain.md.
```

**✅ Done When:**
- [x] `POST /api/v1/auth/login` returns valid JWT token.
- [x] Unauthorized requests return `401 Unauthorized`.
- [x] `explain.md` is updated.

---

### [x] Step 15: Spatial Challenge Repository (Phase 3.2.1)
> **Summary**: Creates the Challenge JPA Entity using JTS `Point` geometries and spatial query methods using PostGIS `ST_DWithin`.

**📋 Copy & Paste This Prompt:**
```text
Implement Challenge entity and repository in backend/src/main/java/org/civicsolve/challenge/:
1. Challenge entity: maps all columns from dbrequirement.md with org.locationtech.jts.geom.Point for location (SRID 4326).
2. ChallengeRepository with spatial query:
   - findWithinRadius(Point p, double radiusMeters) using PostGIS ST_DWithin.
   - findByDistrictAndDomain with pagination.
3. DTOs: ChallengeIntakeDTO and ChallengeResponseDTO. Update explain.md.
```

**✅ Done When:**
- [x] Entity maps JTS `Point` spatial coordinate cleanly.
- [x] PostGIS spatial query compiles and runs.
- [x] `explain.md` is updated.

---

### [x] Step 16: Challenge Submission API (Phase 3.2.2)
> **Summary**: Builds the API endpoint to submit a problem with description, GPS coordinates, and photos, saving it with status `SUBMITTED`.

**📋 Copy & Paste This Prompt:**
```text
Implement ChallengeService and ChallengeController in backend/src/main/java/org/civicsolve/challenge/:
1. POST /api/v1/challenges: Multipart endpoint taking JSON metadata + up to 5 photos.
   - Saves challenge with status 'SUBMITTED'.
   - Stores photos in uploads/ directory and records them in challenge_evidence.
   - Emits a ChallengeSubmittedEvent asynchronously.
2. GET /api/v1/challenges: Returns paginated challenges with domain, status, and district filters.
3. GET /api/v1/challenges/{id}: Returns complete Challenge details. Update explain.md.
```

**✅ Done When:**
- [x] Challenge created with photos attached.
- [x] Status is `SUBMITTED`.
- [x] `explain.md` is updated.

---

### [x] Step 17: Async AI Gateway Client (Phase 3.3.1)
> **Summary**: Connects Spring Boot to the FastAPI AI service in the background, updating the challenge to `AI_ANALYZED` with predicted domain and priority.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/ai/:
1. Configure Spring RestClient targeting AI_SERVICE_URL (http://fastapi-ai:8000).
2. Implement AiGatewayService calling classify, duplicate, priority, and match endpoints.
3. Implement @Async @EventListener for ChallengeSubmittedEvent:
   - Calls AI endpoints.
   - Updates challenge with domain, priority_score, and explanation.
   - Transitions status to 'AI_ANALYZED'.
4. Update explain.md.
```

**✅ Done When:**
- [x] Submitting a challenge triggers background AI call.
- [x] Challenge status updates to `AI_ANALYZED`.
- [x] `explain.md` is updated.

---

### [x] Step 18: Institution & Capability APIs (Phase 3.4.1)
> **Summary**: Creates REST endpoints to browse participating universities, industry partners, and departmental capabilities.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/institution/:
1. Entities: Institution and Capability with bidirectional relationship.
2. InstitutionController:
   - GET /api/v1/institutions: List all universities and industry partners with capabilities.
   - GET /api/v1/institutions/{id}: Detailed profile with active projects.
   - POST /api/v1/institutions/{id}/capabilities: Add or edit capability.
3. Update explain.md.
```

**✅ Done When:**
- [x] `GET /api/v1/institutions` returns universities with capability tags.
- [x] `explain.md` is updated.

---

## Phase 4: Moderation & Project Lifecycle

### [x] Step 19: Moderator Review & Merging (Phase 4.1.1)
> **Summary**: Builds the moderator API to approve challenges (`VALIDATED`), reject spam, or merge duplicate reports with an audit log.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/moderation/:
1. ModeratorAudit entity: audit_id, challenge_id, moderator_id, action, reason, timestamp.
2. ModerationController with @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')"):
   - GET /api/v1/moderator/queue: List challenges in 'AI_ANALYZED' or flagged duplicates.
   - POST /api/v1/moderator/{id}/validate: Approves challenge, sets status 'VALIDATED', writes audit entry.
   - POST /api/v1/moderator/{id}/reject: Rejects challenge with reason.
   - POST /api/v1/moderator/{id}/merge: Merges duplicate into parent challenge and updates report counts.
3. Update explain.md.
```

**✅ Done When:**
- [x] Validation moves status to `VALIDATED`.
- [x] Merging links reports properly.
- [x] Audit log is saved on every action.
- [x] `explain.md` is updated.

---

### [x] Step 20: University Team Builder (Phase 4.2.1)
> **Summary**: Allows universities to claim validated challenges, spawning a Project and assigning faculty leads and students.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/project/:
1. Project and ProjectMember entities.
2. ProjectController:
   - POST /api/v1/projects/{challengeId}/accept: University claims challenge. Creates Project in stage 'PROPOSAL' and updates challenge status to 'MATCHED'.
   - POST /api/v1/projects/{projectId}/team: Adds faculty guide, student researchers, and industry mentors.
   - GET /api/v1/projects/{id}: Returns project team and current stage.
3. Update explain.md.
```

**✅ Done When:**
- [x] University can accept challenge.
- [x] Project created with team members.
- [x] `explain.md` is updated.

---

### [x] Step 21: Stage Gates & Milestones (Phase 4.3.1)
> **Summary**: Enforces progression through strict stages (`Proposal` $\to$ `Prototype` $\to$ `Field Test` $\to$ `Pilot`) based on milestone deliverable approvals.

**📋 Copy & Paste This Prompt:**
```text
Implement stage progression and milestones in backend/src/main/java/org/civicsolve/project/:
1. Milestone entity: title, description, due_date, status (PENDING, SUBMITTED, APPROVED), deliverable_url.
2. Endpoints:
   - POST /api/v1/projects/{id}/milestones: Add milestone.
   - POST /api/v1/projects/{id}/milestones/{milestoneId}/submit: Upload milestone proof.
   - POST /api/v1/projects/{id}/advance-stage: Advances stage only when all milestones in current stage are APPROVED.
3. Update explain.md.
```

**✅ Done When:**
- [x] Milestones can be submitted and approved.
- [x] Project advances through stages sequentially.
- [x] `explain.md` is updated.

---

### [x] Step 22: Public Impact Ledger (Phase 4.4.1)
> **Summary**: Records verified before-and-after community metrics and publishes them on the immutable public Impact Ledger.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/impact/:
1. ImpactMetric entity: metric_name, before_value, after_value, unit, verified_at.
2. ImpactController:
   - POST /api/v1/impact/{projectId}/metrics: Submit before/after values (e.g. Turbidity: 85 NTU -> 4.2 NTU).
   - GET /api/v1/impact/ledger: Public endpoint returning all verified community outcomes.
3. Update explain.md.
```

**✅ Done When:**
- [x] Impact metrics saved with before/after values.
- [x] Public ledger returns completed projects.
- [x] `explain.md` is updated.

---

### [x] Step 23: District Analytics & Heatmaps (Phase 4.4.2)
> **Summary**: Fast aggregate endpoints for landing page counters (Challenges Logged, Active Projects) and district heatmap data.

**📋 Copy & Paste This Prompt:**
```text
Implement backend/src/main/java/org/civicsolve/analytics/:
1. AnalyticsController:
   - GET /api/v1/analytics/summary: Returns live counts (total challenges, active projects, deployed solutions, districts).
   - GET /api/v1/analytics/district-distribution: Returns counts and average priority score by district for heatmap rendering.
   - GET /api/v1/analytics/domain-breakdown: Returns percentage distribution by domain.
2. Optimize queries with SQL aggregates. Update explain.md.
```

**✅ Done When:**
- [x] Summary endpoint responds in <100ms.
- [x] Returns valid JSON for charts and heatmaps.
- [x] `explain.md` is updated.

---

## Phase 5: React Frontend Integration

### [x] Step 24: Frontend API & Auth Context (Phase 5.1.1)
> **Summary**: Connects the `dummy frontend` to the backend with Axios, JWT storage in localStorage, and an `AuthContext`.

**📋 Copy & Paste This Prompt:**
```text
Configure the frontend API client and authentication in dummy frontend/:
1. Create src/lib/api.ts with an Axios instance using VITE_API_BASE_URL (http://localhost:8080/api/v1).
2. Add request interceptor attaching 'Authorization: Bearer <token>'.
3. Create src/context/AuthContext.tsx with useAuth hook managing user, role, token, login, and logout.
4. Add login modal component connected to POST /api/v1/auth/login. Update explain.md.
```

**✅ Done When:**
- [x] Axios client attaches JWT token automatically.
- [x] Login modal works and persists user session.
- [x] `explain.md` is updated.

---

### [x] Step 25: Interactive GPS Map Picker (Phase 5.2.1)
> **Summary**: Creates a draggable Leaflet OpenStreetMap picker with current location button and reverse geocoding to district and ward.

**📋 Copy & Paste This Prompt:**
```text
Create dummy frontend/src/components/MapPicker.tsx:
1. Render interactive Leaflet OpenStreetMap centered on Madhya Pradesh (22.9734° N, 75.8321° E).
2. Draggable marker that updates selected latitude and longitude.
3. 'Use My Current Location' button using browser Geolocation API.
4. Reverse geocoding converting coordinates into District and Tehsil/Ward.
5. Emits onChange({ lat, lon, district, ward }). Update explain.md.
```

**✅ Done When:**
- [x] Interactive map displays and marker is draggable.
- [x] Coordinates update and reverse geocode.
- [x] `explain.md` is updated.

---

### [x] Step 26: Full Challenge Submission Form (Phase 5.2.2)
> **Summary**: Builds the complete submission flow with MapPicker, photo uploader, population slider, and real-time AI preview chips.

**📋 Copy & Paste This Prompt:**
```text
Build dummy frontend/src/routes/submit.tsx:
1. Multi-step form:
   - Step 1: MapPicker for GPS location + affected population slider.
   - Step 2: Title and description (English/Hindi text or voice input).
   - Step 3: Photo upload dropzone with previews and remove buttons.
   - Step 4: Real-time AI preview chips showing predicted domain and priority badge.
2. Submits multipart form data to POST /api/v1/challenges.
3. Redirects to challenge details page with toast confirmation. Update explain.md.
```

**✅ Done When:**
- [x] User can submit form with photos and location.
- [x] Challenge appears in database and navigates to detail page.
- [x] `explain.md` is updated.

---

### [x] Step 27: Challenge Dossier & AI Card (Phase 5.3.1)
> **Summary**: Builds the complete Challenge details view matching Figure 5 from the synopsis with the full AI Analysis Card.

**📋 Copy & Paste This Prompt:**
```text
Build dummy frontend/src/routes/challenges/$id.tsx matching Figure 5 from synopsis:
1. Banner: Title, submission date, status badge, district breadcrumb.
2. Left pane: Problem description, photo gallery, pinned Leaflet map.
3. Right pane - AI Analysis Card:
   - Domain & Sub-domain badge with confidence score.
   - Explainable priority gauge (0-100) with formula rationale.
   - Possible duplicates list with similarity %.
   - Recommended universities with match %, distance, and 1-click 'Accept Challenge' button for universities.
4. Update explain.md.
```

**✅ Done When:**
- [x] Layout matches Figure 5 in synopsis.
- [x] University accounts can click `Accept Challenge`.
- [x] `explain.md` is updated.

---

### [x] Step 28: Multi-Role Dashboards (Phase 5.4.1)
> **Summary**: Builds dedicated dashboards for Citizens, Moderators (with side-by-side duplicate merger), Universities, and Government heatmap.

**📋 Copy & Paste This Prompt:**
```text
Build role-based dashboards in dummy frontend/:
1. /dashboard/citizen: Submitted challenges list with visual status stepper.
2. /dashboard/moderator: Pending review queue, side-by-side duplicate merger with approve/reject/merge actions.
3. /dashboard/university: Matched challenges inbox, active project workspace, and milestone deliverable uploader.
4. /dashboard/government: KPI counters, district choropleth heatmap, and report export.
Update explain.md.
```

**✅ Done When:**
- [x] All 4 role dashboards are accessible and functional.
- [x] Moderator can merge duplicates side-by-side.
- [x] `explain.md` is updated.

---

## Phase 6: Testing & Launch

### [x] Step 29: Automated Test Matrix (TC01-TC10) (Phase 6.1.1)
> **Summary**: Automates verification of all 10 representative test cases from Table 5 in the synopsis.

**📋 Copy & Paste This Prompt:**
```text
Implement automated integration tests for Table 5 test cases (TC01 to TC10):
- TC01 & TC02: Valid login returns JWT; invalid returns 401.
- TC03: Challenge submission creates record with status 'SUBMITTED'.
- TC04: AI classification categorizes 'Handpump broken in school' to 'Water Supply'.
- TC05: Duplicate detection finds matches with similarity >= 0.75.
- TC06: Priority score is bounded between 0 and 100 with explanation.
- TC07: University recommendation returns ranked list.
- TC08: Moderator validation moves status to 'VALIDATED' and writes audit log.
- TC09: RBAC forbids unauthorized citizen access to moderator endpoints (HTTP 403).
- TC10: Analytics summary loads under 500ms.
Run tests and report results. Update explain.md.
```

**✅ Done When:**
- [x] All 10 test cases (TC01 to TC10) pass green.
- [x] `explain.md` is updated.

---

### [x] Step 30: Production Build & Smoke Test (Phase 6.2.1)
> **Summary**: Builds all Docker containers cleanly and runs an automated smoke test across all services.

**📋 Copy & Paste This Prompt:**
```text
Finalize deployment and verification:
1. Run 'docker-compose build --no-cache' ensuring all images build cleanly.
2. Start the entire platform with 'docker-compose up -d'.
3. Run an automated curl smoke-test script verifying:
   - PostgreSQL PostGIS on port 5432.
   - FastAPI /health on port 8000.
   - Spring Boot /api/v1/analytics/summary on port 8080.
   - React frontend on port 5173.
4. Record final deployment status in explain.md.
```

**✅ Done When:**
- [x] `docker compose up -d` starts all 4 containers healthy.
- [x] All 4 endpoints return HTTP 200.
- [x] `explain.md` is updated.
