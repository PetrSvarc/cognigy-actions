/**
 * Chat WebSocket Client
 *
 * Socket.IO client for real-time chat communication with the backend.
 * Handles connection lifecycle, message protocol, and streaming responses.
 */

import { io, Socket } from 'socket.io-client'
import type {
  ChatSocketEventHandlers,
  ConnectionState,
  InitPayload,
  UserMessagePayload,
  ServerEvent,
  InitAckPayload,
  AssistantMessageStartedPayload,
  AssistantTokenPayload,
  AssistantMessageFinishedPayload,
  ErrorPayload,
  AppEventPayload,
} from './types'
import { emitGlobalEvent } from '../utils/globalEvents'

export interface ChatSocketConfig {
  serverUrl?: string
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
  timeout?: number
}

export class ChatSocket {
  private socket: Socket | null = null
  private readonly serverUrl: string
  private readonly config: Required<ChatSocketConfig>
  private cxoneToken: string | null = null
  private conversationId: string | null = null
  private connectionState: ConnectionState = 'disconnected'
  private eventHandlers: ChatSocketEventHandlers = {}

  constructor(config: ChatSocketConfig = {}) {
    this.serverUrl = config.serverUrl || 'http://localhost:3000'
    this.config = {
      serverUrl: this.serverUrl,
      reconnection: config.reconnection ?? true,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
      reconnectionDelay: config.reconnectionDelay ?? 1000,
      timeout: config.timeout ?? 20000,
    }
  }

  /**
   * Set event handlers for server events
   */
  setEventHandlers(handlers: ChatSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /**
   * Get current token
   */
  getCxoneToken(): string | null {
    return this.cxoneToken
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId
  }

  /**
   * Update connection state and notify handlers
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state
      console.log('[ChatSocket] Connection state:', state)
      this.eventHandlers.onConnectionStateChange?.(state)

      // Emit global events for connection state changes
      const timestamp = Date.now()
      if (state === 'connecting') {
        emitGlobalEvent('connection:connecting', { timestamp })
      } else if (state === 'connected') {
        emitGlobalEvent('connection:connected', { timestamp })
      } else if (state === 'disconnected') {
        emitGlobalEvent('connection:disconnected', { reason: 'disconnect', timestamp })
      } else if (state === 'reconnecting') {
        emitGlobalEvent('connection:reconnecting', { attempt: 1, timestamp })
      } else if (state === 'error') {
        emitGlobalEvent('connection:error', { error: 'Connection error', timestamp })
      }
    }
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.socket?.connected) {
        resolve()
        return
      }

      // If socket exists but not connected, try to reconnect
      if (this.socket) {
        this.socket.connect()
        resolve()
        return
      }

      this.setConnectionState('connecting')

      // Create new socket connection
      this.socket = io(`${this.serverUrl}/chat`, {
        transports: ['websocket'], // Force WebSocket (no polling fallback)
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        timeout: this.config.timeout,
      })

      // Connection successful
      this.socket.on('connect', () => {
        console.log('[ChatSocket] Connected to server')
        this.setConnectionState('connected')
        resolve()

        // Re-initialize if we have a token and this is a reconnection
        if (this.cxoneToken && this.socket) {
          console.log('[ChatSocket] Reconnected, re-initializing session')
          this.init(this.cxoneToken, this.conversationId || undefined).catch((err) => {
            console.error('[ChatSocket] Re-initialization failed:', err)
          })
        }
      })

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('[ChatSocket] Connection error:', error)
        this.setConnectionState('error')
        reject(error)
      })

      // Disconnected
      this.socket.on('disconnect', (reason) => {
        console.log('[ChatSocket] Disconnected:', reason)
        this.setConnectionState('disconnected')
      })

      // Reconnection attempt
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`[ChatSocket] Reconnection attempt ${attemptNumber}`)
        this.setConnectionState('reconnecting')
      })

      // Reconnection failed
      this.socket.on('reconnect_failed', () => {
        console.error('[ChatSocket] Reconnection failed')
        this.setConnectionState('error')
      })

      // Listen for server events
      this.socket.on('server_event', (event: ServerEvent) => {
        this.handleServerEvent(event)
      })
    })
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[ChatSocket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
      this.cxoneToken = null
      this.setConnectionState('disconnected')
    }
  }

  /**
   * Initialize session with cxoneToken and optionally load a specific conversation
   */
  async init(cxoneToken: string, conversationId?: string): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket not connected. Call connect() first.')
    }

    this.cxoneToken = cxoneToken
    this.conversationId = conversationId || null
    console.log('[ChatSocket] Initializing session with token:', cxoneToken, 'conversation:', conversationId || 'default')

    return this.sendMessage('init', { cxoneToken, conversationId })
  }

  /**
   * Send a user message
   */
  async sendUserMessage(
    messageId: string,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket not connected')
    }

    if (!this.cxoneToken) {
      throw new Error('Session not initialized. Call init() first.')
    }

    console.log('[ChatSocket] Sending user message:', { messageId, content })

    return this.sendMessage('user_message', {
      messageId,
      content,
      metadata,
    })
  }

  /**
   * Send a message to the server
   */
  private sendMessage(
    type: 'init' | 'user_message',
    payload: InitPayload | UserMessagePayload
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      const message = { type, payload }
      console.log('[ChatSocket] Sending message:', message)

      // Send message and wait for acknowledgment (if server sends one)
      this.socket.emit('message', message, (ack?: { error?: string }) => {
        if (ack?.error) {
          console.error('[ChatSocket] Message error:', ack.error)
          reject(new Error(ack.error))
        } else {
          resolve()
        }
      })

      // Resolve after a short timeout if no ack (server might not send ack for all messages)
      setTimeout(() => resolve(), 100)
    })
  }

  /**
   * Handle server events
   */
  private handleServerEvent(event: ServerEvent): void {
    console.log('[ChatSocket] Server event:', event.type, event.payload)

    switch (event.type) {
      case 'init_ack':
        this.handleInitAck(event.payload as InitAckPayload)
        break
      case 'assistant_message_started':
        this.handleAssistantMessageStarted(event.payload as AssistantMessageStartedPayload)
        break
      case 'assistant_token':
        this.handleAssistantToken(event.payload as AssistantTokenPayload)
        break
      case 'assistant_message_finished':
        this.handleAssistantMessageFinished(event.payload as AssistantMessageFinishedPayload)
        break
      case 'app_event':
        this.handleAppEvent(event.payload as AppEventPayload)
        break
      case 'error':
        this.handleError(event.payload as ErrorPayload)
        break
      default:
        console.warn('[ChatSocket] Unknown server event type:', (event as any).type)
    }
  }

  /**
   * Handle init acknowledgment
   */
  private handleInitAck(payload: InitAckPayload): void {
    // Store the conversation ID from server response
    this.conversationId = payload.conversationId
    console.log('[ChatSocket] Session initialized, conversation:', payload.conversationId, 'messages:', payload.conversation.messages.length)
    this.eventHandlers.onInitAck?.(payload)

    // Emit global event
    if (this.cxoneToken) {
      emitGlobalEvent('session:initialized', {
        token: this.cxoneToken,
        conversationId: payload.conversationId,
        timestamp: Date.now(),
      })

      emitGlobalEvent('conversation:loaded', {
        conversationId: payload.conversationId,
        messageCount: payload.conversation.messages.length,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Handle assistant message started
   */
  private handleAssistantMessageStarted(payload: AssistantMessageStartedPayload): void {
    console.log('[ChatSocket] Assistant message started:', payload.messageId)
    this.eventHandlers.onAssistantMessageStarted?.(payload)

    // Emit global event
    emitGlobalEvent('message:received:start', {
      messageId: payload.messageId,
      timestamp: Date.now(),
    })
  }

  /**
   * Handle assistant token (streaming)
   */
  private handleAssistantToken(payload: AssistantTokenPayload): void {
    // Don't log every token to avoid console spam
    this.eventHandlers.onAssistantToken?.(payload)

    // Emit global event (throttled to avoid spam)
    emitGlobalEvent('message:received:token', {
      messageId: payload.messageId,
      delta: payload.delta,
      timestamp: Date.now(),
    })
  }

  /**
   * Handle assistant message finished
   */
  private handleAssistantMessageFinished(payload: AssistantMessageFinishedPayload): void {
    console.log('[ChatSocket] Assistant message finished:', payload.messageId)
    this.eventHandlers.onAssistantMessageFinished?.(payload)

    // Emit global event
    emitGlobalEvent('message:received:complete', {
      messageId: payload.messageId,
      content: payload.content,
      timestamp: Date.now(),
    })
  }

  /**
   * Handle error
   */
  private handleError(payload: ErrorPayload): void {
    console.error('[ChatSocket] Server error:', payload.message)
    this.eventHandlers.onError?.(payload)

    // Emit global event
    emitGlobalEvent('session:error', {
      error: payload.message,
      timestamp: Date.now(),
    })
  }

  /**
   * Handle app event
   */
  private handleAppEvent(payload: AppEventPayload): void {
    console.log('[ChatSocket] App event received:', payload.eventType, payload.data)
    this.eventHandlers.onAppEvent?.(payload)

    // Emit global event
    emitGlobalEvent('app:event', {
      eventType: payload.eventType,
      data: payload.data,
      groupId: payload.groupId,
      timestamp: Date.now(),
    })
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}
