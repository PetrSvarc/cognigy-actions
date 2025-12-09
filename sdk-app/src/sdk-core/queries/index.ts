/**
 * Queries and Mutations Index
 *
 * Barrel export for all TanStack Query Core queries and mutations.
 * Import from this file to access all query-related functionality.
 *
 * @example
 * ```typescript
 * import {
 *   // Session
 *   sessionKeys,
 *   getSessionQuery,
 *   prefetchSession,
 *
 *   // Messages
 *   messageKeys,
 *   getMessagesQuery,
 *   updateMessagesCache,
 *
 *   // Conversations
 *   conversationKeys,
 *   getConversationQuery,
 *
 *   // Mutations
 *   getSendMessageMutationOptions,
 *   createMessageSender,
 * } from './queries'
 * ```
 */

// Session queries and utilities
export {
  sessionKeys,
  getSessionQuery,
  prefetchSession,
  invalidateSession,
  getCachedSession,
  setSessionCache,
} from './sessionQueries.ts'

// Message queries and cache utilities
export {
  messageKeys,
  getMessagesQuery,
  updateMessagesCache,
  updateMessageInCache,
  removeMessageFromCache,
  prefetchMessages,
  invalidateMessages,
  getCachedMessages,
  setMessagesCache,
} from './messageQueries.ts'

// Conversation queries and utilities
export {
  conversationKeys,
  getConversationQuery,
  prefetchConversation,
  invalidateConversation,
  getCachedConversation,
  setConversationCache,
  updateConversationCache,
} from './conversationQueries.ts'

// Message mutations
export {
  getSendMessageMutationOptions,
  retryFailedMessage,
  createMessageSender,
  type SendMessageVariables,
} from './messageMutations.ts'
