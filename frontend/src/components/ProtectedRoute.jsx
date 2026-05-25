import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles = [] }) {
  const { loading, isAuthed, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-white/70 px-6 py-4 text-sm shadow-xl backdrop-blur dark:bg-slate-900/70">
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />
  }

  if (roles.length && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
