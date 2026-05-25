# 🚀 HireConnect — AI-Powered Job Portal with Microservices Architecture

<div align="center">

![HireConnect Banner](https://img.shields.io/badge/HireConnect-AI%20Job%20Portal-6366f1?style=for-the-badge&logo=briefcase&logoColor=white)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF%20Generation-000000?style=flat-square&logo=puppeteer)](https://pptr.dev/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)


**A production-grade, microservices-based job portal platform powered by AI — built for jobseekers, recruiters, and interview preparation. Features AI interview prep with Google Gemini 2.5 Flash, ATS resume analysis, career path suggestions, PDF generation with Puppeteer, and JWT + OTP-based authentication.**

[🌐 Live Demo](https://github.com/Mahendra-9569/HireConnect) &nbsp;|&nbsp; [📖 API Docs](#api-reference) &nbsp;|&nbsp; [🐛 Report Bug](https://github.com/Mahendra-9569/HireConnect/issues) &nbsp;|&nbsp; [💡 Request Feature](https://github.com/Mahendra-9569/HireConnect/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Microservices Breakdown](#microservices-breakdown)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running All Services](#running-all-services)
- [API Reference](#api-reference)
- [Database Schemas](#database-schemas)
- [Authentication & Security Flow](#authentication--security-flow)
- [AI Features Deep Dive](#ai-features-deep-dive)
- [Frontend Routing & Pages](#frontend-routing--pages)
- [Deployment Guide](#deployment-guide)
- [Contributing](#contributing)
- [Known Issues & Roadmap](#known-issues--roadmap)
- [Author](#author)

---

## 🧭 Overview

**HireConnect** (internally named `hireheaven`) is a full-stack, production-grade job portal platform built on a **true microservices architecture**. Unlike monolithic job portals, every domain concern — authentication, job management, user profiles, AI tools, and email delivery 

The platform serves two distinct user roles:

- **Jobseekers** — Browse jobs, apply with one click (using their uploaded resume), track application status, get AI-generated interview reports, analyze their resume for ATS scores, and receive career path recommendations powered by Gemini AI.
- **Recruiters** — Create and manage companies, post jobs, review all applications for each job, and update application statuses (Submitted → Hired / Rejected) with automated email notifications sent to applicants.

All authentication uses **OTP-based email verification**, **JWT tokens** (15-day expiry), and a **token blacklist** system for secure logout.

---

## 🏗️ Architecture Overview

HireConnect follows a **polyrepo-style microservices** design where each service owns its domain, its database connection, and its business logic. Services communicate synchronously via REST APIs and asynchronously via Kafka topics.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             HIRECONNECT PLATFORM                                 │
├────────────────────────────────────┬─────────────────────────────────────────────┤
│         FRONTEND (React + Vite)    │            MICROSERVICES LAYER               │
│         Port: 5173                 │                                              │
│                                    │  ┌─────────────────┐  Port 5000             │
│  ┌────────────────────────┐        │  │  authentication  │ ─── MongoDB            │
│  │     React Router DOM   │◄──────►│  │    service       │                       │
│  │   (20+ pages/routes)   │        │  │                  │                       │
│  └────────────────────────┘        │  └─────────────────┘                        │
│                                    │                                              │
│  ┌────────────────────────┐        │  ┌─────────────────┐  Port 5002             │
│  │     AuthContext        │◄──────►│  │   jobseeker      │ ─── MongoDB            │
│  │   (JWT + localStorage) │        │  │   service        │                        │
│  └────────────────────────┘        │  └─────────────────┘                        │
│                                    │                                              │
│  ┌────────────────────────┐        │  ┌─────────────────┐  Port 5003             │
│  │   5 Axios Instances    │◄──────►│  │   recruiter      │ ─── MongoDB            │
│  │  (auth/user/job/       │        │  │   service        │                       │
│  │   interview/utils)     │        │  └─────────────────┘ ─── Cloudinary         │
│  └────────────────────────┘        │                                              │
│                                    │  ┌─────────────────┐  Port 5001             │
│                                    │  │  geminiResponse  │ ─── Cloudinary         │
│                                    │  │  (utils) service │                        │
│                                    │  │                  │     (send-mail topic)  │
│                                    │  └─────────────────┘                        │
│                                    │                                              │
│                                    │  ┌─────────────────┐  Port 3000             │
│                                    │  │ interviewReport  │ ─── MongoDB            │
│                                    │  │   service        │ ─── Gemini AI          │
│                                    │  │                  │ ─── Puppeteer (PDF)    │
│                                    │  └─────────────────┘                        │
│                                    │                                              │
│                                    │  ┌─────────────────────────────────────────┐│
│                                    │  │          INFRASTRUCTURE LAYER            ││
│                                    │  │  Nodemailer   (event bus - send-mail)    ││
│                                    │  │                                          ││
│                                    │  │  MongoDB Atlas (per-service databases)   ││
│                                    │  │  Cloudinary (resume + logo CDN)          ││
│                                    │  └─────────────────────────────────────────┘│
└────────────────────────────────────┴─────────────────────────────────────────────┘
```

**Key Architectural Decisions:**
- Each backend service has its **own MongoDB connection** and its own set of models — there is no shared database layer
- **Apache Kafka** decouples email delivery: services publish to the `send-mail` topic, and the `geminiResponse` service (which also houses the Kafka consumer + Nodemailer transporter) handles sending, keeping SMTP logic isolated in one place
- **Redis** stores short-lived password reset tokens (15-minute TTL) and prevents replay attacks
- A **token blacklist** (MongoDB `BlackList` collection) ensures logout is truly effective even before the JWT expires
- All file uploads (resumes, logos, profile pictures) are proxied through the **utils service** which handles Cloudinary CDN operations, keeping Cloudinary credentials out of multiple services

---

## ✨ Features

### 👤 Jobseeker Features
| Feature | Description |
|---|---|
| **OTP-Verified Registration** | Email OTP sent via Kafka → Nodemailer; 10-minute expiry |
| **Upload Resume on Signup** | PDF resume uploaded to Cloudinary during registration |
| **Apply for Jobs** | One-click apply using saved resume; duplicate application prevention |
| **Track Applications** | View all applications with job title, salary, location, and status |
| **Profile Management** | Update name, bio, phone number; update profile picture; update resume |
| **Skills Management** | Add and delete skills from profile |
| **AI Interview Studio** | Upload resume + job description → get a full AI-generated interview prep report |
| **Interview Report** | Match score, technical questions + answers, behavioral questions, skill gap analysis, day-wise preparation plan |
| **AI Resume Analyzer** | Upload PDF resume → receive ATS score breakdown (formatting, keywords, structure, readability) + improvement suggestions |
| **AI Career Advisor** | Enter skills → receive career path suggestions, job options, skill recommendations |
| **Download AI Resume PDF** | AI generates a job-tailored, ATS-friendly resume in HTML → converted to PDF via Puppeteer |
| **Dark / Light Theme** | Persistent theme preference stored in localStorage |

### 🏢 Recruiter Features
| Feature | Description |
|---|---|
| **Company Management** | Create, view, and delete companies with logo upload |
| **Job Posting** | Post jobs with title, description, salary, location, type, work location, role, and openings count |
| **Job Updates** | Edit existing job listings (toggle active/inactive, update details) |
| **Application Review** | View all applicants for each job, sorted by subscription status |
| **Application Status Update** | Change application status (Submitted → Hired / Rejected); applicant is emailed automatically |
| **Company Details** | View all jobs associated with a company |

### 🔐 Authentication & Security
| Feature | Description |
|---|---|
| **OTP Email Verification** | 6-digit OTP, 10-minute expiry, sent via Kafka async pipeline |
| **JWT Authentication** | 15-day token, `Authorization: Bearer` header |
| **Password Reset** | Secure reset link emailed via Kafka; token stored in Redis with 15-minute TTL |
| **Token Blacklist** | Logout invalidates the token by storing it in MongoDB `BlackList` collection |
| **Role-Based Access Control** | Routes and API endpoints protected by `jobseeker` / `recruiter` role |

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | Latest | Build tool and dev server |
| **Tailwind CSS** | 3 | Utility-first CSS |
| **React Router DOM** | 7 | Client-side routing with protected routes |
| **Axios** | Latest | HTTP client (5 separate instances per service) |
| **React Hot Toast** | Latest | Toast notifications |
| **Lucide React** | Latest | Icon library |
| **AuthContext** | Custom | Global auth state (JWT + user object) |
| **ThemeContext** | Custom | Dark/light theme management |

### Backend Services
| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | REST API framework for all services |
| **MongoDB + Mongoose** | Primary database (Atlas, shared cluster, separate DBs) |
| **Apache Kafka (KafkaJS)** | Async event bus for email delivery |
| **Redis (ioredis)** | Password reset token cache (TTL-based) |
| **JWT (jsonwebtoken)** | Stateless authentication (15-day expiry) |
| **bcryptjs** | Password hashing (10 salt rounds) |
| **Cloudinary** | Resume, profile pic, company logo CDN |
| **Multer** | Multipart file parsing before Cloudinary upload |
| **Nodemailer** | SMTP email via Gmail (port 465, SSL) |
| **Google Gemini 2.5 Flash** | AI career advisor + ATS resume analyzer |
| **Google Gemini 3 Flash** | AI interview report + resume PDF generation |
| **Zod + zod-to-json-schema** | Structured AI output schema enforcement |
| **Puppeteer** | Headless Chrome for PDF generation from HTML |
| **pdf-parse** | Extract text from uploaded PDF resumes |
| **Docker** | Each service has its own `Dockerfile` |

---

## 📦 Microservices Breakdown

### 1. 🔐 Authentication Service — Port `5000`
**Responsibility:** User registration, login, OTP verification, password reset, logout.

| Feature | Details |
|---|---|
| Registration | Accepts role (`jobseeker` / `recruiter`), hashes password, generates 6-digit OTP, sends via Kafka |
| Jobseeker signup | Also uploads resume PDF to Cloudinary via utils service |
| OTP Verification | Validates OTP + expiry, marks `isVerified: true`, issues JWT |
| Login | bcrypt compare, issues JWT (15d), returns serialized user |
| Forgot Password | Generates reset JWT, stores in Redis (15min TTL), sends link via Kafka |
| Reset Password | Verifies JWT type + Redis token match, updates password hash |
| Logout | Adds token to MongoDB `BlackList` collection |
| Kafka | Produces to `send-mail` topic; creates topic if not found on startup |

---

### 2. 👤 Jobseeker Service — Port `5002`
**Responsibility:** User profile management, job application, skills management.

| Feature | Details |
|---|---|
| My Profile | Returns authenticated user object |
| Update Profile | Name, phone, bio |
| Update Profile Pic | Uploads to Cloudinary via utils service (replaces old image) |
| Update Resume | Uploads PDF to Cloudinary, replaces old resume |
| Add/Delete Skills | Manages `skills[]` array on User document |
| Apply for Job | Creates Application (enforces unique index on `job_id + applicant_id`), checks subscription for priority ordering |
| My Applications | MongoDB aggregation pipeline: joins Applications → Jobs → returns enriched data |

---

### 3. 🏢 Recruiter Service — Port `5003`
**Responsibility:** Company management, job posting, application review and status management.

| Feature | Details |
|---|---|
| Create Company | Role-guarded (`recruiter` only), uploads logo to Cloudinary |
| Delete Company | Cascading delete: removes company logo from Cloudinary, deletes all associated jobs and applications |
| Create Job | Links to company via `company_id`, validates recruiter ownership |
| Update Job | Ownership check on `posted_by_recruiter_id` before allowing edit |
| Get All Active Jobs | Filter by title/location (case-insensitive regex), joins company name + logo |
| Get All Applications | Sorted by subscription status (subscribed applicants shown first), then by date |
| Update Application Status | Updates status, publishes email notification to Kafka topic |

---

### 4. 🤖 GeminiResponse / Utils Service — Port `5001`
**Responsibility:** Cloudinary uploads, Gemini AI career advisor, ATS resume analyzer, AND Kafka email consumer.

| Feature | Details |
|---|---|
| File Upload | Accepts base64-encoded buffer, optionally deletes old Cloudinary asset, returns `secure_url` + `public_id` |
| Career Advisor | Takes skills string → structured Gemini 2.5 Flash prompt → returns JSON (summary, job options, skills to learn, learning approach) |
| ATS Resume Analyzer | Takes PDF base64 → Gemini 2.5 Flash multimodal analysis → returns JSON (ATS score, score breakdown, suggestions, strengths) |
| Kafka Consumer | Subscribes to `send-mail` topic, parses messages, sends via Nodemailer Gmail SMTP (port 465 SSL) |

---

### 5. 📋 InterviewReport Service — Port `3000`
**Responsibility:** AI-powered interview preparation reports and AI resume PDF generation.

| Feature | Details |
|---|---|
| Generate Interview Report | Parses uploaded PDF resume with `pdf-parse`, sends to Gemini 3 Flash with Zod schema enforcement |
| Report Contents | Match score (0-100), technical Q&A, behavioral Q&A, skill gap analysis (severity: low/medium/high), day-wise prep plan |
| Get All Reports | Returns all reports for the authenticated user (excludes large text fields for listing) |
| Get Single Report | Full report details by ID |
| Generate Resume PDF | Fetches saved report, sends to Gemini 3 Flash to generate ATS-optimized HTML resume → Puppeteer renders to PDF → returned as binary download |

---

## 📁 Project Structure

```
myProject/
├── frontend/                            # React + Vite client app
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                # 5 Axios instances + session helpers
│   │   ├── components/
│   │   │   ├── Layout.jsx               # App shell wrapper
│   │   │   ├── Navbar.jsx               # Responsive nav (role-aware)
│   │   │   ├── ProtectedRoute.jsx       # Auth + role guard
│   │   │   ├── UI.jsx                   # Shared UI components
│   │   │   └── JsonTree.jsx             # JSON visualizer component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # JWT auth state, login/logout, refreshMe
│   │   │   └── ThemeContext.jsx         # Dark/light theme with localStorage persistence
│   │   ├── pages/
│   │   │   ├── Home.jsx                 # Landing page (role-aware CTAs)
│   │   │   ├── AuthPages.jsx            # Login, Register, Verify OTP, Forgot, Reset
│   │   │   ├── JobsPages.jsx            # Browse Jobs, Job Details, Company Details
│   │   │   ├── UserPages.jsx            # Dashboard, Profile, Applications, Public Profile
│   │   │   ├── RecruiterPages.jsx       # Company mgmt, Job mgmt, Application review
│   │   │   ├── InterviewAndToolsPages.jsx # Interview Studio, Report View, Career Tools, ATS
│   │   │   └── NotFound.jsx             # 404 page
│   │   ├── utils/format.js              # Date/salary formatting helpers
│   │   ├── App.jsx                      # Router with AnimatedRoutes
│   │   └── main.jsx                     # Entry point
│   ├── .env
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── services/
    ├── authentication/                  # Auth microservice (Port 5000)
    │   ├── controllers/auth.js          # registerUser, verifyOTP, loginUser, forgotPassword, resetPassword, logoutUser
    │   ├── models/User.js + BlackList.js
    │   ├── routes/auth.js
    │   ├── middleware/multer.js
    │   ├── utils/ (redis, TryCatch, errorHandler, serialize, buffer)
    │   ├── producer.js                  # Kafka producer
    │   ├── template.js                  # Email HTML templates
    │   ├── app.js + index.js
    │   └── Dockerfile
    │
    ├── jobseeker/                       # Jobseeker microservice (Port 5002)
    │   ├── controllers/user.js
    │   ├── models/ (User, Job, Application)
    │   ├── routes/user.js
    │   ├── middlewares/ (auth, multer)
    │   ├── utils/
    │   ├── app.js + index.js
    │   └── Dockerfile
    │
    ├── recruiter/                       # Recruiter microservice (Port 5003)
    │   ├── controllers/job.js
    │   ├── models/ (Company, Job, Application, User)
    │   ├── routes/job.js
    │   ├── producer.js                  # Kafka producer for status emails
    │   ├── template.js
    │   ├── utils/ (serialize, TryCatch, errorHandler, buffer, db)
    │   ├── app.js + index.js
    │   └── Dockerfile
    │
    ├── geminiResponse/                  # Utils + AI + Mail service (Port 5001)
    │   ├── routes.js                    # /upload, /career, /resume-analyser
    │   ├── consumer.js                  # Kafka consumer → Nodemailer
    │   ├── app.js + index.js
    │   └── Dockerfile
    │
    └── interviewReport/                 # Interview AI service (Port 3000)
        ├── src/
        │   ├── services/ai.service.js   # Gemini + Puppeteer
        │   ├── controllers/interview.controller.js
        │   ├── models/interviewReport.model.js
        │   ├── routes/interview.routes.js
        │   ├── middlewares/ (auth, file)
        │   └── config/database.js
        └── server.js
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | v18+ | [Download](https://nodejs.org/) |
| **npm** | v9+ | Comes with Node.js |
| **Apache Kafka** | 3.x | Local or [Confluent Cloud](https://confluent.io/) |
| **Redis** | 7.x | Local or [Redis Cloud](https://redis.com/try-free/) |
| **MongoDB Atlas** | Cloud | [Sign up free](https://www.mongodb.com/cloud/atlas) |
| **Cloudinary** | Account | [Sign up free](https://cloudinary.com/) |
| **Google Gemini API Key** | — | [Get key](https://ai.google.dev/) |

> **Quick Kafka + Redis setup (Linux/Mac):**
> ```bash
> # Start Zookeeper + Kafka
> bin/zookeeper-server-start.sh config/zookeeper.properties &
> bin/kafka-server-start.sh config/server.properties &
>
> # Start Redis
> redis-server
> ```

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Mahendra-9569/HireConnect.git
cd HireConnect
```

**2. Install all service dependencies**
```bash
# Frontend
cd frontend && npm install && cd ..

# Auth service
cd services/authentication && npm install && cd ../..

# Jobseeker service
cd services/jobseeker && npm install && cd ../..

# Recruiter service
cd services/recruiter && npm install && cd ../..

# GeminiResponse/Utils service
cd services/geminiResponse && npm install && cd ../..

# InterviewReport service
cd services/interviewReport && npm install && cd ../..
```

---

### Environment Variables

#### 🔐 `services/authentication/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/hireheaven
JWT_SEC=your_long_random_jwt_secret
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
UPLOAD_SERVICE=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

#### 👤 `services/jobseeker/.env`
```env
PORT=5002
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/hireheaven
JWT_SEC=your_long_random_jwt_secret
UPLOAD_SERVICE=http://localhost:5001
```

#### 🏢 `services/recruiter/.env`
```env
PORT=5003
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net
MONGODB_DB=hireheaven
JWT_SEC=your_long_random_jwt_secret
KAFKA_BROKER=localhost:9092
UPLOAD_SERVICE=http://localhost:5001
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

#### 🤖 `services/geminiResponse/.env`
```env
PORT=5001
KAFKA_BROKER=localhost:9092
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
API_KEY_GEMINI=your_google_gemini_api_key
```

> ⚠️ `SMTP_PASS` must be a **Gmail App Password** — enable 2FA on Google account, then generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

#### 📋 `services/interviewReport/.env`
```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/hireheaven
JWT_SECRET=your_long_random_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

#### 🌐 `frontend/.env`
```env
VITE_AUTH_API=http://localhost:5000
VITE_USER_API=http://localhost:5002
VITE_JOB_API=http://localhost:5003
VITE_INTERVIEW_API=http://localhost:3000
VITE_UTILS_API=http://localhost:5001
```

> ⚠️ **Security:** Never commit `.env` files. Ensure `.env` is in `.gitignore` for every service.

---

### Running All Services

You need **6 terminal windows** to run the full platform:

| Terminal | Command | Port |
|---|---|---|
| 1 — Frontend | `cd frontend && npm run dev` | 5173 |
| 2 — Auth Service | `cd services/authentication && npm run dev` | 5000 |
| 3 — Jobseeker Service | `cd services/jobseeker && npm run dev` | 5002 |
| 4 — Recruiter Service | `cd services/recruiter && npm run dev` | 5003 |
| 5 — Utils/Gemini/Mail | `cd services/geminiResponse && npm run dev` | 5001 |
| 6 — Interview Service | `cd services/interviewReport && node server.js` | 3000 |

> Ensure **Kafka** and **Redis** are running locally before starting any backend service.

---

## 📡 API Reference

### Authentication Service — Base: `http://localhost:5000`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register; sends OTP via Kafka |
| `POST` | `/api/auth/verify` | ❌ | Verify OTP; issues JWT |
| `POST` | `/api/auth/login` | ❌ | Login; returns token + user |
| `POST` | `/api/auth/forgot` | ❌ | Send password reset link |
| `POST` | `/api/auth/reset/:token` | ❌ | Reset password using token |
| `POST` | `/api/auth/logout` | ✅ | Blacklists current JWT |

**Register — Jobseeker** (`multipart/form-data`)
```
name=John Doe, email=john@example.com, password=Pass@1234,
phoneNumber=9876543210, role=jobseeker, bio=..., resume=<PDF file>
```

**Register — Recruiter** (`application/json`)
```json
{ "name": "Jane HR", "email": "jane@co.com", "password": "Pass@1234", "phoneNumber": "9876543210", "role": "recruiter" }
```

**Verify OTP**
```json
{ "email": "john@example.com", "otp": "482901" }
// Response: { "token": "<jwt>", "user": { ... } }
```

---

### Jobseeker Service — Base: `http://localhost:5002`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user/me` | ✅ | Get my profile |
| `GET` | `/api/user/:userId` | ✅ | Get public profile |
| `PUT` | `/api/user/update/profile` | ✅ | Update name, phone, bio |
| `PUT` | `/api/user/update/pic` | ✅ | Update profile picture (multipart) |
| `PUT` | `/api/user/update/resume` | ✅ | Update resume PDF (multipart) |
| `POST` | `/api/user/skill/add` | ✅ | Add a skill |
| `PUT` | `/api/user/skill/delete` | ✅ | Remove a skill |
| `POST` | `/api/user/apply/job` | ✅ | Apply for a job |
| `GET` | `/api/user/application/all` | ✅ | Get all my applications |

---

### Recruiter Service — Base: `http://localhost:5003`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/job/company/new` | ✅ (recruiter) | Create company + logo |
| `DELETE` | `/api/job/company/:companyId` | ✅ (recruiter) | Delete company + cascade |
| `GET` | `/api/job/company/all` | ✅ | Get my companies |
| `GET` | `/api/job/company/:id` | ❌ | Company details + jobs |
| `POST` | `/api/job/new` | ✅ (recruiter) | Post a job |
| `PUT` | `/api/job/:jobId` | ✅ (recruiter) | Update job |
| `GET` | `/api/job/all` | ❌ | All active jobs (`?title=&location=`) |
| `GET` | `/api/job/:jobId` | ❌ | Single job |
| `GET` | `/api/job/application/:jobId` | ✅ (recruiter) | Applications for a job |
| `PUT` | `/api/job/application/update/:id` | ✅ (recruiter) | Update application status |

---

### Utils / Gemini Service — Base: `http://localhost:5001`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/utils/upload` | ❌ (internal) | Upload buffer to Cloudinary |
| `POST` | `/api/utils/career` | ❌ | AI career path advisor |
| `POST` | `/api/utils/resume-analyser` | ❌ | ATS resume analysis |

---

### Interview Report Service — Base: `http://localhost:3000`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/interview/` | ✅ | Generate interview report |
| `GET` | `/api/interview/` | ✅ | Get all my reports |
| `GET` | `/api/interview/:interviewId` | ✅ | Get single report |
| `GET` | `/api/interview/resume/pdf/:id` | ✅ | Download AI resume PDF |

---

## 🗄️ Database Schemas

### User Schema
```js
{
  name, email (unique+indexed), password (bcrypt),
  phone_number, role: ["jobseeker"|"recruiter"], bio,
  resume (Cloudinary URL), resume_public_id,
  profile_pic (Cloudinary URL), profile_pic_public_id,
  subscription (Date — premium expiry),
  skills: [String],
  isVerified: Boolean,
  otp: String (temporary), otpExpires: Date,
  created_at: Date
}
```

### Company Schema
```js
{
  name (unique+indexed), description, website,
  logo (Cloudinary URL), logo_public_id,
  recruiter_id: ObjectId (ref: User)
}
```

### Job Schema
```js
{
  title, description, salary, location,
  job_type, openings, role, work_location,
  company_id: ObjectId (ref: Company),
  posted_by_recuriter_id: ObjectId (ref: User),
  is_active: Boolean (default: true),
  created_at: Date
}
```

### Application Schema
```js
{
  job_id: ObjectId, applicant_id: ObjectId,     // unique compound index
  applicant_email: String,
  status: ["Submitted"|"Rejected"|"Hired"],
  resume: String (Cloudinary URL at apply time),
  subscribed: Boolean,
  applied_at: Date
}
```

### Interview Report Schema
```js
{
  applicant_id: ObjectId,
  title: String,
  jobDescription, resume (PDF text), selfDescription,
  matchScore: Number (0-100),
  technicalQuestions: [{ question, intention, answer }],
  behavioralQuestions: [{ question, intention, answer }],
  skillGaps: [{ skill, severity: "low"|"medium"|"high" }],
  preparationPlan: [{ day, focus, tasks: [String] }],
  createdAt, updatedAt
}
```

### Blacklist Schema (logout token store)
```js
{ token: String, expiresAt: Date }   // TTL: 15 days
```

---

## 🔐 Authentication & Security Flow

### Registration + OTP Verification
```
POST /auth/register → validate → bcrypt hash password (10 rounds)
→ generate 6-digit OTP + 10-min expiry
→ if jobseeker: upload resume PDF to Cloudinary via utils service
→ create User (isVerified: false)
→ publishToTopic("send-mail", { to, subject, OTP html }) → Kafka
→ Kafka consumer (geminiResponse) → Nodemailer → Gmail SMTP → email sent

POST /auth/verify → match OTP + expiry
→ isVerified: true, otp: null
→ issue JWT (15d) → return to client
```

### Password Reset Flow
```
POST /auth/forgot → create reset JWT { email, type:"reset" } (15min)
→ Redis SET forgot:<email> <token> EX 900
→ Kafka → email with reset link

POST /auth/reset/:token →
  a. jwt.verify → check type === "reset"
  b. redis.get("forgot:<email>") must match token (prevents replay)
  c. update password hash → redis.del("forgot:<email>")
```

### Secure Logout (True Invalidation)
```
POST /auth/logout → extract JWT from header/cookie
→ BlackList.create({ token, expiresAt: now + 15 days })
→ Auth middleware checks blacklist on every request
→ Blacklisted tokens are permanently rejected until TTL
```

---

## 🤖 AI Features Deep Dive

### 1. Interview Report — Zod Schema Enforcement
The most complex AI feature uses **Gemini 3 Flash** with **Zod schema as responseSchema** guaranteeing structured JSON output:

```
User uploads PDF resume + self-description + job description
  → pdf-parse extracts resume text
  → Prompt + Zod schema sent to Gemini 3 Flash (responseMimeType: "application/json")
  → Guaranteed structured response:
     { matchScore, title, technicalQuestions[], behavioralQuestions[], skillGaps[], preparationPlan[] }
  → Saved to MongoDB → returned to frontend
```

### 2. AI Resume PDF Generation (Puppeteer)
```
Fetch saved InterviewReport (resume + jobDescription + selfDescription)
  → Gemini 3 Flash: "Generate ATS-friendly HTML resume tailored to this job"
  → Puppeteer: page.setContent(html) → page.pdf({ format: "A4" })
  → PDF binary returned as file download
```

### 3. ATS Resume Analyzer (Multimodal Gemini)
```
Frontend: PDF → FileReader → base64 string
  → POST /api/utils/resume-analyser { pdfBase64 }
  → Gemini 2.5 Flash reads PDF inline (inlineData mimeType)
  → Returns: { atsScore, scoreBreakdown: { formatting, keywords, structure, readability }, suggestions[], strengths[] }
```

### 4. AI Career Advisor
```
User enters skills → POST /api/utils/career { skills: "React, Node.js, Docker" }
  → Gemini 2.5 Flash generates:
     { summary, jobOptions[], skillsToLearn[], learningApproach }
```

---

## 📬 Event-Driven Email System (Kafka)

The platform uses Apache Kafka to fully decouple email sending from business logic:

```
Producers                                       Consumer (geminiResponse service)
────────────────────────────────────────        ─────────────────────────────────
auth: Registration OTP email       ─────────►  consumer.subscribe("send-mail")
auth: Forgot password reset link   ─────────►  Parse JSON { to, subject, html }
recruiter: Application status update ──────►   Nodemailer createTransport (Gmail, port 465)
                                               transporter.sendMail(...)
```

**Why Kafka for email?**
- SMTP is slow and can fail; making it async means APIs respond instantly
- SMTP credentials (`SMTP_USER`, `SMTP_PASS`) live in only one service
- Adding more consumers (analytics, push notifications) requires zero changes to producer code
- The auth service auto-creates the `send-mail` topic on startup via Kafka admin if it doesn't exist

---

## 🎨 Key Design Patterns

### TryCatch Wrapper
All controllers use a higher-order function eliminating repetitive try/catch blocks:
```js
export const TryCatch = (fn) => async (req, res, next) => {
  try { await fn(req, res, next); }
  catch (error) { next(error); }
};
```

### Serialize Helpers
Each service whitelists returned fields to prevent leaking OTP, password, or Cloudinary public_ids:
```js
serializeUser(user)    
serializeJob(job)      
serializeCompany(co)   
```

### File Upload Proxy
All file uploads flow through the utils service — other services convert the file to a base64 buffer and POST to `/api/utils/upload`, keeping Cloudinary SDK in one place.

### Subscription-Based Prioritization
Applications from subscribed users appear at the top of recruiter views:
```js
Application.find({ job_id }).sort({ subscribed: -1, applied_at: 1 })
```

### 5 Axios Instances (Frontend)
One Axios instance per service, each with the correct base URL and `withCredentials: true`. JWT injected via `authHeaders()` helper using `localStorage`.

---

## 🐳 Docker Support

Each service has its own `Dockerfile`. To build and run a service:
```bash
cd services/authentication
docker build -t hireconnect-auth .
docker run -p 5000:5000 --env-file .env hireconnect-auth
```
A `docker-compose.yml` at the root (planned) will orchestrate all services + Kafka + Zookeeper + Redis.

---
## 🗺️ Frontend Routing & Pages
| Route | Component | Auth | Role |
|---|---|---|---|
| `/` | Home | ❌ | — |
| `/login` | LoginPage | ❌ | — |
| `/register` | RegisterPage | ❌ | — |
| `/verify` | VerifyPage | ❌ | — |
| `/forgot-password` | ForgotPasswordPage | ❌ | — |
| `/reset/:token` | ResetPasswordPage | ❌ | — |
| `/jobs` | JobsPage | ❌ | — |
| `/jobs/:jobId` | JobDetailsPage | ❌ | — |
| `/company/:companyId` | CompanyDetailsPage | ❌ | — |
| `/dashboard` | DashboardPage | ✅ | Any |
| `/profile` | ProfilePage | ✅ | Any |
| `/applications` | ApplicationsPage | ✅ | jobseeker |
| `/users/:userId` | PublicUserProfilePage | ✅ | Any |
| `/interview` | InterviewStudioPage | ✅ | jobseeker |
| `/interview/:id` | InterviewReportPage | ✅ | jobseeker |
| `/tools/career` | CareerToolsPage | ✅ | Any |
| `/tools/resume` | ResumeAnalyzerPage | ✅ | Any |
| `/recruiter/companies` | RecruiterCompaniesPage | ✅ | recruiter |
| `/recruiter/companies/new` | CreateCompanyPage | ✅ | recruiter |
| `/recruiter/jobs` | RecruiterJobsPage | ✅ | recruiter |
| `/recruiter/jobs/new` | CreateJobPage | ✅ | recruiter |
| `/recruiter/jobs/:jobId/edit` | EditJobPage | ✅ | recruiter |
| `/recruiter/applications` | RecruiterApplicationsPage | ✅ | recruiter |
| `*` | NotFound | ❌ | — |

---

## ☁️ Deployment Guide

### Recommended Platforms
| Component | Platform |
|---|---|
| Frontend | Vercel or Netlify |
| Backend services | Render, Railway, or Fly.io |
| Interview service | Render (supports Puppeteer) |
| MongoDB | MongoDB Atlas |
| Redis | Redis Cloud or Upstash |
| Kafka | Confluent Cloud (free tier) |

### Frontend (Vercel)
1. Connect GitHub repo → set build command `npm run build`, output dir `dist`
2. Add all `VITE_*` env vars pointing to deployed service URLs

### Backend Services (Render)
1. Create a Web Service per microservice
2. Root directory: `services/<service-name>`
3. Build: `npm install` | Start: `node index.js` (or `node server.js`)
4. Add all `.env` variables in the Render dashboard

### Puppeteer on Render
```bash
# Add to package.json scripts or build command:
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install
```
Or use `@sparticuz/chromium` for serverless environments.

### Kafka on Confluent Cloud
Update KafkaJS config to use SASL authentication with Confluent bootstrap URL, API key, and secret.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

**Commit Convention** ([Conventional Commits](https://www.conventionalcommits.org/)):
`feat:` | `fix:` | `docs:` | `refactor:` | `chore:`

---
## 🐛 Known Issues & Roadmap

### Current Limitations
- No `docker-compose.yml` for one-command local startup
- Subscription/payment logic scaffolded but Stripe not integrated
- Interview service uses CommonJS while others use ESM
- No admin panel / super admin role
- Kafka SASL not configured (local plaintext only)

### Planned Features
- [ ] `docker-compose.yml` with all services + Kafka + Redis + Zookeeper
- [ ] Stripe subscription payment integration
- [ ] Real-time notifications (Socket.io or SSE)
- [ ] Admin dashboard for platform analytics
- [ ] Unified ESM across all services
- [ ] Interview video recording + AI evaluation
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mahendra Yadav**

[![GitHub](https://img.shields.io/badge/GitHub-Mahendra--9569-181717?style=flat-square&logo=github)](https://github.com/Mahendra-9569)

---

## 🙏 Acknowledgements

- [Apache Kafka + KafkaJS](https://kafka.js.org/) — Event-driven messaging
- [Google Gemini AI](https://ai.google.dev/) — Generative AI (2.5 Flash + 3 Flash)
- [Zod](https://zod.dev/) — Schema validation for structured AI output
- [Puppeteer](https://pptr.dev/) — Headless Chrome PDF generation
- [Cloudinary](https://cloudinary.com/) — Media CDN
- [Redis](https://redis.io/) — In-memory token store
- [Nodemailer](https://nodemailer.com/) — SMTP email delivery
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling

---

<div align="center">
  <p>Built with ❤️ on a true microservices architecture — scalable, modular, and AI-powered.</p>
  <p>⭐ If this project helped you, please give it a star!</p>
</div>
