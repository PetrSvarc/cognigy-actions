/**
 * Conversation Composable
 *
 * Provides reactive access to conversation metadata.
 * Conversation data includes status, timestamps, and metadata.
 */

import { useCoreQuery, type UseCoreQueryResult } from '../useCoreQuery.ts'
import { getConversationQuery } from '../../sdk-core/queries.ts'
import type { Conversation } from '../../sdk-core/types.ts'

/**
 * Composable for fetching and managing conversation data
 *
 * The conversation contains metadata about the chat session including
 * its status, creation time, and any custom metadata attached to it.
 *
 * @example
 * ```typescript
 * const { data: conversation, isLoading, error } = useConversation(conversationId)
 *
 * // Check conversation status reactively
 * watchEffect(() => {
 *   if (conversation.value?.status === 'closed') {
 *     console.log('This conversation has been closed')
 *   }
 * })
 * ```
 *
 * @param conversationId - ID of the conversation to fetch
 * @returns Reactive query result with conversation data
 */
export function useConversation(conversationId: string): UseCoreQueryResult<Conversation, Error> {
  const { queryKey, queryFn } = getConversationQuery(conversationId)

  return useCoreQuery<Conversation, Error>({
    queryKey,
    queryFn,
    // Conversation metadata can be cached for 1 minute
    staleTime: 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  })
}
