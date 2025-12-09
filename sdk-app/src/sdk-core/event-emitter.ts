/**
 * Simple Event Emitter
 *
 * A minimal event emitter implementation for SDK internal events.
 * No external dependencies required.
 */

import type { EventCallback } from './types.ts'

export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>>

  constructor() {
    this.listeners = new Map()
  }

  /**
   * Subscribe to an event
   */
  on(eventName: string, callback: EventCallback): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }
    this.listeners.get(eventName)!.add(callback)
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      eventListeners.delete(callback)
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName)
      }
    }
  }

  /**
   * Subscribe to an event for a single invocation
   */
  once(eventName: string, callback: EventCallback): void {
    const onceWrapper: EventCallback = (...args) => {
      this.off(eventName, onceWrapper)
      callback(...args)
    }
    this.on(eventName, onceWrapper)
  }

  /**
   * Emit an event with optional data
   */
  emit(eventName: string, data?: unknown): void {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[EventEmitter] Error in listener for "${eventName}":`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for a specific event or all events
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get the count of listeners for a specific event
   */
  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0
  }
}
