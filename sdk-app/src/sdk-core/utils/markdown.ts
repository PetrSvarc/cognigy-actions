/**
 * Markdown Rendering Utility
 *
 * Parses Markdown to HTML and sanitizes it for safe rendering
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure marked
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
})

/**
 * Parse Markdown text to sanitized HTML
 */
export function renderMarkdown(text: string): string {
  // Parse markdown to HTML
  const rawHtml = marked.parse(text, { async: false }) as string

  // Sanitize HTML to prevent XSS attacks
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'del', 'ins', 'sup', 'sub'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  })

  return cleanHtml
}

/**
 * Check if text contains Markdown syntax
 */
export function hasMarkdownSyntax(text: string): boolean {
  // Simple heuristics to detect common Markdown syntax
  const markdownPatterns = [
    /\*\*.+\*\*/, // **bold**
    /\*.+\*/, // *italic*
    /__.+__/, // __bold__
    /_.+_/, // _italic_
    /\[.+\]\(.+\)/, // [link](url)
    /^#{1,6}\s/, // # headers
    /^\*\s/, // * list
    /^-\s/, // - list
    /^\d+\.\s/, // 1. ordered list
    /^>\s/, // > blockquote
    /`[^`]+`/, // `code`
    /```[\s\S]*```/, // ```code block```
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}
