import React from 'react'
import clsx from 'clsx'

export function AppBadge({ children, tone = 'slate', className = '' }) {
  const map = {
    slate: 'bg-white/10 text-slate-200 ring-white/10',
    pink: 'bg-pink-500/15 text-pink-200 ring-pink-500/20',
    sky: 'bg-sky-500/15 text-sky-200 ring-sky-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-100 ring-amber-500/20',
    rose: 'bg-rose-500/15 text-rose-100 ring-rose-500/20'
  }
  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur', map[tone], className)}>
      {children}
    </span>
  )
}

export function Panel({ children, className = '' }) {
  return (
    <div className={clsx('panel-glass rounded-[28px] p-6 shadow-2xl shadow-black/15', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-300">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
    </label>
  )
}

export function TextInput(props) {
  return <input {...props} className={clsx('w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100', props.className)} />
}

export function TextArea(props) {
  return <textarea {...props} className={clsx('w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100', props.className)} />
}

export function SelectInput(props) {
  return <select {...props} className={clsx('w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100', props.className)} />
}

export function Button({ children, className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'btn-animated neon-hover bg-gradient-to-r from-pink-500 to-sky-500 text-white shadow-lg shadow-pink-500/20',
    secondary: 'neon-hover border border-white/10 bg-white/10 text-slate-900 shadow-sm backdrop-blur hover:bg-white/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10',
    danger: 'neon-hover bg-rose-500 text-white shadow-lg shadow-rose-500/20'
  }

  return (
    <button
      {...props}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60', styles[variant], className)}
    >
      {children}
    </button>
  )
}

export function CardGrid({ children }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}
