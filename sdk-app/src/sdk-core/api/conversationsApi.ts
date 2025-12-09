/**
 * REST API Service for Conversation Management
 *
 * Handles HTTP requests to the backend REST API for managing conversations.
 */

import type { ConversationMetadata, ConversationDetail } from '../websocket/types'

export interface ConversationsApiConfig {
  serverUrl: string
}

export class ConversationsApi {
  private readonly baseUrl: string

  constructor(config: ConversationsApiConfig) {
    this.baseUrl = `${config.serverUrl}/conversations`
  }

  /**
   * Get all conversations for a user
   * GET /conversations?cxoneToken=xxx
   */
  async getConversations(cxoneToken: string): Promise<ConversationMetadata[]> {
    const url = new URL(this.baseUrl)
    url.searchParams.set('cxoneToken', cxoneToken)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a specific conversation with messages
   * GET /conversations/:id
   */
  async getConversation(conversationId: string): Promise<ConversationDetail> {
    const response = await fetch(`${this.baseUrl}/${conversationId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a new conversation
   * POST /conversations
   */
  async createConversation(
    cxoneToken: string,
    title?: string
  ): Promise<{ id: string; title: string; createdAt: string; updatedAt: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cxoneToken,
        title,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Delete a conversation
   * DELETE /conversations/:id
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${conversationId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`)
    }
  }
}
