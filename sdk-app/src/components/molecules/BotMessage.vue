<script setup lang="ts">
/**
 * BotMessage Component
 *
 * Displays a bot/AI message with avatar, content bubble, timestamp,
 * and optional rating functionality.
 *
 * Features:
 * - Left-aligned message bubble with AI avatar
 * - Dark blue background for message content
 * - Timestamp display
 * - Markdown rendering support
 * - Streaming cursor animation when status is 'streaming'
 * - Optional AI generated response indicator with thumbs up/down rating
 */

import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { formatMessageTime } from '../../sdk-core/utils/dateFormat'
import { renderMarkdown } from '../../sdk-core/utils/markdown'

/**
 * Message data structure
 */
export interface BotMessageData {
  /** Unique identifier for the message */
  id: string
  /** Text content of the message */
  text: string
  /** Message timestamp */
  timestamp: Date
  /** Whether the text contains HTML that should be rendered */
  isHtml?: boolean
  /** Current status of the message */
  status?: 'sending' | 'sent' | 'delivered' | 'failed' | 'streaming'
  /** Optional quick reply buttons */
  quickReplies?: {
    quickReplies: Array<{
      id: number | string
      title: string
      imageUrl?: string
      imageAltText?: string
      contentType: string
      payload: string
    }>
  }
}

/**
 * Rating value type
 */
export type RatingValue = 'up' | 'down' | null

/**
 * Component props
 */
interface Props {
  /** Message data object */
  message: BotMessageData
  /** Whether to show the AI avatar (default: true) */
  showAvatar?: boolean
  /** Whether to show the timestamp (default: true) */
  showTimestamp?: boolean
  /** Whether to show the rating buttons (default: false) */
  showRating?: boolean
  /** Current rating value */
  currentRating?: RatingValue
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: true,
  showTimestamp: true,
  showRating: false,
  currentRating: null
})

/**
 * Emitted events
 */
const emit = defineEmits<{
  /** Emitted when user clicks a rating button */
  rate: [value: RatingValue]
  /** Emitted when user clicks a quick reply button */
  quickReply: [payload: string]
}>()

/**
 * Format timestamp for display using centralized formatter
 */
const formattedTimestamp = computed((): string => {
  return formatMessageTime(props.message.timestamp)
})

/**
 * Check if message is currently streaming
 */
const isStreaming = computed((): boolean => {
  return props.message.status === 'streaming'
})

/**
 * Render message text as Markdown HTML or sanitize if HTML
 */
const renderedHtml = computed((): string => {
  if (props.message.isHtml) {
    // If already HTML, sanitize it for safe rendering
    return DOMPurify.sanitize(props.message.text, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'del', 'ins', 'sup', 'sub', 'b', 'i', 'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'style', 'border', 'cellpadding', 'cellspacing'],
      ALLOW_DATA_ATTR: false,
    })
  }
  return renderMarkdown(props.message.text)
})

/**
 * Check if message has quick replies
 */
const hasQuickReplies = computed((): boolean => {
  return !!(props.message.quickReplies?.quickReplies?.length)
})

/**
 * Handle rating button click
 */
function handleRate(value: RatingValue): void {
  // Toggle off if clicking the same rating
  if (props.currentRating === value) {
    emit('rate', null)
  } else {
    emit('rate', value)
  }
}

/**
 * Handle quick reply button click
 */
function handleQuickReply(payload: string): void {
  emit('quickReply', payload)
}
</script>

<template>
  <div class="bot-message">
    <!-- Avatar Section -->
    <div v-if="showAvatar" class="bot-message__avatar">
      <div class="bot-message__avatar-placeholder">
        <span class="bot-message__avatar-text">AI</span>
      </div>
    </div>

    <!-- Content Section -->
    <div class="bot-message__content">
      <!-- Message Bubble -->
      <div
        class="bot-message__bubble"
        :class="{
          'bot-message__bubble--streaming': isStreaming
        }"
      >
        <!-- Markdown Rendered Content -->
        <div
          class="bot-message__text bot-message__text--markdown"
          v-html="renderedHtml"
        />
        <span v-if="isStreaming" class="bot-message__cursor" aria-hidden="true" />
        
        <!-- Quick Reply Buttons -->
        <div v-if="hasQuickReplies" class="bot-message__quick-replies">
          <button
            v-for="quickReply in message.quickReplies!.quickReplies"
            :key="quickReply.id"
            type="button"
            class="bot-message__quick-reply-btn"
            @click="handleQuickReply(quickReply.payload)"
          >
            <img
              v-if="quickReply.imageUrl"
              :src="quickReply.imageUrl"
              :alt="quickReply.imageAltText || quickReply.title"
              class="bot-message__quick-reply-image"
            />
            <span class="bot-message__quick-reply-text">{{ quickReply.title }}</span>
          </button>
        </div>
      </div>

      <!-- Timestamp -->
      <div v-if="showTimestamp" class="bot-message__timestamp">
        {{ formattedTimestamp }}
      </div>

      <!-- Rating Section -->
      <div v-if="showRating" class="bot-message__rating">
        <span class="bot-message__rating-label">AI generated response</span>
        <div class="bot-message__rating-buttons">
          <button
            type="button"
            class="bot-message__rating-btn"
            :class="{ 'bot-message__rating-btn--active': currentRating === 'up' }"
            :aria-pressed="currentRating === 'up'"
            aria-label="Rate response as helpful"
            @click="handleRate('up')"
          >
            <svg
              class="bot-message__rating-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          <button
            type="button"
            class="bot-message__rating-btn"
            :class="{ 'bot-message__rating-btn--active': currentRating === 'down' }"
            :aria-pressed="currentRating === 'down'"
            aria-label="Rate response as not helpful"
            @click="handleRate('down')"
          >
            <svg
              class="bot-message__rating-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Design tokens based on Figma export
$avatar-size: 32px;
$avatar-bg: #6366F1; // Purple/indigo for AI avatar
$avatar-text-color: #FFFFFF;
$bubble-bg: #1E3A5F; // Dark blue from design
$bubble-text-color: #FFFFFF;
$bubble-border-radius: 12px;
$bubble-padding-x: 16px;
$bubble-padding-y: 12px;
$timestamp-color: #6B7280;
$rating-label-color: #9CA3AF;
$rating-btn-color: #6B7280;
$rating-btn-active-color: #3B82F6;
$quick-reply-bg: rgba(255, 255, 255, 0.15);
$quick-reply-hover-bg: rgba(255, 255, 255, 0.25);
$quick-reply-border-color: rgba(255, 255, 255, 0.3);
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

.bot-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
  font-family: $font-family;

  // Avatar
  &__avatar {
    flex-shrink: 0;
  }

  &__avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $avatar-size;
    height: $avatar-size;
    background-color: $avatar-bg;
    border-radius: 50%;
  }

  &__avatar-text {
    font-size: 12px;
    font-weight: 600;
    color: $avatar-text-color;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  // Content container
  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0; // Allows text truncation if needed
  }

  // Message bubble
  &__bubble {
    background-color: $bubble-bg;
    color: $bubble-text-color;
    padding: $bubble-padding-y $bubble-padding-x;
    border-radius: $bubble-border-radius;
    border-bottom-left-radius: 4px; // Tail effect
    overflow: auto;

    &--streaming {
      min-height: 24px;
    }
  }

  // Message text
  &__text {
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;

    &--markdown {
      // Styles for rendered Markdown content
      :deep(p) {
        margin: 0 0 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(a) {
        color: #60A5FA;
        text-decoration: underline;

        &:hover {
          color: #93C5FD;
        }
      }

      :deep(ul),
      :deep(ol) {
        margin: 8px 0;
        padding-left: 20px;
      }

      :deep(li) {
        margin-bottom: 4px;
      }

      :deep(code) {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 13px;
      }

      :deep(pre) {
        background-color: rgba(0, 0, 0, 0.3);
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 8px 0;

        code {
          background: none;
          padding: 0;
        }
      }

      :deep(blockquote) {
        border-left: 3px solid rgba(255, 255, 255, 0.3);
        padding-left: 12px;
        margin: 8px 0;
        opacity: 0.9;
      }

      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin: 12px 0 8px;
        font-weight: 600;
        line-height: 1.3;

        &:first-child {
          margin-top: 0;
        }
      }

      :deep(h1) { font-size: 20px; }
      :deep(h2) { font-size: 18px; }
      :deep(h3) { font-size: 16px; }
      :deep(h4) { font-size: 15px; }
      :deep(h5) { font-size: 14px; }
      :deep(h6) { font-size: 13px; }

      :deep(hr) {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        margin: 12px 0;
      }

      :deep(table) {
        border-collapse: collapse;
        width: 100%;
        margin: 8px 0;
      }

      :deep(th), :deep(td) {
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 6px 10px;
        text-align: left;
      }

      :deep(th) {
        background-color: rgba(255, 255, 255, 0.1);
        font-weight: 600;
      }

      :deep(strong),
      :deep(b) {
        font-weight: 600;
      }

      :deep(em),
      :deep(i) {
        font-style: italic;
      }
    }
  }

  // Streaming cursor animation
  &__cursor {
    display: inline-block;
    width: 2px;
    height: 16px;
    background-color: $bubble-text-color;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: cursor-blink 0.7s ease-in-out infinite;
  }

  // Timestamp
  &__timestamp {
    font-size: 11px;
    color: $timestamp-color;
    padding-left: 4px;
  }

  // Rating section
  &__rating {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 4px;
    margin-top: 4px;
  }

  &__rating-label {
    font-size: 11px;
    color: $rating-label-color;
  }

  &__rating-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__rating-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: $rating-btn-color;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: $rating-btn-active-color;
    }

    &:focus-visible {
      outline: 2px solid $rating-btn-active-color;
      outline-offset: 2px;
    }

    &--active {
      color: $rating-btn-active-color;
      background-color: rgba(59, 130, 246, 0.1);
    }
  }

  &__rating-icon {
    width: 16px;
    height: 16px;
  }

  // Quick replies section
  &__quick-replies {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__quick-reply-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background-color: $quick-reply-bg;
    border: 1px solid $quick-reply-border-color;
    border-radius: 8px;
    color: $bubble-text-color;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;

    &:hover {
      background-color: $quick-reply-hover-bg;
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }
  }

  &__quick-reply-image {
    width: 24px;
    height: 24px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  &__quick-reply-text {
    flex: 1;
    line-height: 1.4;
  }
}

// Cursor blink animation
@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}
</style>
