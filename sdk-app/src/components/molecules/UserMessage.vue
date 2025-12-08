<script setup lang="ts">
/**
 * UserMessage Component
 *
 * Displays a user message bubble with optional timestamp, status indicators,
 * and file attachments. Right-aligned with light gray background as per design.
 * Supports Markdown rendering for rich text formatting.
 */

import { computed } from 'vue'
import { formatMessageTime } from '../../sdk-core/utils/dateFormat'
import { renderMarkdown } from '../../sdk-core/utils/markdown'

/**
 * Attachment interface for file attachments
 */
export interface Attachment {
  /** Unique identifier for the attachment */
  id?: string
  /** Display name of the file */
  name: string
  /** File size in bytes */
  size: number
  /** Download URL for the file */
  url: string
  /** Optional MIME type */
  type?: string
}

/**
 * Message interface for user messages
 */
export interface UserMessageData {
  /** Unique identifier for the message */
  id: string
  /** Text content of the message */
  text: string
  /** Timestamp when the message was sent */
  timestamp: Date
  /** Current status of the message */
  status?: 'sending' | 'sent' | 'delivered' | 'failed'
  /** Optional file attachments */
  attachments?: Attachment[]
}

interface Props {
  /** The message data to display */
  message: UserMessageData
  /** Whether to show the user avatar on the right side */
  showAvatar?: boolean
  /** Whether to show the timestamp above the message */
  showTimestamp?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: false,
  showTimestamp: true,
})

/**
 * Format timestamp for display using centralized formatter
 */
const formattedTimestamp = computed(() => {
  return formatMessageTime(props.message.timestamp)
})

/**
 * Render message text as Markdown HTML
 */
const renderedHtml = computed((): string => {
  return renderMarkdown(props.message.text)
})

/**
 * Format file size for display (e.g., "293 KB", "2 MB")
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  // Use integer for KB and above, 1 decimal for bytes
  if (i === 0) {
    return `${size} ${units[i]}`
  }

  return `${Math.round(size)} ${units[i]}`
}

/**
 * Handle attachment download
 */
function downloadAttachment(attachment: Attachment): void {
  window.open(attachment.url, '_blank')
}

/**
 * Check if message has any content to display
 */
const hasTextContent = computed(() => {
  return props.message.text && props.message.text.trim().length > 0
})

const hasAttachments = computed(() => {
  return props.message.attachments && props.message.attachments.length > 0
})

/**
 * Get status display text
 */
const statusText = computed(() => {
  switch (props.message.status) {
    case 'sending':
      return 'Sending...'
    case 'failed':
      return 'Failed'
    default:
      return null
  }
})

/**
 * Check if status should be displayed
 */
const showStatus = computed(() => {
  return props.message.status === 'sending' || props.message.status === 'failed'
})
</script>

<template>
  <div class="user-message">
    <!-- Timestamp -->
    <div v-if="showTimestamp" class="user-message__timestamp">
      {{ formattedTimestamp }}
    </div>

    <div class="user-message__content">
      <!-- Message bubble with text -->
      <div
        v-if="hasTextContent"
        class="user-message__bubble"
        :class="{
          'user-message__bubble--sending': message.status === 'sending',
          'user-message__bubble--failed': message.status === 'failed',
        }"
      >
        <div class="user-message__text user-message__text--markdown" v-html="renderedHtml" />

        <!-- Status indicator -->
        <span v-if="showStatus" class="user-message__status" :class="`user-message__status--${message.status}`">
          {{ statusText }}
        </span>
      </div>

      <!-- File attachments -->
      <div v-if="hasAttachments" class="user-message__attachments">
        <div
          v-for="(attachment, index) in message.attachments"
          :key="attachment.id || index"
          class="user-message__attachment"
        >
          <!-- File icon -->
          <div class="user-message__attachment-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14 2 14 8 20 8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- File info -->
          <div class="user-message__attachment-info">
            <span class="user-message__attachment-name">{{ attachment.name }}</span>
            <span class="user-message__attachment-size">{{ formatFileSize(attachment.size) }}</span>
          </div>

          <!-- Download button -->
          <button
            type="button"
            class="user-message__attachment-download"
            :aria-label="`Download ${attachment.name}`"
            @click="downloadAttachment(attachment)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="7 10 12 15 17 10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="15"
                x2="12"
                y2="3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Avatar (optional) -->
      <div v-if="showAvatar" class="user-message__avatar">
        <div class="user-message__avatar-placeholder">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Design tokens
$bubble-bg: #F3F4F6;
$bubble-text: #1F2937;
$timestamp-color: #6B7280;
$attachment-bg: #F3F4F6;
$attachment-border: #E5E7EB;
$attachment-icon-color: #4F46E5;
$attachment-text-color: #374151;
$attachment-size-color: #6B7280;
$download-icon-color: #4F46E5;
$status-sending-color: #9CA3AF;
$status-failed-color: #EF4444;
$avatar-bg: #E5E7EB;
$avatar-icon-color: #9CA3AF;

.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 4px;

  &__timestamp {
    font-size: 12px;
    color: $timestamp-color;
    margin-bottom: 4px;
    padding-right: 4px;
  }

  &__content {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    max-width: 85%;
  }

  &__bubble {
    background-color: $bubble-bg;
    border-radius: 16px 16px 4px 16px;
    padding: 10px 14px;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;

    &--sending {
      opacity: 0.7;
    }

    &--failed {
      border: 1px solid $status-failed-color;
    }
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: $bubble-text;

    &--markdown {
      // Styles for rendered Markdown content
      :deep(p) {
        margin: 0 0 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(a) {
        color: #4F46E5;
        text-decoration: underline;

        &:hover {
          color: #6366F1;
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
        background-color: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 13px;
        color: #1F2937;
      }

      :deep(pre) {
        background-color: rgba(0, 0, 0, 0.05);
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
        border-left: 3px solid rgba(0, 0, 0, 0.2);
        padding-left: 12px;
        margin: 8px 0;
        opacity: 0.8;
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
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        margin: 12px 0;
      }

      :deep(table) {
        border-collapse: collapse;
        width: 100%;
        margin: 8px 0;
      }

      :deep(th), :deep(td) {
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 6px 10px;
        text-align: left;
      }

      :deep(th) {
        background-color: rgba(0, 0, 0, 0.05);
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

  &__status {
    display: block;
    font-size: 11px;
    margin-top: 4px;
    text-align: right;

    &--sending {
      color: $status-sending-color;
    }

    &--failed {
      color: $status-failed-color;
    }
  }

  &__attachments {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  &__attachment {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: $attachment-bg;
    border: 1px solid $attachment-border;
    border-radius: 8px;
    padding: 10px 12px;
    min-width: 200px;
    max-width: 280px;
  }

  &__attachment-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    color: $attachment-icon-color;
  }

  &__attachment-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 2px;
  }

  &__attachment-name {
    font-size: 13px;
    font-weight: 500;
    color: $attachment-text-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__attachment-size {
    font-size: 12px;
    color: $attachment-size-color;
  }

  &__attachment-download {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: $download-icon-color;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(79, 70, 229, 0.1);
    }

    &:focus {
      outline: 2px solid $download-icon-color;
      outline-offset: 2px;
    }

    &:active {
      background-color: rgba(79, 70, 229, 0.2);
    }
  }

  &__avatar {
    flex-shrink: 0;
    order: 1;
  }

  &__avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: $avatar-bg;
    border-radius: 50%;
    color: $avatar-icon-color;
  }
}
</style>
