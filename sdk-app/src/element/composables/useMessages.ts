/**
 * Messages Composable
 *
 * Provides reactive access to messages in a conversation.
 * Messages are always fresh (staleTime: 0) to ensure users see the latest messages.
 */

import { useCoreQuery, type UseCoreQueryResult } from '../useCoreQuery.ts'
import { getMessagesQuery } from '../../sdk-core/queries.ts'
import type { Message } from '../../sdk-core/types.ts'

/**
 * Composable for fetching and managing conversation messages
 *
 * Messages are fetched with staleTime: 0 to ensure the UI always shows
 * the most recent messages. Real-time updates should be handled separately
 * via WebSocket and cache invalidation.
 *
 * @example
 * ```typescript
 * const { data: messages, isLoading, refetch } = useMessages(conversationId)
 *
 * // Display messages reactively
 * watchEffect(() => {
 *   messages.value?.forEach(msg => {
 *     console.log(`${msg.sender}: ${msg.text}`)
 *   })
 * })
 *
 * // Manual refresh after WebSocket notification
 * function onNewMessageNotification() {
 *   refetch()
 * }
 * ```
 *
 * @param conversationId - ID of the conversation to fetch messages for
 * @returns Reactive query result with messages array
 */
export function useMessages(conversationId: string): UseCoreQueryResult<Message[], Error> {
  const { queryKey, queryFn } = getMessagesQuery(conversationId)

  return useCoreQuery<Message[], Error>({
    queryKey,
    queryFn,
    // Messages should always be considered stale to ensure freshness
    staleTime: 0,
    // Keep messages in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Don't retry too aggressively for messages
    retry: 2,
  })
}
