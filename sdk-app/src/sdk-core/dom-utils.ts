/**
 * DOM Utilities
 *
 * Helper functions for DOM manipulation and container management.
 */

const DEFAULT_CONTAINER_ID = 'my-chat-sdk-container'

/**
 * Gets a container element by CSS selector
 */
export function getContainer(selector: string): HTMLElement | null {
  try {
    return document.querySelector(selector)
  } catch (error) {
    console.error('[MyChatSDK] Invalid selector: "' + selector + '"', error)
    return null
  }
}

/**
 * Creates a default container element and appends it to the body
 */
export function createContainer(id?: string): HTMLElement {
  const containerId = id || DEFAULT_CONTAINER_ID + '-' + Date.now()

  // Check if container already exists
  let container = document.getElementById(containerId)

  if (!container) {
    container = document.createElement('div')
    container.id = containerId

    // Apply default styles for positioning
    container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 999999;'

    document.body.appendChild(container)
  }

  return container
}

/**
 * Removes a container element from the DOM
 */
export function removeContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/**
 * Checks if an element is attached to the DOM
 */
export function isElementAttached(element: HTMLElement): boolean {
  return document.body.contains(element)
}

/**
 * Waits for an element to be available in the DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const existing = getContainer(selector)
    if (existing) {
      resolve(existing)
      return
    }

    // Set up MutationObserver to watch for the element
    const observer = new MutationObserver((_mutations, obs) => {
      const element = getContainer(selector)
      if (element) {
        obs.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Set timeout
    setTimeout(() => {
      observer.disconnect()
      reject(new Error('Element "' + selector + '" not found within ' + timeout + 'ms'))
    }, timeout)
  })
}
