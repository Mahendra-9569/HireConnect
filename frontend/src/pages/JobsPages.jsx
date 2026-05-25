import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authHeaders, apiError, jobApi, userApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AppBadge, Button, Field, Panel, SectionTitle, SelectInput, TextArea, TextInput } from '../components/UI'
import { asList, compact, dateTime, money } from '../utils/format'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  BadgeCheck,
  Rocket,
  Eye,
} from 'lucide-react'

function PageShell({ eyebrow, title, subtitle, children, actions }) {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {children}
    </div>
  )
}

function Stat({ label, value, hint, icon: Icon }) {
  return (
      <div></div>
  )
}

function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <Panel className={['border border-white/10 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-950/55', className].join(' ')}>
      <div className="mb-5">
        <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
      </div>
      {children}
    </Panel>
  )
}

function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
    pink: 'bg-pink-500/15 text-pink-300',
    sky: 'bg-sky-500/15 text-sky-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-300',
    rose: 'bg-rose-500/15 text-rose-300',
  }
  return <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone] || tones.slate].join(' ')}>{children}</span>
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 py-14 text-center">
      {Icon ? <Icon className="mx-auto h-10 w-10 text-pink-300" /> : null}
      <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

function JobCard({ job, onApply, applying, role }) {
  return (
    <Panel className="flex h-full flex-col justify-between border border-white/10 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(15,23,42,0.12)] dark:bg-slate-950/55">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <Link to={`/jobs/${job.job_id || job._id}`} className="block truncate text-xl font-black tracking-tight text-slate-950 hover:text-pink-400 dark:text-white">
              {job.title}
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">{job.company_name || 'Independent company'}</p>
          </div>
          <AppBadge tone={job.is_active ? 'emerald' : 'rose'}>{job.is_active ? 'Active' : 'Closed'}</AppBadge>
        </div>

        <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {compact(job.description, 220)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <AppBadge tone="pink">{job.role || 'Role'}</AppBadge>
          <AppBadge tone="sky">{job.job_type || 'Job type'}</AppBadge>
          <AppBadge tone="slate">{job.work_location || 'Work model'}</AppBadge>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-300" />{job.location || '—'}</div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" />Openings: {job.openings ?? '—'}</div>
          <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-300" />Posted: {dateTime(job.created_at)}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          ₹{money(job.salary)}
          <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">per year</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/jobs/${job.job_id || job._id}`} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
            View
          </Link>
          {role === 'jobseeker' ? (
            <Button type="button" onClick={() => onApply(job)} disabled={applying}>
              Apply
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  )
}

function CompanyStatStrip() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Stat label="Jobs" value="Live" hint="Browse active opportunities across roles and locations." icon={BriefcaseBusiness} />
      <Stat label="Search" value="Fast" hint="Filter by title and location with instant feedback." icon={Search} />
      <Stat label="Apply" value="1 Click" hint="Jobseekers can submit applications quickly from cards or detail pages." icon={Rocket} />
    </div>
  )
}

export function JobsPage() {
  const { user, isAuthed } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ title: '', location: '' })
  const [applyingId, setApplyingId] = useState(null)

  const load = async (filters = query) => {
    setLoading(true)
    try {
      const { data } = await jobApi.get('/api/job/all', { params: filters })
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(query)
   
  }, [])

  const filtered = useMemo(() => jobs, [jobs])

  const apply = async (job) => {
    if (!isAuthed || user?.role !== 'jobseeker') {
      toast.error('Login as a jobseeker to apply.')
      return
    }

    setApplyingId(job.job_id || job._id)
    try {
      await userApi.post('/api/user/apply/job', { job_id: job.job_id || job._id }, { headers: authHeaders() })
      toast.success('Applied successfully')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <PageShell
    >
      <CompanyStatStrip />

      <SectionCard title="Search filters" subtitle="Fine tune the results with title and location filters." className="mt-6 p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <TextInput
            placeholder="Search title"
            value={query.title}
            onChange={(e) => setQuery({ ...query, title: e.target.value })}
          />
          <TextInput
            placeholder="Search location"
            value={query.location}
            onChange={(e) => setQuery({ ...query, location: e.target.value })}
          />
          <Button type="button" onClick={() => load(query)}>
            <Filter className="h-4 w-4" />
            Apply filters
          </Button>
        </div>
      </SectionCard>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/70 p-10 text-center text-sm text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">
          Loading jobs...
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {filtered.map((job) => (
            <JobCard
              key={job.job_id || job._id}
              job={job}
              role={user?.role}
              applying={applyingId === (job.job_id || job._id)}
              onApply={apply}
            />
          ))}
          {!filtered.length ? (
            <SectionCard title="No results" subtitle="Try a different search query or clear the filters." className="xl:col-span-2 p-6">
              <EmptyState
                icon={Search}
                title="No jobs matched your filters"
                subtitle="Adjust the title or location filter to discover more openings."
              />
            </SectionCard>
          ) : null}
        </div>
      )}
    </PageShell>
  )
}

export function JobDetailsPage() {
  const { jobId } = useParams()
  const { user, isAuthed } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await jobApi.get(`/api/job/${jobId}`)
        if (alive) setJob(data)
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [jobId])

  const apply = async () => {
    if (!isAuthed || user?.role !== 'jobseeker') {
      toast.error('Login as a jobseeker to apply.')
      navigate('/login')
      return
    }

    setApplying(true)
    try {
      await userApi.post('/api/user/apply/job', { job_id: jobId }, { headers: authHeaders() })
      toast.success('Application submitted')
      navigate('/applications')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading job details...</div>
  }

  if (!job) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Job not found.</div>
  }

  return (
    <PageShell
      eyebrow="JOB DETAILS"
      title={job.title}
      subtitle="Review role details, company context, and apply directly from the detail screen."
    >
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <SectionCard title="Role overview" subtitle="A detailed snapshot of the role and expectations." className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <AppBadge tone="pink">{job.role || 'Role'}</AppBadge>
            <AppBadge tone="sky">{job.job_type || 'Type'}</AppBadge>
            <AppBadge tone={job.is_active ? 'emerald' : 'rose'}>{job.is_active ? 'Active' : 'Closed'}</AppBadge>
          </div>

          <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">{job.description}</p>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-300" />{job.location}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" />Openings: {job.openings}</div>
            <div className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-emerald-300" />Work model: {job.work_location}</div>
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" />Posted: {dateTime(job.created_at)}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={apply} disabled={applying}>
              {applying ? 'Applying...' : 'Apply now'}
            </Button>
            {user?.role === 'recruiter' ? (
              <Link to={`/recruiter/jobs/${job.job_id || job._id}/edit`} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                Edit job
              </Link>
            ) : null}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Salary" subtitle="Compensation at a glance." className="p-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-white">
              <div className="text-sm text-slate-300">Salary</div>
              <div className="mt-1 text-3xl font-black">₹{money(job.salary)}</div>
              <div className="mt-2 text-sm text-slate-300">Per year</div>
            </div>
          </SectionCard>

          {job.company_name || job.company_id ? (
            <Link to={`/company/${job.company_id}`} className="block rounded-3xl border border-white/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45 dark:hover:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-sky-500/15 ring-1 ring-white/10">
                  <Building2 className="h-5 w-5 text-pink-300" />
                </div>
                <div>
                  <div className="font-semibold text-slate-950 dark:text-white">{job.company_name || 'Company details'}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Open company page</div>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}

export function CompanyDetailsPage() {
  const { companyId } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await jobApi.get(`/api/job/company/${companyId}`)
        if (alive) setCompany(data)
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [companyId])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading company...</div>
  }
  if (!company) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Company not found.</div>
  }

  return (
    <PageShell
      eyebrow="COMPANY"
      title={company.name}
      subtitle="Explore company information and the roles linked to this organization."
    >
      <SectionCard title="Company profile" subtitle="A polished overview of the organization." className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <AppBadge tone="sky">Company</AppBadge>
              <Pill tone="pink">Brand page</Pill>
            </div>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">{company.description}</p>
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">{company.website}</div>
          </div>
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="h-24 w-24 rounded-3xl object-cover ring-1 ring-white/10" />
          ) : null}
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Stat label="Company" value="Live" hint="Public company profile with linked roles." icon={Building2} />
          <Stat label="Jobs" value={String(asList(company.jobs).length)} hint="Available roles under this company." icon={BriefcaseBusiness} />
          <Stat label="Visibility" value="Open" hint="Share this page or link it from jobs." icon={Eye} />
        </div>

        <SectionCard title="Open roles" subtitle="These roles are fetched from the company details endpoint." className="p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {asList(company.jobs).map((job) => (
              <Link key={job.job_id || job._id} to={`/jobs/${job.job_id || job._id}`} className="rounded-3xl border border-white/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45 dark:hover:bg-slate-950/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-950 dark:text-white">{job.title}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.location}</div>
                  </div>
                  <AppBadge tone={job.is_active ? 'emerald' : 'rose'}>{job.is_active ? 'Active' : 'Closed'}</AppBadge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill tone="sky">₹{money(job.salary)}</Pill>
                  <Pill tone="slate">{job.job_type || 'Type'}</Pill>
                </div>
              </Link>
            ))}
          </div>

          {!asList(company.jobs).length ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No open roles"
              subtitle="This company currently has no linked jobs available."
            />
          ) : null}
        </SectionCard>
      </div>
    </PageShell>
  )
}
