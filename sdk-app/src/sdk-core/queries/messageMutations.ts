/**
 * Message Mutations
 *
 * TanStack Query Core mutation definitions for message operations.
 * Implements optimistic updates for smooth user experience.
 */

import type { QueryClient, MutationOptions } from '@tanstack/query-core'
import { getApiClient } from '../apiClient.ts'
import type { Message, SendMessagePayload } from '../types.ts'
import { messageKeys, updateMessagesCache, removeMessageFromCache, updateMessageInCache } from './messageQueries.ts'

/**
 * Context type for mutation callbacks
 * Used for optimistic update rollback on error
 */
interface SendMessageContext {
  /** The optimistically added message for rollback */
  optimisticMessage: Message
  /** Previous messages state for rollback */
  previousMessages: Message[] | undefined
}

/**
 * Variables passed to the send message mutation
 */
export interface SendMessageVariables {
  /** The message text to send */
  text: string
  /** Optional metadata to attach to the message */
  metadata?: Record<string, unknown>
}

/**
 * Generate a temporary ID for optimistic updates
 * Uses a combination of timestamp and random string for uniqueness
 */
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Create mutation options for sending a message
 *
 * Implements the optimistic update pattern:
 * 1. onMutate: Add message to cache with 'sending' status
 * 2. mutationFn: Send to server
 * 3. onSuccess: Replace temp message with server response
 * 4. onError: Rollback optimistic update, mark as 'failed'
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation to send the message to
 * @returns Mutation options for use with MutationObserver
 *
 * @example
 * ```typescript
 * const queryClient = new QueryClient()
 * const mutationOptions = getSendMessageMutationOptions(queryClient, 'conv-123')
 * const observer = new MutationObserver(queryClient, mutationOptions)
 *
 * observer.mutate({ text: 'Hello world!' })
 * ```
 */
export function getSendMessageMutationOptions(
  queryClient: QueryClient,
  conversationId: string
): MutationOptions<Message, Error, SendMessageVariables, SendMessageContext> {
  return {
    mutationFn: async (variables: SendMessageVariables): Promise<Message> => {
      const payload: SendMessagePayload = {
        text: variables.text,
        metadata: variables.metadata,
      }
      const apiClient = getApiClient()
      const response = await apiClient.post<Message>(
        `/conversations/${conversationId}/messages`,
        payload
      )
      return response.data
    },

    onMutate: async (variables: SendMessageVariables): Promise<SendMessageContext> => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: messageKeys.list(conversationId) })

      // Snapshot the previous messages for rollback
      const previousMessages = queryClient.getQueryData<Message[]>(
        messageKeys.list(conversationId)
      )

      // Create optimistic message with 'sending' status
      const optimisticMessage: Message = {
        id: generateTempId(),
        conversationId,
        text: variables.text,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
      }

      // Add the optimistic message to the cache
      updateMessagesCache(queryClient, conversationId, optimisticMessage)

      // Return context for potential rollback
      return {
        optimisticMessage,
        previousMessages,
      }
    },

    onSuccess: (
      serverMessage: Message,
      _variables: SendMessageVariables,
      context: SendMessageContext | undefined
    ): void => {
      if (!context) return

      // Remove the optimistic message
      removeMessageFromCache(
        queryClient,
        conversationId,
        context.optimisticMessage.id
      )

      // Add the server-confirmed message
      updateMessagesCache(queryClient, conversationId, {
        ...serverMessage,
        status: 'sent',
      })
    },

    onError: (
      error: Error,
      _variables: SendMessageVariables,
      context: SendMessageContext | undefined
    ): void => {
      if (!context) return

      console.error('Failed to send message:', error)

      // Option 1: Full rollback to previous state
      // queryClient.setQueryData(
      //   messageKeys.list(conversationId),
      //   context.previousMessages
      // )

      // Option 2: Keep message but mark as failed (better UX for retry)
      updateMessageInCache(
        queryClient,
        conversationId,
        context.optimisticMessage.id,
        { status: 'failed' }
      )
    },

    onSettled: async (): Promise<void> => {
      // Optionally invalidate to ensure server state sync
      // Commented out to avoid unnecessary refetch after successful send
      // await queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) })
    },
  }
}

/**
 * Helper to retry a failed message
 *
 * Updates the message status to 'sending' and re-triggers the send.
 * This is useful for providing a "retry" button in the UI.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @param messageId - The ID of the failed message
 * @param mutate - The mutation function from MutationObserver
 */
export function retryFailedMessage(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  mutate: (variables: SendMessageVariables) => void
): void {
  // Get the failed message from cache
  const messages = queryClient.getQueryData<Message[]>(
    messageKeys.list(conversationId)
  )

  const failedMessage = messages?.find((msg) => msg.id === messageId)
  if (!failedMessage || failedMessage.status !== 'failed') {
    console.warn('Message not found or not in failed state:', messageId)
    return
  }

  // Remove the failed message from cache
  removeMessageFromCache(queryClient, conversationId, messageId)

  // Re-trigger the mutation
  mutate({ text: failedMessage.text })
}

/**
 * Create a mutation observer wrapper for sending messages
 *
 * Provides a convenient interface for Vue components to send messages.
 *
 * @param queryClient - The QueryClient instance
 * @param conversationId - The conversation ID
 * @returns Object with send and retry methods
 *
 * @example
 * ```typescript
 * import { MutationObserver } from '@tanstack/query-core'
 *
 * const queryClient = new QueryClient()
 * const messenger = createMessageSender(queryClient, 'conv-123')
 *
 * // Send a message
 * messenger.send('Hello!')
 *
 * // Retry a failed message
 * messenger.retry('temp-123-abc')
 * ```
 */
export function createMessageSender(
  queryClient: QueryClient,
  conversationId: string
) {
  // Note: The actual MutationObserver is created by the consumer
  // This factory just provides the mutation options
  const mutationOptions = getSendMessageMutationOptions(queryClient, conversationId)

  return {
    mutationOptions,

    /**
     * Create a send function that uses the provided mutate callback
     */
    createSendFn: (mutate: (variables: SendMessageVariables) => void) => {
      return (text: string, metadata?: Record<string, unknown>) => {
        mutate({ text, metadata })
      }
    },

    /**
     * Create a retry function that uses the provided mutate callback
     */
    createRetryFn: (mutate: (variables: SendMessageVariables) => void) => {
      return (messageId: string) => {
        retryFailedMessage(queryClient, conversationId, messageId, mutate)
      }
    },
  }
}
