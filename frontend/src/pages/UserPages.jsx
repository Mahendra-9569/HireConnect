import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API, authHeaders, apiError, buildAssetUrl, toFormData, userApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AppBadge, Button, Field, Panel, SectionTitle, TextArea, TextInput } from '../components/UI'
import { asList, dateTime, statusTone } from '../utils/format'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Camera,
  ClipboardList,
  FileText,
  ImagePlus,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Activity,
  Star,
} from 'lucide-react'

function PageShell({ eyebrow, title, subtitle, children, actions }) {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-80px] top-[-120px] h-[320px] w-[320px] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute right-[-100px] top-[140px] h-[340px] w-[340px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-130px] left-1/3 h-[260px] w-[260px] rounded-full bg-violet-500/10 blur-3xl" />
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
    <div className="rounded-[28px] border border-white/10 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:bg-slate-900/60">
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


export function DashboardPage() {
  const { user } = useAuth()
  const [text, setText] = useState("")
  const fullText = "Build. Prepare. Get Hired."


  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      
 
      <div className="relative px-6 py-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-sky-500/10 blur-3xl" />

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Welcome, Applicants!
        </h1>

        <p className="mt-4 text-lg text-slate-400 h-6">
          {text}
          <span className="animate-pulse">|</span>
        </p>
      </div>


      <div className="px-6 grid gap-6 md:grid-cols-3">

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c"
            alt="coding"
            className="h-40 w-full object-cover opacity-80"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold">Interview Preparation</h3>
            <p className="text-sm text-slate-400 mt-1">
              Practice real-world interview questions and improve confidence.
            </p>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
          <img
            src="https://images.unsplash.com/photo-1556740749-887f6717d7e4"
            alt="career"
            className="h-40 w-full object-cover opacity-80"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold">Career Growth</h3>
            <p className="text-sm text-slate-400 mt-1">
              Get AI-powered roadmap and build industry-ready skills.
            </p>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
          <img
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4"
            alt="resume"
            className="h-40 w-full object-cover opacity-80"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold">Resume Analyzer</h3>
            <p className="text-sm text-slate-400 mt-1">
              Improve ATS score and optimize your resume instantly.
            </p>
          </div>
        </div>

      </div>

    
      <div className="mt-16 px-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/10 to-sky-500/10 p-8 text-center">
          <h2 className="text-2xl font-bold">Your Progress</h2>

          <div className="mt-6 h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[75%] bg-gradient-to-r from-pink-500 to-sky-500 animate-pulse" />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            You are on the right track. Keep building and practicing.
          </p>
        </div>
      </div>


      <div className="mt-20 px-6 pb-16 text-center text-slate-500 text-sm">
        Designed for real-world hiring 🚀
      </div>
    </div>
  )
}

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
    { label: 'Profile', value: user?.name || '—', hint: user?.email || 'No email' , icon: UserCircle2 },
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
              icon={ImagePlus}
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
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/80 p-6 dark:bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-slate-100 shadow-sm dark:bg-slate-900">
                  <Avatar src={profileImage} name={user?.name} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white">{user?.name}</h2>
                  <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-pink-300" /> {user?.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-sky-300" /> {user?.phone_number || 'No phone added'}</div>
                  </div>
                </div>
              </div>
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
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 py-14 text-center">
            <FileText className="mx-auto h-10 w-10 text-pink-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">No applications yet</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Once you apply to jobs, they will appear here with status tracking.</p>
            <div className="mt-6">
              <Link to="/jobs" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20">
                Browse Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-slate-500">
        Loading...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-slate-500">
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
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-pink-300" /> {profile.email}</div>
                {profile.phone_number ? <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-sky-300" /> {profile.phone_number}</div> : null}
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
              <Stat label="Visibility" value="Public" hint="This page can be shared with others." icon={ShieldCheck} />
              <Stat label="Skills" value={String(skills.length)} hint="Skills help with matching and discovery." icon={Star} />
              <Stat label="Status" value={profile.resume ? 'Ready' : 'Incomplete'} hint="Add resume and details to improve completeness." icon={BadgeCheck} />
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  )
}
