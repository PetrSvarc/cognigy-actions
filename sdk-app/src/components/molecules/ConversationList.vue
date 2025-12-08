<script setup lang="ts">
/**
 * Conversation List Component
 * Shows list of past conversations
 */

import type { ConversationHistoryItem } from '../../sdk-core/types.ts'
import { formatConversationTime } from '../../sdk-core/utils/dateFormat'

// Re-export type for convenience
export type ConversationItem = ConversationHistoryItem

defineProps<{
  conversations: ConversationHistoryItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'select': [id: string]
}>()

function selectConversation(id: string) {
  emit('select', id)
}
</script>

<template>
  <div class="conversation-list">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading conversations...</span>
    </div>

    <div v-else-if="conversations.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <p>No conversations yet</p>
      <span>Start a new chat to begin</span>
    </div>

    <template v-else>
      <button
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ unread: conv.unread }"
        @click="selectConversation(conv.id)"
      >
        <div class="conv-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="conv-content">
          <div class="conv-header">
            <span class="conv-title">{{ conv.title }}</span>
            <span class="conv-time">{{ formatConversationTime(conv.timestamp) }}</span>
          </div>
          <p class="conv-preview">{{ conv.lastMessage }}</p>
        </div>
        <div v-if="conv.unread" class="unread-dot"></div>
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
$primary-blue: #3B5EFF;
$text-color: #1F2937;
$text-secondary: #6B7280;
$border-color: #E5E7EB;

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  color: $text-secondary;
  text-align: center;
  gap: 12px;

  svg {
    opacity: 0.4;
  }

  p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: $text-color;
  }

  span {
    font-size: 14px;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: $primary-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #fff;
  border: none;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: #F9FAFB;
  }

  &.unread {
    background: #F0F7FF;

    &:hover {
      background: #E5F0FF;
    }
  }
}

.conv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: $text-secondary;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.conv-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-color;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-time {
  font-size: 12px;
  color: $text-secondary;
  flex-shrink: 0;
}

.conv-preview {
  margin: 0;
  font-size: 13px;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $primary-blue;
  flex-shrink: 0;
}
</style>
