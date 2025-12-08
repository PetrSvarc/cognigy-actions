/**
 * WebSocket Message Types
 *
 * Type definitions for the Socket.IO chat protocol
 */

// ============================================================================
// Client → Server Message Types
// ============================================================================

/**
 * Init message payload
 */
export interface InitPayload {
  cxoneToken: string
  conversationId?: string
}

/**
 * User message payload
 */
export interface UserMessagePayload {
  messageId: string
  content: string
  metadata?: Record<string, unknown>
}

/**
 * Client message wrapper
 */
export interface ClientMessage {
  type: 'init' | 'user_message'
  payload: InitPayload | UserMessagePayload
}

// ============================================================================
// Server → Client Message Types
// ============================================================================

/**
 * Backend message structure
 */
export interface BackendMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  createdAt: string
}

/**
 * Init acknowledgment payload
 */
export interface InitAckPayload {
  cxoneToken: string
  conversationId: string
  conversation: {
    id: string
    title: string
    messages: BackendMessage[]
  }
}

/**
 * Assistant message started payload
 */
export interface AssistantMessageStartedPayload {
  messageId: string
}

/**
 * Assistant token payload (streaming)
 */
export interface AssistantTokenPayload {
  messageId: string
  delta: string
  isFinal: boolean
  groupId?: string
}

/**
 * Assistant message finished payload
 */
export interface AssistantMessageFinishedPayload {
  messageId: string
  content: string
  groupId?: string
}

/**
 * Error payload
 */
export interface ErrorPayload {
  message: string
}

/**
 * App event payload (tool and UX events emitted by backend)
 */
export interface AppEventPayload {
  eventType: string
  data: any
  groupId?: string
}

/**
 * Server event wrapper
 */
export interface ServerEvent {
  type: 'init_ack' | 'assistant_message_started' | 'assistant_token' | 'assistant_message_finished' | 'error' | 'app_event'
  payload: InitAckPayload | AssistantMessageStartedPayload | AssistantTokenPayload | AssistantMessageFinishedPayload | ErrorPayload | AppEventPayload
}

// ============================================================================
// Connection State
// ============================================================================

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting'

// ============================================================================
// Event Handlers
// ============================================================================

export interface ChatSocketEventHandlers {
  onInitAck?: (payload: InitAckPayload) => void
  onAssistantMessageStarted?: (payload: AssistantMessageStartedPayload) => void
  onAssistantToken?: (payload: AssistantTokenPayload) => void
  onAssistantMessageFinished?: (payload: AssistantMessageFinishedPayload) => void
  onError?: (payload: ErrorPayload) => void
  onAppEvent?: (payload: AppEventPayload) => void
  onConnectionStateChange?: (state: ConnectionState) => void
}

// ============================================================================
// REST API Types (Conversation Management)
// ============================================================================

/**
 * Conversation metadata (from GET /conversations)
 */
export interface ConversationMetadata {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage: string
}

/**
 * Full conversation with messages (from GET /conversations/:id)
 */
export interface ConversationDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: BackendMessage[]
}
