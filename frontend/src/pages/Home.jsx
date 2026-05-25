import React, { useEffect, useState } from 'react'
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Sparkles,
  Users,
  Brain,
  Rocket,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: BriefcaseBusiness,
    title: 'Smart Job Discovery',
    text: 'Find relevant jobs faster with clean UI and structured filtering.',
  },
  {
    icon: ClipboardList,
    title: 'Interview Intelligence',
    text: 'Generate AI-based interview questions and preparation plans.',
  },
  {
    icon: Bot,
    title: 'ATS Resume Analysis',
    text: 'Improve resume score with keyword and structure suggestions.',
  },
  {
    icon: Building2,
    title: 'Recruiter Workspace',
    text: 'Manage jobs, companies, and candidates efficiently.',
  },
]

const workflow = [
  { icon: Brain, title: 'Analyze', text: 'Understand your strengths & gaps.' },
  { icon: Rocket, title: 'Improve', text: 'Follow roadmap & build projects.' },
  { icon: ShieldCheck, title: 'Perform', text: 'Crack interviews confidently.' },
]

export default function Home() {
  const { user } = useAuth()
  const [typedText, setTypedText] = useState('')
  const fullText = 'AI-Powered Hiring & Interview Platform'

  // Typing Effect
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  // Scroll Reveal Animation
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.2 }
    )
    elements.forEach((el) => observer.observe(el))
  }, [])

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white">

      {/* 🔥 HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
       <h1 className="relative text-4xl font-extrabold italic leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
        <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(236,72,153,0.35)]">
        {typedText}
         </span>
          <span className="ml-2 inline-block h-[0.9em] w-[3px] animate-pulse bg-gradient-to-b from-pink-400 to-sky-400 align-middle rounded-full" />
          <span className="absolute inset-0 -z-10 blur-3xl opacity-40 bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500" />
       </h1>

        <p className="mx-auto mt-6 max-w-2xl text-slate-400 text-lg">
          One platform for job discovery, interview prep, resume analysis, and recruiter workflows.
        </p>

    
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />
      </section>

 
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold mb-12">Platform Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="reveal rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:bg-white/10"
              >
                <Icon className="h-8 w-8 text-pink-400" />
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 🧠 WORKFLOW */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-12">How it Works</h2>

        <div className="grid gap-8 sm:grid-cols-3">
          {workflow.map((w, i) => {
            const Icon = w.icon
            return (
              <div key={i} className="reveal">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pink-500/20">
                  <Icon className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                <p className="text-sm text-slate-400">{w.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 🎯 ROLE SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">

          <div className="reveal rounded-3xl bg-gradient-to-br from-pink-500/20 to-transparent p-8 border border-white/10">
            <h3 className="text-xl font-bold">For Jobseekers</h3>
            <p className="mt-3 text-slate-400">
              Build skills, Apply for jobs, track their Applications analyze resumes, generate interview reports and track applications.
            </p>
          </div>

          <div className="reveal rounded-3xl bg-gradient-to-br from-sky-500/20 to-transparent p-8 border border-white/10">
            <h3 className="text-xl font-bold">For Recruiters</h3>
            <p className="mt-3 text-slate-400">
              Manage companies, post jobs, and evaluate candidates efficiently.
            </p>
          </div>

        </div>
      </section>

      {/* ✨ FOOTER STYLE CTA */}
      <section className="text-center py-16">
        <p className="text-slate-400">
          Built for modern hiring • AI-powered • Clean experience
        </p>
      </section>

      {/* 🔥 ANIMATION STYLES */}
      <style>
        {`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.6s ease;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        `}
      </style>
    </div>
  )
}