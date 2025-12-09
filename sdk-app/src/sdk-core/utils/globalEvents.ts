/**
 * Global Event System
 *
 * Emits custom events to the window object so external applications
 * can listen to SDK events and react to them.
 */

/**
 * Event types that the SDK can emit
 */
export interface SDKEvents {
  // Connection events
  'connection:connecting': { timestamp: number }
  'connection:connected': { timestamp: number }
  'connection:disconnected': { reason: string; timestamp: number }
  'connection:reconnecting': { attempt: number; timestamp: number }
  'connection:error': { error: string; timestamp: number }

  // Message events
  'message:sending': { messageId: string; content: string; timestamp: number }
  'message:sent': { messageId: string; content: string; timestamp: number }
  'message:failed': { messageId: string; error: string; timestamp: number }
  'message:received:start': { messageId: string; timestamp: number }
  'message:received:token': { messageId: string; delta: string; timestamp: number }
  'message:received:complete': { messageId: string; content: string; timestamp: number }

  // Conversation events
  'conversation:loaded': { conversationId: string; messageCount: number; timestamp: number }
  'conversation:switched': { conversationId: string; timestamp: number }
  'conversation:created': { conversationId: string; timestamp: number }
  'conversation:deleted': { conversationId: string; timestamp: number }

  // Session events
  'session:initialized': { token: string; conversationId: string; timestamp: number }
  'session:error': { error: string; timestamp: number }

  // UI events
  'ui:tab:changed': { tab: 'chat' | 'history'; timestamp: number }

  // App events (tool-related actions)
  'draft:opened': { draftId: string; timestamp: number }
}

export type SDKEventName = keyof SDKEvents

/**
 * Emit a global event to the window
 * This allows external applications to listen to SDK events
 */
export function emitGlobalEvent<K extends SDKEventName>(
  eventName: K,
  detail: SDKEvents[K]
): void {
  if (typeof window === 'undefined') return

  // Create custom event with SDK namespace
  const event = new CustomEvent(`cxone-webchat:${eventName}`, {
    detail,
    bubbles: false,
    cancelable: false,
  })

  // Dispatch to window
  window.dispatchEvent(event)

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log(`[SDK Event] ${eventName}`, detail)
  }
}

/**
 * Type-safe event listener helper
 * Usage: onSDKEvent('message:sent', (event) => { ... })
 */
export function onSDKEvent<K extends SDKEventName>(
  eventName: K,
  handler: (event: CustomEvent<SDKEvents[K]>) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const wrappedHandler = handler as EventListener
  const fullEventName = `cxone-webchat:${eventName}`

  window.addEventListener(fullEventName, wrappedHandler)

  // Return unsubscribe function
  return () => {
    window.removeEventListener(fullEventName, wrappedHandler)
  }
}

/**
 * Listen to all SDK events (useful for debugging)
 */
export function onAllSDKEvents(
  handler: (eventName: string, detail: any) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const wrappedHandler = (event: Event) => {
    if (event instanceof CustomEvent && event.type.startsWith('cxone-webchat:')) {
      const eventName = event.type.replace('cxone-webchat:', '')
      handler(eventName, event.detail)
    }
  }

  // Listen to all events on window
  window.addEventListener('cxone-webchat:*' as any, wrappedHandler)

  return () => {
    window.removeEventListener('cxone-webchat:*' as any, wrappedHandler)
  }
}
