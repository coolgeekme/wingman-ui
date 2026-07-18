'use client'

import { Plus, MessageSquare, Clock } from 'lucide-react'
import { ChatSession } from '@/hooks/useAgentChat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
}

export default function ChatSidebar({ sessions, currentSessionId, onSelectSession, onNewChat }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 w-full select-none">
      <div className="p-4">
        <button onClick={onNewChat} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all text-xs font-bold text-zinc-100 group shadow-lg">
          <Plus className="w-4 h-4 text-cyan-400" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
        <div className="px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Recent Chats</span>
        </div>
        
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center opacity-40">
             <Clock className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
             <p className="text-[10px] font-bold text-zinc-600 uppercase">No history</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                currentSessionId === session.id 
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
              )}
            >
              <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentSessionId === session.id ? "text-cyan-400" : "text-zinc-700")} />
              <span className="flex-1 text-[12px] font-medium truncate text-left tracking-tight">{session.title || "Untitled Chat"}</span>
              {currentSessionId === session.id && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-full" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
