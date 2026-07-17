'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Square,
  Bot,
  User,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  Copy,
  Check,
  Calendar,
  Mic,
  Plus,
  MessageCircle,
  X,
  History,
  LayoutGrid
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
import Link from 'next/link'

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
      className={cn("flex flex-col w-full max-w-4xl mx-auto px-6 py-6 relative", 
        isUser ? "items-end" : "items-start"
      )}
    >
      <div className={cn("flex items-start gap-4 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
        {!isUser && (
           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Bot className="w-4 h-4 text-cyan-400" />
           </div>
        )}
        
        <div className={cn("flex-1 min-w-0", isUser ? "flex flex-col items-end" : "flex flex-col items-start")}>
          {isUser ? (
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 shadow-sm max-w-[90%] ring-1 ring-white/5">
                <p className="text-[15px] text-zinc-100 leading-relaxed font-medium">{message.content}</p>
             </div>
          ) : (
            <div className="w-full space-y-4">
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="space-y-3">
                  <button 
                    onClick={() => setToolsExpanded(!toolsExpanded)}
                    className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors group"
                  >
                     <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 hover:bg-zinc-900 transition-all">
                        <span className="opacity-80">Used {message.toolCalls.length} tools</span>
                        {toolsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
                     </div>
                  </button>

                  <AnimatePresence>
                    {toolsExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                        {message.toolCalls.map(tc => (
                          <ToolExecutionCard key={tc.id} toolCall={tc} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="prose prose-invert prose-zinc max-w-none prose-sm leading-[1.8] text-[15px] text-zinc-300">
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
                    p: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-6 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-6 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-0">{children}</li>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-6 mt-10 text-white tracking-tight">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-5 mt-8 text-white tracking-tight">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-4 mt-6 text-white tracking-tight">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-cyan-400/50 pl-6 italic text-zinc-400 my-8 bg-cyan-400/5 py-5 rounded-r-xl">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                       <div className="my-8 overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900/20">
                          <table className="min-w-full divide-y divide-zinc-800">{children}</table>
                       </div>
                    ),
                    th: ({ children }) => <th className="px-5 py-3 bg-zinc-900/50 text-left text-[11px] font-black uppercase tracking-widest text-zinc-500">{children}</th>,
                    td: ({ children }) => <td className="px-5 py-3 text-[13px] border-t border-zinc-800/50">{children}</td>,
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    el.style.height = Math.min(el.scrollHeight, 320) + 'px'
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 bg-dot-grid relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pt-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[70%] text-center px-4">
             <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/5">
                <Bot className="w-10 h-10 text-zinc-700" />
             </div>
             <h2 className="text-3xl font-black tracking-tighter text-white mb-3">Wingman</h2>
             <p className="text-zinc-500 text-sm font-medium max-w-sm leading-relaxed">
               Your private agent is authenticated and ready to orchestrate your workflow with Groq speed.
             </p>
          </div>
        )}

        <div className="w-full pb-80">
          <div className="flex justify-center mb-10">
             <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-zinc-900/40 rounded-full border border-zinc-800/30 backdrop-blur-sm shadow-sm ring-1 ring-white/5">System Ready</span>
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
              className="fixed bottom-[200px] left-1/2 -translate-x-1/2 p-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:bg-zinc-800 transition-all z-20 text-zinc-100 ring-4 ring-black/20"
            >
              <ArrowDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Input Area - Exactly like Wingman */}
      <div className="absolute bottom-10 left-0 right-0 px-8 z-30 pointer-events-none">
        <div className="max-w-[840px] mx-auto pointer-events-auto">
          {/* Action Row */}
          <div className="flex items-center gap-2.5 mb-5 overflow-x-auto no-scrollbar pb-1 px-2">
             {[
               { icon: <History className="w-3.5 h-3.5" />, label: 'Check Ian\'s sports schedule' },
               { icon: <Bot className="w-3.5 h-3.5" />, label: 'Draft email about PBCoach app' },
               { icon: <Calendar className="w-3.5 h-3.5" />, label: 'What is my agenda for today?' },
               { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'Summarize my recent GitHub PRs' },
             ].map((s, i) => (
               <button
                 key={i}
                 onClick={() => sendMessage(s.label)}
                 className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-800 transition-all backdrop-blur-md shadow-sm ring-1 ring-white/5"
               >
                 <span className="text-zinc-500">{s.icon}</span>
                 <span className="text-[11px] font-bold text-zinc-400 whitespace-nowrap tracking-tight">{s.label}</span>
               </button>
             ))}
          </div>

          {/* Main Input Box */}
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden focus-within:border-zinc-700 transition-all backdrop-blur-xl ring-1 ring-white/5">
            {/* Top Banner */}
            <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-900/30 via-cyan-900/10 to-zinc-900 border-b border-zinc-800/50">
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-zinc-900 shadow-lg">
                       <span className="text-[9px] font-black text-black italic">X</span>
                    </div>
                    <div className="w-4.5 h-4.5 rounded-full bg-cyan-400 border-2 border-zinc-900 shadow-lg" />
                    <div className="w-4.5 h-4.5 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-900 shadow-lg">
                       <span className="text-[9px] font-black text-white tracking-tighter">231</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-zinc-100 tracking-tight italic opacity-90">Let Wingman run apps for you</span>
               </div>
               <div className="flex items-center gap-4">
                  <Link href="/connections" className="px-5 py-1.5 rounded-full bg-zinc-100 text-black text-[10px] font-black uppercase tracking-[0.1em] hover:bg-white transition-all transform active:scale-95 shadow-md flex items-center justify-center">Connect</Link>
                  <X className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-3 pt-4">
               <div className="px-5 pb-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to Atlas"
                    disabled={isLoading}
                    rows={1}
                    className="w-full bg-transparent text-[16px] text-zinc-50 placeholder:text-zinc-600 outline-none resize-none font-medium leading-relaxed"
                    style={{ minHeight: '36px', maxHeight: '320px' }}
                  />
               </div>
               
               <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all">
                       <Plus className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all">
                       <Calendar className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="button" className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all">
                       <Mic className="w-5 h-5" />
                    </button>
                    
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={stopGeneration}
                        className="w-11 h-11 bg-zinc-50 text-black rounded-full hover:bg-white flex items-center justify-center transition-all shadow-xl scale-105"
                      >
                        <Square className="w-4.5 h-4.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-11 h-11 bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700 hover:border-zinc-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                      >
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
               </div>
            </form>
          </div>
          <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] mt-5">
            Agent Instance • V0.2.1-SNAPSHOT • Phoenix, AZ
          </p>
        </div>
      </div>

      {/* Floating Chat Widget Icon */}
      <div className="fixed bottom-8 right-8 z-40 hidden md:block">
         <div className="relative group cursor-pointer transition-all hover:scale-110 active:scale-95">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl border border-zinc-200">
               <MessageCircle className="w-7 h-7 text-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-black border-2 border-white text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-lg">2</div>
         </div>
      </div>
    </div>
  )
}
