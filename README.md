# Campus-portal
This  is a repo for Gamified learning and Ai shortlisting campus placement portal
# 🎓 Gamified Learning & AI-Based Campus Placement Platform

A full-stack MERN application combining gamified skill-building (Aptitude, DSA,
Programming, Resume, Interview levels with quizzes, points, badges, and a
leaderboard) with an AI-assisted campus placement pipeline (resume upload +
NLP analysis, job postings, resume-gated applications, and AI match scoring
for recruiters).

## Tech Stack
- **Frontend:** React.js (React Router, Context API, Axios)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (role-based: student / recruiter / admin)
- **AI:** Lightweight keyword/skill-dictionary based NLP for resume parsing & job matching

---

## 1. Project Structure

```
campus-placement-platform/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── middleware/                  # JWT auth + role guard + error handler
│   ├── models/                      # User, Level, Attempt, Job, Application, PlacedStudent
│   ├── controllers/                 # Business logic per feature
│   ├── routes/                      # Express route definitions
│   ├── utils/
│   │   ├── nlpMatcher.js            # Resume <-> Job skill matching engine
│   │   ├── upload.js                # Multer config for resume files
│   │   └── extractText.js           # PDF/text extraction
│   ├── seed/seed.js                 # Seeds levels, admin account, sample placements
│   ├── uploads/resumes/             # Uploaded resume files land here
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/               # Navbar, ProtectedRoute, Alert, ProgressBar, BadgeList
    │   ├── context/AuthContext.js    # Global auth state
    │   ├── services/api.js           # Axios instance w/ JWT interceptor
    │   ├── pages/
    │   │   ├── Login.js, Register.js, PlacementHistory.js
    │   │   ├── student/  (Dashboard, Levels, Quiz, Leaderboard, Jobs, ResumeUpload)
    │   │   ├── recruiter/ (Dashboard, PostJob, Applicants)
    │   │   └── admin/    (Login, Dashboard, ManageUsers, ManageLevels, ManageJobs, PlacedStudents)
    │   ├── styles/global.css
    │   └── App.js
    └── package.json
```

## 2. Setup

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, ADMIN_SECRET_KEY
npm install
npm run seed               # creates levels, a default admin, and sample placement records
npm run dev                 # starts on http://localhost:5000
```

Default seeded admin (change the password after first login):
- Email: `admin@campusplacement.com`
- Password: `Admin@12345`
- Admin Secret Key: whatever you set as `ADMIN_SECRET_KEY` in `.env`

### Frontend
```bash
cd frontend
npm install
npm start                   # starts on http://localhost:3000, proxies /api to :5000
```

---

## 3. Core Features Implemented

### Roles & Auth
- Student / Recruiter / Admin, JWT-based.
- Admin accounts are **not** creatable via the public `/register` endpoint — they require
  the secret `ADMIN_SECRET_KEY` (via `/api/auth/admin/register` and `/api/auth/admin/login`),
  and a **separate secure Admin Login page** in the UI.

### Gamified Learning
- 5 levels: Aptitude → DSA → Programming → Resume → Interview (sequential unlock).
- Quiz per level, scored server-side; points + badges awarded; next level auto-unlocks on passing.
- Global leaderboard ranked by points.

### Dashboards
- **Student:** progress %, points, rank, badges, recent applications.
- **Recruiter:** jobs posted, applicant counts, close/reopen jobs, view applicants.
- **Admin:** platform-wide stats, quick links to every management screen.

### Placement Module (resume-gated)
- Student uploads resume → instant AI summary, quality score (0–100), detected skills,
  and improvement suggestions (`/student/resume`).
- **A student cannot apply to any job until a resume is on file** — enforced server-side
  in `applicationController.applyToJob`.
- On successful application, the **full student profile + resume snapshot** is stored
  against the `Application` record and immediately visible to the recruiter (name, email,
  college, branch, graduation year, LinkedIn, gamification points, AI match score, matched/missing
  skills, and a button to view/download the resume file).
- Resumes are **not** served from a public/static folder. They're only reachable via the
  authenticated `GET /api/applications/:id/resume` endpoint, restricted to the job's recruiter,
  the applying student, or an admin. The frontend fetches this as an authenticated blob and
  opens it in a new tab (a plain `<a href="/uploads/...">` link would neither be authenticated
  nor reliably reach the backend through the React dev server).

### AI Resume ↔ Job Matching (`backend/utils/nlpMatcher.js`)
- Tokenises & normalises text, strips stop-words.
- Matches against an extensible **skill dictionary** (100+ tech/soft skills).
- Produces: match score (0–100), matched skills, missing skills, experience-year bonus.
- Separately generates a **resume quality summary** (independent of any job) with suggestions
  such as "add a Projects section", "include GitHub/LinkedIn links", etc.
- This is intentionally dependency-light (no paid API) so it runs instantly and free of cost —
  swap in a real embeddings-based model later without changing the calling code's shape.

### Admin Capabilities
- Manage Students & Recruiters: view all progress/company data in clean tables, activate/deactivate, delete.
- Manage Levels & Questions: edit level pass-thresholds, add/edit/delete quiz questions live.
- Manage Jobs: platform-wide oversight, force close/reopen any job.
- **Placement History management:** add/edit/delete placed-student records, including a
  **LinkedIn profile link column** — visible read-only to students/recruiters at `/placements`.
- Secure admin credential flow via `ADMIN_SECRET_KEY`.

### Removed per requirements
- The "Senior Guidance" Q&A/chat module has been intentionally **excluded** from this build.

---

## 4. Example API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register student/recruiter |
| POST | `/api/auth/login` | Public | Student/recruiter login |
| POST | `/api/auth/admin/login` | Public + secret key | Admin login |
| GET | `/api/levels` | Student | List levels + lock status |
| POST | `/api/levels/:key/submit` | Student | Submit quiz, get points/badges |
| GET | `/api/leaderboard` | Any | Ranked student leaderboard |
| POST | `/api/resume/upload` | Student | Upload + AI-analyse resume |
| POST | `/api/jobs` | Recruiter | Post a job |
| GET | `/api/jobs` | Any | Browse active jobs |
| POST | `/api/applications/:jobId` | Student | Apply (requires resume on file) |
| GET | `/api/applications/job/:jobId` | Recruiter | View ranked applicants |
| GET | `/api/applications/:id/resume` | Recruiter (job owner) / applying student / admin | Securely download the resume attached to an application |
| GET | `/api/admin/students` | Admin | All student data |
| POST | `/api/admin/levels/:id/questions` | Admin | Add a quiz question |
| POST | `/api/admin/placed` | Admin | Add placed-student record (incl. LinkedIn) |
| PUT | `/api/admin/placed/:id` | Admin | Edit placed-student record |

---

## 5. UI Pages (suggested / implemented)
Login · Register · Admin Login · Student Dashboard · Levels · Quiz · Leaderboard ·
Resume Upload (AI summary) · Job Listing (apply) · Recruiter Dashboard · Post Job ·
View Applicants · Admin Dashboard · Manage Students · Manage Recruiters ·
Manage Levels/Questions · Manage Jobs · Placement History Management ·
Public Placement History (read-only for students/recruiters)

## 7. Changelog (latest fixes)
- **Fixed admin login failure:** email lookups now normalise case/whitespace
  (`normaliseEmail` in `authController.js`) before querying MongoDB. Mongoose's
  `lowercase: true` schema option only applies when a document is saved, not on
  `findOne` query filters — so an admin email typed with different casing than
  how it was stored would silently fail to match. This affected `login`,
  `admin/login`, and `admin/register`.
- **Removed the "Placements" tab from the recruiter navbar** (and blocked the
  route for recruiters at the router level) — it now only appears for students
  and admins.
- **Added a status filter to the recruiter's Applicants page** — tabs for
  All / Applied / Shortlisted / Hired / Rejected, each showing a live count.
- **Added a LinkedIn field to student registration**, stored on the student's
  profile and surfaced to recruiters (in the Applicants view) and admins (in
  Manage Students) automatically once populated.

## 8. Suggested Future Improvements
- Replace the keyword-based NLP with a proper embeddings model (e.g. sentence-transformers)
  for more semantically-aware resume-job matching.
- Add email notifications (application received, shortlisted, hired).
- Add pagination & search/filter on large tables (students, jobs, applicants).
- Add refresh tokens + token rotation for stronger session security.
- Add file-type-specific resume parsing (proper `.docx` parser via `mammoth`, OCR for scanned PDFs).
- Add unit/integration tests (Jest + Supertest for backend, React Testing Library for frontend).
- Add real-time notifications via WebSockets for application status changes.
- Add analytics dashboard for admin (placement trends by year/branch/company).
- Rate-limit auth endpoints and add CAPTCHA on admin login for extra brute-force protection.
