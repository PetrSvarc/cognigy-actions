/**
 * Date and Time Formatting Utilities
 *
 * Centralized date/time formatting to ensure consistency across the entire SDK.
 */

/**
 * Format a timestamp for message display (e.g., "09:35 AM")
 * Used in chat messages (both user and bot)
 */
export function formatMessageTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a timestamp for conversation list (relative time)
 * - Today: Shows time (e.g., "09:35 AM")
 * - Yesterday: Shows "Yesterday"
 * - This week: Shows day name (e.g., "Mon")
 * - Older: Shows date (e.g., "Jan 15")
 */
export function formatConversationTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    // Today - show time
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } else if (days === 1) {
    // Yesterday
    return 'Yesterday'
  } else if (days < 7) {
    // This week - show day name
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    // Older - show date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

/**
 * Format a full date and time (e.g., "Jan 15, 2025 at 09:35 AM")
 * Used for detailed timestamps or tooltips
 */
export function formatFullDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)

  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} at ${timePart}`
}

/**
 * Ensure a value is a Date object
 * Handles both Date objects and string timestamps
 */
export function ensureDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}
