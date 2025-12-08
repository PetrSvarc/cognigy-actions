/**
 * Session Query Factory
 *
 * TanStack Query Core query definitions for session management.
 * Provides query keys and query functions for session operations.
 */

import type { QueryClient } from '@tanstack/query-core'
import { getApiClient, setApiConfig } from '../apiClient.ts'
import type { Session } from '../types.ts'

/**
 * Query key factory for session-related queries.
 * Follows the recommended pattern for hierarchical query keys.
 */
export const sessionKeys = {
  /** Base key for all session queries */
  all: ['session'] as const,
  /** Key for a specific session by token */
  detail: (token: string) => [...sessionKeys.all, token] as const,
}

/**
 * Query options for fetching/creating a session
 *
 * Creates or validates a session with the server using the provided token.
 * This is typically called during SDK initialization.
 *
 * @param token - The authentication token to create/validate a session
 * @returns Query options object with queryKey and queryFn
 *
 * @example
 * ```typescript
 * const queryClient = new QueryClient()
 * const observer = new QueryObserver(queryClient, getSessionQuery('user-token'))
 * observer.subscribe((result) => {
 *   if (result.data) {
 *     console.log('Session established:', result.data)
 *   }
 * })
 * ```
 */
export function getSessionQuery(token: string) {
  return {
    queryKey: sessionKeys.detail(token),
    queryFn: async (): Promise<Session> => {
      // Set the auth token before making the request
      setApiConfig({ token })
      const apiClient = getApiClient()
      const response = await apiClient.post<Session>('/sessions', { token })
      return response.data
    },
    // Sessions should be considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep session data in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
  }
}

/**
 * Prefetch a session into the query cache
 *
 * Useful for warming the cache before the widget is fully rendered.
 *
 * @param queryClient - The QueryClient instance
 * @param token - The authentication token
 */
export async function prefetchSession(
  queryClient: QueryClient,
  token: string
): Promise<void> {
  await queryClient.prefetchQuery(getSessionQuery(token))
}

/**
 * Invalidate all session queries
 *
 * Forces refetch of session data. Useful after logout or session expiry.
 *
 * @param queryClient - The QueryClient instance
 */
export async function invalidateSession(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: sessionKeys.all })
}

/**
 * Get cached session data without triggering a fetch
 *
 * @param queryClient - The QueryClient instance
 * @param token - The authentication token
 * @returns The cached session or undefined
 */
export function getCachedSession(
  queryClient: QueryClient,
  token: string
): Session | undefined {
  return queryClient.getQueryData<Session>(sessionKeys.detail(token))
}

/**
 * Set session data directly in the cache
 *
 * Useful when receiving session data from WebSocket or other sources.
 *
 * @param queryClient - The QueryClient instance
 * @param token - The authentication token
 * @param session - The session data to cache
 */
export function setSessionCache(
  queryClient: QueryClient,
  token: string,
  session: Session
): void {
  queryClient.setQueryData(sessionKeys.detail(token), session)
}
