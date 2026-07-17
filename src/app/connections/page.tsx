'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ChevronLeft, 
  ExternalLink, 
  CheckCircle2, 
  Loader2,
  Mail,
  Calendar,
  Github,
  Slack,
  BookOpen,
  MessageCircle,
  Linkedin,
  Database,
  Plus,
  RefreshCw,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'


import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AGENT_URL = 'https://api.agent.coolgeek.me'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  color: string
}

interface ConnectedAccount {
  id: string
  app_name: string
  status: string
  connection_name: string
  created_at: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read and send emails, manage drafts and threads.',
    icon: Mail,
    color: 'bg-red-500/10 text-red-500 border-red-500/20'
  },
  {
    id: 'googlecalendar',
    name: 'Google Calendar',
    description: 'Schedule events, check availability, and manage your day.',
    icon: Calendar,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, pull requests, and issues.',
    icon: Github,
    color: 'bg-zinc-100/10 text-zinc-100 border-zinc-100/20'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages to channels and direct messages.',
    icon: Slack,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and update pages, manage databases and tasks.',
    icon: BookOpen,
    color: 'bg-zinc-100/10 text-zinc-100 border-zinc-100/20'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Automate messages and manage server interactions.',
    icon: MessageCircle,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Post updates and manage professional network interactions.',
    icon: Linkedin,
    color: 'bg-blue-600/10 text-blue-600 border-blue-600/20'
  }
]

export default function ConnectionsPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConnected = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_URL}/integrations/connected`)
      if (!res.ok) throw new Error('Failed to fetch connections')
      const data = await res.json()
      setConnectedAccounts(data.connected_accounts || [])
    } catch (err) {
      console.error('Connection fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnected()
    // Polling while connecting or just for fresh data
    const interval = setInterval(fetchConnected, 10000)
    return () => clearInterval(interval)
  }, [fetchConnected])

  const handleConnect = async (appId: string) => {
    setConnecting(appId)
    try {
      const response = await fetch(`${AGENT_URL}/integrations/connect/${appId}?redirect_url=${window.location.href}`)
      if (!response.ok) throw new Error('Failed to get connection URL')
      const data = await response.json()
      
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank')
      }
    } catch (err) {
      console.error(err)
      alert('Error initiating connection. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  const getAccountsForApp = (appId: string) => {
    return connectedAccounts.filter(acc => acc.app_name === appId && acc.status === 'ACTIVE')
  }

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans bg-dot-grid">
      {/* Header */}
      <header className="h-[56px] flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-[12px] font-black uppercase tracking-widest text-zinc-100">Integrations</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={fetchConnected}
             className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
           >
             <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
           </button>
           <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mr-2 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
             Secured by Composio
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white">Power your agent</h1>
              <p className="text-zinc-500 text-base max-w-2xl leading-relaxed">
                Connect multiple accounts to allow Atlas to act across your tools. 
                Everything is secured via encrypted tokens.
              </p>
            </div>
            
            <div className="flex items-center gap-4 px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
               <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Connected Assets</div>
                  <div className="text-xl font-bold text-white">{connectedAccounts.filter(a => a.status === 'ACTIVE').length}</div>
               </div>
               <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATIONS.map((app, index) => {
              const accounts = getAccountsForApp(app.id);
              const isConnected = accounts.length > 0;
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative flex flex-col p-6 rounded-[32px] bg-zinc-900/50 border transition-all shadow-xl backdrop-blur-sm ring-1 ring-white/5",
                    isConnected ? "border-cyan-400/30" : "border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${app.color} flex items-center justify-center border shadow-lg`}>
                      <app.icon className="w-6 h-6" />
                    </div>
                    
                    {isConnected && (
                      <div className="px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Connected</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tight">{app.name}</h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
                      {app.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* List connected accounts */}
                    <AnimatePresence>
                      {accounts.map(acc => (
                        <motion.div 
                          key={acc.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-[11px] font-bold"
                        >
                          <span className="text-zinc-300 truncate max-w-[150px]">{acc.connection_name || "Primary Account"}</span>
                          <span className="text-[9px] text-zinc-600 font-mono">{acc.id.slice(-8)}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      onClick={() => handleConnect(app.id)}
                      disabled={connecting === app.id}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all transform active:scale-95 disabled:opacity-50 shadow-md",
                        isConnected 
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" 
                          : "bg-zinc-100 text-black hover:bg-white"
                      )}
                    >
                      {connecting === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{isConnected ? `Link another ${app.name}` : `Connect ${app.name}`}</span>
                          <Plus className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-10 rounded-[40px] bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent border border-white/5 text-center space-y-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-dot-grid opacity-20" />
             <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-zinc-100 mx-auto flex items-center justify-center shadow-2xl ring-8 ring-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                   <Plus className="w-8 h-8 text-black" />
                </div>
                <div className="mt-6 space-y-2">
                   <h3 className="text-2xl font-black text-white tracking-tight">Expand your ecosystem</h3>
                   <p className="text-zinc-500 text-base max-w-md mx-auto font-medium">We support over 200+ integrations including Jira, Linear, Twilio, and Stripe.</p>
                </div>
                <button className="mt-8 px-8 py-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500/20 transition-all shadow-lg backdrop-blur-md">
                   Explore Integration Directory
                </button>
             </div>
          </div>
        </div>
      </main>

      <footer className="h-[60px] flex items-center justify-center border-t border-zinc-900/50 bg-zinc-950/50 backdrop-blur-xl">
        <p className="text-[10px] text-zinc-800 font-bold uppercase tracking-[0.5em]">
          Secured Vibe Network • 2026
        </p>
      </footer>
    </div>
  )
}
