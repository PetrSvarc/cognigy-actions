/**
 * TanStack Query Definitions
 *
 * Query and mutation factories for the SDK.
 * These follow the query key factory pattern for consistent cache management.
 */

import type { MutationObserverOptions } from '@tanstack/query-core'
import type { Session, Message, Conversation, ConversationHistoryItem } from './types.ts'
import { getQueryClient } from './queryClient.ts'
import { getApiClient } from './apiClient.ts'

/**
 * Query key factory for consistent key management
 */
export const queryKeys = {
  all: ['cxone-webchat'] as const,

  // Session queries
  sessions: () => [...queryKeys.all, 'session'] as const,
  session: (token: string) => [...queryKeys.sessions(), token] as const,

  // Conversation queries
  conversations: () => [...queryKeys.all, 'conversation'] as const,
  conversation: (conversationId: string) => [...queryKeys.conversations(), conversationId] as const,
  conversationHistory: () => [...queryKeys.conversations(), 'history'] as const,

  // Message queries
  messages: () => [...queryKeys.all, 'messages'] as const,
  messagesByConversation: (conversationId: string) => [...queryKeys.messages(), conversationId] as const,
}

/**
 * API base URL - should be configured via SDK config
 */
const API_BASE_URL = '/api/v1'

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Get session query configuration
 */
export function getSessionQuery(token: string) {
  return {
    queryKey: queryKeys.session(token),
    queryFn: async (): Promise<Session> => {
      return apiFetch<Session>('/session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
  }
}

/**
 * Get conversation query configuration
 */
export function getConversationQuery(conversationId: string) {
  return {
    queryKey: queryKeys.conversation(conversationId),
    queryFn: async (): Promise<Conversation> => {
      return apiFetch<Conversation>(`/conversations/${conversationId}`)
    },
  }
}

/**
 * Get messages query configuration
 */
export function getMessagesQuery(conversationId: string) {
  return {
    queryKey: queryKeys.messagesByConversation(conversationId),
    queryFn: async (): Promise<Message[]> => {
      return apiFetch<Message[]>(`/conversations/${conversationId}/messages`)
    },
  }
}

/**
 * Get conversation history query configuration
 * Uses axios client to work with mock interceptor
 */
export function getConversationHistoryQuery() {
  return {
    queryKey: queryKeys.conversationHistory(),
    queryFn: async (): Promise<ConversationHistoryItem[]> => {
      const apiClient = getApiClient()
      const response = await apiClient.get<ConversationHistoryItem[]>('/conversations/history')
      return response.data
    },
  }
}

/**
 * Send message mutation options
 */
export function getSendMessageMutationOptions(
  conversationId: string
): MutationObserverOptions<Message, Error, { text: string }> {
  return {
    mutationFn: async (variables: { text: string }): Promise<Message> => {
      return apiFetch<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: variables.text }),
      })
    },
    onSuccess: () => {
      // Invalidate messages query to refetch after sending
      const queryClient = getQueryClient()
      queryClient.invalidateQueries({
        queryKey: queryKeys.messagesByConversation(conversationId),
      })
    },
  }
}

/**
 * Utility to prefetch session data
 */
export async function prefetchSession(token: string): Promise<void> {
  const queryClient = getQueryClient()
  const { queryKey, queryFn } = getSessionQuery(token)
  await queryClient.prefetchQuery({ queryKey, queryFn })
}

/**
 * Utility to prefetch messages
 */
export async function prefetchMessages(conversationId: string): Promise<void> {
  const queryClient = getQueryClient()
  const { queryKey, queryFn } = getMessagesQuery(conversationId)
  await queryClient.prefetchQuery({ queryKey, queryFn })
}

/**
 * Utility to update messages cache optimistically
 */
export function addMessageToCache(conversationId: string, message: Message): void {
  const queryClient = getQueryClient()
  queryClient.setQueryData<Message[]>(
    queryKeys.messagesByConversation(conversationId),
    (old) => (old ? [...old, message] : [message])
  )
}

/**
 * Utility to update a single message in cache
 */
export function updateMessageInCache(
  conversationId: string,
  messageId: string,
  updater: (message: Message) => Message
): void {
  const queryClient = getQueryClient()
  queryClient.setQueryData<Message[]>(
    queryKeys.messagesByConversation(conversationId),
    (old) =>
      old?.map((msg) => (msg.id === messageId ? updater(msg) : msg)) ?? []
  )
}
