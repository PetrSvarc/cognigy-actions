/**
 * Send Message Mutation Composable
 *
 * Provides a mutation for sending messages in a conversation.
 * Automatically invalidates the messages cache on success.
 */

import { useCoreMutation, type UseCoreMutationResult } from '../useCoreMutation.ts'
import { getSendMessageMutationOptions } from '../../sdk-core/queries.ts'
import type { Message } from '../../sdk-core/types.ts'

/**
 * Variables required to send a message
 */
export interface SendMessageVariables {
  /** The text content of the message to send */
  text: string
}

/**
 * Composable for sending messages in a conversation
 *
 * This mutation sends a new message and automatically invalidates
 * the messages cache on success to ensure the UI updates.
 *
 * @example
 * ```typescript
 * const { mutate, mutateAsync, isPending, error } = useSendMessage(conversationId)
 *
 * // Fire-and-forget style
 * function handleSubmit(text: string) {
 *   mutate({ text })
 * }
 *
 * // With async/await for more control
 * async function handleSubmitAsync(text: string) {
 *   try {
 *     const message = await mutateAsync({ text })
 *     console.log('Message sent:', message.id)
 *   } catch (err) {
 *     console.error('Failed to send message:', err)
 *   }
 * }
 *
 * // Track sending state
 * watchEffect(() => {
 *   if (isPending.value) {
 *     console.log('Sending message...')
 *   }
 * })
 * ```
 *
 * @param conversationId - ID of the conversation to send the message to
 * @returns Reactive mutation result with mutate functions and state
 */
export function useSendMessage(
  conversationId: string
): UseCoreMutationResult<Message, Error, SendMessageVariables> {
  const options = getSendMessageMutationOptions(conversationId)

  return useCoreMutation<Message, Error, SendMessageVariables>(options)
}
