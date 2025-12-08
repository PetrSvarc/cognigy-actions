/**
 * Text filtering utilities
 */

/**
 * Removes <thinking>...</thinking> tags and all content between them from text
 * @param text The text to filter
 * @returns Text with thinking tags and their content removed
 */
export function filterThinkingTags(text: string): string {
  if (!text) return text
  
  // Remove <thinking>...</thinking> tags and all content between them
  // Use a more robust pattern that handles:
  // - Multiple occurrences (global flag)
  // - Case-insensitive matching
  // - Any content including newlines, special characters, etc.
  // - Multiple passes to catch any edge cases
  
  let filtered = text
  
  // First pass: Remove properly closed thinking tags with all content
  // This pattern matches <thinking> followed by any characters (including newlines) 
  // non-greedily until </thinking>
  filtered = filtered.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
  
  // Second pass: Handle any unclosed thinking tags (remove from opening tag to end)
  // This catches edge cases where closing tag might be missing
  filtered = filtered.replace(/<thinking>[\s\S]*$/gi, '')
  
  // Third pass: Handle any standalone closing tags (shouldn't happen, but just in case)
  filtered = filtered.replace(/<\/thinking>/gi, '')
  
  // Clean up any excessive whitespace that might remain
  // Replace multiple consecutive newlines/spaces with a single space
  filtered = filtered.replace(/\s+/g, ' ')
  
  return filtered.trim()
}

