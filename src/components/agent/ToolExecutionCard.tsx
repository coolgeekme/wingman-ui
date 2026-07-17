'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Terminal, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { ToolCall } from '@/hooks/useAgentChat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ToolExecutionCardProps {
  toolCall: ToolCall
}

export default function ToolExecutionCard({ toolCall }: ToolExecutionCardProps) {
  const [expanded, setExpanded] = useState(false)

  const isComplete = toolCall.status === 'completed'
  const isError = toolCall.status === 'error'
  const isRunning = toolCall.status === 'running' || toolCall.status === 'pending'

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all duration-200",
      isComplete ? "bg-vibe-surface/50 border-vibe-border" : 
      isError ? "bg-red-500/5 border-red-500/20" :
      "bg-vibe-accent/5 border-vibe-accent/20 animate-pulse-subtle"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors group"
      >
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
          isComplete ? "bg-vibe-border text-vibe-muted" :
          isError ? "bg-red-500/10 text-red-500" :
          "bg-vibe-accent/10 text-vibe-accent"
        )}>
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isError ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <Terminal className="w-3.5 h-3.5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-vibe-text tracking-tight uppercase">
              {toolCall.name}
            </span>
            {isComplete && (
              <CheckCircle2 className="w-3 h-3 text-vibe-accent" />
            )}
          </div>
          <p className="text-[10px] text-vibe-muted font-medium truncate">
            {isRunning ? 'Executing action...' : isError ? 'Operation failed' : 'Action completed successfully'}
          </p>
        </div>

        <div className="text-vibe-muted group-hover:text-vibe-text transition-colors">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-vibe-border/30 mx-4">
          {toolCall.arguments && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-vibe-muted font-bold">
                Request
              </span>
              <div className="p-3 rounded-lg bg-vibe-bg border border-vibe-border/50">
                <pre className="text-[11px] text-vibe-text/70 font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {toolCall.arguments}
                </pre>
              </div>
            </div>
          )}
          
          {toolCall.result && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-vibe-muted font-bold">
                Response
              </span>
              <div className="p-3 rounded-lg bg-vibe-bg border border-vibe-border/50">
                <pre className={cn(
                  "text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words",
                  isError ? "text-red-400/90" : "text-vibe-accent/90"
                )}>
                  {toolCall.result}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
