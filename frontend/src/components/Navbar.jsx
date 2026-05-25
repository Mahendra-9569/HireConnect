import React, { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MoonStar,
  Sparkles,
  SunMedium,
  UserCircle2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { authHeaders, authApi } from '../api/client'
import { Button, AppBadge } from './UI'

const publicItems = [
  { label: 'Home', to: '/', icon: LayoutDashboard },
  { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
  { label: 'Interview', to: '/interview', icon: ClipboardList },
]

const seekerItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
  { label: 'Interview', to: '/interview', icon: ClipboardList },
  { label: 'Applications', to: '/applications', icon: ClipboardList },
  { label: 'Profile', to: '/profile', icon: UserCircle2 },
]

const recruiterItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
  { label: 'Companies', to: '/recruiter/companies', icon: Building2 },
  { label: 'Post Job', to: '/recruiter/jobs/new', icon: Sparkles },
  { label: 'Applications', to: '/recruiter/applications', icon: ClipboardList },
  { label: 'Profile', to: '/profile', icon: UserCircle2 },
]

const cn = (...classes) => classes.filter(Boolean).join(' ')

function navClass({ isActive }) {
  return cn(
    'group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-200',
    isActive
      ? 'bg-gradient-to-r from-pink-500/20 to-sky-500/20 text-white ring-1 ring-pink-400/20 shadow-[0_0_0_1px_rgba(255,95,200,0.1),0_0_25px_rgba(47,157,245,0.08)]'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  )
}

async function logoutRequest() {
  await authApi.post('/api/auth/logout', null, { headers: authHeaders() })
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { isAuthed, user, logout, loading } = useAuth()
  const navigate = useNavigate()

  const navItems = useMemo(
    () => (!isAuthed ? publicItems : user?.role === 'recruiter' ? recruiterItems : seekerItems),
    [isAuthed, user?.role]
  )

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutRequest()
    } catch {
      // ignore backend logout errors, still clear local auth state
    } finally {
      logout()
      toast.success('Logged out successfully')
      navigate('/')
      setOpen(false)
      setLoggingOut(false)
    }
  }

  const Brand = () => (
    <Link to="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-sky-500 text-white shadow-[0_0_22px_rgba(236,72,153,0.24)]">
        <BriefcaseBusiness className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight text-white">HireConnect</div>
        <div className="text-xs text-slate-400">Jobs · Interview · Recruit</div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="h-10 w-40 rounded-full border border-white/10 bg-white/5" />
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthed ? (
              <>
                <AppBadge tone={user?.role === 'recruiter' ? 'sky' : 'pink'}>{user?.role}</AppBadge>
                <Button type="button" variant="secondary" onClick={handleLogout} disabled={loggingOut}>
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-[0_0_24px_rgba(255,95,200,0.24)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Button type="button" variant="secondary" onClick={toggleTheme} className="px-3">
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen((v) => !v)} className="px-3">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className={cn('fixed inset-0 z-40 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <button
          aria-label="Close menu overlay"
          type="button"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />

        <aside
          className={cn(
            'absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col border-l border-white/10 bg-slate-950/95 px-4 py-5 shadow-2xl shadow-black/50 transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <Brand />
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="px-3">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {isAuthed ? (
                <AppBadge tone={user?.role === 'recruiter' ? 'sky' : 'pink'}>{user?.role}</AppBadge>
              ) : (
                <AppBadge tone="slate">guest</AppBadge>
              )}
            </div>

            {!isAuthed ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-[0_0_24px_rgba(255,95,200,0.24)]"
                >
                  Register
                </Link>
              </div>
            ) : (
              <Button type="button" variant="secondary" onClick={handleLogout} disabled={loggingOut} className="w-full">
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}