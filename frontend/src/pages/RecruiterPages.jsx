import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheck } from "lucide-react";
import { API, authHeaders, apiError, buildAssetUrl, jobApi, toFormData, userApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AppBadge, Button, Field, Panel, SectionTitle, SelectInput, TextArea, TextInput } from '../components/UI'
import { asList, dateTime, money, statusTone } from '../utils/format'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  Camera,
  CirclePlus,
  Eye,
  Layers3,
  MapPin,
  Plus,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
  Users,
  UserCircle2,
  FileText,
  Clock3,
  CheckCircle2,
} from 'lucide-react'

function PageShell({ eyebrow, title, subtitle, children, actions }) {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-100px] top-[-120px] h-[340px] w-[340px] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[140px] h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[20%] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? <AppBadge tone="pink">{eyebrow}</AppBadge> : null}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children}
    </div>
  )
}

function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-pink-300">{label}</div>
        </div>
        {Icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-sky-500/15 text-pink-300 ring-1 ring-white/10">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{hint}</div>
    </div>
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

function ProgressBar({ value, tone = 'violet' }) {
  const toneClass = tone === 'green' ? 'from-emerald-500 to-emerald-400' : tone === 'amber' ? 'from-amber-500 to-amber-400' : tone === 'rose' ? 'from-rose-500 to-pink-500' : 'from-violet-600 to-fuchsia-500'
  return (
    <div className="h-2.5 rounded-full bg-white/5">
      <div className={['h-full rounded-full bg-gradient-to-r', toneClass].join(' ')} style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  )
}

function FilePick({ label, accept, onPick, fileName, helper, icon: Icon }) {
  return (
    <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 p-5 text-center transition hover:border-violet-400 hover:bg-violet-500/5">
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
      />
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-pink-300 ring-1 ring-white/10">
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <div className="text-sm font-semibold text-white">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{helper}</div>
      {fileName ? <div className="mt-3 text-sm font-medium text-emerald-300">✓ {fileName}</div> : null}
    </label>
  )
}

function Avatar({ src, name }) {
  if (src) {
    return <img src={src} alt={name || 'profile'} className="h-full w-full object-cover" />
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500/20 via-violet-500/20 to-sky-500/20 text-3xl font-black text-slate-700 dark:text-white">
      {name ? name.charAt(0).toUpperCase() : 'U'}
    </div>
  )
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

/* ================= DASHBOARD ================= */
export function DashboardPage() {
  const { user } = useAuth()

  const cards = user?.role === 'recruiter'
    ? [
        { title: 'Companies', text: 'Manage companies', to: '/recruiter/companies', icon: Building2 },
        { title: 'Jobs', text: 'Post new jobs', to: '/recruiter/jobs/new', icon: BriefcaseBusiness },
        { title: 'Applications', text: 'Review applicants', to: '/recruiter/applications', icon: Users },
      ]
    : [
        { title: 'Applications', text: 'Track applications', to: '/applications', icon: ClipboardList },
        { title: 'Interview', text: 'Generate reports', to: '/interview', icon: Sparkles },
        { title: 'AI Tools', text: 'Boost your career', to: '/tools/career', icon: Rocket },
      ]

  const quickStats = user?.role === 'recruiter'
    ? [
        { label: 'Open Roles', value: 'Live', hint: 'Manage active hiring pipelines.', icon: BriefcaseBusiness },
        { label: 'Hiring Flow', value: 'Fast', hint: 'Track applicants and move quicker.', icon: Clock3 },
        { label: 'Output', value: 'Better', hint: 'Use structured tools to scale hiring.', icon: BadgeCheck },
      ]
    : [
        { label: 'Prep Status', value: 'Ready', hint: 'Interview prep and ATS tools are available.', icon: Sparkles },
        { label: 'Career Focus', value: 'Growing', hint: 'Analyze skills and build your roadmap.', icon: Rocket },
        { label: 'Profile', value: 'Updated', hint: 'Keep your profile clean and visible.', icon: BadgeCheck },
      ]

  return (
    <PageShell
      eyebrow="DASHBOARD"
      title={`Hello, ${user?.name || 'User'}`}
      subtitle={
        user?.role === 'recruiter'
          ? 'Manage company pages, job posts, and applications from a clean recruiter workspace.'
          : 'Track your progress, build interview confidence, and use AI tools to strengthen your profile.'
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <SectionCard
          title="Your workspace"
          subtitle="A quick overview of the key actions available in your account."
          className="p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AppBadge>{user?.role || 'member'}</AppBadge>
            <Pill tone="pink">PREMIUM UI</Pill>
            <Pill tone="sky">ROLE BASED</Pill>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {quickStats.map((item) => {
              const Icon = item.icon
              return <Stat key={item.label} {...item} icon={Icon} />
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Next actions"
          subtitle="Jump straight into the tools that matter most for your role."
          className="p-6"
        >
          <div className="grid gap-4">
            {cards.map((c) => {
              const Icon = c.icon
              return (
                <Link
                  key={c.title}
                  to={c.to}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-sky-500/15 text-pink-300 ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white">{c.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-950 dark:group-hover:text-white" />
                </Link>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Stat label="Mode" value={user?.role === 'recruiter' ? 'Recruiter' : 'Jobseeker'} hint="Dedicated flow for your account type." icon={UserCircle2} />
        <Stat label="Tools" value="Interview + ATS" hint="Use AI tools to improve prep and resume quality." icon={Layers3} />
        <Stat label="Experience" value="Clean" hint="Modern dashboard with focused actions and clear layout." icon={ShieldCheck} />
      </div>
    </PageShell>
  )
}

/* ================= PROFILE ================= */
export function ProfilePage() {
  const { user, refreshMe } = useAuth()

  const [form, setForm] = useState({ name: '', phoneNumber: '', bio: '' })
  const [skill, setSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [picFile, setPicFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [picPreview, setPicPreview] = useState('')
  const [resumeName, setResumeName] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phoneNumber: user.phone_number || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const profileImage = user?.profile_pic
    ? user.profile_pic.startsWith('http')
      ? user.profile_pic
      : buildAssetUrl(API.auth, user.profile_pic)
    : picPreview || ''

  const skills = useMemo(() => asList(user?.skills), [user?.skills])

  const updateProfile = async () => {
    setLoading(true)
    try {
      await userApi.put('/api/user/update/profile', form, { headers: authHeaders() })
      await refreshMe()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  const uploadPic = async () => {
    if (!picFile) return toast.error('Select image')
    const payload = toFormData({ file: picFile })
    await userApi.put('/api/user/update/pic', payload, { headers: authHeaders() })
    await refreshMe()
    setPicFile(null)
    setPicPreview('')
    toast.success('Image uploaded')
  }

  const uploadResume = async () => {
    if (!resumeFile) return toast.error('Select PDF')
    const payload = toFormData({ file: resumeFile })
    await userApi.put('/api/user/update/resume', payload, { headers: authHeaders() })
    await refreshMe()
    setResumeFile(null)
    setResumeName('')
    toast.success('Resume uploaded')
  }

  const addSkill = async () => {
    if (!skill.trim()) return toast.error('Enter a skill')
    await userApi.post('/api/user/skill/add', { skillName: skill.trim() }, { headers: authHeaders() })
    await refreshMe()
    setSkill('')
    toast.success('Skill added')
  }

  const removeSkill = async (s) => {
    await userApi.put('/api/user/skill/delete', { skillName: s }, { headers: authHeaders() })
    await refreshMe()
    toast.success('Skill removed')
  }

  const profileStats = [
    { label: 'Profile', value: user?.name || '—', hint: user?.email || 'No email', icon: UserCircle2 },
    { label: 'Skills', value: String(skills.length), hint: 'Active skills listed in your profile.', icon: Sparkles },
    { label: 'Resume', value: user?.resume ? 'Uploaded' : 'Missing', hint: 'Keep your resume ready for applications.', icon: FileText },
  ]

  return (
    <PageShell
      eyebrow="PROFILE"
      title="Profile Settings"
      subtitle="Update your identity, upload assets, and keep your skills ready for applications and interviews."
      actions={
        <>
          <Button variant="ghost" onClick={() => refreshMe && refreshMe()}>Refresh</Button>
          <Button onClick={updateProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <SectionCard title="Edit profile" subtitle="Keep your profile clean and up to date." className="p-6">
          <div className="grid gap-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>

            <Field label="Phone">
              <TextInput value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </Field>

            <Field label="Bio">
              <TextArea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FilePick
              label="Upload image"
              accept="image/*"
              fileName={picFile?.name || ''}
              helper="PNG, JPG, JPEG"
              icon={Camera}
              onPick={(file) => {
                setPicFile(file)
                if (file) setPicPreview(URL.createObjectURL(file))
              }}
            />
            <FilePick
              label="Upload resume"
              accept="application/pdf"
              fileName={resumeName || resumeFile?.name || ''}
              helper="PDF only"
              icon={Upload}
              onPick={(file) => {
                setResumeFile(file)
                setResumeName(file ? file.name : '')
              }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="ghost" onClick={uploadPic} disabled={!picFile}> <Camera className="h-4 w-4" /> Upload Image</Button>
            <Button variant="ghost" onClick={uploadResume} disabled={!resumeFile}> <Upload className="h-4 w-4" /> Upload Resume</Button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Profile overview" subtitle="A quick snapshot of your public identity and profile readiness." className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {profileStats.map((item) => {
                const Icon = item.icon
                return <Stat key={item.label} {...item} icon={Icon} />
              })}
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/80 p-6 dark:bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-slate-100 shadow-sm dark:bg-slate-900">
                  <Avatar src={profileImage} name={user?.name} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white">{user?.name}</h2>
                  <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-pink-300" /> {user?.email}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" /> {user?.phone_number || 'No phone added'}</div>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{user?.bio || 'Add a short bio so recruiters and collaborators can understand your background quickly.'}</p>
            </div>
          </SectionCard>

          <SectionCard title="Skills" subtitle="Add and remove skills to keep your profile searchable and useful for AI tools." className="p-6">
            <div className="flex gap-2">
              <TextInput value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Add skill" />
              <Button onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-rose-500/10 hover:text-rose-300 dark:bg-white/5 dark:text-slate-200"
                >
                  <span>{s}</span>
                  <Trash2 size={14} className="transition group-hover:text-rose-300" />
                </button>
              )) : <div className="text-sm text-slate-500">No skills added yet.</div>}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  )
}

/* ================= APPLICATIONS ================= */
export function ApplicationsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    userApi.get('/api/user/application/all', { headers: authHeaders() })
      .then(res => setApps(res.data || []))
      .catch(err => toast.error(apiError(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell
      eyebrow="APPLICATIONS"
      title="My Applications"
      subtitle="Track your job applications, status updates, and activity in one organized view."
    >
      <SectionCard title="Application list" subtitle="Monitor your progress across different jobs." className="p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading applications...</div>
        ) : apps.length ? (
          <div className="grid gap-4">
            {apps.map((a) => {
              const tone = statusTone ? statusTone(a.status) : 'slate'
              return (
                <div key={a._id} className="rounded-3xl border border-white/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">{a.job_title}</h3>
                        <Pill tone={tone === 'success' ? 'emerald' : tone === 'warning' ? 'amber' : tone === 'danger' ? 'rose' : 'slate'}>
                          {a.status || 'unknown'}
                        </Pill>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-pink-300" /> {a.job_location || 'Location not listed'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>{dateTime(a.applied_at)}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="font-medium">{a.company_name || 'Company'}</span>
                    </div>
                  </div>

                  {a.notes ? (
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{a.notes}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            subtitle="Once you apply to jobs, they will appear here with status tracking."
            action={
              <Link to="/jobs" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20">
                Browse Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        )}
      </SectionCard>
    </PageShell>
  )
}

/* ================= PUBLIC PROFILE ================= */
export function PublicUserProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    userApi.get(`/api/user/${userId}`)
      .then(res => setProfile(res.data))
      .catch(err => toast.error(apiError(err)))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-slate-500 dark:text-slate-300">
        Loading...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-slate-500 dark:text-slate-300">
        Profile not found.
      </div>
    )
  }

  const profileImage = profile.profile_pic
    ? profile.profile_pic.startsWith('http')
      ? profile.profile_pic
      : buildAssetUrl(API.auth, profile.profile_pic)
    : ''

  const skills = asList(profile.skills)

  return (
    <PageShell
      eyebrow="PUBLIC PROFILE"
      title={profile.name}
      subtitle="A public-facing profile view with clean identity, skills, and summary information."
    >
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <SectionCard title="Identity" subtitle="Core public profile details." className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-slate-100 shadow-sm dark:bg-slate-900">
              <Avatar src={profileImage} name={profile.name} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <AppBadge>{profile.role || 'user'}</AppBadge>
              <Pill tone="pink">VISIBLE PROFILE</Pill>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/75 p-4 dark:bg-slate-950/40">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bio</div>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{profile.bio || 'No bio added yet.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/75 p-4 dark:bg-slate-950/40">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-pink-300" /> {profile.email}</div>
                {profile.phone_number ? <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" /> {profile.phone_number}</div> : null}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Skills" subtitle="Skills shown on this public profile." className="p-6">
            <div className="flex flex-wrap gap-2">
              {skills.length ? skills.map((s) => <Pill key={s} tone="sky">{s}</Pill>) : <span className="text-sm text-slate-500">No skills listed.</span>}
            </div>
          </SectionCard>

          <SectionCard title="Profile health" subtitle="A quick visual overview of this profile." className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Visibility" value="Public" hint="This page can be shared with others." icon={Eye} />
              <Stat label="Skills" value={String(skills.length)} hint="Skills help with matching and discovery." icon={BadgeCheck} />
              <Stat label="Status" value={profile.resume ? 'Ready' : 'Incomplete'} hint="Add resume and details to improve completeness." icon={CheckCircle2} />
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  )
}

/* ================= RECRUITER COMPANIES ================= */
export function RecruiterCompaniesPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await jobApi.get('/api/job/company/all', { headers: authHeaders() })
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const removeCompany = async (companyId) => {
    if (!confirm('Delete this company and all related jobs/applications?')) return
    try {
      await jobApi.delete(`/api/job/company/${companyId}`, { headers: authHeaders() })
      toast.success('Company deleted')
      load()
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  return (
    <PageShell
      eyebrow="RECRUITER WORKSPACE"
      title="Manage your companies"
      subtitle="Create, edit, and remove recruiter-owned companies from one organized screen."
      actions={<Button type="button" onClick={() => navigate('/recruiter/companies/new')}><Plus className="h-4 w-4" /> New company</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Stat label="Companies" value={String(companies.length)} hint="All recruiter-owned companies in your workspace." icon={Building2} />
        <Stat label="Branding" value="Logo" hint="Upload visual branding for each company." icon={Camera} />
        <Stat label="Access" value="Owner only" hint="Hides jobseeker actions and keeps recruiter controls visible." icon={ShieldCheck} />
      </div>

      <SectionCard title="Company list" subtitle="Click a company to inspect its public profile." className="mt-6 p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading companies...</div>
        ) : companies.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {companies.map((company) => {
              const id = company.company_id || company._id
              return (
                <div key={id} className="rounded-3xl border border-white/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-sky-500/15 ring-1 ring-white/10">
                          <Building2 className="h-5 w-5 text-pink-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link to={`/company/${id}`} className="text-lg font-bold tracking-tight text-slate-950 hover:text-pink-400 dark:text-white">
                          {company.name}
                        </Link>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{company.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCompany(id)}
                      className="rounded-2xl border border-white/10 p-3 text-rose-300 transition hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Pill tone="pink">Recruiter company</Pill>
                    {company.website ? <Pill tone="sky">Website linked</Pill> : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No companies created yet"
            subtitle="Create your first company to start posting jobs from a recruiter-owned workspace."
            action={<Button type="button" onClick={() => navigate('/recruiter/companies/new')}><Plus className="h-4 w-4" /> New company</Button>}
          />
        )}
      </SectionCard>
    </PageShell>
  )
}

export function CreateCompanyPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', website: '' })
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = toFormData({ ...form, file: logo })
      await jobApi.post('/api/job/company/new', payload, { headers: authHeaders() })
      toast.success('Company created')
      navigate('/recruiter/companies')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      eyebrow="CREATE COMPANY"
      title="Add a recruiter-owned company"
      subtitle="Upload a logo, add a description, and publish the company profile used by your job posts."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Company details" subtitle="Use the backend field name: file for the logo upload." className="p-6">
          <form className="space-y-5" onSubmit={submit}>
            <Field label="Company name">
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Website">
              <TextInput value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} required />
            </Field>
            <Field label="Description">
              <TextArea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </Field>
            <Field label="Logo">
              <input
                type="file"
                accept="image/*"
                className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white/90 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950/50"
                onChange={(e) => setLogo(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create company'}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="What happens next" subtitle="After creation, the company can be used in recruiter job posts." className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Step 1" value="Upload" hint="Add company logo and profile details." icon={Upload} />
            <Stat label="Step 2" value="Publish" hint="Create jobs linked to this company." icon={Plus} />
            <Stat label="Step 3" value="Track" hint="Review applicants and hiring progress." icon={Users} />
            <Stat label="Step 4" value="Scale" hint="Keep posting and managing from one dashboard." icon={Sparkles} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

function JobForm({ initial, onSubmit, submitLabel, loading, companyOptions = [] }) {
  const [form, setForm] = useState(initial)

  useEffect(() => {
    setForm(initial)
  }, [initial])

  return (
    <form className="space-y-5" onSubmit={(e) => onSubmit(e, form, setForm)}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="Salary">
          <TextInput type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
        </Field>
        <Field label="Location">
          <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        </Field>
        <Field label="Role">
          <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        </Field>
        <Field label="Job type">
          <TextInput value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} required />
        </Field>
        <Field label="Work location">
          <TextInput value={form.work_location} onChange={(e) => setForm({ ...form, work_location: e.target.value })} required />
        </Field>
        <Field label="Openings">
          <TextInput type="number" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} required />
        </Field>
        <Field label="Company">
          <SelectInput value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required>
            <option value="">Select company</option>
            {companyOptions.map((company) => (
              <option key={company.company_id || company._id} value={company.company_id || company._id}>
                {company.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          <span className="text-sm text-slate-700 dark:text-slate-200">Active job</span>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <TextArea rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </Field>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}

export function CreateJobPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await jobApi.get('/api/job/company/all', { headers: authHeaders() })
        if (alive) setCompanies(Array.isArray(data) ? data : [])
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
  }, [])

  const submit = async (e, form) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await jobApi.post('/api/job/new', form, { headers: authHeaders() })
      toast.success('Job posted')
      navigate('/recruiter/jobs')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading companies...</div>
  }

  return (
    <PageShell
      eyebrow="POST JOB"
      title="Publish a new opening"
      subtitle="This uses the recruiter-only job create endpoint and respects company ownership."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Job form" subtitle="Create a new role for your selected company." className="p-6">
          {!companies.length ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
              Create a company first.
              <div className="mt-4">
                <Button type="button" onClick={() => navigate('/recruiter/companies/new')}>
                  <Plus className="h-4 w-4" />
                  New company
                </Button>
              </div>
            </div>
          ) : (
            <JobForm
              initial={{
                title: '',
                description: '',
                salary: '',
                location: '',
                role: '',
                job_type: 'Full Time',
                work_location: 'Remote',
                company_id: '',
                openings: 1,
                is_active: true,
              }}
              onSubmit={submit}
              submitLabel={submitting ? 'Posting...' : 'Post job'}
              loading={submitting}
              companyOptions={companies}
            />
          )}
        </SectionCard>

        <SectionCard title="Posting tips" subtitle="A clean job post performs better with applicants." className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Clarity" value="Strong" hint="Use clear titles and responsibilities." icon={BriefcaseBusiness} />
            <Stat label="Reach" value="Higher" hint="Add location, work mode, and salary." icon={Eye} />
            <Stat label="Fit" value="Better" hint="Select the right company before posting." icon={Building2} />
            <Stat label="Conversion" value="Improved" hint="Clean details help more candidates apply." icon={BadgeCheck} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

export function EditJobPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const [jobRes, companyRes] = await Promise.all([
          jobApi.get(`/api/job/${jobId}`),
          jobApi.get('/api/job/company/all', { headers: authHeaders() }),
        ])
        const job = jobRes.data || {}
        if (alive) {
          setInitial({
            title: job.title || '',
            description: job.description || '',
            salary: job.salary || '',
            location: job.location || '',
            role: job.role || '',
            job_type: job.job_type || 'Full Time',
            work_location: job.work_location || 'Remote',
            company_id: job.company_id || '',
            openings: job.openings || 1,
            is_active: Boolean(job.is_active),
          })
          setCompanies(Array.isArray(companyRes.data) ? companyRes.data : [])
        }
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

  const submit = async (e, form) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await jobApi.put(`/api/job/${jobId}`, form, { headers: authHeaders() })
      toast.success('Job updated')
      navigate('/recruiter/jobs')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !initial) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading job...</div>
  }

  return (
    <PageShell
      eyebrow="EDIT JOB"
      title="Update job details"
      subtitle="Keep the role description accurate, active status current, and company link correct."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Job form" subtitle="Update your posting and keep it current." className="p-6">
          <JobForm
            initial={initial}
            onSubmit={submit}
            submitLabel={submitting ? 'Saving...' : 'Save changes'}
            loading={submitting}
            companyOptions={companies}
          />
        </SectionCard>

        <SectionCard title="Editing checklist" subtitle="Small fixes can improve candidate conversions." className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Title" value="Clear" hint="Use role-specific wording." icon={BriefcaseBusiness} />
            <Stat label="Company" value="Linked" hint="Ensure the correct company is selected." icon={Building2} />
            <Stat label="Status" value={initial.is_active ? 'Open' : 'Closed'} hint="Keep the opening state aligned with hiring." icon={CheckCircle2} />
            <Stat label="Visibility" value="Fresh" hint="Update stale descriptions and salary data." icon={Sparkles} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

export function RecruiterJobsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await jobApi.get('/api/job/all')
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const mine = useMemo(() => jobs.filter((job) => job.posted_by_recuriter_id), [jobs])

  return (
    <PageShell
      eyebrow="RECRUITER JOBS"
      title="Your posted jobs"
      subtitle="These are filtered from the public job list using the recruiter owner id."
      actions={<Button type="button" onClick={() => navigate('/recruiter/jobs/new')}><Plus className="h-4 w-4" /> Post job</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Stat label="Posted" value={String(mine.length)} hint="Jobs owned by your recruiter account." icon={BriefcaseBusiness} />
        <Stat label="Candidates" value="Tracked" hint="Review applicants per job from one place." icon={Users} />
        <Stat label="Workflow" value="Fast" hint="Move from creation to review without clutter." icon={Clock3} />
      </div>

      <SectionCard title="Your roles" subtitle="Manage job cards, edit posts, or open the public job page." className="mt-6 p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {mine.map((job) => (
            <div key={job.job_id || job._id} className="rounded-3xl border border-white/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/jobs/${job.job_id || job._id}`} className="text-lg font-bold tracking-tight text-slate-950 hover:text-pink-400 dark:text-white">
                    {job.title}
                  </Link>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-pink-300" /> {job.location}
                  </p>
                </div>
                <AppBadge tone={job.is_active ? 'emerald' : 'rose'}>{job.is_active ? 'Active' : 'Closed'}</AppBadge>
              </div>

              <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{job.description}</div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill tone="pink">₹{money(job.salary)}</Pill>
                <Pill tone="sky">{job.openings} openings</Pill>
                <Pill tone="slate">{job.job_type}</Pill>
                <Pill tone="slate">{job.work_location}</Pill>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">Posted job management</div>
                <Button type="button" variant="secondary" onClick={() => navigate(`/recruiter/jobs/${job.job_id || job._id}/edit`)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
          {!mine.length ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs posted yet"
              subtitle="Create your first company and then post a role to begin collecting applications."
              action={<Button type="button" onClick={() => navigate('/recruiter/jobs/new')}><Plus className="h-4 w-4" /> Post job</Button>}
            />
          ) : null}
        </div>
      </SectionCard>
    </PageShell>
  )
}

export function RecruiterApplicationsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  const loadJobs = async () => {
    const { data } = await jobApi.get('/api/job/all')
    const mine = Array.isArray(data) ? data.filter((job) => String(job.posted_by_recuriter_id) === String(user?.user_id)) : []
    setJobs(mine)
    setSelectedJob((mine[0] && (mine[0].job_id || mine[0]._id)) || '')
    return mine
  }

  const loadApps = async (jobId) => {
    if (!jobId) {
      setApps([])
      return
    }
    const { data } = await jobApi.get(`/api/job/application/${jobId}`, { headers: authHeaders() })
    setApps(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      try {
        const mine = await loadJobs()
        if (mine.length) {
          await loadApps(mine[0].job_id || mine[0]._id)
        }
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [user?.user_id])

  const handleSelect = async (value) => {
    setSelectedJob(value)
    setLoading(true)
    try {
      await loadApps(value)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appId, status) => {
    try {
      await jobApi.put(`/api/job/application/update/${appId}`, { status }, { headers: authHeaders() })
      await loadApps(selectedJob)
      toast.success('Application updated')
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  if (loading && !apps.length) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading recruiter applications...</div>
  }

  const currentJob = jobs.find((job) => String(job.job_id || job._id) === String(selectedJob))

  return (
    <PageShell
      eyebrow="RECRUITER APPLICATIONS"
      title="Review candidates"
      subtitle="Pick a job and update its applicant status from a clean candidate management screen."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Choose a job" subtitle="Switch between openings you own to view applicants." className="p-6">
          <Field label="Job">
            <SelectInput value={selectedJob} onChange={(e) => handleSelect(e.target.value)}>
              {jobs.map((job) => (
                <option key={job.job_id || job._id} value={job.job_id || job._id}>
                  {job.title}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stat label="Active job" value={currentJob ? 'Selected' : 'None'} hint={currentJob ? currentJob.title : 'Choose a role to review applicants.'} icon={BriefcaseBusiness} />
            <Stat label="Applicants" value={String(apps.length)} hint="Candidates attached to the selected job." icon={Users} />
          </div>
        </SectionCard>

        <SectionCard title="Applicant queue" subtitle="Update statuses directly from this panel." className="p-6">
          <div className="grid gap-4">
            {apps.map((app) => (
              <div key={app.application_id || app._id} className="rounded-3xl border border-white/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-950/45">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-950 dark:text-white">{app.applicant_email}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applied: {dateTime(app.applied_at)}</div>
                    <Link to={`/users/${app.applicant_id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-pink-300 hover:text-pink-200">
                      View applicant profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <AppBadge tone={statusTone(app.status)}>{app.status}</AppBadge>
                    {['Submitted', 'Rejected', 'Hired'].map((status) => (
                      <Button key={status} type="button" variant="secondary" onClick={() => updateStatus(app.application_id || app._id, status)}>
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {!apps.length ? (
              <EmptyState
                icon={Users}
                title="No applications found for this job"
                subtitle="Applicants will appear here after candidates submit applications for the selected opening."
              />
            ) : null}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}
