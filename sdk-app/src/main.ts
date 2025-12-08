/**
 * SDK Entry Point
 *
 * This is the main entry point for the Vue 3 Shadow DOM Chat Widget SDK.
 * It exports the public SDK API and auto-initializes when loaded via script tag.
 *
 * Usage patterns:
 * 1. Script tag: <script src="sdk.global.js" data-token="TOKEN" data-element="#container"></script>
 * 2. ESM import: import MyChatSDK from 'my-sdk'; MyChatSDK.create({ token: 'TOKEN' });
 */

// SDK Core imports
import type { SDKConfig, SDKInstance } from './sdk-core/types.ts'
import { EventEmitter } from './sdk-core/event-emitter.ts'
import { parseConfig, validateConfig } from './sdk-core/config.ts'
import { getContainer, createContainer } from './sdk-core/dom-utils.ts'
import { setApiConfig } from './sdk-core'

// Custom element registration
import { registerChatElement } from './element'

// Conversation API
import { ConversationsApi } from './sdk-core/api/conversationsApi'
import type { ConversationMetadata } from './sdk-core/websocket/types'

// Constants
const CUSTOM_ELEMENT_TAG = 'my-chat-widget'
const SDK_GLOBAL_NAME = 'MyChatSDK'
const SCRIPT_SELECTOR = 'script[src*="sdk"]'

/**
 * Internal state for managing widget instances and events
 */
interface SDKState {
  instances: Map<string, SDKInstance>
  eventEmitter: EventEmitter
  isElementRegistered: boolean
  currentWidget: HTMLElement | null
  conversationsApi: ConversationsApi | null
  currentToken: string | null
}

const state: SDKState = {
  instances: new Map(),
  eventEmitter: new EventEmitter(),
  isElementRegistered: false,
  currentWidget: null,
  conversationsApi: null,
  currentToken: null,
}

/**
 * Ensures the custom element is registered with the browser
 */
function ensureElementRegistered(): void {
  if (state.isElementRegistered) {
    return
  }

  if (!customElements.get(CUSTOM_ELEMENT_TAG)) {
    registerChatElement()
  }

  state.isElementRegistered = true
}

/**
 * Resolves the container element from config
 */
function resolveContainer(element?: string | HTMLElement): HTMLElement {
  if (!element) {
    // Create a default container if none specified
    return createContainer()
  }

  if (typeof element === 'string') {
    const container = getContainer(element)
    if (!container) {
      console.warn(`[${SDK_GLOBAL_NAME}] Container "${element}" not found, creating default container`)
      return createContainer()
    }
    return container
  }

  return element
}

/**
 * Creates and mounts the chat widget
 */
function create(config: Partial<SDKConfig>): void {
  // Parse and validate configuration
  const parsedConfig = parseConfig(config)

  if (!validateConfig(parsedConfig)) {
    console.error(`[${SDK_GLOBAL_NAME}] Invalid configuration provided`)
    return
  }

  // Configure API client with token
  setApiConfig({
    token: parsedConfig.token,
    baseURL: parsedConfig.baseURL || '/api'
  })

  // Store token and initialize conversations API
  state.currentToken = parsedConfig.token
  state.conversationsApi = new ConversationsApi({
    serverUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  })

  // Ensure custom element is registered
  ensureElementRegistered()

  // Get or create the container element
  const container = resolveContainer(parsedConfig.element)

  // Remove any existing widget from the container (prevents duplicates during HMR)
  const existingWidget = container.querySelector(CUSTOM_ELEMENT_TAG)
  if (existingWidget) {
    existingWidget.remove()
  }

  // Create the custom element
  const widget = document.createElement(CUSTOM_ELEMENT_TAG)

  // Set the token attribute
  if (parsedConfig.token) {
    widget.setAttribute('token', parsedConfig.token)
  }

  // Store reference to the widget
  state.currentWidget = widget

  // Generate instance ID for tracking
  const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  state.instances.set(instanceId, {
    id: instanceId,
    element: widget,
    container,
    config: parsedConfig,
  })

  // Append widget to container
  container.appendChild(widget)

  // Emit creation event
  state.eventEmitter.emit('widget:created', { instanceId, config: parsedConfig })
}

/**
 * Sends a message to the chat widget
 */
function sendMessage(message: string): void {
  if (!state.currentWidget) {
    console.warn(`[${SDK_GLOBAL_NAME}] No widget instance found. Call create() first.`)
    return
  }

  // Dispatch a custom event to the widget
  const event = new CustomEvent('sdk:sendMessage', {
    detail: { message },
    bubbles: false,
    composed: false, // Keep event within shadow DOM boundary
  })

  state.currentWidget.dispatchEvent(event)

  // Also emit through event emitter for external listeners
  state.eventEmitter.emit('message:sent', { message })
}

/**
 * Subscribes to SDK events
 */
function on(eventName: string, callback: (...args: unknown[]) => void): void {
  state.eventEmitter.on(eventName, callback)
}

/**
 * Unsubscribes from SDK events
 */
function off(eventName: string, callback: (...args: unknown[]) => void): void {
  state.eventEmitter.off(eventName, callback)
}

/**
 * Get all conversations for the current user
 */
async function getConversations(): Promise<ConversationMetadata[]> {
  if (!state.conversationsApi || !state.currentToken) {
    console.warn(`[${SDK_GLOBAL_NAME}] No active session. Call create() first.`)
    return []
  }

  try {
    return await state.conversationsApi.getConversations(state.currentToken)
  } catch (error) {
    console.error(`[${SDK_GLOBAL_NAME}] Failed to fetch conversations:`, error)
    return []
  }
}

/**
 * Create a new conversation
 */
async function createConversation(title?: string): Promise<string | null> {
  if (!state.conversationsApi || !state.currentToken) {
    console.warn(`[${SDK_GLOBAL_NAME}] No active session. Call create() first.`)
    return null
  }

  try {
    const conversation = await state.conversationsApi.createConversation(state.currentToken, title)
    state.eventEmitter.emit('conversation:created', { conversationId: conversation.id })
    return conversation.id
  } catch (error) {
    console.error(`[${SDK_GLOBAL_NAME}] Failed to create conversation:`, error)
    return null
  }
}

/**
 * Switch to a different conversation
 */
function switchConversation(conversationId: string): void {
  if (!state.currentWidget) {
    console.warn(`[${SDK_GLOBAL_NAME}] No widget instance found. Call create() first.`)
    return
  }

  // Dispatch custom event to widget to switch conversation
  const event = new CustomEvent('sdk:switchConversation', {
    detail: { conversationId },
    bubbles: false,
    composed: false,
  })

  state.currentWidget.dispatchEvent(event)
  state.eventEmitter.emit('conversation:switched', { conversationId })
}

/**
 * Delete a conversation
 */
async function deleteConversation(conversationId: string): Promise<boolean> {
  if (!state.conversationsApi) {
    console.warn(`[${SDK_GLOBAL_NAME}] No active session. Call create() first.`)
    return false
  }

  try {
    await state.conversationsApi.deleteConversation(conversationId)
    state.eventEmitter.emit('conversation:deleted', { conversationId })
    return true
  } catch (error) {
    console.error(`[${SDK_GLOBAL_NAME}] Failed to delete conversation:`, error)
    return false
  }
}

/**
 * The public SDK API object
 */
export interface MyChatSDKInterface {
  create(config: { token: string; element?: string | HTMLElement; baseURL?: string }): void
  sendMessage(message: string): void
  on(eventName: string, callback: (...args: unknown[]) => void): void
  off(eventName: string, callback: (...args: unknown[]) => void): void
  getConversations(): Promise<ConversationMetadata[]>
  createConversation(title?: string): Promise<string | null>
  switchConversation(conversationId: string): void
  deleteConversation(conversationId: string): Promise<boolean>
}

const sdk: MyChatSDKInterface = {
  create,
  sendMessage,
  on,
  off,
  getConversations,
  createConversation,
  switchConversation,
  deleteConversation,
}

/**
 * Auto-initialization for script tag usage
 *
 * This function is called when the script is loaded via a script tag.
 * It reads configuration from the script tag's data-* attributes and
 * automatically initializes the widget.
 */
function autoInitialize(): void {
  // Find the current script tag
  const scripts = document.querySelectorAll(SCRIPT_SELECTOR)
  let currentScript: HTMLScriptElement | null = null

  // Find the script tag that loaded this SDK
  // We look for the last script with an src containing "sdk"
  // as it's most likely to be the current script
  scripts.forEach((script) => {
    if (script instanceof HTMLScriptElement && script.src) {
      currentScript = script
    }
  })

  // Also check document.currentScript for better accuracy
  if (document.currentScript instanceof HTMLScriptElement) {
    currentScript = document.currentScript
  }

  if (!currentScript) {
    return
  }

  // Check if the script has a data-token attribute (required for auto-init)
  const token = currentScript.getAttribute('data-token')

  if (!token) {
    // No token means no auto-initialization
    return
  }

  // Parse configuration from data attributes
  const config: Partial<SDKConfig> = {
    token,
  }

  // Get optional element selector
  const elementSelector = currentScript.getAttribute('data-element')
  if (elementSelector) {
    config.element = elementSelector
  }

  // Initialize the widget if token is present
  if (config.token) {
    sdk.create(config as { token: string; element?: string | HTMLElement })
  }
}

/**
 * Schedules auto-initialization
 */
function scheduleAutoInit(): void {
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', autoInitialize, { once: true })
  } else {
    // DOM is already ready, initialize immediately
    autoInitialize()
  }
}

// Expose SDK to window for global access (IIFE/UMD usage)
declare global {
  interface Window {
    MyChatSDK: MyChatSDKInterface
  }
}

// Attach to window
if (typeof window !== 'undefined') {
  window[SDK_GLOBAL_NAME] = sdk

  // Schedule auto-initialization for script tag usage
  scheduleAutoInit()
}

// Default export for ESM usage
export default sdk

// Re-export types for TypeScript consumers
export type { SDKConfig, SDKInstance } from './sdk-core/types.ts'
