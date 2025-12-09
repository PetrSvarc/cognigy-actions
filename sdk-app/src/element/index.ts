/**
 * Custom Element Registration
 *
 * Registers the Vue-based chat widget as a custom element.
 * This module handles the integration between Vue 3's defineCustomElement
 * and the browser's Custom Elements API.
 */

import { defineCustomElement } from 'vue'
import ChatWidget from '../components/ChatWidget.ce.vue'

// Re-export Vue adapters for TanStack Query Core
export { useCoreQuery, type UseCoreQueryResult } from './useCoreQuery.ts'
export { useCoreMutation, type UseCoreMutationResult } from './useCoreMutation.ts'

// Re-export domain-specific composables
export * from './composables'

const CUSTOM_ELEMENT_TAG = 'my-chat-widget'

/**
 * Creates and registers the chat widget custom element
 */
export function registerChatElement(): void {
  // Check if already registered
  if (customElements.get(CUSTOM_ELEMENT_TAG)) {
    console.warn(`[MyChatSDK] Custom element "${CUSTOM_ELEMENT_TAG}" is already registered`)
    return
  }

  // Define the custom element from the Vue component
  const ChatWidgetElement = defineCustomElement(ChatWidget)

  // Register with the browser
  customElements.define(CUSTOM_ELEMENT_TAG, ChatWidgetElement)
}

/**
 * Returns the tag name of the custom element
 */
export function getElementTagName(): string {
  return CUSTOM_ELEMENT_TAG
}

/**
 * Checks if the custom element is registered
 */
export function isElementRegistered(): boolean {
  return customElements.get(CUSTOM_ELEMENT_TAG) !== undefined
}
