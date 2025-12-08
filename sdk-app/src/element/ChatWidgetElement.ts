/**
 * Chat Widget Element Class
 *
 * Extended custom element class for the chat widget.
 * This provides additional functionality beyond what Vue's defineCustomElement offers.
 */

import { defineCustomElement } from 'vue'
import ChatWidget from '../components/ChatWidget.ce.vue'

/**
 * Extended custom element class with additional SDK integration methods
 */
export const ChatWidgetElement = defineCustomElement(ChatWidget)

/**
 * Type declaration for the custom element
 */
export interface ChatWidgetElementInstance extends HTMLElement {
  /** The authentication token */
  token: string

  /**
   * Programmatically send a message
   */
  sendMessage?(message: string): void
}

declare global {
  interface HTMLElementTagNameMap {
    'my-chat-widget': ChatWidgetElementInstance
  }
}
