import { defineCustomElement } from 'vue'
import ChatWidget from '../components/ChatWidget.ce.vue'

/**
 * Custom element class for the Chat Widget.
 * Vue's defineCustomElement creates a class that extends HTMLElement
 * and automatically handles Shadow DOM creation (mode: 'open').
 * Styles from the .ce.vue file are injected into the Shadow DOM.
 */
export const ChatWidgetElement = defineCustomElement(ChatWidget)

/** The custom element tag name */
export const CHAT_ELEMENT_TAG = 'my-chat-widget'

/**
 * Registers the chat widget as a custom element.
 * Safe to call multiple times - will only register once.
 *
 * @example
 * ```ts
 * import { registerChatElement } from '@cxone/webchat-sdk'
 *
 * registerChatElement()
 *
 * // Then use in HTML:
 * // <my-chat-widget token="abc123"></my-chat-widget>
 * ```
 */
export function registerChatElement(): void {
  if (!customElements.get(CHAT_ELEMENT_TAG)) {
    customElements.define(CHAT_ELEMENT_TAG, ChatWidgetElement)
  }
}
