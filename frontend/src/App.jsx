import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import {
  LoginPage,
  RegisterPage,
  VerifyPage
} from './pages/AuthPages'
import {
  JobsPage,
  JobDetailsPage,
  CompanyDetailsPage
} from './pages/JobsPages'
import {
  DashboardPage,
  ProfilePage,
  ApplicationsPage,
  PublicUserProfilePage
} from './pages/UserPages'
import {
  RecruiterCompaniesPage,
  CreateCompanyPage,
  CreateJobPage,
  EditJobPage,
  RecruiterJobsPage,
  RecruiterApplicationsPage
} from './pages/RecruiterPages'
import {
  InterviewStudioPage,
  InterviewReportPage,
  CareerToolsPage,
  ResumeAnalyzerPage
} from './pages/InterviewAndToolsPages'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/company/:companyId" element={<CompanyDetailsPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute roles={['jobseeker']}><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/users/:userId" element={<ProtectedRoute><PublicUserProfilePage /></ProtectedRoute>} />

        <Route path="/interview" element={<ProtectedRoute roles={['jobseeker']}><InterviewStudioPage /></ProtectedRoute>} />
        <Route path="/interview/:id" element={<ProtectedRoute roles={['jobseeker']}><InterviewReportPage /></ProtectedRoute>} />
        <Route path="/tools/career" element={<ProtectedRoute roles={['jobseeker','recruiter']}><CareerToolsPage /></ProtectedRoute>} />
        <Route path="/tools/resume" element={<ProtectedRoute roles={['jobseeker','recruiter']}><ResumeAnalyzerPage /></ProtectedRoute>} />

        <Route path="/recruiter/companies" element={<ProtectedRoute roles={['recruiter']}><RecruiterCompaniesPage /></ProtectedRoute>} />
        <Route path="/recruiter/companies/new" element={<ProtectedRoute roles={['recruiter']}><CreateCompanyPage /></ProtectedRoute>} />
        <Route path="/recruiter/jobs" element={<ProtectedRoute roles={['recruiter']}><RecruiterJobsPage /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/new" element={<ProtectedRoute roles={['recruiter']}><CreateJobPage /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/:jobId/edit" element={<ProtectedRoute roles={['recruiter']}><EditJobPage /></ProtectedRoute>} />
        <Route path="/recruiter/applications" element={<ProtectedRoute roles={['recruiter']}><RecruiterApplicationsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}
