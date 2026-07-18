'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Square,
  Bot,
  ArrowDown,
  Copy,
  Check,
  Bell,
  BellRing
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAgentChat, ChatMessage } from '@/hooks/useAgentChat'
import ToolExecutionCard from './ToolExecutionCard'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'framer-motion'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-zinc-800 bg-black/40">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-black tracking-widest">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="hover:text-zinc-200 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '13px',
          lineHeight: '1.6',
          backgroundColor: 'transparent',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const [toolsExpanded, setToolsExpanded] = useState(false)

  if (isSystem) {
    return (
      <div className="flex justify-center my-8">
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] bg-zinc-900/30 px-4 py-1.5 rounded-full border border-zinc-800/50">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 relative", 
        isUser ? "items-end" : "items-start"
      )}
    >
      <div className={cn("flex items-start gap-3 md:gap-4 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
        {!isUser && (
           <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
           </div>
        )}
        
        <div className={cn("flex-1 min-w-0", isUser ? "flex flex-col items-end" : "flex flex-col items-start")}>
          {isUser ? (
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 shadow-sm max-w-[95%] sm:max-w-[90%] ring-1 ring-white/5">
                <p className="text-[14px] md:text-[15px] text-zinc-100 leading-relaxed font-medium">{message.content}</p>
             </div>
          ) : (
            <div className="w-full space-y-4">
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-zinc-500">
                     <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                        <span className="opacity-80">Used {message.toolCalls.length} tools</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                    {message.toolCalls.map(tc => (
                      <ToolExecutionCard key={tc.id} toolCall={tc} />
                    ))}
                  </div>
                </div>
              )}

              <div className="prose prose-invert prose-zinc max-w-none prose-sm leading-[1.7] md:leading-[1.8] text-[14px] md:text-[15px] text-zinc-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <CodeBlock
                          language={match[1]}
                          value={String(children).replace(/\n$/, '')}
                        />
                      ) : (
                        <code className={cn("bg-zinc-900 px-1.5 py-0.5 rounded text-cyan-400 text-xs font-mono border border-zinc-800", className)} {...props}>
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="mb-4 md:mb-6 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 md:mb-6 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 md:mb-6 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-0">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 mt-8 md:mt-10 text-white tracking-tight">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-5 mt-6 md:mt-8 text-white tracking-tight">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 mt-5 md:mt-6 text-white tracking-tight">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-cyan-400/50 pl-4 md:pl-6 italic text-zinc-400 my-6 md:my-8 bg-cyan-400/5 py-4 md:py-5 rounded-r-xl">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                       <div className="my-6 md:my-8 overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900/20">
                          <table className="min-w-full divide-y divide-zinc-800">{children}</table>
                       </div>
                    ),
                    th: ({ children }) => <th className="px-4 md:px-5 py-2 md:py-3 bg-zinc-900/50 text-left text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500">{children}</th>,
                    td: ({ children }) => <td className="px-4 md:px-5 py-2 md:py-3 text-[12px] md:text-[13px] border-t border-zinc-800/50">{children}</td>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {message.isStreaming && !message.content && (
                   <div className="flex gap-2 items-center py-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                )}
                
                {message.isStreaming && message.content && (
                   <span className="inline-block w-1.5 h-4 bg-cyan-400/80 animate-pulse ml-1 align-middle" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages } = useAgentChat()
  const [input, setInput] = useState('')
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [notifStatus, setNotifStatus] = useState<'default' | 'granted' | 'denied' | 'loading'>('default')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifStatus(Notification.permission as 'default' | 'granted' | 'denied')
    }
  }, [])

  const VAPID_PUBLIC_KEY = 'BMGZ5AmtQV0n6OzUxptLGbbwi3TZ5hlujzZWW63EWxdBM-F4Kqp-fhFM10A1OKeKXQbRcUmYrj5cysUNL_jJHQE'
  const API_BASE = 'https://api.agent.coolgeek.me'

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const handleEnableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }

    setNotifStatus('loading')

    try {
      const permission = await Notification.requestPermission()
      setNotifStatus(permission as 'default' | 'granted' | 'denied')

      if (permission !== 'granted') {
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await fetch(API_BASE + '/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      console.log('[Notifications] Subscribed successfully')
    } catch (err) {
      console.error('[Notifications] Error:', err)
      setNotifStatus('default')
    }
  }

  useEffect(() => {
    if (scrollRef.current && !showScrollDown) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, showScrollDown])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setShowScrollDown(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 bg-dot-grid relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pt-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60%] md:min-h-[70%] text-center px-4">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 md:mb-8 shadow-2xl ring-1 ring-white/5">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-zinc-700" />
             </div>
             <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-3">Wingman</h2>
             <p className="text-zinc-500 text-sm font-medium max-w-sm leading-relaxed">
               Your private agent is authenticated and ready to orchestrate your workflow with Groq speed.
             </p>
          </div>
        )}

        <div className="w-full pb-48 md:pb-80">
          <div className="flex justify-center mb-6 md:mb-10">
             <span className="text-[9px] md:text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-zinc-900/40 rounded-full border border-zinc-800/30 backdrop-blur-sm shadow-sm ring-1 ring-white/5">System Ready</span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="fixed bottom-[140px] md:bottom-[200px] left-1/2 -translate-x-1/2 p-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:bg-zinc-800 transition-all z-20 text-zinc-100 ring-4 ring-black/20"
            >
              <ArrowDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-4 md:bottom-10 left-0 right-0 px-4 md:px-8 z-30 pointer-events-none">
        <div className="max-w-[840px] mx-auto pointer-events-auto">
          {/* Main Input Box */}
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden focus-within:border-zinc-700 transition-all backdrop-blur-xl ring-1 ring-white/5">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-2 md:p-3 pt-3 md:pt-4">
               <div className="px-3 md:px-5 pb-2 md:pb-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to Atlas"
                    disabled={isLoading}
                    rows={1}
                    className="w-full bg-transparent text-[15px] md:text-[16px] text-zinc-50 placeholder:text-zinc-600 outline-none resize-none font-medium leading-relaxed"
                    style={{ minHeight: '32px', maxHeight: '200px' }}
                  />
               </div>
               
               <div className="flex items-center justify-between px-2 md:px-3 pb-2 md:pb-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleEnableNotifications}
                      disabled={notifStatus === 'denied'}
                      title={
                        notifStatus === 'granted' ? 'Notifications enabled' :
                        notifStatus === 'denied' ? 'Notifications blocked' :
                        notifStatus === 'loading' ? 'Enabling...' :
                        'Enable push notifications'
                      }
                      className={cn(
                        "p-2 md:p-2.5 rounded-full transition-all",
                        notifStatus === 'granted'
                          ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                          : notifStatus === 'denied'
                          ? "text-red-400/50 cursor-not-allowed"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                      )}
                    >
                       {notifStatus === 'granted' ? <BellRing className="w-4.5 h-4.5 md:w-5 md:h-5" /> : <Bell className="w-4.5 h-4.5 md:w-5 md:h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={stopGeneration}
                        className="w-9 h-9 md:w-11 md:h-11 bg-zinc-50 text-black rounded-full hover:bg-white flex items-center justify-center transition-all shadow-xl scale-105"
                      >
                        <Square className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-9 h-9 md:w-11 md:h-11 bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700 hover:border-zinc-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                      >
                        <Send className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
               </div>
            </form>
          </div>
          <p className="hidden sm:block text-center text-[9px] md:text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] mt-3 md:mt-5">
            Agent Instance • V0.4.1 • Phoenix, AZ
          </p>
        </div>
      </div>
    </div>
  )
}
