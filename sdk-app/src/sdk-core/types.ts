/**
 * SDK Core Types
 *
 * Type definitions for the SDK configuration and instances.
 */

/**
 * Configuration options for the SDK
 */
export interface SDKConfig {
  /** Authentication token for the chat service */
  token: string
  /** Target element - can be a CSS selector string or an HTMLElement */
  element?: string | HTMLElement
  /** Optional API base URL (defaults to '/api') */
  baseURL?: string
}

/**
 * Represents a mounted widget instance
 */
export interface SDKInstance {
  /** Unique identifier for this instance */
  id: string
  /** The custom element (my-chat-widget) */
  element: HTMLElement
  /** The container element where the widget is mounted */
  container: HTMLElement
  /** The configuration used to create this instance */
  config: SDKConfig
}

/**
 * Event callback type
 */
export type EventCallback = (...args: unknown[]) => void

/**
 * Event map for SDK events
 */
export interface SDKEventMap {
  'widget:created': { instanceId: string; config: SDKConfig }
  'widget:destroyed': { instanceId: string }
  'message:sent': { message: string }
  'message:received': { message: string; timestamp: number }
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Represents a chat message
 */
export interface Message {
  /** Unique identifier for the message */
  id: string
  /** ID of the conversation this message belongs to */
  conversationId: string
  /** Text content of the message */
  text: string
  /** Who sent the message */
  sender: 'user' | 'bot'
  /** When the message was created */
  timestamp: Date
  /** Current status of the message */
  status?: 'sending' | 'sent' | 'delivered' | 'failed' | 'streaming'
  /** Whether the text contains HTML that should be rendered */
  isHtml?: boolean
  /** Optional metadata associated with the message */
  metadata?: Record<string, unknown>
  /** Optional quick reply buttons */
  quickReplies?: {
    quickReplies: Array<{
      id: number | string
      title: string
      imageUrl?: string
      imageAltText?: string
      contentType: string
      payload: string
    }>
  }
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Represents a chat conversation
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string
  /** Current status of the conversation */
  status: 'active' | 'closed' | 'pending'
  /** When the conversation was created */
  createdAt: Date
  /** When the conversation was last updated */
  updatedAt: Date
  /** Additional metadata associated with the conversation */
  metadata?: Record<string, unknown>
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Represents a user session
 */
export interface Session {
  /** Unique identifier for the session */
  id: string
  /** Authentication token for this session */
  token: string
  /** ID of the active conversation */
  conversationId: string
  /** When the session expires */
  expiresAt: Date
}

// ============================================================================
// Payload Types
// ============================================================================

/**
 * Payload for sending a new message
 */
export interface SendMessagePayload {
  /** Text content of the message */
  text: string
  /** Optional metadata to attach to the message */
  metadata?: Record<string, unknown>
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** The response data */
  data: T
  /** Whether the request was successful */
  success: boolean
  /** Error message if the request failed */
  error?: string
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[]
  /** Total number of items across all pages */
  total: number
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Whether there are more pages available */
  hasMore: boolean
}

// ============================================================================
// Conversation History Types
// ============================================================================

/**
 * Represents a conversation history item (for listing past conversations)
 */
export interface ConversationHistoryItem {
  /** Unique identifier */
  id: string
  /** Conversation title */
  title: string
  /** Last message preview */
  lastMessage: string
  /** Timestamp of last activity */
  timestamp: Date
  /** Whether there are unread messages */
  unread?: boolean
  /** Number of messages in the conversation */
  messageCount?: number
}
