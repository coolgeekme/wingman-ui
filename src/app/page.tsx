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
  const [activeTab, setActiveAgent] = useState('Chat')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Right sidebar (Memory)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false) // Left sidebar (History)
  const { sessions, currentSessionId, loadSession, startNewChat } = useAgentChat()

  const handleSelectSession = (id: string) => {
    loadSession(id)
    setLeftSidebarOpen(false) // Close left sidebar on mobile after selection
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* --- MOBILE OVERLAYS --- */}
      {/* Left Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden",
          leftSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setLeftSidebarOpen(false)}
      />
      
      {/* Right Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* --- SIDEBARS --- */}
      {/* App Navigation (Desktop Only) */}
      <div className="w-[60px] hidden md:flex flex-shrink-0 flex-col items-center py-4 border-r border-zinc-800 bg-zinc-950 z-30">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
          <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="profile" className="w-full h-full object-cover opacity-80" />
        </div>
      </div>

      {/* Chat History Sidebar (Responsive) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-30",
        leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <ChatSidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={handleSelectSession} 
          onNewChat={startNewChat}
        />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-[56px] flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 md:gap-8">
            {/* Mobile Menu Toggle (Left) */}
            <button 
              onClick={() => setLeftSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg bg-cyan-400/20 border border-cyan-400/30">
               <MessageSquare className="w-3 md:w-3.5 h-3 md:h-3.5 text-cyan-400" />
               <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-cyan-400">Wingman</span>
            </div>

            <nav className="hidden sm:flex items-center gap-6">
              <button 
                onClick={() => setActiveAgent('Chat')}
                className={\`flex items-center gap-2 text-xs font-bold transition-colors \${activeTab === 'Chat' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}\`}
              >
                <div className={\`w-2 h-2 rounded-full \${activeTab === 'Chat' ? 'bg-cyan-400' : 'bg-transparent'}\`} />
                Chat
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="flex items-center gap-3 md:ml-2 md:border-l md:border-zinc-800 md:pl-4 text-zinc-500">
               <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-black cursor-pointer overflow-hidden shadow-inner shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="user" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 min-h-0 relative">
          <ChatInterface />
          
          {/* Toggle Right Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 md:right-6 z-20 p-2 hover:bg-zinc-800 bg-zinc-950/50 backdrop-blur rounded-lg transition-all border border-zinc-800 text-zinc-500 hover:text-zinc-100 flex items-center justify-center shadow-lg"
            title={sidebarOpen ? 'Collapse side panel' : 'Expand side panel'}
          >
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </main>
      </div>

      {/* Memory Sidebar (Responsive) */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 transform transition-all duration-300 ease-in-out bg-zinc-950 border-l border-zinc-800 md:relative md:translate-x-0 md:z-30",
        sidebarOpen ? "translate-x-0 w-full sm:w-80 opacity-100" : "translate-x-full w-0 opacity-0 border-l-0"
      )}>
        {/* Mobile Close Button (Right Sidebar) */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-5 p-2 hover:bg-zinc-800 rounded-lg md:hidden text-zinc-400 z-50"
        >
          <X className="w-5 h-5" />
        </button>
        <MemoryPanel />
      </div>
    </div>
  )
}
