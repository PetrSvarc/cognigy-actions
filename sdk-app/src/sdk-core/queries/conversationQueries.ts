/**
 * Conversation Query Factory
 *
 * TanStack Query Core query definitions for conversation operations.
 * Provides query keys and query functions for conversation management.
 */

import type { QueryClient } from '@tanstack/query-core'
import { getApiClient } from '../apiClient.ts'
import type { Conversation } from '../types.ts'

/**
 * Query key factory for conversation-related queries.
 * Follows the recommended pattern for hierarchical query keys.
 */
export const conversationKeys = {
  /** Base key for all conversation queries */
  all: ['conversations'] as const,
  /** Key for conversation list queries */
  lists: () => [...conversationKeys.all, 'list'] as const,
  /** Key for conversation detail queries */
  details: () => [...conversationKeys.all, 'detail'] as const,
  /** Key for a specific conversation by ID */
  detail: (id: string) => [...conversationKeys.details(), id] as const,
}

/**
 * Query options for fetching a conversation by ID
 *
 * @param conversationId - The conversation ID to fetch
 * @returns Query options object with queryKey and queryFn
 *
 * @example
 * ```typescript
 * const queryClient = new QueryClient()
 * const observer = new QueryObserver(queryClient, getConversationQuery('conv-123'))
 * observer.subscribe((result) => {
 *   if (result.data) {
 *     console.log('Conversation:', result.data)
 *   }
 * })
 * ```
 */
export function getConversationQuery(conversationId: string) {
  return {
    queryKey: conversationKeys.detail(conversationId),
    queryFn: async (): Promise<Conversation> => {
      const apiClient = getApiClient()
      const response = await apiClient.get<Conversation>(`/conversations/${conversationId}`)
      return response.data
    },
    // Conversation metadata should be considered fresh for 1 minute
    staleTime: 60 * 1000,
    // Keep conversation data in cache for 15 minutes
    gcTime: 15 * 60 * 1000,
  }
}

/**
 * Prefetch a conversation into the query cache
 *
 * Useful for warming the cache before displaying conversation details.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 */
export async function prefetchConversation(
  queryClient: QueryClient,
  conversationId: string
): Promise<void> {
  await queryClient.prefetchQuery(getConversationQuery(conversationId))
}

/**
 * Invalidate a specific conversation
 *
 * Forces refetch of conversation data.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID (optional - invalidates all if not provided)
 */
export async function invalidateConversation(
  queryClient: QueryClient,
  conversationId?: string
): Promise<void> {
  const queryKey = conversationId
    ? conversationKeys.detail(conversationId)
    : conversationKeys.all

  await queryClient.invalidateQueries({ queryKey })
}

/**
 * Get cached conversation data without triggering a fetch
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @returns The cached conversation or undefined
 */
export function getCachedConversation(
  queryClient: QueryClient,
  conversationId: string
): Conversation | undefined {
  return queryClient.getQueryData<Conversation>(
    conversationKeys.detail(conversationId)
  )
}

/**
 * Set conversation data directly in the cache
 *
 * Useful when receiving conversation data from WebSocket or other sources.
 *
 * @param queryClient - The QueryClient instance
 * @param conversation - The conversation data to cache
 */
export function setConversationCache(
  queryClient: QueryClient,
  conversation: Conversation
): void {
  queryClient.setQueryData(
    conversationKeys.detail(conversation.id),
    conversation
  )
}

/**
 * Update conversation data in the cache
 *
 * Merges partial updates with existing cached data.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param updates - Partial conversation data to merge
 */
export function updateConversationCache(
  queryClient: QueryClient,
  conversationId: string,
  updates: Partial<Conversation>
): void {
  queryClient.setQueryData<Conversation>(
    conversationKeys.detail(conversationId),
    (oldConversation) => {
      if (!oldConversation) return oldConversation
      return { ...oldConversation, ...updates }
    }
  )
}
