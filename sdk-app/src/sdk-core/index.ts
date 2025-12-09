/**
 * SDK Core Module Index
 *
 * Re-exports all sdk-core functionality for convenient imports.
 */

export * from './types.ts'
export { EventEmitter } from './event-emitter.ts'
export { parseConfig, validateConfig, parseConfigFromScript } from './config.ts'
export { getContainer, createContainer, removeContainer, isElementAttached, waitForElement } from './dom-utils.ts'

// QueryClient exports
export { queryClient, getQueryClient, resetQueryClient } from './queryClient.ts'

// API Client exports
export {
  apiClient,
  getApiClient,
  createApiClient,
  setApiConfig,
  getApiConfig,
  resetApiClient,
} from './apiClient.ts'
export type { ApiConfig } from './apiClient.ts'

// Query and Mutation exports
export * from './queries.ts'
