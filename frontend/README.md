# HireHeaven Frontend

A full Vite + React + Tailwind frontend for the backend services in your archive.

## Includes
- Authentication: register, verify OTP, login, forgot/reset password
- Public jobs list + job details
- Jobseeker profile, applications, skills, resume/picture upload
- Recruiter companies, jobs, job applications
- Interview report generation + PDF download
- Career tools endpoint
- Resume analyzer endpoint
- Light / dark theme toggle
- Role-based navigation and protected routes

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Backend URLs

- Auth: `http://localhost:5000`
- User: `http://localhost:5002`
- Job: `http://localhost:5003`
- Interview: `http://localhost:3000`
- Utils: `http://localhost:5001`

## Important field names

- Register jobseeker resume upload: `file`
- Update profile picture / resume: `file`
- Create company logo upload: `file`
- Interview report resume upload: `resume`
- Reset password route: `/reset/:token`

If your backend ports differ, update the `.env` file.
