import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authHeaders, interviewApi, utilsApi } from "../api/client";

const getApiError = (err) => err?.response?.data?.message || err?.message || "Request failed";

const apiService = {
  generateInterview: (formData) => interviewApi.post("/api/interview/", formData, { headers: authHeaders() }),
  getInterviewById: (id) => interviewApi.get(`/api/interview/${id}`, { headers: authHeaders() }),
  getAllInterviews: () => interviewApi.get("/api/interview/", { headers: authHeaders() }),
  downloadResumePdf: (id) => interviewApi.get(`/api/interview/resume/pdf/${id}`, { responseType: "blob", headers: authHeaders() }),
  analyzeCareer: (skills) => utilsApi.post("/api/utils/career", { skills }),
  analyzeResumeATS: (pdfBase64) => utilsApi.post("/api/utils/resume-analyser", { pdfBase64 }),
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

function Shell({ title, subtitle, children, rightAction, className = "" }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.9)]" />
              <span>PrepAI</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Interview & Career Intelligence</p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">{rightAction}</div>
        </div>
      </div>

      <main className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
          <div className="sm:hidden">{rightAction}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20", className)}>
      {children}
    </div>
  );
}

function Button({ children, className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    variant === "ghost"
      ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      : variant === "soft"
      ? "bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 border border-violet-400/20"
      : "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-950/30";

  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15",
        className
      )}
    />
  );
}

function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15",
        className
      )}
    />
  );
}

function Badge({ children, className = "" }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", className)}>{children}</span>;
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-2xl">📁</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{subtitle}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

function LoaderOverlay({ show, text = "Analysing...", sub = "This may take a few seconds" }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-slate-900 px-8 py-10 shadow-2xl shadow-black/40">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />
        <div className="text-center">
          <div className="text-base font-semibold text-white">{text}</div>
          <div className="mt-1 text-sm text-slate-400">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, tone = "violet" }) {
  const toneClass = tone === "green" ? "from-emerald-500 to-emerald-400" : tone === "amber" ? "from-amber-500 to-amber-400" : "from-violet-600 to-fuchsia-500";
  return (
    <div className="h-2.5 rounded-full bg-white/5">
      <div className={cn("h-full rounded-full bg-gradient-to-r", toneClass)} style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  );
}

function CollapsibleCard({ title, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <span className={cn("text-slate-400 transition-transform", open ? "rotate-180" : "rotate-0")}>▾</span>
      </button>
      {open ? <div className="p-5">{children}</div> : null}
    </Card>
  );
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function usePdfDropzone({ onPick, labelId }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDragOver = (e) => {
      e.preventDefault();
      el.dataset.dragover = "true";
    };
    const onDragLeave = () => {
      el.dataset.dragover = "false";
    };
    const onDrop = (e) => {
      e.preventDefault();
      el.dataset.dragover = "false";
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file");
        return;
      }
      onPick(file);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [onPick]);

  return { ref, labelId };
}

function FileDrop({ id, icon, title, hint, fileName, onChange, accepted = ".pdf" }) {
  const { ref } = usePdfDropzone({ onPick: onChange, labelId: id });

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 p-5 text-center transition-colors hover:border-violet-400 hover:bg-violet-500/5"
    >
      <input
        id={id}
        type="file"
        accept={accepted}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-2xl">{icon}</div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      {fileName ? <p className="mt-3 text-sm font-medium text-emerald-300">✓ {fileName}</p> : null}
    </div>
  );
}

export function InterviewStudioPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [resumeFileName, setResumeFileName] = useState("");

  useEffect(() => {
    apiService
      .getAllInterviews()
      .then((res) => setReports(res.data.interviewReports || []))
      .catch((err) => toast.error(getApiError(err)));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return toast.error("Resume PDF and Job Description are required");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription.trim());

    setLoading(true);
    try {
      const { data } = await apiService.generateInterview(formData);
      toast.success("Report Generated!");
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const rightAction = (
    <div className="flex items-center gap-2">
      <Button variant="soft" onClick={() => navigate("/tools/career")}>
        Career Tool
      </Button>

      <Button variant="soft" onClick={() => navigate("/tools/resume")}>
        Resume Analyzer
      </Button>
    </div>
  );

  return (
    <Shell
      title="Interview Studio"
      subtitle="Upload your resume, paste a job description, and generate a structured interview prep report."
      rightAction={rightAction}
    >
      <LoaderOverlay show={loading} text="AI is working…" sub="Generating your interview report" />

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <SectionTitle icon="📄" title="Generate interview report" subtitle="Keep the form aligned by filling the resume and job description fields below." />
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Resume (PDF)</label>
              <FileDrop
                id="resumeFile"
                icon="📄"
                title="Click to upload or drag & drop"
                hint="PDF only · Max 10MB"
                fileName={resumeFileName}
                onChange={async (picked) => {
                  if (!picked) return;
                  setFile(picked);
                  setResumeFileName(picked.name);
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Job Description <span className="text-rose-400">*</span></label>
              <TextArea
                rows={7}
                placeholder="Paste the full job description here…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full py-3.5 text-base">
              ✦ Generate Interview Report
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <SectionTitle icon="🗂" title="Your reports" subtitle="Previously generated interview reports appear here." />
          {reports.length ? (
            <div className="space-y-3">
              {reports.map((r) => {
                const score = r.matchScore || r.score || 0;
                const tone = score >= 70 ? "green" : score >= 45 ? "amber" : "violet";
                return (
                  <button
                    key={r._id || r.id}
                    type="button"
                    onClick={() => navigate(`/interview/${r._id || r.id}`)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/8"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-200">🗂</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{r.title || r.jobTitle || "Untitled report"}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {score}% match · {r.technicalQuestions?.length || 0} technical · {r.behavioralQuestions?.length || 0} behavioural
                      </div>
                    </div>
                    <Badge className={cn("shrink-0", tone === "green" ? "bg-emerald-500/15 text-emerald-300" : tone === "amber" ? "bg-amber-500/15 text-amber-300" : "bg-violet-500/15 text-violet-200")}>{score}%</Badge>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No reports yet"
              subtitle="Generate your first report to see it here."
              action={<Button onClick={() => navigate("/interview/new")}>+ Generate Report</Button>}
            />
          )}
        </Card>
      </div>
    </Shell>
  );
}

export function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService
      .getInterviewById(id)
      .then((res) => mounted && setReport(res.data.interviewReport))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await apiService.downloadResumePdf(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Optimized_Resume_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (err) {
      toast.error(getApiError(err) || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => navigate("/interview")}>Back</Button>
      <Button variant="soft" onClick={() => navigate("/tools/career")}>
        Career Tool
      </Button>
      <Button variant="soft" onClick={() => navigate("/tools/resume")}>
        Resume Analyzer
      </Button>
      <Button onClick={handleDownload} disabled={downloading}>
        {downloading ? "Downloading..." : "Download PDF"}
      </Button>
    </div>
  );

  return (
    <Shell rightAction={headerActions}>
      {loading ? (
        <Card className="p-8 text-center text-slate-400">Loading report...</Card>
      ) : report ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            <CollapsibleCard title="Technical Questions" icon="🔵" defaultOpen>
              <div className="grid gap-4">
                {(report.technicalQuestions || []).map((q, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <Badge className="bg-violet-500/15 text-violet-200">Technical</Badge>
                    <div className="mt-3 text-sm font-medium text-white">{escHtml(q.question || q)}</div>
                    {q.intention ? <div className="mt-2 text-xs italic text-slate-400">💡 {escHtml(q.intention)}</div> : null}
                    {q.answer ? <div className="mt-3 text-sm leading-6 text-slate-300">{escHtml(q.answer)}</div> : null}
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Behavioural Questions" icon="🟢" defaultOpen={false}>
              <div className="grid gap-4">
                {(report.behavioralQuestions || []).map((q, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <Badge className="bg-emerald-500/15 text-emerald-200">Behavioural</Badge>
                    <div className="mt-3 text-sm font-medium text-white">{escHtml(q.question || q)}</div>
                    {q.intention ? <div className="mt-2 text-xs italic text-slate-400">💡 {escHtml(q.intention)}</div> : null}
                    {q.answer ? <div className="mt-3 text-sm leading-6 text-slate-300">{escHtml(q.answer)}</div> : null}
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Skill Gaps" icon="⚠️" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {(report.skillGaps || []).map((g, i) => {
                  const sev = String(g.severity || "").toLowerCase();
                  const cls =
                    sev === "high"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/20"
                      : sev === "medium"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
                  return (
                    <span key={i} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", cls)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {g.skill || g}
                      {g.severity ? <span className="opacity-70">{g.severity}</span> : null}
                    </span>
                  );
                })}
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Preparation Plan" icon="📅" defaultOpen={false}>
              <div className="space-y-4">
                {(report.preparationPlan || []).map((day, i) => (
                  <div key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-200">D{day.day || i + 1}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{day.focus || day.title || `Day ${day.day || i + 1}`}</div>
                      <div className="mt-2 space-y-1 text-sm text-slate-400">
                        {(day.tasks || []).map((task, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-violet-400">→</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Report not found"
          subtitle="The requested interview report could not be loaded."
          action={<Button onClick={() => navigate("/interview")}>Back to Studio</Button>}
        />
      )}
    </Shell>
  );
}

export function CareerToolsPage() {
  const [skills, setSkills] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!skills.trim()) return toast.error("Please enter your skills");
    setLoading(true);
    try {
      const { data } = await apiService.analyzeCareer(skills.trim());
      setRoadmap(data);
      toast.success("Career analysis complete!");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const topPaths = roadmap?.top_career_paths || [];
  const steps = roadmap?.learning_roadmap || [];
  const projects = roadmap?.projects_to_build || [];
  const gap = roadmap?.skill_gap_analysis || {};

  return (
    <Shell
      title="AI Career Roadmap"
      subtitle="Enter your skills and get recommended roles, learning steps, and project ideas."
      rightAction={<Button onClick={handleAnalyze} disabled={loading}>{loading ? "Analyzing..." : "Get Roadmap"}</Button>}
    >
      <LoaderOverlay show={loading} text="Analysing your career paths…" sub="Finding the best roles for your skillset" />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <SectionTitle icon="🚀" title="Skills input" subtitle="Write all relevant skills, tools, domains, and experience details for better recommendations." />
          <div className="space-y-4">
            <TextArea
              rows={8}
              placeholder="e.g. Python, React, Node.js, PostgreSQL, Docker, REST APIs, Machine Learning, 3 years experience…"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <Button onClick={handleAnalyze} disabled={loading} className="w-full py-3.5 text-base">
              🚀 Analyse Career Paths
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          {roadmap ? (
            <>
              <Card className="p-6">
                <SectionTitle icon="🧭" title="Summary" />
                <p className="text-sm leading-6 text-slate-300">{roadmap.summary}</p>
              </Card>

              <CollapsibleCard title="Career Paths" icon="🎯" defaultOpen>
                <div className="grid gap-4">
                  {topPaths.map((p, i) => (
                    <div key={i} className={cn("rounded-2xl border p-5", i === 0 ? "border-violet-500/30 bg-violet-500/5" : "border-white/10 bg-slate-950/50")}>
                      {i === 0 ? <Badge className="mb-3 bg-emerald-500/15 text-emerald-300">Best Match</Badge> : null}
                      <div className="text-base font-semibold text-white">{p.role}</div>
                      <div className="mt-1 text-xs text-slate-400">{p.salary_range} · {p.growth_outlook} growth</div>
                      <div className="mt-3"><ProgressBar value={p.match_score || 0} /></div>
                      <div className="mt-2 text-xs text-slate-400">{p.match_score}% match</div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{p.why_this_role}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(p.required_skills || []).map((s, idx) => (
                          <Badge key={idx} className="bg-white/10 text-slate-200">{s}</Badge>
                        ))}
                        {(p.missing_skills || []).map((s, idx) => (
                          <Badge key={`m-${idx}`} className="bg-rose-500/15 text-rose-300">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              <CollapsibleCard title="Skill Analysis" icon="📊" defaultOpen={false}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">Strong</div>
                    <div className="flex flex-wrap gap-2">
                      {(gap.strong_skills || []).map((s, idx) => <Badge key={idx} className="bg-emerald-500/15 text-emerald-300">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-300">Weak</div>
                    <div className="flex flex-wrap gap-2">
                      {(gap.weak_skills || []).map((s, idx) => <Badge key={idx} className="bg-amber-500/15 text-amber-300">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-300">Learn Next</div>
                    <div className="flex flex-wrap gap-2">
                      {(gap.priority_to_learn || []).map((s, idx) => <Badge key={idx} className="bg-violet-500/15 text-violet-200">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </CollapsibleCard>

              <CollapsibleCard title="Learning Roadmap" icon="🗺" defaultOpen={false}>
                <div className="space-y-4">
                  {steps.map((s, idx) => (
                    <div key={idx} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500 text-xs font-bold text-white">{s.step}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{s.title}</div>
                        <div className="mt-1 text-xs text-slate-400">⏱ {s.duration}</div>
                        <div className="mt-2 text-sm text-violet-300">{(s.resources || []).join(" · ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              <CollapsibleCard title="Projects to Build" icon="🛠" defaultOpen={false}>
                <div className="grid gap-4">
                  {projects.map((p, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{p.title}</div>
                        <Badge className={cn(p.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-300" : p.difficulty === "advanced" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300")}>{p.difficulty}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{p.description}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState title="No analysis yet" subtitle="Enter your skills and generate a career roadmap to see the recommendations here." />
          )}
        </div>
      </div>
    </Shell>
  );
}

export function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfBase64, setPdfBase64] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (pickedFile) => {
    const selectedFile = pickedFile;

    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error("Please upload a resume");
      return;
    }

    setLoading(true);
    try {
      const base64String = await convertToBase64(file);
      setPdfBase64(base64String);

      const { data } = await apiService.analyzeResumeATS(base64String);
      setResults(data);
      toast.success("ATS analysis complete!");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const score = results?.ats_score || 0;

  return (
    <Shell
      title="ATS Resume Analyzer"
      subtitle="Upload your resume PDF and get ATS feedback, keyword analysis, improvements, and role matches."
      rightAction={<Button variant="ghost" onClick={() => {
        setFile(null);
        setFileName("");
        setPdfBase64("");
        setResults(null);
      }}>Reset</Button>}
    >
      <LoaderOverlay show={loading} text="Running ATS analysis…" sub="Scanning your resume structure and keyword match" />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <SectionTitle icon="📋" title="Upload resume" subtitle="A clean alignment starts with one PDF resume file." />
          <FileDrop
            id="atsFile"
            icon="📋"
            title="Click to upload your resume PDF"
            hint="PDF only · Best for ATS analysis"
            fileName={fileName}
            onChange={handleFileChange}
          />
          <Button onClick={analyzeResume} disabled={!file || loading} className="mt-4 w-full py-3.5 text-base">
            🎯 Analyse My Resume
          </Button>
          {pdfBase64 ? <p className="mt-4 text-xs text-emerald-300">Resume file ready for analysis.</p> : null}
        </Card>

        <div className="space-y-6">
          {results ? (
            <>
              <Card className="p-6">
                <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
                  <div className="text-center">
                    <div className={cn("text-5xl font-bold", score >= 70 ? "text-emerald-300" : score >= 45 ? "text-amber-300" : "text-rose-300")}>{score}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">ATS Score</div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-semibold text-white">{score >= 70 ? "Strong" : score >= 45 ? "Average" : "Needs Work"}</div>
                    <ProgressBar value={score} tone={score >= 70 ? "green" : score >= 45 ? "amber" : "violet"} />
                    <p className="mt-3 text-sm leading-6 text-slate-300">{results.overall_feedback}</p>
                  </div>
                </div>
              </Card>

              <CollapsibleCard title="Improvements" icon="🛠" defaultOpen={false}>
                <div className="space-y-3">
                  {(results.improvements || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                      <span className="text-violet-400">✦</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              <CollapsibleCard title="Best Role Fits" icon="🎯" defaultOpen={false}>
                <div className="space-y-4">
                  {(results.best_role_fit || []).map((role, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-white">{role.role}</div>
                        <div className="text-sm font-bold text-violet-300">{role.match_score}%</div>
                      </div>
                      <div className="mt-3"><ProgressBar value={role.match_score || 0} /></div>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState title="No analysis yet" subtitle="Upload a PDF resume to generate ATS feedback and keyword analysis." />
          )}
        </div>
      </div>
    </Shell>
  );
}

export default function PrepAIDashboard() {
  return <InterviewStudioPage />;
}