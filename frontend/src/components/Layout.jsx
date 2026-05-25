import React from 'react'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-hero-glow bg-fixed text-slate-100 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="app-shell relative">{children}</main>
    </div>
  )
}
