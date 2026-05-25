import React from 'react'
import { ChevronRight } from 'lucide-react'

function Primitive({ value }) {
  if (value === null) return <span className="text-slate-400">null</span>
  if (value === undefined) return <span className="text-slate-400">undefined</span>
  if (typeof value === 'boolean') return <span className="text-sky-300">{String(value)}</span>
  if (typeof value === 'number') return <span className="text-amber-300">{value}</span>
  return <span className="text-slate-100">"{String(value)}"</span>
}

function Node({ data, level = 0 }) {
  if (Array.isArray(data)) {
    return (
      <div className="space-y-2">
        {data.length ? data.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <ChevronRight className="h-3 w-3" />
              Item {index + 1}
            </div>
            <Node data={item} level={level + 1} />
          </div>
        )) : <p className="text-sm text-slate-400">Empty array</p>}
      </div>
    )
  }

  if (data && typeof data === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">{key}</div>
            <Node data={value} level={level + 1} />
          </div>
        ))}
      </div>
    )
  }

  return <Primitive value={data} />
}

export default function JsonTree({ data }) {
  return <Node data={data} />
}
