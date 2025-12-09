/**
 * Message Query Factory
 *
 * TanStack Query Core query definitions for message operations.
 * Provides query keys, query functions, and cache utilities for messages.
 */

import type { QueryClient } from '@tanstack/query-core'
import { getApiClient } from '../apiClient.ts'
import type { Message } from '../types.ts'

/**
 * Query key factory for message-related queries.
 * Follows the recommended pattern for hierarchical query keys.
 */
export const messageKeys = {
  /** Base key for all message queries */
  all: ['messages'] as const,
  /** Key for message list queries */
  lists: () => [...messageKeys.all, 'list'] as const,
  /** Key for messages in a specific conversation */
  list: (conversationId: string) => [...messageKeys.lists(), conversationId] as const,
  /** Key for message detail queries */
  details: () => [...messageKeys.all, 'detail'] as const,
  /** Key for a specific message by ID */
  detail: (messageId: string) => [...messageKeys.details(), messageId] as const,
}

/**
 * Query options for fetching messages in a conversation
 *
 * @param conversationId - The conversation ID to fetch messages for
 * @returns Query options object with queryKey and queryFn
 *
 * @example
 * ```typescript
 * const queryClient = new QueryClient()
 * const observer = new QueryObserver(queryClient, getMessagesQuery('conv-123'))
 * observer.subscribe((result) => {
 *   if (result.data) {
 *     console.log('Messages:', result.data)
 *   }
 * })
 * ```
 */
export function getMessagesQuery(conversationId: string) {
  return {
    queryKey: messageKeys.list(conversationId),
    queryFn: async (): Promise<Message[]> => {
      const apiClient = getApiClient()
      const response = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`)
      return response.data
    },
    // Messages should be considered fresh for 30 seconds
    // Real-time updates come through WebSocket, not polling
    staleTime: 30 * 1000,
    // Keep message data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
  }
}

/**
 * Update messages cache by appending a new message
 *
 * Used for real-time message updates from WebSocket or streaming.
 * Ensures no duplicate messages are added.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param newMessage - The new message to append
 *
 * @example
 * ```typescript
 * // In WebSocket message handler
 * websocket.on('message', (message) => {
 *   updateMessagesCache(queryClient, message.conversationId, message)
 * })
 * ```
 */
export function updateMessagesCache(
  queryClient: QueryClient,
  conversationId: string,
  newMessage: Message
): void {
  queryClient.setQueryData<Message[]>(
    messageKeys.list(conversationId),
    (oldMessages) => {
      if (!oldMessages) {
        return [newMessage]
      }

      // Check if message already exists (by ID)
      const messageExists = oldMessages.some((msg) => msg.id === newMessage.id)
      if (messageExists) {
        // Update existing message
        return oldMessages.map((msg) =>
          msg.id === newMessage.id ? newMessage : msg
        )
      }

      // Append new message
      return [...oldMessages, newMessage]
    }
  )
}

/**
 * Update a specific message in the cache
 *
 * Useful for updating message status (e.g., from 'sending' to 'sent').
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param messageId - The ID of the message to update
 * @param updates - Partial message data to merge
 */
export function updateMessageInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  updates: Partial<Message>
): void {
  queryClient.setQueryData<Message[]>(
    messageKeys.list(conversationId),
    (oldMessages) => {
      if (!oldMessages) return oldMessages

      return oldMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }
  )
}

/**
 * Remove a message from the cache
 *
 * Used for rolling back optimistic updates on error.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param messageId - The ID of the message to remove
 */
export function removeMessageFromCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string
): void {
  queryClient.setQueryData<Message[]>(
    messageKeys.list(conversationId),
    (oldMessages) => {
      if (!oldMessages) return oldMessages
      return oldMessages.filter((msg) => msg.id !== messageId)
    }
  )
}

/**
 * Prefetch messages for a conversation
 *
 * Useful for warming the cache before displaying a conversation.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 */
export async function prefetchMessages(
  queryClient: QueryClient,
  conversationId: string
): Promise<void> {
  await queryClient.prefetchQuery(getMessagesQuery(conversationId))
}

/**
 * Invalidate messages for a conversation
 *
 * Forces refetch of messages. Useful after sending a message
 * or reconnecting after network issues.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID (optional - invalidates all if not provided)
 */
export async function invalidateMessages(
  queryClient: QueryClient,
  conversationId?: string
): Promise<void> {
  const queryKey = conversationId
    ? messageKeys.list(conversationId)
    : messageKeys.all

  await queryClient.invalidateQueries({ queryKey })
}

/**
 * Get cached messages without triggering a fetch
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @returns The cached messages or undefined
 */
export function getCachedMessages(
  queryClient: QueryClient,
  conversationId: string
): Message[] | undefined {
  return queryClient.getQueryData<Message[]>(messageKeys.list(conversationId))
}

/**
 * Set messages directly in the cache
 *
 * Useful when receiving a full message list from another source.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param messages - The messages to cache
 */
export function setMessagesCache(
  queryClient: QueryClient,
  conversationId: string,
  messages: Message[]
): void {
  queryClient.setQueryData(messageKeys.list(conversationId), messages)
}
