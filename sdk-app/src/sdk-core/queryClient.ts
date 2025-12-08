/**
 * QueryClient Configuration
 *
 * Creates and exports a singleton QueryClient instance from @tanstack/query-core
 * for managing server state in the chat widget SDK.
 */

import { QueryClient } from '@tanstack/query-core'

/**
 * Default query client configuration
 */
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
}

/**
 * Singleton QueryClient instance
 */
let queryClientInstance: QueryClient | null = null

/**
 * Creates a new QueryClient instance with default configuration
 */
function createQueryClient(): QueryClient {
  return new QueryClient(defaultQueryClientConfig)
}

/**
 * Gets the singleton QueryClient instance
 * Creates a new instance if one doesn't exist
 */
export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient()
  }
  return queryClientInstance
}

/**
 * Resets/clears the QueryClient instance
 * Useful for testing or when reinitializing the SDK
 */
export function resetQueryClient(): void {
  if (queryClientInstance) {
    queryClientInstance.clear()
    queryClientInstance = null
  }
}

/**
 * The singleton QueryClient instance
 * Use getQueryClient() for lazy initialization
 */
export const queryClient = getQueryClient()
