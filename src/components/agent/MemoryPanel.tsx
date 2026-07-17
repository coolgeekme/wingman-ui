'use client'

import { useState, useEffect } from 'react'
import { Brain, RefreshCw, ChevronRight, ChevronDown, Database, Hash, Clock, LoaderCircle } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AGENT_URL = 'https://api.agent.coolgeek.me'

interface MemoryFact {
  id?: string
  key?: string
  content: string
  category?: string
  timestamp?: string
}

export default function MemoryPanel() {
  const [facts, setFacts] = useState<MemoryFact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))

  const fetchMemory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${AGENT_URL}/memory/facts`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()

      let factList: MemoryFact[] = []
      if (Array.isArray(data)) {
        factList = data.map((item: any) => ({
          id: item.id || item.key || Math.random().toString(36).slice(2),
          content: item.content || item.fact || item.text || (typeof item === 'string' ? item : JSON.stringify(item)),
          category: item.category || item.type || 'general',
          timestamp: item.timestamp || item.created_at,
        }))
      } else if (data.facts) {
        factList = Object.entries(data.facts).map(([key, value]: [string, any]) => ({
          id: key,
          content: typeof value === 'string' ? value : JSON.stringify(value),
          category: 'facts',
        }))
      }

      setFacts(factList)
    } catch (err: any) {
      console.error("Memory fetch error:", err)
      setError(err.message)
      setFacts([])
    } finally {
      // Add small delay to ensure loading state transition is visible and stable
      setTimeout(() => setLoading(false), 300)
    }
  }

  useEffect(() => {
    fetchMemory()
  }, [])

  const categories = Array.from(new Set(facts.map(f => f.category || 'general')))

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 select-none w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Brain className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.15em] text-zinc-100">
            Memory
          </span>
        </div>
        <button
          onClick={fetchMemory}
          disabled={loading}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-cyan-400 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-cyan-400")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 no-scrollbar">
        {loading && facts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoaderCircle className="w-8 h-8 text-indigo-500 animate-spin opacity-50" />
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Updating Neural State</span>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
            <p className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">Sync Error</p>
            <p className="text-[13px] text-zinc-500 leading-relaxed">{error}</p>
            <button
              onClick={fetchMemory}
              className="mt-4 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && facts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Database className="w-10 h-10 text-zinc-600 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">No context stored</p>
          </div>
        )}

        {categories.map(category => (
          <div key={category} className="space-y-4">
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-black group-hover:text-zinc-100 transition-colors">
                  {category}
                </span>
              </div>
              <div className="h-px flex-1 bg-zinc-800/80" />
              <span className="text-[10px] text-zinc-600 font-mono font-bold">
                {facts.filter(f => (f.category || 'general') === category).length}
              </span>
            </button>

            {expandedCategories.has(category) && (
              <div className="space-y-3">
                {facts
                  .filter(f => (f.category || 'general') === category)
                  .map((fact, i) => (
                    <div
                      key={fact.id || i}
                      className="group p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                         <Hash className="w-3.5 h-3.5 text-indigo-400 mt-0.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                         <p className="text-[13px] text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-medium transition-colors">
                          {fact.content}
                        </p>
                      </div>
                      
                      {fact.timestamp && (
                        <div className="flex items-center gap-2 mt-3 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                            {new Date(fact.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/10">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2.5">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Sync active</span>
           </div>
        </div>
      </div>
    </div>
  )
}
