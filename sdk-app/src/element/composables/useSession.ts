/**
 * Session Composable
 *
 * Provides reactive access to the current user session.
 * Sessions are relatively stable and cached for 5 minutes.
 */

import { useCoreQuery, type UseCoreQueryResult } from '../useCoreQuery.ts'
import { getSessionQuery } from '../../sdk-core/queries.ts'
import type { Session } from '../../sdk-core/types.ts'

/**
 * Composable for fetching and managing user session data
 *
 * The session contains authentication information and the active conversation ID.
 * Session data is cached for 5 minutes as it changes infrequently.
 *
 * @example
 * ```typescript
 * const { data: session, isLoading, error } = useSession(authToken)
 *
 * // Access session data reactively
 * watchEffect(() => {
 *   if (session.value) {
 *     console.log('Conversation ID:', session.value.conversationId)
 *   }
 * })
 * ```
 *
 * @param token - Authentication token for the session
 * @returns Reactive query result with session data
 */
export function useSession(token: string): UseCoreQueryResult<Session, Error> {
  const { queryKey, queryFn } = getSessionQuery(token)

  return useCoreQuery<Session, Error>({
    queryKey,
    queryFn,
    // Session is relatively stable, cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep session in cache for 10 minutes even if unused
    gcTime: 10 * 60 * 1000,
    // Retry session fetches on failure
    retry: 3,
  })
}
