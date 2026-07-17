'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const AGENT_URL = 'https://api.agent.coolgeek.me'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ToolCall {
  id: string
  name: string
  arguments: string
  result?: string
  status: 'pending' | 'running' | 'completed' | 'error'
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_URL}/sessions`)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Session fetch error:', err)
    }
  }, [])

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true)
    setCurrentSessionId(sessionId)
    try {
      const res = await fetch(`${AGENT_URL}/sessions/${sessionId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      
      const history = (data.messages || []).map((m: any, i: number) => ({
        id: `hist_${i}`,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        toolCalls: m.tool_calls ? m.tool_calls.map((tc: any) => ({
          ...tc,
          status: 'completed'
        })) : []
      }))
      
      setMessages(history)
    } catch (err) {
      console.error('History load error:', err)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startNewChat = useCallback(() => {
    const newId = `chat_${Date.now()}`
    setCurrentSessionId(newId)
    setMessages([])
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const sessionId = currentSessionId || `chat_${Date.now()}`
    if (!currentSessionId) setCurrentSessionId(sessionId)

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const prevMessages = [...messages]
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      toolCalls: [],
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      abortRef.current = new AbortController()

      const response = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          session_id: sessionId,
          history: prevMessages.map(m => ({ 
            role: m.role, 
            content: m.content,
            tool_calls: m.toolCalls
          })),
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)
      
      const data = await response.json()
      
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { 
                ...m, 
                content: data.response, 
                toolCalls: data.tool_calls,
                isStreaming: false 
              }
            : m
        )
      )
      
      fetchSessions()

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `⚠️ Error: ${err.message}`,
                  isStreaming: false,
                }
              : m
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [messages, isLoading, currentSessionId, fetchSessions])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    sendMessage,
    loadSession,
    startNewChat,
    stopGeneration,
    clearMessages,
  }
}
