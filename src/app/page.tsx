'use client'

import { useState } from 'react'
import { 
  MessageSquare, 
  Menu,
  X,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react'
import ChatInterface from '@/components/agent/ChatInterface'
import MemoryPanel from '@/components/agent/MemoryPanel'
import ChatSidebar from '@/components/agent/ChatSidebar'
import { useAgentChat } from '@/hooks/useAgentChat'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function AgentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Right sidebar (Memory)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false) // Left sidebar (History)
  const { sessions, currentSessionId, loadSession, startNewChat } = useAgentChat()

  const handleSelectSession = (id: string) => {
    loadSession(id)
    setLeftSidebarOpen(false) 
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* Mobile Overlays */}
      {(leftSidebarOpen || sidebarOpen) && (
        <div 
          className="fixed inset-0 bg-black/80 z-[45] transition-opacity md:hidden"
          onClick={() => {
            setLeftSidebarOpen(false)
            setSidebarOpen(false)
          }}
        />
      )}

      {/* Desktop App Nav (Hidden on Mobile) */}
      <div className="w-[60px] hidden md:flex flex-shrink-0 flex-col items-center py-4 border-r border-zinc-800 bg-zinc-950 z-30">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
          <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="profile" className="w-full h-full object-cover opacity-80" />
        </div>
      </div>

      {/* Chat History Sidebar (Slide-in on Mobile) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-72 bg-zinc-950 md:z-30",
        leftSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      )}>
        <ChatSidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={handleSelectSession} 
          onNewChat={startNewChat}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLeftSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg md:hidden text-zinc-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-400/20 border border-cyan-400/30">
               <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
               <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Wingman</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner">
               <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="user" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 relative">
          <ChatInterface />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 md:right-6 z-20 p-2 hover:bg-zinc-800 bg-zinc-950/50 backdrop-blur rounded-lg transition-all border border-zinc-800 text-zinc-500 hover:text-zinc-100 shadow-lg"
          >
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </main>
      </div>

      {/* Memory Sidebar (Slide-in on Mobile) */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-80 bg-zinc-950 md:z-30",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full md:translate-x-0 md:w-0 md:border-l-0 overflow-hidden"
      )}>
        <MemoryPanel />
      </div>
    </div>
  )
}
