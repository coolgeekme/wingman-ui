'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Socket } from 'socket.io-client'

const DEFAULT_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

interface UseSocketOptions {
  url?: string
  autoConnect?: boolean
}

export interface SocketMessage {
  type: 'output' | 'error' | 'system'
  content: string
  agent?: 'claude' | 'codex'
  timestamp: Date
}

export function useSocket(options: UseSocketOptions = {}) {
  const { url = DEFAULT_URL, autoConnect = true } = options
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<SocketMessage[]>([])

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return

    console.log('Connecting to socket at:', url)
    const { io } = await import('socket.io-client')
    const socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
      setMessages(prev => [...prev, {
        type: 'system',
        content: `▸ Connected to Agent Brain at ${url}`,
        timestamp: new Date()
      }])
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
      setMessages(prev => [...prev, {
        type: 'system',
        content: '▸ Disconnected from Agent Brain.',
        timestamp: new Date()
      }])
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setMessages(prev => [...prev, {
        type: 'error',
        content: `▸ Connection error: ${err.message}. Ensure port 4000 is open.`,
        timestamp: new Date()
      }])
    })

    socket.on('agent:output', (msg: any) => {
      setMessages((prev) => [...prev, {
        type: 'output',
        content: msg.data || msg.content,
        agent: msg.agent,
        timestamp: new Date(msg.timestamp || Date.now())
      }])
    })

    socket.on('agent:error', (msg: any) => {
      setMessages((prev) => [...prev, {
        type: 'error',
        content: msg.data || msg.content,
        agent: msg.agent,
        timestamp: new Date(msg.timestamp || Date.now())
      }])
    })

    socketRef.current = socket
  }, [url])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setConnected(false)
  }, [])

  const sendCommand = useCallback((command: string, agent: 'claude' | 'codex') => {
    if (!socketRef.current?.connected) return false
    socketRef.current.emit('agent:command', { command, agent })
    return true
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  useEffect(() => {
    if (autoConnect) connect()
    return () => { disconnect() }
  }, [autoConnect, connect, disconnect])

  return {
    connected,
    messages,
    connect,
    disconnect,
    sendCommand,
    clearMessages
  }
}
