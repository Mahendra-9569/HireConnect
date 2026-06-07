# 🚀 HireConnect — AI-Powered Job Portal with Microservices Architecture

<div align="center">

![HireConnect Banner](https://img.shields.io/badge/HireConnect-AI%20Job%20Portal-6366f1?style=for-the-badge&logo=briefcase&logoColor=white)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Event%20Bus-231F20?style=flat-square&logo=apachekafka)](https://kafka.apache.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF%20Gen-40B5A4?style=flat-square&logo=puppeteer)](https://pptr.dev/)

**A production-grade, microservices-based job portal platform powered by Google Gemini AI.**  
Built for jobseekers and recruiters. Features OTP-verified registration, JWT-based auth with token blacklisting, AI interview prep, ATS resume scoring, career path suggestions, and Puppeteer-based PDF resume generation — all split across 5 independently deployable backend services.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Microservices Breakdown](#-microservices-breakdown)
- [Database Schemas](#-database-schemas)
- [API Reference](#-api-reference)
- [Frontend Pages & Routing](#-frontend-pages--routing)
- [Authentication & Security Flow](#-authentication--security-flow)
- [AI Features Deep Dive](#-ai-features-deep-dive)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment Notes](#-deployment-notes)
- [Known Issues & Roadmap](#-known-issues--roadmap)

---

## 🧭 Overview

**HireConnect** (frontend package name: `hireheaven`) is a full-stack job portal built on a true **microservices architecture**. Each domain concern — authentication, user/jobseeker profiles, recruiter & job management, AI tooling, and file/email utilities — lives in its own independently runnable Node.js service, all consumed by a single React + Vite frontend.

The platform serves two distinct roles:

- **Jobseekers** — Register with OTP verification, upload a resume, browse and apply for jobs in one click, track application status, generate AI-powered interview prep reports, get ATS resume scores, and receive career path recommendations.
- **Recruiters** — Create companies with logos, post and manage job listings, review all applicants per job, update application statuses (Submitted → Hired / Rejected) with automated email notifications sent via Kafka + Nodemailer.

---

## 🏗️ Architecture

HireConnect follows a **polyrepo-style microservices** design. Services own their data and business logic. Frontend communicates with each service directly over REST. Services communicate with each other synchronously (HTTP via Axios) or asynchronously (Apache Kafka for emails).

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HIRECONNECT PLATFORM                       │
├─────────────────────────┬───────────────────────────────────────────┤
│  FRONTEND               │  BACKEND MICROSERVICES                    │
│  React + Vite           │                                           │
│  Port: 5173             │  ┌──────────────────────┐  :5000          │
│                         │  │  Authentication Svc   │──► MongoDB     │
│  5 Axios instances      │  │  OTP, JWT, Blacklist  │──► Nodemailer  │
│  (auth/user/job/        │  │  Cloudinary Upload    │──► Cloudinary  │
│   interview/utils)      │  └──────────────────────┘                 │
│                         │                                           │
│  AuthContext            │  ┌──────────────────────┐  :5002          │
│  ThemeContext           │  │  Jobseeker Svc        │──► MongoDB     │
│  ProtectedRoute         │  │  Profile, Resume,     │──► Cloudinary  │
│                         │  │  Skills, Apply, Apps  │                │
│  20+ React Router       │  └──────────────────────┘                 │
│  pages with role-       │                                           │
│  based access           │  ┌──────────────────────┐  :5003          │
│                         │  │  Recruiter Svc        │──► MongoDB     │
│                         │  │  Companies, Jobs,     │──► Cloudinary  │
│                         │  │  Applications, Kafka  │──► Kafka       │
│                         │  └──────────────────────┘                 │
│                         │                                           │
│                         │  ┌──────────────────────┐  :5001          │
│                         │  │  Utils/Gemini Svc     │──► Cloudinary  │
│                         │  │  File upload,         │──► Gemini AI   │
│                         │  │  Career advisor,      │──► Nodemailer  │
│                         │  │  Resume ATS analyzer  │                │
│                         │  └──────────────────────┘                 │
│                         │                                           │
│                         │  ┌──────────────────────┐  :3000          │
│                         │  │  Interview Report Svc │──► MongoDB     │
│                         │  │  AI interview prep,   │──► Gemini AI   │
│                         │  │  PDF resume gen,      │──► Puppeteer   │
│                         │  │  Zod schema output    │                │
│                         │  └──────────────────────┘                 │
│                         │                                           │
│                         │  ┌──────────────────────────────────────┐ │
│                         │  │  Apache Kafka (send-mail topic)      │ │
│                         │  │  Recruiter Svc → publishes messages  │ │
│                         │  │  Utils Svc → consumes & sends emails │ │
│                         │  └──────────────────────────────────────┘ │
└─────────────────────────┴───────────────────────────────────────────┘
```

### Inter-Service Communication

| Type | Usage |
|---|---|
| **Synchronous REST (Axios)** | All services call the Utils service (`/api/utils/upload`) to upload files to Cloudinary |
| **Asynchronous Kafka** | Recruiter service publishes to `send-mail` topic when an application status changes; Utils service consumes and sends the email |

---

## ✨ Features

### For Jobseekers
- OTP-verified registration with resume upload
- One-click job apply (uses stored resume URL)
- Subscription-aware application prioritization
- Profile management: bio, phone, profile picture, resume replacement
- Skills management (add / remove)
- Application tracker with job title, salary, location, and status
- **AI Interview Studio** — upload resume + job description → get match score, technical questions, behavioral questions, skill gaps, and a day-wise preparation plan
- **ATS Resume Analyzer** — upload PDF → get ATS score, formatting/keywords/structure/readability breakdown, and prioritized suggestions
- **Career Advisor** — enter your skills → get job role options, skills to learn, and learning approach advice

### For Recruiters
- Company management: create (with logo), view, delete (cascades jobs + applications)
- Job posting with title, salary, location, role, type, work mode, and openings count
- Job toggle (active/inactive), full edit support
- Per-job applicant list with subscription priority sorting
- Application status updates (Submitted / Hired / Rejected) with automatic email notification to applicant

### Platform-Wide
- Dark / Light theme toggle with system preference detection and smooth CSS transitions
- Role-based protected routes (jobseeker-only, recruiter-only, both)
- JWT token blacklisting for secure server-side logout
- Centralized error handling and TryCatch wrapper pattern across all services
- Multer-based file upload with base64 buffer forwarding to Cloudinary

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 7 | Build tool and dev server |
| React Router DOM v6 | Client-side routing |
| Tailwind CSS 3 | Utility-first styling |
| Axios | HTTP client (5 independent instances) |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| clsx | Conditional class names |

### Backend (per service)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server framework |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Access token auth (15-day expiry) |
| bcryptjs | Password hashing (salt rounds: 10) |
| Multer | File upload middleware |
| Cloudinary SDK | Media/file CDN storage |
| Axios | Inter-service HTTP calls |
| Nodemailer | Transactional email via Gmail SMTP |
| KafkaJS | Event streaming for async email delivery |
| Google Gemini AI (`@google/genai`) | AI generation (gemini-2.5-flash / gemini-3-flash-preview) |
| Puppeteer | Headless browser for PDF generation |
| pdf-parse | Server-side PDF text extraction |
| Zod + zod-to-json-schema | Structured AI response schema enforcement |
| dotenv | Environment variable management |

---

## 📁 Project Structure

```
hireConnect/
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # 5 Axios instances, session helpers, base64 util
│   │   ├── components/
│   │   │   ├── JsonTree.jsx           # Recursive JSON tree renderer
│   │   │   ├── Layout.jsx             # App shell wrapper
│   │   │   ├── Navbar.jsx             # Top nav with auth state + theme toggle
│   │   │   ├── ProtectedRoute.jsx     # Role-based route guard
│   │   │   └── UI.jsx                 # Reusable UI primitives
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # JWT session, login/logout, refreshMe
│   │   │   └── ThemeContext.jsx       # Dark/light theme with system detection
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx          # Login, Register, Verify OTP
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── JobsPages.jsx          # Job list, job detail, company detail
│   │   │   ├── UserPages.jsx          # Dashboard, profile, applications, public profile
│   │   │   ├── RecruiterPages.jsx     # Companies, create company/job, recruiter apps
│   │   │   ├── InterviewAndToolsPages.jsx  # Interview studio, report, career, ATS
│   │   │   └── NotFound.jsx           # 404 page
│   │   ├── utils/
│   │   │   └── format.js              # Date/number formatting helpers
│   │   ├── App.jsx                    # Root router + provider composition
│   │   ├── main.jsx                   # React DOM entry point
│   │   └── index.css                  # Global styles + Tailwind directives
│   ├── .env                           # VITE_ API base URLs
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── services/
    ├── authentication/               # Port 5000 — Auth Service
    │   ├── controllers/auth.js        # register, verifyOTP, login, logout
    │   ├── middleware/multer.js        # File upload middleware
    │   ├── models/
    │   │   ├── User.js                # User schema with OTP fields
    │   │   └── BlackList.js           # Token blacklist schema
    │   ├── routes/auth.js             # /api/auth routes
    │   ├── utils/
    │   │   ├── buffer.js              # File → base64 buffer helper
    │   │   ├── db.js                  # MongoDB connection
    │   │   ├── errorHandler.js        # Custom ErrorHandler class
    │   │   ├── mailer.js              # Nodemailer Gmail SMTP
    │   │   ├── serialize.js           # serializeUser output shaper
    │   │   └── TryCatch.js            # Async error wrapper HOF
    │   ├── app.js                     # Express app with CORS
    │   ├── index.js                   # Server entry + DB connect
    │   └── Dockerfile
    │
    ├── jobseeker/                    # Port 5002 — Jobseeker/User Service
    │   ├── controllers/user.js        # profile, updateProfile, skills, apply, applications
    │   ├── middlewares/
    │   │   ├── auth.js                # JWT verify + blacklist check
    │   │   └── multer.js
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Job.js                 # Read-only mirror of Job schema
    │   │   ├── Application.js         # Application schema
    │   │   └── BlackList.js
    │   ├── routes/user.js             # /api/user routes
    │   └── utils/ (buffer, db, errorHandler, serialize, TryCatch)
    │
    ├── recruiter/                    # Port 5003 — Recruiter/Job Service
    │   ├── controllers/job.js         # company CRUD, job CRUD, application management
    │   ├── middlewares/
    │   │   ├── auth.js                # JWT verify + role check
    │   │   └── multer.js
    │   ├── models/
    │   │   ├── Company.js             # Company schema
    │   │   ├── Job.js                 # Job schema (full write model)
    │   │   ├── Application.js
    │   │   ├── User.js
    │   │   └── BlackList.js
    │   ├── routes/job.js              # /api/job routes
    │   ├── producer.js                # Kafka producer (send-mail topic)
    │   ├── template.js                # HTML email template for status updates
    │   └── utils/ (buffer, db, errorHandler, serialize, TryCatch)
    │
    ├── geminiResponse/               # Port 5001 — Utils/AI Service
    │   ├── routes.js                  # /upload, /career, /resume-analyser
    │   ├── app.js                     # Express app (50mb JSON limit)
    │   └── index.js                   # Server entry
    │
    └── interviewReport/              # Port 3000 — Interview Report Service
        ├── src/
        │   ├── app.js                 # Express app
        │   ├── config/database.js     # MongoDB connection
        │   ├── controllers/
        │   │   └── interview.controller.js   # generate, getById, getAll, generatePdf
        │   ├── middlewares/
        │   │   ├── auth.middleware.js  # JWT verify (CommonJS)
        │   │   └── file.middleware.js  # Multer (memory storage)
        │   ├── models/
        │   │   └── interviewReport.model.js  # Full report schema with sub-docs
        │   ├── routes/
        │   │   └── interview.routes.js
        │   └── services/
        │       └── ai.service.js      # Gemini AI calls + Puppeteer PDF gen
        └── server.js                  # Entry point
```

---

## 🗄 Database Schemas

All services connect to the same **MongoDB Atlas cluster** (`MicroservicesDB`) but own their models independently.

### User (auth + jobseeker + recruiter services)
```
User {
  name:                 String (required)
  email:                String (required, unique, indexed)
  password:             String (required, bcrypt hashed)
  phone_number:         String (required)
  role:                 "jobseeker" | "recruiter"
  bio:                  String (nullable)
  resume:               String (Cloudinary URL, nullable)
  resume_public_id:     String (Cloudinary public_id, nullable)
  profile_pic:          String (Cloudinary URL, nullable)
  profile_pic_public_id:String (nullable)
  subscription:         Date (nullable — expiry date for priority sorting)
  skills:               [String]
  isVerified:           Boolean (default: false)
  otp:                  String (nullable, 6-digit, 10-min TTL)
  otpExpires:           Date (nullable)
  created_at:           Date (auto)
}
```

### Company (recruiter service)
```
Company {
  name:             String (required, unique, indexed)
  description:      String (required)
  website:          String (required)
  logo:             String (Cloudinary URL, required)
  logo_public_id:   String (required)
  recruiter_id:     ObjectId → User (required)
  created_at:       Date (auto)
}
```

### Job (recruiter + jobseeker services)
```
Job {
  title:                     String (required)
  description:               String (required)
  salary:                    Number (nullable)
  location:                  String (nullable)
  job_type:                  String (required)  — e.g. "Full-time"
  openings:                  Number (required)
  role:                      String (required)  — e.g. "Backend Engineer"
  work_location:             String (required)  — e.g. "Remote"
  company_id:                ObjectId → Company (required)
  posted_by_recuriter_id:    ObjectId → User (required)
  is_active:                 Boolean (default: true)
  created_at:                Date (auto)
}
```

### Application (recruiter + jobseeker services)
```
Application {
  job_id:           ObjectId → Job
  applicant_id:     ObjectId → User
  applicant_email:  String (required)
  status:           "Submitted" | "Rejected" | "Hired" (default: "Submitted")
  resume:           String (Cloudinary URL, required)
  subscribed:       Boolean (default: false — used for priority sort)
  applied_at:       Date (auto)

  UNIQUE INDEX: (job_id, applicant_id) — prevents duplicate applications
}
```

### BlackList (auth + jobseeker + recruiter services)
```
BlackList {
  token:      String (the raw JWT)
  expiresAt:  Date (TTL for cleanup)
}
```

### InterviewReport (interviewReport service)
```
InterviewReport {
  applicant_id:        ObjectId
  title:               String (job title, required)
  resume:              String (extracted text)
  selfDescription:     String
  jobDescription:      String (required)
  matchScore:          Number (0–100)
  technicalQuestions:  [{ question, intention, answer }]
  behavioralQuestions: [{ question, intention, answer }]
  skillGaps:           [{ skill, severity: "low"|"medium"|"high" }]
  preparationPlan:     [{ day, focus, tasks: [String] }]
  createdAt / updatedAt: Date (auto, Mongoose timestamps)
}
```

---

## 📡 API Reference

### Authentication Service — `http://localhost:5000`

| Method | Endpoint | Auth | Body / Notes |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | `name, email, password, phoneNumber, role, bio` + optional `file` (resume, required for jobseeker). Sends OTP email. |
| `POST` | `/api/auth/verify` | — | `{ email, otp }` — verifies OTP (10 min TTL), returns JWT + user |
| `POST` | `/api/auth/login` | — | `{ email, password }` — returns JWT + user |
| `POST` | `/api/auth/logout` | Bearer JWT | Blacklists the token |

### Jobseeker / User Service — `http://localhost:5002`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/user/me` | Bearer JWT | Returns logged-in user's profile |
| `GET` | `/api/user/:userId` | Bearer JWT | Public profile of any user |
| `PUT` | `/api/user/update/profile` | Bearer JWT | `{ name, phoneNumber, bio }` |
| `PUT` | `/api/user/update/pic` | Bearer JWT | Multipart file — replaces profile picture on Cloudinary |
| `PUT` | `/api/user/update/resume` | Bearer JWT | Multipart file — replaces resume on Cloudinary |
| `POST` | `/api/user/skill/add` | Bearer JWT | `{ skillName }` |
| `PUT` | `/api/user/skill/delete` | Bearer JWT | `{ skillName }` |
| `POST` | `/api/user/apply/job` | Bearer JWT (jobseeker only) | `{ job_id }` — requires stored resume |
| `GET` | `/api/user/application/all` | Bearer JWT | Returns all applications with job details via aggregate |

### Recruiter / Job Service — `http://localhost:5003`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/job/company/new` | Bearer JWT (recruiter) | Multipart: `name, description, website` + logo file |
| `DELETE` | `/api/job/company/:companyId` | Bearer JWT (recruiter) | Cascades: deletes all jobs + applications |
| `GET` | `/api/job/company/all` | Bearer JWT (recruiter) | All companies owned by recruiter |
| `GET` | `/api/job/company/:id` | — | Company details + all its jobs (public) |
| `POST` | `/api/job/new` | Bearer JWT (recruiter) | `{ title, description, salary, location, role, job_type, work_location, company_id, openings }` |
| `PUT` | `/api/job/:jobId` | Bearer JWT (recruiter) | Update any job field including `is_active` |
| `GET` | `/api/job/all` | — | All active jobs, supports `?title=&location=` regex filters |
| `GET` | `/api/job/:jobId` | — | Single job detail |
| `GET` | `/api/job/application/:jobId` | Bearer JWT (recruiter) | All applicants, sorted by subscription then apply date |
| `PUT` | `/api/job/application/update/:id` | Bearer JWT (recruiter) | `{ status: "Hired"|"Rejected" }` — triggers Kafka email event |

### Utils / AI Service — `http://localhost:5001`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/utils/upload` | — (internal) | `{ buffer, public_id? }` — uploads/replaces file on Cloudinary. Returns `{ url, public_id }` |
| `POST` | `/api/utils/career` | — | `{ skills }` — returns structured JSON: summary, job options, skills to learn, learning approach |
| `POST` | `/api/utils/resume-analyser` | — | `{ pdfBase64 }` — returns ATS score, breakdown by 4 dimensions, suggestions, strengths, summary |

### Interview Report Service — `http://localhost:3000`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/interview` | Bearer JWT | Multipart: `resume` PDF file + `{ jobDescription, selfDescription }`. Parses PDF, calls Gemini, saves + returns report |
| `GET` | `/api/interview` | Bearer JWT | All reports for logged-in user (summary only, no full text fields) |
| `GET` | `/api/interview/:interviewId` | Bearer JWT | Full report by ID |
| `GET` | `/api/interview/resume/pdf/:interviewReportId` | Bearer JWT | Generates and streams a tailored PDF resume via Puppeteer |

---

## 🖥 Frontend Pages & Routing

All routes are declared in `App.jsx`. Role-based guards are applied via the `ProtectedRoute` component.

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/verify` | OTP Verification | Public |
| `/jobs` | Job Listings | Public |
| `/jobs/:jobId` | Job Detail | Public |
| `/company/:companyId` | Company Detail + Jobs | Public |
| `/dashboard` | User Dashboard | Auth (any role) |
| `/profile` | Profile Management | Auth (any role) |
| `/applications` | My Applications | Auth (jobseeker only) |
| `/users/:userId` | Public User Profile | Auth (any role) |
| `/interview` | Interview Studio — create new report | Auth (jobseeker only) |
| `/interview/:id` | Interview Report Viewer | Auth (jobseeker only) |
| `/tools/career` | Career Advisor | Auth (any role) |
| `/tools/resume` | ATS Resume Analyzer | Auth (any role) |
| `/recruiter/companies` | Company List | Auth (recruiter only) |
| `/recruiter/companies/new` | Create Company | Auth (recruiter only) |
| `/recruiter/jobs` | My Job Listings | Auth (recruiter only) |
| `/recruiter/jobs/new` | Create Job | Auth (recruiter only) |
| `/recruiter/jobs/:jobId/edit` | Edit Job | Auth (recruiter only) |
| `/recruiter/applications` | All Applications per Job | Auth (recruiter only) |
| `*` | 404 Not Found | Public |

### Route Guard Logic (`ProtectedRoute.jsx`)
1. If `loading` → show spinner
2. If not authenticated → redirect to `/login` (preserving `from` location in state)
3. If `roles` array is provided and user's role is not in it → redirect to `/dashboard`
4. Otherwise → render children

---

## 🔐 Authentication & Security Flow

### Registration Flow
```
User submits form
  → Auth Service validates fields
  → If jobseeker: file buffer forwarded to Utils Service → Cloudinary URL stored
  → Password bcrypt-hashed (rounds: 10)
  → 6-digit OTP generated, hashed not stored (stored plaintext with 10 min TTL)
  → User doc created (isVerified: false)
  → Nodemailer sends OTP via Gmail SMTP
  → Frontend redirected to /verify
```

### OTP Verification Flow
```
User submits email + OTP
  → Auth Service queries: { email, otp, otpExpires: { $gt: now } }
  → On match: isVerified=true, otp=null, otpExpires=null
  → JWT signed (payload: { id: user._id }, expiry: 15 days)
  → Token + serialized user returned to frontend
  → Frontend saves to localStorage under 'hireheaven.token' / 'hireheaven.user'
```

### Login Flow
```
User submits email + password
  → Auth Service fetches user
  → Checks isVerified
  → bcrypt.compare(plain, hashed)
  → JWT signed and returned
```

### Logout Flow (Token Blacklisting)
```
User clicks logout
  → Frontend calls POST /api/auth/logout with Bearer token
  → Auth Service decodes token for expiry time
  → Token inserted into BlackList collection with TTL
  → All subsequent requests with this token rejected at middleware level
  → Frontend clears localStorage
```

### JWT Middleware (jobseeker + recruiter services)
```
Request arrives
  → Extract token from Authorization header (Bearer <token>)
  → jwt.verify(token, JWT_SEC) → decoded payload
  → Check BlackList collection — if found → 401 Unauthorized
  → Fetch user from DB → attach to req.user
  → next()
```

---

## 🤖 AI Features Deep Dive

### 1. Interview Report Generator (Interview Report Service — Port 3000)

**Input:** Resume PDF (file upload) + Job Description text + optional Self Description  
**Process:**
1. `pdf-parse` extracts text from the uploaded PDF buffer
2. Constructs a prompt with resume text + self description + job description
3. Calls `gemini-3-flash-preview` with:
   - `responseMimeType: "application/json"`
   - Zod schema compiled to JSON Schema via `zod-to-json-schema` for structured output enforcement
4. Parses response and stores in MongoDB

**Output Schema (Zod enforced):**
```
{
  matchScore:          number (0-100)
  title:               string (job title)
  technicalQuestions:  [{ question, intention, answer }]
  behavioralQuestions: [{ question, intention, answer }]
  skillGaps:           [{ skill, severity: "low"|"medium"|"high" }]
  preparationPlan:     [{ day, focus, tasks: string[] }]
}
```

### 2. AI-Generated Resume PDF (Interview Report Service — Port 3000)

**Input:** Existing interview report ID  
**Process:**
1. Loads report from MongoDB
2. Sends resume text + job description + self description to `gemini-3-flash-preview`
3. Gemini returns JSON `{ html: "..." }` — a fully styled, ATS-friendly HTML resume
4. Puppeteer launches headless Chromium, sets the HTML content, generates A4 PDF (20mm/15mm margins)
5. PDF buffer streamed to client as `application/pdf`

### 3. Career Path Advisor (Utils Service — Port 5001)

**Input:** Comma-separated skills string  
**Process:** Calls `gemini-2.5-flash` with a detailed structured prompt  
**Output JSON:**
```
{
  summary:        string
  jobOptions:     [{ title, responsibilities, why }]
  skillsToLearn:  [{ category, skills: [{ title, why, how }] }]
  learningApproach: { title, points: string[] }
}
```

### 4. ATS Resume Analyzer (Utils Service — Port 5001)

**Input:** PDF as base64 string  
**Process:** Sends PDF as `inlineData` to `gemini-2.5-flash` with a vision-capable multipart prompt  
**Output JSON:**
```
{
  atsScore:       number
  scoreBreakdown: {
    formatting:   { score, feedback }
    keywords:     { score, feedback }
    structure:    { score, feedback }
    readability:  { score, feedback }
  }
  suggestions: [{ category, issue, recommendation, priority: "high"|"medium"|"low" }]
  strengths:   string[]
  summary:     string
}
```

---

## ⚙️ Environment Variables

### Frontend — `frontend/.env`
```env
VITE_AUTH_API=http://localhost:5000
VITE_USER_API=http://localhost:5002
VITE_JOB_API=http://localhost:5003
VITE_INTERVIEW_API=http://localhost:3000
VITE_UTILS_API=http://localhost:5001
```

### Authentication Service — `services/authentication/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/MicroservicesDB
JWT_SEC=<your_jwt_secret>
UPLOAD_SERVICE=http://localhost:5001
FRONTEND_URL=http://localhost:5173
SMTP_USER=<gmail_address>
SMTP_PASS=<gmail_app_password>
```

### Jobseeker Service — `services/jobseeker/.env`
```env
PORT=5002
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
MONGODB_DB=MicroservicesDB
JWT_SEC=<your_jwt_secret>
UPLOAD_SERVICE=http://localhost:5001
```

### Recruiter Service — `services/recruiter/.env`
```env
PORT=5003
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
MONGODB_DB=MicroservicesDB
JWT_SEC=<your_jwt_secret>
UPLOAD_SERVICE=http://localhost:5001
CLOUD_NAME=<cloudinary_cloud_name>
API_KEY=<cloudinary_api_key>
API_SECRET=<cloudinary_api_secret>
```

### Utils / Gemini Service — `services/geminiResponse/.env`
```env
PORT=5001
CLOUD_NAME=<cloudinary_cloud_name>
API_KEY=<cloudinary_api_key>
API_SECRET=<cloudinary_api_secret>
API_KEY_GEMINI=<google_gemini_api_key>
SMTP_USER=<gmail_address>
SMTP_PASS=<gmail_app_password>
```

### Interview Report Service — `services/interviewReport/.env`
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/MicroservicesDB
JWT_SECRET=<your_jwt_secret>
GOOGLE_GENAI_API_KEY=<google_gemini_api_key>
CLOUDINARY_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_SECRET_KEY=<cloudinary_api_secret>
COOKIE_EXPIRE=7
JWT_EXPIRE=7d
SMTP_SERVICE=gmail
SMTP_MAIL=<gmail_address>
SMTP_PASSWORD=<gmail_app_password>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

> ⚠️ **Security Note:** The `.env` files in this repository contain real credentials for development. Before pushing to a public repository or deploying, rotate all secrets (JWT keys, Cloudinary credentials, Gmail app passwords, Google API keys, MongoDB passwords).

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account
- Google Gemini API key
- Gmail account with an App Password (not your regular password — enable 2FA first)
- Apache Kafka (for email notifications; optional for basic setup)

### Installation & Running

Each service and the frontend must be started independently. Open a separate terminal for each.

**1. Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

**2. Authentication Service**
```bash
cd services/authentication
npm install
npm run dev
# Runs at http://localhost:5000
```

**3. Jobseeker Service**
```bash
cd services/jobseeker
npm install
npm run dev
# Runs at http://localhost:5002
```

**4. Recruiter Service**
```bash
cd services/recruiter
npm install
npm run dev
# Runs at http://localhost:5003
```

**5. Utils / Gemini Service**
```bash
cd services/geminiResponse
npm install
npm run dev
# Runs at http://localhost:5001
```

**6. Interview Report Service**
```bash
cd services/interviewReport
npm install
npm run dev
# Runs at http://localhost:3000
```

> The Utils service (port 5001) must be running before Auth, Jobseeker, or Recruiter services — they all call it for file uploads.

### Quick Checklist
- [ ] All 6 `.env` files configured with real credentials
- [ ] MongoDB Atlas cluster accessible from your IP (check Network Access)
- [ ] Cloudinary account created, cloud name / API key / secret copied
- [ ] Google Gemini API key enabled for `generativelanguage.googleapis.com`
- [ ] Gmail App Password generated (not your account password)
- [ ] Utils service (5001) started first

---

## 🐳 Deployment Notes

Each service has a `Dockerfile`. The services use a standard pattern:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE <port>
CMD ["node", "index.js"]
```

For production deployment:
- All `MONGODB_URI` / `UPLOAD_SERVICE` / `FRONTEND_URL` values must be updated to production URLs
- Kafka broker address must be updated in the Recruiter service's `producer.js`
- The Interview Report service's Puppeteer may need `--no-sandbox` args in containerized environments:
  ```js
  puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  ```
- Set `CORS` origins explicitly per service (currently uses env var `FRONTEND_URL`)

---

## 🗺 Known Issues & Roadmap

### Known Issues
- **Mixed module systems:** The `interviewReport` service uses CommonJS (`require`/`module.exports`) while all other services use ES Modules (`import`/`export`). This is functional but inconsistent.
- **JWT secret mismatch:** The `interviewReport` service reads `JWT_SECRET` while other services read `JWT_SEC`. Ensure they are set to the same value.
- **Kafka is optional:** If Kafka is not running, the recruiter service logs a warning but continues to function; application status emails simply won't be sent.
- **No rate limiting:** Auth endpoints (login, register) have no rate limiting, making them susceptible to brute force.
- **OTP stored as plaintext:** The OTP in the database is not hashed; it should be hashed for production.
- **Subscription field unused in UI:** The `subscription` date field exists in the User schema and is used for application sort priority, but there is no payment/subscription management UI or API.

### Roadmap / Potential Improvements
- [ ] Add Docker Compose for one-command local startup
- [ ] Unify module system to ES Modules across all services
- [ ] Add Redis for OTP storage with TTL (removing OTP fields from User schema)
- [ ] Rate limiting on auth endpoints (express-rate-limit)
- [ ] Hash OTPs before storing
- [ ] Add Kafka consumer in Utils service for async email delivery
- [ ] Subscription/payment flow with Razorpay or Stripe
- [ ] Centralized API gateway (Nginx or custom Express proxy)
- [ ] Unified logging with Winston or Pino
- [ ] End-to-end tests with Jest + Supertest

---

## 👤 Author

**Mahendra Yadav**  
GitHub: [@Mahendra-9569](https://github.com/Mahendra-9569)

---

<div align="center">
Made with ❤️ using React, Node.js, MongoDB, Google Gemini, and Kafka
</div>
