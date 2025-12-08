<script setup lang="ts">
/**
 * Simple Header Component
 * Header with title on left and action buttons on right
 */

export type TabId = 'chat' | 'history'

const props = defineProps<{
  title?: string
  activeTab?: TabId
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: TabId]
  'new-chat': []
}>()

function switchTab(tab: TabId) {
  emit('update:activeTab', tab)
}

function handleNewChat() {
  emit('new-chat')
}
</script>

<template>
  <header class="simple-header">
    <h1 class="header-title">{{ title || 'CXOne WebChat' }}</h1>

    <div class="header-actions">
      <button
        type="button"
        class="header-btn new-chat"
        @click="handleNewChat"
        title="New Chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #1E3A5F;
  color: #fff;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  &.new-chat {
    background: rgba(59, 94, 255, 0.2);
    color: #fff;

    &:hover {
      background: rgba(59, 94, 255, 0.3);
    }

    &:active {
      background: rgba(59, 94, 255, 0.4);
    }
  }
}
</style>
