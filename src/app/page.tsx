'use client'

import { useState } from 'react'
import { 
  MessageSquare, 
  CheckSquare, 
  Bell, 
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { sessions, currentSessionId, loadSession, startNewChat } = useAgentChat()

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar - Far Left (App Navigation) */}
      <div className="w-[60px] flex-shrink-0 flex flex-col items-center py-4 border-r border-zinc-800 bg-zinc-950 z-30">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
          <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="profile" className="w-full h-full object-cover opacity-80" />
        </div>
      </div>

      {/* Chat History Sidebar */}
      <ChatSidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId} 
        onSelectSession={loadSession} 
        onNewChat={startNewChat}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-[56px] flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-400/20 border border-cyan-400/30">
               <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
               <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Wingman</span>
            </div>

            <nav className="flex items-center gap-6">
              <button 
                onClick={() => setActiveAgent('Chat')}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${activeTab === 'Chat' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <div className={`w-2 h-2 rounded-full ${activeTab === 'Chat' ? 'bg-cyan-400' : 'bg-transparent'}`} />
                Chat
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 ml-2 border-l border-zinc-800 pl-4 text-zinc-500">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-black cursor-pointer overflow-hidden shadow-inner shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <img src="https://avatars.githubusercontent.com/u/100000000?v=4" alt="user" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 min-h-0 relative">
          <ChatInterface />
          
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-6 z-20 p-2 hover:bg-zinc-800 bg-zinc-950/50 backdrop-blur rounded-lg transition-all border border-zinc-800 text-zinc-500 hover:text-zinc-100 flex items-center justify-center shadow-lg"
            title={sidebarOpen ? 'Collapse side panel' : 'Expand side panel'}
          >
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </main>
      </div>

      {/* Memory Sidebar */}
      <div className={cn(
        "h-full flex-shrink-0 transition-all duration-300 ease-in-out border-l border-zinc-800 overflow-hidden bg-zinc-950",
        sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
      )}>
        <MemoryPanel />
      </div>
    </div>
  )
}
