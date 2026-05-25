import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi, apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'

const cn = (...classes) => classes.filter(Boolean).join(' ')

function Shell({ title, subtitle, children, sideNote, accent = 'violet' }) {
  const accentRing =
    accent === 'pink'
      ? 'shadow-[0_0_40px_rgba(236,72,153,0.18)]'
      : 'shadow-[0_0_40px_rgba(139,92,246,0.18)]'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className={cn('w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 sm:p-8', accentRing)}>
          {children}
        </section>
      </main>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15',
        props.className
      )}
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15',
        props.className
      )}
    />
  )
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15',
        props.className
      )}
    />
  )
}

function Button({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'ghost'
      ? 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
      : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-950/30'

  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  )
}

function AuthFormCard({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthed, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthed) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, isAuthed, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.post('/api/auth/login', form)
      login(data.token, data.userObject)
      toast.success('Logged in successfully')
      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (isAuthed) return null

  return (
    <Shell
      title="Welcome back"
      subtitle="Login and continue to your dashboard with the right role-based experience."
      accent="violet"
    >
      <AuthFormCard title="Sign in" subtitle="Use the same credentials you created during registration.">
        <form className="space-y-5" onSubmit={submit}>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </Field>

          <div className="flex items-center justify-between gap-3 text-sm">
            <Link to="/register" className="text-violet-300 transition hover:text-violet-200">
              Create account
            </Link>
          </div>

          <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </AuthFormCard>
    </Shell>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthed, loading: authLoading } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'jobseeker',
    bio: '',
  })
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)

  const requiresResume = form.role === 'jobseeker'

  useEffect(() => {
    if (!authLoading && isAuthed) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, isAuthed, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('email', form.email)
      payload.append('password', form.password)
      payload.append('phoneNumber', form.phoneNumber)
      payload.append('role', form.role)
      payload.append('bio', form.bio)
      if (requiresResume && resume) payload.append('file', resume)

      const { data } = await authApi.post('/api/auth/register', payload)
      toast.success(data.message || 'OTP sent to your email')
      navigate(`/verify?email=${encodeURIComponent(data.email || form.email)}`)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (isAuthed) return null

  return (
    <Shell
      title="Create your account"
      subtitle="Jobseekers and recruiters register from the same place, while the backend decides what extra data is required."
      sideNote="Jobseekers upload a resume during registration. Recruiters skip that step."
      accent="pink"
    >
      <AuthFormCard title="Register" subtitle="Create your profile in a few quick steps.">
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </Field>
            <Field label="Phone number">
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="Mobile number"
                required
              />
            </Field>
          </div>

          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a strong password"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
            <Field label="Role">
              <SelectInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="jobseeker">Jobseeker</option>
                <option value="recruiter">Recruiter</option>
              </SelectInput>
            </Field>
            <Field label="Bio" hint="Optional">
              <TextArea
                rows={1}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short intro about yourself"
              />
            </Field>
          </div>

          {requiresResume ? (
            <Field label="Resume PDF" hint="Required for jobseekers">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 px-4 py-6 text-center transition hover:border-violet-400 hover:bg-violet-500/5">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  required
                />
                <span className="text-sm font-medium text-white">Click to upload or drag & drop</span>
                <span className="mt-1 text-xs text-slate-400">PDF only · resume file</span>
                {resume ? <span className="mt-3 text-sm font-medium text-emerald-300">✓ {resume.name}</span> : null}
              </label>
            </Field>
          ) : null}

          <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already verified?{' '}
            <Link to="/login" className="text-pink-300 transition hover:text-pink-200">
              Login here
            </Link>
          </p>
        </form>
      </AuthFormCard>
    </Shell>
  )
}

export function VerifyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthed, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ email: params.get('email') || '', otp: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthed) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, isAuthed, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.post('/api/auth/verify', form)
      login(data.token, data.user)
      toast.success(data.message || 'Verified successfully')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (isAuthed) return null

  return (
    <Shell title="Verify your email" subtitle="Enter the OTP sent to your email after registration." accent="violet">
      <AuthFormCard title="Email verification" subtitle="This is the final step before you can access the dashboard.">
        <form className="space-y-5" onSubmit={submit}>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>
          <Field label="OTP">
            <Input
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              placeholder="Enter 6-digit code"
              required
            />
          </Field>
          <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify account'}
          </Button>
        </form>
      </AuthFormCard>
    </Shell>
  )
}

// export function ForgotPasswordPage() {
//   const navigate = useNavigate()
//   const [email, setEmail] = useState('')
//   const [loading, setLoading] = useState(false)

//   const submit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const { data } = await authApi.post('/api/auth/forgot', { email })
//       toast.success(data.message || 'Reset link sent')
//       toast('Check your email for the reset link.')
//       navigate('/login')
//     } catch (error) {
//       toast.error(apiError(error))
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Shell title="Forgot password" subtitle="Request a reset mail from the backend mail flow." accent="pink">
//       <AuthFormCard title="Reset access" subtitle="We will send a password reset link to your email address.">
//         <form className="space-y-5" onSubmit={submit}>
//           <Field label="Email">
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               required
//             />
//           </Field>
//           <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
//             {loading ? 'Sending...' : 'Send reset email'}
//           </Button>
//           <p className="text-center text-sm text-slate-400">
//             Remembered it?{' '}
//             <Link to="/login" className="text-violet-300 transition hover:text-violet-200">
//               Go back
//             </Link>
//           </p>
//         </form>
//       </AuthFormCard>
//     </Shell>
//   )
// }

// export function ResetPasswordPage() {
//   const { token } = useParams()
//   const navigate = useNavigate()
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   const submit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const { data } = await authApi.post(`/api/auth/reset/${token}`, { password })
//       toast.success(data.message || 'Password updated')
//       navigate('/login')
//     } catch (error) {
//       toast.error(apiError(error))
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Shell title="Reset password" subtitle="Create a new password and return to login." accent="violet">
//       <AuthFormCard title="Set a new password" subtitle="Choose something strong and unique.">
//         <form className="space-y-5" onSubmit={submit}>
//           <Field label="New password">
//             <Input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="New password"
//               required
//             />
//           </Field>
//           <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
//             {loading ? 'Updating...' : 'Update password'}
//           </Button>
//         </form>
//       </AuthFormCard>
//     </Shell>
//   )
// }

export default function AuthPages() {
  return <LoginPage />
}